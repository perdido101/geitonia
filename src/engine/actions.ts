// §4.7 — actions. Pure reducers: apply(state, action) → state. Each reducer clones the
// input and mutates the clone, so callers never see mutation.

import type { GameState, ShiftState, Station } from './types';
import { getShop, SHOP_KEYS } from '../data/shops';
import { getRecipe } from '../data/recipes';
import { REGULARS } from '../data/customers';
import { upgradeEffect, nextUpgradeCost } from '../data/upgrades';
import type { UpgradeLine } from '../data/types';
import { monthForDay, isBillingDay, eventForDay } from './calendar';
import {
  clampReputation,
  clampStanding,
  reputationForServe,
  REP_WRONG_SERVE,
  REP_PLATEIA_CHAT,
  REP_NEGLECT,
} from './reputation';
import {
  customerPayout,
  ingredientCost,
  rentFor,
  EFKA,
  MONTHLY_INTEREST,
  FORCED_LOAN_RATE,
  DEBT_CAP,
  LOAN_MAX_SINGLE,
} from './economy';
import { createInitialState } from './state';

export const SHIFT_DURATION = 180;
export const LAIKI_BASE_PRICE = 50;

export type Action =
  | { type: 'START_SHIFT'; shopKey: string }
  | { type: 'TAP_STATION'; stationId: string }
  | { type: 'START_COOKING'; stationId: string; itemKey: string; stepIndex: number }
  | { type: 'TAP_CUSTOMER'; customerId: string }
  | { type: 'DISCARD_HELD' }
  | { type: 'END_SHIFT' }
  | { type: 'ADVANCE_DAY' }
  | { type: 'BUY_UPGRADE'; shopKey: string; upgradeKey: UpgradeLine }
  | { type: 'UNLOCK_SHOP'; shopKey: string }
  | { type: 'TAKE_LOAN'; amount: number }
  | { type: 'REPAY_LOAN'; amount: number }
  | { type: 'PLATEIA_CHAT'; regularKey: string }
  | { type: 'BUY_LAIKI_DISCOUNT' }
  | { type: 'NEW_GAME'; onboarding?: boolean };

export function apply(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return createInitialState({ onboarding: action.onboarding });
    case 'START_SHIFT':
      return startShift(structuredClone(state), action.shopKey);
    case 'TAP_STATION':
      return tapStation(structuredClone(state), action.stationId);
    case 'START_COOKING':
      return startCooking(structuredClone(state), action.stationId, action.itemKey, action.stepIndex);
    case 'TAP_CUSTOMER':
      return tapCustomer(structuredClone(state), action.customerId);
    case 'DISCARD_HELD':
      return discardHeld(structuredClone(state));
    case 'END_SHIFT':
      return endShiftDraft(structuredClone(state));
    case 'ADVANCE_DAY':
      return advanceDay(structuredClone(state));
    case 'BUY_UPGRADE':
      return buyUpgrade(structuredClone(state), action.shopKey, action.upgradeKey);
    case 'UNLOCK_SHOP':
      return unlockShop(structuredClone(state), action.shopKey);
    case 'TAKE_LOAN':
      return takeLoan(structuredClone(state), action.amount);
    case 'REPAY_LOAN':
      return repayLoan(structuredClone(state), action.amount);
    case 'PLATEIA_CHAT':
      return plateiaChat(structuredClone(state), action.regularKey);
    case 'BUY_LAIKI_DISCOUNT':
      return buyLaikiDiscount(structuredClone(state));
    default:
      return state;
  }
}

// ---- Shift lifecycle ----

function startShift(draft: GameState, shopKey: string): GameState {
  const shop = draft.shops[shopKey];
  if (!shop || !shop.unlocked || draft.activeShift) return draft;

  const shopDef = getShop(shopKey);
  const capacityTier = shop.upgrades.capacity ?? 0;
  const extra = upgradeEffect('capacity', capacityTier); // 0 at tier 0
  const stations: Station[] = [];
  for (const stationKey of shopDef.stationKeys) {
    const instances = 1 + extra;
    for (let i = 0; i < instances; i++) {
      stations.push({
        id: `${stationKey}_${i}`,
        typeKey: stationKey,
        state: 'idle',
        timer: 0,
        producing: null,
        stepIndex: 0,
      });
    }
  }
  shop.stations = stations;
  shop.lastOpenedDay = draft.day;

  const shift: ShiftState = {
    shopKey,
    elapsed: 0,
    duration: SHIFT_DURATION,
    served: 0,
    failed: 0,
    grossEarned: 0,
    heldItem: null,
    heldItemStep: 0,
    spawnAccumulator: 0,
    queue: [],
    nextCustomerId: 1,
    regularInQueue: false,
    events: [],
  };
  draft.activeShift = shift;
  return draft;
}

export function endShiftDraft(draft: GameState): GameState {
  const shift = draft.activeShift;
  if (!shift) return draft;
  const cost = ingredientCost(shift.grossEarned, draft.ingredientDiscountActive);
  const net = shift.grossEarned - cost;
  draft.money += net;
  draft.lifetimeEarnings += shift.grossEarned;
  draft.ingredientDiscountActive = false; // consumed
  draft.activeShift = null;
  return draft;
}

// ---- In-shift interactions ----

function findStation(draft: GameState, stationId: string): Station | null {
  const shift = draft.activeShift;
  if (!shift) return null;
  const shop = draft.shops[shift.shopKey];
  return shop.stations.find((s) => s.id === stationId) ?? null;
}

function tapStation(draft: GameState, stationId: string): GameState {
  const shift = draft.activeShift;
  const station = findStation(draft, stationId);
  if (!shift || !station) return draft;

  if (station.state === 'ready') {
    if (shift.heldItem === null && station.producing) {
      shift.heldItem = station.producing;
      shift.heldItemStep = station.stepIndex;
      station.state = 'idle';
      station.producing = null;
      station.timer = 0;
      station.stepIndex = 0;
    }
  } else if (station.state === 'burnt') {
    station.state = 'clearing';
    station.timer = 0;
  }
  // idle → UI opens recipe selection then dispatches START_COOKING.
  return draft;
}

function startCooking(draft: GameState, stationId: string, itemKey: string, stepIndex: number): GameState {
  const shift = draft.activeShift;
  const station = findStation(draft, stationId);
  if (!shift || !station || station.state !== 'idle') return draft;

  const recipe = getRecipe(itemKey);
  const step = recipe.steps[stepIndex];
  if (!step || step.stationKey !== station.typeKey) return draft;

  if (stepIndex > 0) {
    // Must be holding the same item at exactly the previous completed step.
    if (shift.heldItem !== itemKey || shift.heldItemStep !== stepIndex - 1) return draft;
    shift.heldItem = null;
    shift.heldItemStep = 0;
  }

  station.state = 'working';
  station.producing = itemKey;
  station.stepIndex = stepIndex;
  station.timer = 0;
  return draft;
}

function tapCustomer(draft: GameState, customerId: string): GameState {
  const shift = draft.activeShift;
  if (!shift || shift.heldItem === null) return draft;
  const shop = draft.shops[shift.shopKey];

  const customer = shift.queue.find((c) => c.id === customerId && c.state === 'waiting');
  if (!customer) return draft;

  const held = shift.heldItem;
  const recipe = getRecipe(held);
  const heldComplete = shift.heldItemStep === recipe.steps.length - 1;

  const target = heldComplete
    ? customer.order.find((o) => !o.fulfilled && o.itemKey === held)
    : undefined;

  if (!target) {
    // Wrong serve — item destroyed, rep −0.3, customer unchanged.
    shift.heldItem = null;
    shift.heldItemStep = 0;
    shop.reputation = clampReputation(shop.reputation + REP_WRONG_SERVE);
    shift.events.push({ kind: 'wrong_serve' });
    return draft;
  }

  target.fulfilled = true;
  shift.heldItem = null;
  shift.heldItemStep = 0;

  if (customer.order.every((o) => o.fulfilled)) {
    const payout = customerPayout(customer, shop);
    shift.grossEarned += payout;
    shift.served += 1;
    shop.lifetimeServed += 1;

    const isRegular = customer.regularKey != null;
    shop.reputation = clampReputation(
      shop.reputation + reputationForServe(isRegular, customer.patience),
    );
    if (isRegular && customer.regularKey) {
      const rec = draft.regulars[customer.regularKey];
      if (rec) {
        rec.timesServed += 1;
        rec.standing = clampStanding(rec.standing + 1);
      }
      shift.regularInQueue = false;
    }
    customer.state = 'served';
    shift.queue = shift.queue.filter((c) => c.id !== customer.id);
    shift.events.push({ kind: 'served', customerId: customer.id, payout, regular: isRegular });
    checkRegularUnlocks(draft);
  }
  return draft;
}

function discardHeld(draft: GameState): GameState {
  if (draft.activeShift) {
    draft.activeShift.heldItem = null;
    draft.activeShift.heldItemStep = 0;
  }
  return draft;
}

// ---- Day / economy ----

function advanceDay(draft: GameState): GameState {
  draft.day += 1;
  draft.year = Math.floor((draft.day - 1) / 48) + 1;

  const onboardingGrace = draft.flags.onboarding && draft.day < 5;

  if (isBillingDay(draft.day) && !onboardingGrace) {
    // Compound interest, then charge the fixed costs.
    draft.debt = draft.debt * (1 + MONTHLY_INTEREST);
    const unlockedCount = Object.values(draft.shops).filter((s) => s.unlocked).length;
    draft.money -= rentFor(unlockedCount) + EFKA;

    // Forced automatic loan at a punitive rate — you do not get to simply be broke.
    if (draft.money < 0) {
      const shortfall = -draft.money;
      draft.debt += shortfall * (1 + FORCED_LOAN_RATE);
      draft.money = 0;
    }
  }

  // Neglect decay: unlocked shops not opened the previous day lose a little reputation.
  for (const shop of Object.values(draft.shops)) {
    if (shop.unlocked && shop.lastOpenedDay < draft.day - 1) {
      shop.reputation = clampReputation(shop.reputation + REP_NEGLECT);
    }
  }

  // Roll month events (set flags the calendar/UI read).
  const ev = eventForDay(draft.day);
  if (ev) {
    draft.flags[`event_${ev.key}`] = true;
    if (ev.setFlag) draft.flags[ev.setFlag] = true;
  }

  checkRegularUnlocks(draft);

  if (draft.debt > DEBT_CAP) draft.flags.gameOver = true;
  return draft;
}

function buyUpgrade(draft: GameState, shopKey: string, line: UpgradeLine): GameState {
  const shop = draft.shops[shopKey];
  if (!shop) return draft;
  const tier = shop.upgrades[line] ?? 0;
  const cost = nextUpgradeCost(line, tier);
  if (cost == null || draft.money < cost) return draft;
  draft.money -= cost;
  shop.upgrades[line] = tier + 1;
  return draft;
}

function unlockShop(draft: GameState, shopKey: string): GameState {
  const shop = draft.shops[shopKey];
  const shopDef = getShop(shopKey);
  if (!shop || shop.unlocked) return draft;
  if (!canUnlock(draft, shopKey)) return draft;
  if (draft.money < shopDef.unlockCost) return draft;
  draft.money -= shopDef.unlockCost;
  shop.unlocked = true;
  shop.lastOpenedDay = draft.day;
  return draft;
}

export function canUnlock(state: GameState, shopKey: string): boolean {
  const shopDef = getShop(shopKey);
  const unlock = shopDef.unlock;
  if (unlock.kind === 'start') return true;
  if (unlock.kind === 'rep') {
    const gate = state.shops[unlock.repShop];
    return !!gate && gate.unlocked && gate.reputation >= unlock.rep;
  }
  // anyThree: at least 3 unlocked shops at/above the rep threshold.
  const qualifying = Object.values(state.shops).filter(
    (s) => s.unlocked && s.reputation >= unlock.rep,
  ).length;
  return qualifying >= 3;
}

function takeLoan(draft: GameState, amount: number): GameState {
  const headroom = DEBT_CAP - draft.debt;
  const take = Math.max(0, Math.min(amount, LOAN_MAX_SINGLE, headroom));
  draft.money += take;
  draft.debt += take;
  return draft;
}

function repayLoan(draft: GameState, amount: number): GameState {
  const repay = Math.max(0, Math.min(amount, draft.debt, draft.money));
  draft.money -= repay;
  draft.debt -= repay;
  return draft;
}

function plateiaChat(draft: GameState, regularKey: string): GameState {
  const rgDef = REGULARS[regularKey];
  const record = draft.regulars[regularKey];
  if (!rgDef || !record || !record.unlocked) return draft;
  const flag = `chat_${regularKey}_${draft.day}`;
  if (draft.flags[flag]) return draft;
  draft.flags[flag] = true;
  const shop = draft.shops[rgDef.shopKey];
  if (shop) {
    shop.reputation = clampReputation(shop.reputation + REP_PLATEIA_CHAT);
    checkRegularUnlocks(draft);
  }
  return draft;
}

function buyLaikiDiscount(draft: GameState): GameState {
  const price = laikiPrice(monthForDay(draft.day));
  if (draft.ingredientDiscountActive || draft.money < price) return draft;
  draft.money -= price;
  draft.ingredientDiscountActive = true;
  return draft;
}

/** λαϊκή discount price: €50 base, ±30% by month (dear in Δεκέμβριος, cheap in Σεπτέμβριος). */
export function laikiPrice(month: number): number {
  const factor = month === 12 ? 1.3 : month === 9 ? 0.7 : 1.0;
  return Math.round(LAIKI_BASE_PRICE * factor);
}

/**
 * When a shop's reputation first crosses a Regular's threshold, unlock them and raise a
 * flag so the UI can celebrate. Κυρ-Θανάσης noticing you is the first real reward (§4.3).
 */
export function checkRegularUnlocks(draft: GameState): void {
  for (const rgDef of Object.values(REGULARS)) {
    const record = draft.regulars[rgDef.key];
    if (!record || record.unlocked) continue;
    const shop = draft.shops[rgDef.shopKey];
    if (shop && shop.unlocked && shop.reputation >= rgDef.repThreshold) {
      record.unlocked = true;
      draft.flags[`regular_unlocked_${rgDef.key}`] = true;
    }
  }
}

// re-export so callers importing from actions get the shop key list too
export { SHOP_KEYS };

// §4.9 — THE HEADLESS SIM. Simulates a full year (48 days) with a bot policy and prints the
// economy curve so we can find broken numbers BEFORE building any UI. Run: npm run sim

import { apply, tick, createInitialState, canUnlock } from '../engine';
import type { Action, GameState } from '../engine';
import { getShop, SHOP_KEYS } from '../data/shops';
import { nextUpgradeCost } from '../data/upgrades';
import { monthDefForDay } from '../engine';
import { botStep } from './bot';

const SIM_DT = 0.1;
const ACTIONS_PER_TICK = 3;

interface DayRow {
  day: number;
  month: string;
  shop: string;
  served: number;
  failed: number;
  gross: number;
  net: number;
  money: number;
  debt: number;
  rep: number;
}

function chooseShop(state: GameState, day: number): string {
  const unlocked = SHOP_KEYS.filter((k) => state.shops[k].unlocked);
  // Develop under-built shops: on even days, play the lowest-rep shop still below 70 so new
  // shops climb toward their gates; otherwise play the highest-EV shop for income.
  if (day % 2 === 0) {
    const developing = unlocked
      .filter((k) => state.shops[k].reputation < 70)
      .sort((a, b) => state.shops[a].reputation - state.shops[b].reputation);
    if (developing.length) return developing[0];
  }
  let best = 'kafeneio';
  let bestScore = -1;
  for (const key of unlocked) {
    const score = (state.shops[key].reputation + 5) * getShop(key).baseSpawnRate;
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return best;
}

function betweenShifts(state: GameState): GameState {
  let s = state;
  const BUFFER = 400;
  const candidates = SHOP_KEYS.filter((k) => !s.shops[k].unlocked && canUnlock(s, k)).sort(
    (a, b) => getShop(a).unlockCost - getShop(b).unlockCost,
  );
  for (const k of candidates) {
    if (s.money >= getShop(k).unlockCost + BUFFER) s = apply(s, { type: 'UNLOCK_SHOP', shopKey: k });
  }
  // Reinvest in throughput like a smart player: speed & capacity first, then comfort/quality.
  // Keep a bill buffer; buy the cheapest useful upgrade we can afford.
  const UP_BUFFER = 250;
  let bought = true;
  while (bought) {
    bought = false;
    for (const k of SHOP_KEYS) {
      if (!s.shops[k].unlocked) continue;
      for (const line of ['speed', 'capacity', 'comfort', 'quality'] as const) {
        const tier = s.shops[k].upgrades[line] ?? 0;
        if (tier >= 3) continue;
        const cost = nextUpgradeCost(line, tier);
        if (cost != null && s.money >= cost + UP_BUFFER) {
          const before = s.money;
          s = apply(s, { type: 'BUY_UPGRADE', shopKey: k, upgradeKey: line });
          if (s.money < before) {
            bought = true;
          }
        }
      }
    }
  }
  return s;
}

interface ShiftResult {
  state: GameState;
  served: number;
  failed: number;
  gross: number;
}

function runShift(state: GameState, shopKey: string): ShiftResult {
  let s = apply(state, { type: 'START_SHIFT', shopKey });
  let served = 0;
  let failed = 0;
  let gross = 0;
  let guard = 0;
  while (s.activeShift && guard < 100000) {
    served = s.activeShift.served;
    failed = s.activeShift.failed;
    gross = s.activeShift.grossEarned;
    s = tick(s, SIM_DT);
    for (let i = 0; i < ACTIONS_PER_TICK; i++) {
      if (!s.activeShift) break;
      const action: Action | null = botStep(s);
      if (!action) break;
      s = apply(s, action);
    }
    guard++;
  }
  return { state: s, served, failed, gross };
}

function main() {
  // onboarding grace: no rent/ΕΦΚΑ until day 5 — the real game's bootstrap window.
  let state = createInitialState({ seed: 20260714, onboarding: true });
  const rows: DayRow[] = [];
  const unlockDay: Record<string, number> = {};

  for (let day = 1; day <= 48; day++) {
    const shopKey = chooseShop(state, day);
    const moneyBefore = state.money;

    const res = runShift(state, shopKey);
    state = res.state;
    const afterShiftMoney = state.money;

    state = betweenShifts(state);
    state = apply(state, { type: 'ADVANCE_DAY' });

    rows.push({
      day,
      month: monthDefForDay(day).nameEL,
      shop: shopKey,
      served: res.served,
      failed: res.failed,
      gross: Math.round(res.gross),
      net: Math.round(afterShiftMoney - moneyBefore),
      money: Math.round(state.money),
      debt: Math.round(state.debt),
      rep: state.shops[shopKey].reputation,
    });

    for (const key of Object.keys(state.regulars)) {
      if (state.regulars[key].unlocked && unlockDay[key] == null) unlockDay[key] = day;
    }

    if (state.flags.gameOver) {
      console.log(`\n💀 GAME OVER on day ${day} (debt €${Math.round(state.debt)})`);
      break;
    }
  }

  printTable(rows, state);
  const unlockStr = Object.entries(unlockDay)
    .sort((a, b) => a[1] - b[1])
    .map(([k, d]) => `${k}@D${d}`)
    .join('  ');
  console.log(`Regular unlock days: ${unlockStr || '(none)'}`);
}

function printTable(rows: DayRow[], state: GameState) {
  const pad = (s: string | number, n: number) => String(s).padEnd(n);
  console.log(
    pad('Day', 4) + pad('Month', 13) + pad('Shop', 15) + pad('Srv', 5) + pad('Fail', 5) +
      pad('Gross', 7) + pad('Net', 7) + pad('Money', 9) + pad('Debt', 8) + pad('Rep', 6),
  );
  console.log('─'.repeat(94));
  for (const r of rows) {
    console.log(
      pad(r.day, 4) + pad(r.month, 13) + pad(r.shop, 15) + pad(r.served, 5) + pad(r.failed, 5) +
        pad(`€${r.gross}`, 7) + pad(`€${r.net}`, 7) + pad(`€${r.money}`, 9) + pad(`€${r.debt}`, 8) +
        pad(r.rep.toFixed(1), 6),
    );
  }
  console.log('─'.repeat(94));

  const unlocked = SHOP_KEYS.filter((k) => state.shops[k].unlocked);
  const reps = SHOP_KEYS.filter((k) => state.shops[k].unlocked)
    .map((k) => `${k}:${state.shops[k].reputation.toFixed(0)}`)
    .join('  ');
  const aug = rows.filter((r) => r.month === 'Αύγουστος');
  console.log(`\nFinal: money €${Math.round(state.money)}  debt €${Math.round(state.debt)}  year ${state.year}`);
  console.log(`Shops unlocked (${unlocked.length}): ${unlocked.join(', ')}`);
  console.log(`Reputations: ${reps}`);
  console.log(`August: served ${aug.map((r) => r.served).join('/')}  money ${aug.map((r) => `€${r.money}`).join(' → ') || '(n/a)'}`);
  const reg = Object.values(state.regulars).filter((r) => r.unlocked).map((r) => r.key);
  console.log(`Regulars unlocked: ${reg.join(', ') || '(none)'}`);
}

main();

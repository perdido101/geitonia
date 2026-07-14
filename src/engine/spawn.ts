// §4.3 — spawning: the rush curve, reputation-scaled foot traffic, archetype selection,
// order generation, and Regular spawning. These helpers MUTATE a draft GameState that the
// caller (tick/apply) has already cloned — keeping the public reducers pure.

import type { Customer, GameState, OrderItem } from './types';
import { getShop } from '../data/shops';
import { ARCHETYPES, regularsForShop } from '../data/customers';
import { recipesForShop, getRecipe } from '../data/recipes';
import { monthForDay, monthSpawnModifier } from './calendar';
import { repMultiplier } from './reputation';
import { tipMultiplierForRep } from './economy';
import { nextRandom, weightedPick, randInt } from './rng';

/** shiftCurve(t) — the rush. Piecewise ramp / hold-with-lunch-bump / taper (§4.3). */
export function shiftCurve(t: number): number {
  if (t <= 0) return 0.3;
  if (t < 0.2) return 0.3 + (t / 0.2) * 0.7; // 0.3 → 1.0
  if (t < 0.75) {
    // hold at 1.0 with a lunch bump to 1.35 between 0.45 and 0.60
    if (t >= 0.45 && t <= 0.6) return 1.35;
    return 1.0;
  }
  if (t < 1.0) return 1.0 - ((t - 0.75) / 0.25) * 0.8; // 1.0 → 0.2
  return 0.2;
}

/** spawnRate = baseSpawnRate × shiftCurve × repMultiplier × monthSpawnModifier. */
export function spawnRate(state: GameState): number {
  const shift = state.activeShift;
  if (!shift) return 0;
  const shop = state.shops[shift.shopKey];
  const shopDef = getShop(shift.shopKey);
  const t = shift.duration > 0 ? shift.elapsed / shift.duration : 0;
  return (
    shopDef.baseSpawnRate *
    shiftCurve(t) *
    repMultiplier(shop.reputation) *
    monthSpawnModifier(state.day, shift.shopKey)
  );
}

/** Weighted archetype pool for a shop this month. */
function archetypePool(shopKey: string, month: number): { keys: string[]; weights: number[] } {
  const keys: string[] = [];
  const weights: number[] = [];
  for (const a of Object.values(ARCHETYPES)) {
    const base = a.shopWeights[shopKey];
    if (!base) continue;
    const monthMult = a.monthWeights[month] ?? 1;
    const w = base * monthMult;
    if (w <= 0) continue;
    keys.push(a.key);
    weights.push(w);
  }
  return { keys, weights };
}

/** Generate an order of the given size from a shop's recipe pool, weighted toward cheaper. */
function generateOrder(
  shopKey: string,
  size: number,
  rngState: number,
): { order: OrderItem[]; basePayout: number; next: number } {
  const pool = recipesForShop(shopKey);
  const weights = pool.map((r) => 1 / r.basePrice); // cheaper items more likely
  const order: OrderItem[] = [];
  let basePayout = 0;
  let rng = rngState;
  for (let i = 0; i < size; i++) {
    const pick = weightedPick(weights, rng);
    rng = pick.next;
    const recipe = pool[pick.index];
    order.push({ itemKey: recipe.itemKey, fulfilled: false });
    basePayout += recipe.basePrice;
  }
  return { order, basePayout, next: rng };
}

/**
 * Try to spawn a Regular. Returns true (and mutates state) if one spawned.
 * Rolls each eligible Regular's spawnChance in turn; first hit wins. Sets regularInQueue.
 */
function trySpawnRegular(state: GameState): boolean {
  const shift = state.activeShift!;
  if (shift.regularInQueue) return false;
  const shop = state.shops[shift.shopKey];

  for (const rgDef of regularsForShop(shift.shopKey)) {
    const record = state.regulars[rgDef.key];
    if (!record || !record.unlocked) continue;
    if (rgDef.repThreshold > shop.reputation) continue;

    const draw = nextRandom(state.rng);
    state.rng = draw.next;
    if (draw.value >= rgDef.spawnChance) continue;

    // Spawn this Regular with their fixed favorite order.
    const order: OrderItem[] = rgDef.favoriteOrder.map((itemKey) => ({ itemKey, fulfilled: false }));
    const basePayout = rgDef.favoriteOrder.reduce((s, k) => s + getRecipe(k).basePrice, 0);
    const customer: Customer = {
      id: `c${shift.nextCustomerId}`,
      archetypeKey: 'regular',
      regularKey: rgDef.key,
      order,
      patience: 1.0,
      patienceDrainRate: rgDef.patienceDrainRate,
      basePayout,
      tipMultiplier: tipMultiplierForRep(shop.reputation),
      state: 'waiting',
      spawnedAt: shift.elapsed,
    };
    shift.nextCustomerId += 1;
    shift.queue.push(customer);
    shift.regularInQueue = true;
    shift.events.push({ kind: 'regular_arrive', regularKey: rgDef.key });
    shift.events.push({ kind: 'customer_arrive', customerId: customer.id });
    return true;
  }
  return false;
}

/**
 * Spawn one customer into the queue. First tries a Regular, then a weighted archetype.
 * Mutates the (already-cloned) draft state.
 */
export function spawnCustomer(state: GameState): void {
  const shift = state.activeShift!;
  if (shift.queue.length >= 5) return;

  if (trySpawnRegular(state)) return;

  const month = monthForDay(state.day);
  const pool = archetypePool(shift.shopKey, month);
  if (pool.keys.length === 0) return;

  const pick = weightedPick(pool.weights, state.rng);
  state.rng = pick.next;
  const archetype = ARCHETYPES[pool.keys[pick.index]];

  const sizeRoll = randInt(archetype.orderSize[0], archetype.orderSize[1], state.rng);
  state.rng = sizeRoll.next;

  const shop = state.shops[shift.shopKey];
  const gen = generateOrder(shift.shopKey, sizeRoll.value, state.rng);
  state.rng = gen.next;

  const customer: Customer = {
    id: `c${shift.nextCustomerId}`,
    archetypeKey: archetype.key,
    regularKey: null,
    order: gen.order,
    patience: 1.0,
    patienceDrainRate: archetype.patienceDrainRate,
    basePayout: gen.basePayout,
    tipMultiplier: tipMultiplierForRep(shop.reputation),
    state: 'waiting',
    spawnedAt: shift.elapsed,
  };
  shift.nextCustomerId += 1;
  shift.queue.push(customer);
  shift.events.push({ kind: 'customer_arrive', customerId: customer.id });
}

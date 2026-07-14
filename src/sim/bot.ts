// A competent bot policy for the headless sim: prevent burns, serve the lowest-patience
// customer, cook the best value-per-hand-time item the queue needs — and never deadlock
// holding a multi-step intermediate. Used only by the sim harness.

import type { Action, GameState } from '../engine';
import type { Customer, Station } from '../engine';
import { getRecipe } from '../data/recipes';

function stepCount(itemKey: string): number {
  return getRecipe(itemKey).steps.length;
}
function completedFinalStep(itemKey: string, step: number): boolean {
  return step === stepCount(itemKey) - 1;
}

function inProgressCounts(state: GameState): Record<string, number> {
  const shift = state.activeShift!;
  const shop = state.shops[shift.shopKey];
  const counts: Record<string, number> = {};
  for (const st of shop.stations) {
    if ((st.state === 'working' || st.state === 'ready') && st.producing) {
      counts[st.producing] = (counts[st.producing] ?? 0) + 1;
    }
  }
  if (shift.heldItem) counts[shift.heldItem] = (counts[shift.heldItem] ?? 0) + 1;
  return counts;
}

function netDemand(state: GameState): Map<string, number> {
  const shift = state.activeShift!;
  const need = new Map<string, number>();
  for (const c of shift.queue) {
    if (c.state !== 'waiting') continue;
    for (const o of c.order) if (!o.fulfilled) need.set(o.itemKey, (need.get(o.itemKey) ?? 0) + 1);
  }
  const prog = inProgressCounts(state);
  for (const [k, v] of Object.entries(prog)) {
    if (need.has(k)) need.set(k, (need.get(k) ?? 0) - v);
  }
  return need;
}

function idleByType(stations: Station[]): Map<string, Station> {
  const m = new Map<string, Station>();
  for (const st of stations) if (st.state === 'idle' && !m.has(st.typeKey)) m.set(st.typeKey, st);
  return m;
}

function lowestPatienceNeeding(queue: Customer[], itemKey: string): Customer | null {
  let best: Customer | null = null;
  for (const c of queue) {
    if (c.state !== 'waiting') continue;
    if (c.order.some((o) => !o.fulfilled && o.itemKey === itemKey)) {
      if (!best || c.patience < best.patience) best = c;
    }
  }
  return best;
}

export function botStep(state: GameState): Action | null {
  const shift = state.activeShift;
  if (!shift) return null;
  const shop = state.shops[shift.shopKey];
  const idle = idleByType(shop.stations);

  // A) Holding something.
  if (shift.heldItem) {
    const held = shift.heldItem;
    if (completedFinalStep(held, shift.heldItemStep)) {
      const cust = lowestPatienceNeeding(shift.queue, held);
      if (cust) return { type: 'TAP_CUSTOMER', customerId: cust.id };
      return { type: 'DISCARD_HELD' };
    }
    // Intermediate — advance, or unblock.
    const nextType = getRecipe(held).steps[shift.heldItemStep + 1].stationKey;
    const idleNext = idle.get(nextType);
    if (idleNext) {
      return { type: 'START_COOKING', stationId: idleNext.id, itemKey: held, stepIndex: shift.heldItemStep + 1 };
    }
    // Can't advance: clear a burnt station (frees the pipeline), else cut losses.
    const burntNext = shop.stations.find((s) => s.typeKey === nextType && s.state === 'burnt');
    if (burntNext) return { type: 'TAP_STATION', stationId: burntNext.id };
    const anyBurnt = shop.stations.find((s) => s.state === 'burnt');
    if (anyBurnt) return { type: 'TAP_STATION', stationId: anyBurnt.id };
    return { type: 'DISCARD_HELD' };
  }

  // B) Hands empty — collect the ready station closest to burning (avoid burns).
  let readyBest: Station | null = null;
  for (const st of shop.stations) {
    if (st.state === 'ready' && (!readyBest || st.timer > readyBest.timer)) readyBest = st;
  }
  if (readyBest) return { type: 'TAP_STATION', stationId: readyBest.id };

  // C) Clear a burnt station.
  const burnt = shop.stations.find((st) => st.state === 'burnt');
  if (burnt) return { type: 'TAP_STATION', stationId: burnt.id };

  // D) Start the best value-per-hand-time item we can make and chain safely.
  const demand = netDemand(state);
  let bestItem: string | null = null;
  let bestScore = 0;
  for (const [itemKey, qty] of demand) {
    if (qty <= 0) continue;
    const recipe = getRecipe(itemKey);
    const firstType = recipe.steps[0].stationKey;
    if (!idle.has(firstType)) continue;
    // Chainability: for multi-step, only start if the 2nd station is currently idle.
    if (recipe.steps.length > 1) {
      const secondType = recipe.steps[1].stationKey;
      if (!idle.has(secondType) || secondType === firstType) continue;
    }
    const score = recipe.basePrice / recipe.steps.length; // value per unit hand-time
    if (score > bestScore) {
      bestScore = score;
      bestItem = itemKey;
    }
  }
  if (bestItem) {
    const st = idle.get(getRecipe(bestItem).steps[0].stationKey)!;
    return { type: 'START_COOKING', stationId: st.id, itemKey: bestItem, stepIndex: 0 };
  }
  return null;
}

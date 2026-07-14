// §4.2 — the tick. Fixed timestep, deterministic. tick(state, dt) → state.
// Pure w.r.t. its input: it clones the state, mutates the clone, and returns it.

import type { GameState } from './types';
import { cookTime, burnTime, CLEAR_TIME } from './stations';
import { upgradeEffect } from '../data/upgrades';
import { monthPatienceModifier } from './calendar';
import { spawnRate, spawnCustomer } from './spawn';
import { clampReputation, clampStanding, reputationForAngry } from './reputation';
import { endShiftDraft } from './actions';

export function tick(state: GameState, dt: number): GameState {
  if (!state.activeShift || state.flags.gameOver) return state;

  const draft: GameState = structuredClone(state);
  const shift = draft.activeShift!;
  const shop = draft.shops[shift.shopKey];
  shift.events = [];

  // Step 1 — advance shift clock.
  shift.elapsed += dt;

  // Step 2 — advance stations.
  const speedTier = shop.upgrades.speed ?? 0;
  for (const station of shop.stations) {
    if (station.state === 'working') {
      station.timer += dt;
      if (station.timer >= cookTime(station.typeKey, speedTier)) {
        station.state = 'ready';
        station.timer = 0;
        shift.events.push({ kind: 'station_ready', stationId: station.id });
      }
    } else if (station.state === 'ready') {
      const bt = burnTime(station.typeKey);
      if (Number.isFinite(bt)) {
        station.timer += dt;
        if (station.timer >= bt) {
          station.state = 'burnt';
          station.producing = null;
          station.timer = 0;
          shift.events.push({ kind: 'station_burnt', stationId: station.id });
        }
      }
    } else if (station.state === 'clearing') {
      station.timer += dt;
      if (station.timer >= CLEAR_TIME) {
        station.state = 'idle';
        station.timer = 0;
        station.stepIndex = 0;
      }
    }
    // idle, burnt: no timer advance.
  }

  // Step 3 — drain patience.
  const comfort = upgradeEffect('comfort', shop.upgrades.comfort ?? 0);
  const monthPat = monthPatienceModifier(draft.day);
  for (const c of shift.queue) {
    if (c.state === 'waiting') {
      c.patience -= c.patienceDrainRate * comfort * monthPat * dt;
    }
  }

  // Step 4 — process failures.
  const survivors = [];
  for (const c of shift.queue) {
    if (c.state === 'waiting' && c.patience <= 0) {
      c.state = 'left_angry';
      shift.failed += 1;
      shop.lifetimeFailed += 1;
      const isRegular = c.regularKey != null;
      shop.reputation = clampReputation(shop.reputation + reputationForAngry(isRegular));
      if (isRegular && c.regularKey) {
        const rec = draft.regulars[c.regularKey];
        if (rec) {
          rec.timesFailed += 1;
          rec.standing = clampStanding(rec.standing - 2);
        }
        shift.regularInQueue = false;
      }
      shift.events.push({ kind: 'left_angry', customerId: c.id, regular: isRegular });
    } else {
      survivors.push(c);
    }
  }
  shift.queue = survivors;

  // Step 5 — spawn.
  shift.spawnAccumulator += dt * spawnRate(draft);
  while (shift.spawnAccumulator >= 1.0 && shift.queue.length < 5) {
    shift.spawnAccumulator -= 1.0;
    spawnCustomer(draft);
  }

  // Step 6 — check shift end (only once the queue has cleared).
  if (shift.elapsed >= shift.duration && shift.queue.length === 0) {
    return endShiftDraft(draft);
  }

  return draft;
}

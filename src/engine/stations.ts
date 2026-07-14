// Small pure helpers over station data + speed upgrades. Kept separate so tick and the
// UI can share the same cook-time math.

import { STATIONS } from '../data/stations';
import { upgradeEffect } from '../data/upgrades';

export const CLEAR_TIME = 2.0; // burnt → idle takes 2s of clearing (§4.2)

/** Effective cook time for a station type given the shop's speed upgrade tier. */
export function cookTime(typeKey: string, speedTier: number): number {
  const base = STATIONS[typeKey].cookTime;
  return base * upgradeEffect('speed', speedTier); // effect is a multiplier (1 at tier 0)
}

/** Burn time for a station type (Infinity for fridge/shelf/register/ice/ouzo). */
export function burnTime(typeKey: string): number {
  return STATIONS[typeKey].burnTime;
}

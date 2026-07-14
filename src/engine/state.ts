// Engine bootstrap: a fresh GameState with every shop and Regular instantiated.
// Pure (no I/O); the save layer handles storage.

import type { GameState, ShopRuntime, RegularRecord } from './types';
import { SHOPS, SHOP_KEYS, STARTING_SHOP } from '../data/shops';
import { REGULARS, REGULAR_KEYS } from '../data/customers';

export const SCHEMA_VERSION = 1;
export const STARTING_MONEY = 250;
// Reputation starts low so Κυρ-Θανάσης (threshold 30) is *earned*, not handed over at boot.
// With the forgiving pappous-only Day-1 onboarding (+~11 rep) plus a couple of normal shifts,
// the sim unlocks him around Day 4 — matching §9's scripted Day-3 intent — and staggers the
// other Καφενείο Regulars across D9/D11/D12 instead of all by D6. The bootstrap death-spiral
// this low start would otherwise cause is prevented by the raised repMultiplier floor (0.75).
export const STARTING_KAFENEIO_REP = 12;
export const DEFAULT_SEED = 1337;

export function createShopRuntime(shopKey: string, day: number): ShopRuntime {
  const isStart = shopKey === STARTING_SHOP;
  return {
    shopKey,
    unlocked: isStart,
    stations: [],
    reputation: isStart ? STARTING_KAFENEIO_REP : 0,
    upgrades: {},
    lifetimeServed: 0,
    lifetimeFailed: 0,
    lastOpenedDay: isStart ? day : 0,
  };
}

function createRegularRecord(key: string): RegularRecord {
  return { key, unlocked: false, timesServed: 0, timesFailed: 0, standing: 0 };
}

export interface NewGameOptions {
  onboarding?: boolean;
  seed?: number;
}

export function createInitialState(options: NewGameOptions = {}): GameState {
  const shops: Record<string, ShopRuntime> = {};
  for (const key of SHOP_KEYS) shops[key] = createShopRuntime(key, 1);

  const regulars: Record<string, RegularRecord> = {};
  for (const key of REGULAR_KEYS) regulars[key] = createRegularRecord(key);

  const flags: Record<string, boolean> = {};
  if (options.onboarding) flags.onboarding = true;

  return {
    schemaVersion: SCHEMA_VERSION,
    money: STARTING_MONEY,
    debt: 0,
    lifetimeEarnings: 0,
    day: 1,
    year: 1,
    shops,
    regulars,
    activeShift: null,
    flags,
    ingredientDiscountActive: false,
    rng: options.seed ?? DEFAULT_SEED,
  };
}

// Keep the referenced-but-unused imports meaningful for tooling.
export const ALL_SHOP_KEYS = SHOP_KEYS;
export const ALL_REGULAR_KEYS = REGULAR_KEYS;
export { SHOPS, REGULARS };

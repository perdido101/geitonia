// Engine bootstrap: a fresh GameState with every shop and Regular instantiated.
// Pure (no I/O); the save layer handles storage.

import type { GameState, ShopRuntime, RegularRecord } from './types';
import { SHOPS, SHOP_KEYS, STARTING_SHOP } from '../data/shops';
import { REGULARS, REGULAR_KEYS } from '../data/customers';

export const SCHEMA_VERSION = 1;
export const STARTING_MONEY = 250;
// Reputation starts mid-high (the spec's own example table shows rep ≈ 52 on day 1). This
// makes the low-rep death-spiral an edge case rather than the default, and lets Κυρ-Θανάσης
// (rep 30) notice you early — the game's first real reward.
export const STARTING_KAFENEIO_REP = 40;
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

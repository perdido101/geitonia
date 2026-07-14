// PHASE 0 STUB — a fresh GameState. Phase 1 replaces this with the full engine
// bootstrap (instantiating shops, regulars, reputation, etc.).

import type { GameState } from './types';

export const SCHEMA_VERSION = 1;

/** Builds a brand-new game. Kept pure (no I/O) — the save layer handles storage. */
export function createInitialState(): GameState {
  return {
    schemaVersion: SCHEMA_VERSION,
    money: 100,
    debt: 0,
    lifetimeEarnings: 0,
    day: 1,
    year: 1,
    shops: {},
    regulars: {},
    activeShift: null,
    flags: {},
    ingredientDiscountActive: false,
  };
}

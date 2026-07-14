// PHASE 0 STUB.
//
// This file holds a minimal GameState so the save system compiles and boots.
// Phase 1 replaces this with the full engine type contract (§4.1): Station,
// Customer, ShopRuntime, RegularRecord, ShiftState, and the complete GameState.
// The engine becomes byte-stable only AFTER Phase 1 (RULE 1).

export interface GameState {
  schemaVersion: number;
  money: number;
  debt: number;
  lifetimeEarnings: number;
  day: number; // 1-indexed, monotonic. Month = ((day-1)/4 % 12)+1
  year: number;
  // The following collections are fully typed in Phase 1. Kept loose here so the
  // Phase 0 shell can persist and restore a save without pulling in engine logic.
  shops: Record<string, unknown>;
  regulars: Record<string, unknown>;
  activeShift: unknown | null;
  flags: Record<string, boolean>;
  ingredientDiscountActive: boolean;
}

// §4.1 — the engine type contract. Pure data. After Phase 1 this surface is byte-stable
// (RULE 1); guard.test.ts snapshots it. The engine is pure TypeScript: zero React, zero
// side effects, zero I/O. Its entire contract is tick(state, dt)→state and apply(state, action)→state.

export type StationState = 'idle' | 'working' | 'ready' | 'burnt' | 'clearing';

export interface Station {
  id: string;
  typeKey: string; // → data/stations
  state: StationState;
  timer: number; // seconds elapsed in current state
  producing: string | null; // itemKey currently being made
  stepIndex: number; // which step of a multi-step recipe this is
}

export interface OrderItem {
  itemKey: string;
  fulfilled: boolean;
}

export type CustomerState = 'waiting' | 'served' | 'left_angry';

export interface Customer {
  id: string;
  archetypeKey: string; // → data/customers
  regularKey: string | null; // set if this is a named Regular
  order: OrderItem[];
  patience: number; // 1.0 → 0.0
  patienceDrainRate: number; // per second, already modified
  basePayout: number; // sum of recipe basePrices
  tipMultiplier: number;
  state: CustomerState;
  spawnedAt: number; // shift.elapsed when they arrived
}

export interface ShopRuntime {
  shopKey: string;
  unlocked: boolean;
  stations: Station[];
  reputation: number; // 0..100, persists across shifts
  upgrades: Record<string, number>; // upgradeKey → tier 0..3
  lifetimeServed: number;
  lifetimeFailed: number;
  lastOpenedDay: number; // for neglect decay
}

export interface RegularRecord {
  key: string;
  unlocked: boolean;
  timesServed: number;
  timesFailed: number;
  standing: number; // -10..+10, personal relationship
}

export interface ShiftState {
  shopKey: string;
  elapsed: number; // seconds
  duration: number; // seconds, default 180
  served: number;
  failed: number;
  grossEarned: number;
  heldItem: string | null; // item collected from a ready station
  heldItemStep: number; // completed step index of the held item (0-based)
  spawnAccumulator: number;
  queue: Customer[]; // max 5 visible
  nextCustomerId: number;
  regularInQueue: boolean; // max one Regular at a time
  // Ephemeral per-tick events for the UI's juice layer (§6.3). Not part of the
  // simulation; cleared at the start of every tick.
  events: ShiftEvent[];
}

export type ShiftEvent =
  | { kind: 'served'; customerId: string; payout: number; regular: boolean; x?: number }
  | { kind: 'wrong_serve' }
  | { kind: 'left_angry'; customerId: string; regular: boolean }
  | { kind: 'station_ready'; stationId: string }
  | { kind: 'station_burnt'; stationId: string }
  | { kind: 'regular_arrive'; regularKey: string }
  | { kind: 'customer_arrive'; customerId: string };

export interface GameState {
  schemaVersion: number;
  money: number;
  debt: number;
  lifetimeEarnings: number;
  day: number; // 1-indexed, monotonic. Month = ((day-1)/4 % 12)+1
  year: number;
  shops: Record<string, ShopRuntime>;
  regulars: Record<string, RegularRecord>;
  activeShift: ShiftState | null;
  flags: Record<string, boolean>; // events fired, tutorial done, game over
  ingredientDiscountActive: boolean; // bought at the λαϊκή
  // Seeded RNG state so tick()/spawn are deterministic given the same seed (§4.2).
  // Not in the original §4.1 sketch, but required for the determinism the spec mandates.
  rng: number;
}

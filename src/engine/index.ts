// Public API surface of the engine. RULE 1: after Phase 1 this is byte-stable; the UI
// imports only from here (plus ./types) and never reaches into individual modules to
// mutate state. guard.test.ts snapshots the names exported here.

export type {
  GameState,
  ShiftState,
  ShopRuntime,
  RegularRecord,
  Station,
  StationState,
  Customer,
  CustomerState,
  OrderItem,
  ShiftEvent,
} from './types';

export { tick } from './tick';
export { apply, canUnlock, laikiPrice, SHIFT_DURATION, LAIKI_BASE_PRICE } from './actions';
export type { Action } from './actions';
export {
  createInitialState,
  SCHEMA_VERSION,
  STARTING_MONEY,
  DEFAULT_SEED,
} from './state';
export type { NewGameOptions } from './state';

// Pure selectors/helpers the UI needs to render engine state without duplicating logic.
export { cookTime, burnTime, CLEAR_TIME } from './stations';
export { spawnRate, shiftCurve } from './spawn';
export {
  customerPayout,
  tipMultiplierForRep,
  rentFor,
  ingredientCost,
  EFKA,
  RENT_PER_SHOP,
  DEBT_CAP,
  LOAN_MAX_SINGLE,
  MONTHLY_INTEREST,
} from './economy';
export { repMultiplier } from './reputation';
export {
  monthForDay,
  dayInYear,
  monthDefForDay,
  monthPatienceModifier,
  monthSpawnModifier,
  isBillingDay,
  isMonthStart,
  eventForDay,
} from './calendar';

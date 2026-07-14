import { describe, expect, it } from 'vitest';
import * as engine from './index';

// RULE 1 — the engine is sacred. This snapshots the engine's public API surface and fails
// on any change. If you intentionally change the API, update this list in the same commit
// and treat it as a deliberate break of byte-stability.

const EXPECTED_EXPORTS = [
  'CLEAR_TIME',
  'DEBT_CAP',
  'DEFAULT_SEED',
  'EFKA',
  'LAIKI_BASE_PRICE',
  'LOAN_MAX_SINGLE',
  'MONTHLY_INTEREST',
  'RENT_PER_SHOP',
  'SCHEMA_VERSION',
  'SHIFT_DURATION',
  'STARTING_MONEY',
  'apply',
  'burnTime',
  'canUnlock',
  'cookTime',
  'createInitialState',
  'customerPayout',
  'dayInYear',
  'eventForDay',
  'ingredientCost',
  'isBillingDay',
  'isMonthStart',
  'laikiPrice',
  'monthDefForDay',
  'monthForDay',
  'monthPatienceModifier',
  'monthSpawnModifier',
  'rentFor',
  'repMultiplier',
  'shiftCurve',
  'spawnRate',
  'tick',
  'tipMultiplierForRep',
].sort();

describe('engine/guard — public API surface', () => {
  it('exports exactly the expected runtime names', () => {
    const actual = Object.keys(engine).sort();
    expect(actual).toEqual(EXPECTED_EXPORTS);
  });

  it('tick and apply are functions with the expected arity', () => {
    expect(typeof engine.tick).toBe('function');
    expect(engine.tick.length).toBe(2); // (state, dt)
    expect(typeof engine.apply).toBe('function');
    expect(engine.apply.length).toBe(2); // (state, action)
  });
});

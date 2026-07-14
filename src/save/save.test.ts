import { describe, expect, it } from 'vitest';
import { migrate } from './index';
import { createInitialState, SCHEMA_VERSION } from '../engine/state';

// Phase 0 smoke tests: prove the versioned save envelope + migration stub behave.
describe('save/migrate', () => {
  it('returns a fresh state for garbage input', () => {
    expect(migrate(null).schemaVersion).toBe(SCHEMA_VERSION);
    expect(migrate(undefined).day).toBe(1);
    expect(migrate(42).money).toBe(createInitialState().money);
  });

  it('round-trips a current-version save', () => {
    const state = { ...createInitialState(), money: 999, day: 7 };
    const restored = migrate({ schemaVersion: SCHEMA_VERSION, state });
    expect(restored.money).toBe(999);
    expect(restored.day).toBe(7);
    expect(restored.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('stamps the current schema version onto an unversioned state', () => {
    const restored = migrate({ state: { ...createInitialState(), schemaVersion: 0 } });
    expect(restored.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('falls back to a fresh state when the envelope has no usable state', () => {
    expect(migrate({ schemaVersion: SCHEMA_VERSION }).day).toBe(1);
  });
});

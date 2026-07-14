// Save system — localStorage, versioned schema. Kept out of engine/ because it does
// I/O (the engine is pure, RULE 1). The persisted envelope is:
//   { schemaVersion: number, state: GameState }

import type { GameState } from '../engine/types';
import { createInitialState, SCHEMA_VERSION } from '../engine/state';

const STORAGE_KEY = 'geitonia.save';

export interface SaveEnvelope {
  schemaVersion: number;
  state: GameState;
}

/**
 * Migration entry point. Switches on schemaVersion and upgrades old saves to the
 * current shape. Trivial now (only v1 exists) but wired from the start — retrofitting
 * migrations onto a shipped game is miserable.
 */
export function migrate(raw: unknown): GameState {
  if (!raw || typeof raw !== 'object') return createInitialState();

  const envelope = raw as Partial<SaveEnvelope>;
  const version = envelope.schemaVersion ?? 0;

  let state = envelope.state;

  switch (version) {
    case SCHEMA_VERSION:
      // Current version — nothing to do.
      break;
    // case 1: state = migrateV1toV2(state); // future
    default:
      // Unknown/older/newer: if we can't recognise it, start fresh rather than crash.
      if (!state || typeof state !== 'object') return createInitialState();
      break;
  }

  if (!state || typeof state !== 'object') return createInitialState();

  // Ensure the restored state is stamped with the current schema version.
  return { ...(state as GameState), schemaVersion: SCHEMA_VERSION };
}

/** Loads and migrates the saved game, or returns null if there is no save. */
export function loadGame(): GameState | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Persists the game state under the versioned envelope. Returns success. */
export function saveGame(state: GameState): boolean {
  const envelope: SaveEnvelope = { schemaVersion: SCHEMA_VERSION, state };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

/** Deletes the saved game. */
export function clearSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** True if a save exists in storage. */
export function hasSave(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) != null;
  } catch {
    return false;
  }
}

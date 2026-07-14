// §7.1 — the map/navigation module. Separate from the engine and NOT byte-stable.

export type Facing = 'n' | 's' | 'e' | 'w';

export interface WorldState {
  playerPos: { x: number; y: number };
  path: string[]; // remaining node ids to walk through
  targetNodeId: string | null;
  currentNodeId: string | null;
  facing: Facing;
  moving: boolean;
  walkSpeed: number; // px/sec in map space
}

export const DEFAULT_WALK_SPEED = 220;

export function createWorldState(startNodeId: string, x: number, y: number): WorldState {
  return {
    playerPos: { x, y },
    path: [],
    targetNodeId: null,
    currentNodeId: startNodeId,
    facing: 's',
    moving: false,
    walkSpeed: DEFAULT_WALK_SPEED,
  };
}

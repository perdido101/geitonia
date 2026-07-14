// §7.1 — advance the avatar along its path. tickWorld(world, dt) lerps toward the next node
// at walkSpeed and fires onNodeArrive(nodeId) when a waypoint is reached.

import type { Facing, WorldState } from './state';
import { worldNode } from '../data/world';
import { bfs, nearestNode } from './pathfind';

function facingFromVector(dx: number, dy: number): Facing {
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'e' : 'w';
  return dy > 0 ? 's' : 'n';
}

/** Begin walking from the current position to the node nearest (x, y). Returns a new state. */
export function walkTo(world: WorldState, x: number, y: number): WorldState {
  const from = world.currentNodeId ?? nearestNode(world.playerPos.x, world.playerPos.y);
  const target = nearestNode(x, y);
  const path = bfs(from, target);
  if (path.length === 0) {
    return { ...world, path: [], targetNodeId: null, moving: false };
  }
  return { ...world, path, targetNodeId: target, moving: true };
}

/**
 * Advance the avatar. Mutates a copy. Calls onArrive for each node reached this tick.
 */
export function tickWorld(
  world: WorldState,
  dt: number,
  onArrive?: (nodeId: string) => void,
): WorldState {
  if (!world.moving || world.path.length === 0) {
    return world.moving ? { ...world, moving: false } : world;
  }

  const next = { ...world, playerPos: { ...world.playerPos }, path: [...world.path] };
  let remaining = world.walkSpeed * dt;

  while (remaining > 0 && next.path.length > 0) {
    const targetNode = worldNode(next.path[0]);
    const dx = targetNode.x - next.playerPos.x;
    const dy = targetNode.y - next.playerPos.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= remaining || dist < 0.5) {
      // Arrive at this node.
      next.playerPos.x = targetNode.x;
      next.playerPos.y = targetNode.y;
      next.currentNodeId = targetNode.id;
      next.path.shift();
      remaining -= dist;
      onArrive?.(targetNode.id);
      if (next.path.length === 0) {
        next.moving = false;
        next.targetNodeId = null;
      }
    } else {
      const ux = dx / dist;
      const uy = dy / dist;
      next.playerPos.x += ux * remaining;
      next.playerPos.y += uy * remaining;
      next.facing = facingFromVector(dx, dy);
      remaining = 0;
    }
  }

  return next;
}

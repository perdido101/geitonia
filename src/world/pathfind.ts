// §7.1 — BFS over the waypoint graph. NOT a nav-mesh, NOT collision (deliberately, §7.1).

import { WORLD_EDGES, WORLD_NODES } from '../data/world';

const ADJ: Record<string, string[]> = (() => {
  const adj: Record<string, string[]> = {};
  for (const n of WORLD_NODES) adj[n.id] = [];
  for (const e of WORLD_EDGES) {
    adj[e.a].push(e.b);
    adj[e.b].push(e.a);
  }
  return adj;
})();

/** Shortest node path from → to (inclusive of `to`, excluding `from`). Empty if unreachable. */
export function bfs(from: string, to: string): string[] {
  if (from === to) return [];
  const prev: Record<string, string | null> = { [from]: null };
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const next of ADJ[cur] ?? []) {
      if (next in prev) continue;
      prev[next] = cur;
      if (next === to) {
        // reconstruct
        const path: string[] = [];
        let node: string | null = to;
        while (node && node !== from) {
          path.unshift(node);
          node = prev[node];
        }
        return path;
      }
      queue.push(next);
    }
  }
  return [];
}

/** Nearest node id to a map-space point. */
export function nearestNode(x: number, y: number): string {
  let best = WORLD_NODES[0].id;
  let bestD = Infinity;
  for (const n of WORLD_NODES) {
    const d = (n.x - x) ** 2 + (n.y - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = n.id;
    }
  }
  return best;
}

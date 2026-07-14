// Deterministic RNG (mulberry32) threaded through GameState.rng so tick()/apply()
// stay pure and reproducible given the same seed (§4.2).

export interface RngDraw {
  value: number; // in [0, 1)
  next: number; // new rng state to store back
}

export function nextRandom(state: number): RngDraw {
  let t = (state + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, next: t >>> 0 };
}

/** Pick an index from a weight array. Returns { index, next }. */
export function weightedPick(weights: number[], rngState: number): { index: number; next: number } {
  const total = weights.reduce((s, w) => s + Math.max(0, w), 0);
  const draw = nextRandom(rngState);
  if (total <= 0) return { index: 0, next: draw.next };
  let r = draw.value * total;
  for (let i = 0; i < weights.length; i++) {
    r -= Math.max(0, weights[i]);
    if (r < 0) return { index: i, next: draw.next };
  }
  return { index: weights.length - 1, next: draw.next };
}

/** Integer in [min, max] inclusive. */
export function randInt(min: number, max: number, rngState: number): { value: number; next: number } {
  const draw = nextRandom(rngState);
  const span = max - min + 1;
  return { value: min + Math.floor(draw.value * span), next: draw.next };
}

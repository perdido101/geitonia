// §4.4 — reputation: not a score, a relationship. These numbers are the tuning surface.
// Pure functions; the tick/actions apply them and clamp.

export const REP_ANGRY = -2.0;
export const REP_ANGRY_REGULAR = -4.0; // double
export const REP_WRONG_SERVE = -0.3;
export const REP_PLATEIA_CHAT = 0.5;
export const REP_NEGLECT = -0.2;
export const REP_SERVE_REGULAR = 1.0; // spec 1.5, sim-tuned so rep is a climb not a sprint
export const REP_SERVE_BASE = 0.4; // spec 0.5, sim-tuned

/** speedBonus = 1.0 + patienceRemaining → instant serve ≈ 2.0×, last-second ≈ 1.0×. */
export function speedBonus(patienceRemaining: number): number {
  return 1.0 + Math.max(0, patienceRemaining);
}

/** Reputation gained for a correct serve. */
export function reputationForServe(isRegular: boolean, patienceRemaining: number): number {
  if (isRegular) return REP_SERVE_REGULAR;
  return REP_SERVE_BASE * speedBonus(patienceRemaining);
}

/** Reputation lost when a customer leaves angry (double for a Regular). */
export function reputationForAngry(isRegular: boolean): number {
  return isRegular ? REP_ANGRY_REGULAR : REP_ANGRY;
}

export function clampReputation(v: number): number {
  return Math.max(0, Math.min(100, v));
}

/** Personal Regular standing: +1 serve / −2 fail, clamped [-10, +10]. */
export function clampStanding(v: number): number {
  return Math.max(-10, Math.min(10, v));
}

/**
 * repMultiplier(rep) = 0.6 + (rep/100)*0.8 → 0.6× to 1.4× foot traffic.
 * Bad reputation means an empty shop; the death spiral is intentional but escapable
 * (Πλατεία chat + cheap comfort upgrades).
 */
export function repMultiplier(rep: number): number {
  return 0.6 + (rep / 100) * 0.8;
}

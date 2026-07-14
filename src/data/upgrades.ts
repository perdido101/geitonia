import type { UpgradeDef, UpgradeLine } from './types';

// §5.5 — four upgrade lines, each with three tiers. Definitions are shared across all
// seven shops (each shop tracks its own purchased tier). Effects are stated to the player
// in plain language (§8), never as a raw multiplier — see descEL/descEN.

export const UPGRADE_LINES: Record<UpgradeLine, UpgradeDef> = {
  speed: {
    line: 'speed',
    nameEL: 'Ταχύτητα', nameEN: 'Speed',
    descEL: 'Οι σταθμοί μαγειρεύουν πιο γρήγορα.',
    descEN: 'Stations cook faster.',
    effect: [0.85, 0.72, 0.6], // cookTime multiplier
    cost: [300, 800, 2000],
  },
  capacity: {
    line: 'capacity',
    nameEL: 'Χωρητικότητα', nameEN: 'Capacity',
    descEL: 'Περισσότεροι σταθμοί για να δουλεύεις παράλληλα.',
    descEN: 'More station instances to work in parallel.',
    effect: [1, 2, 3], // extra station instances
    cost: [500, 1200, 3000],
  },
  quality: {
    line: 'quality',
    nameEL: 'Ποιότητα', nameEN: 'Quality',
    descEL: 'Οι πελάτες πληρώνουν περισσότερα.',
    descEN: 'Customers pay more.',
    effect: [0.15, 0.3, 0.5], // basePrice bonus fraction
    cost: [400, 1000, 2500],
  },
  comfort: {
    line: 'comfort',
    nameEL: 'Άνεση', nameEN: 'Comfort',
    descEL: 'Οι πελάτες περιμένουν περισσότερο πριν φύγουν.',
    descEN: 'Customers wait longer before leaving.',
    effect: [0.9, 0.8, 0.65], // patience drain multiplier
    cost: [350, 900, 2200],
  },
};

export const UPGRADE_LINE_KEYS = Object.keys(UPGRADE_LINES) as UpgradeLine[];
export const MAX_UPGRADE_TIER = 3;

export function getUpgradeLine(line: UpgradeLine): UpgradeDef {
  return UPGRADE_LINES[line];
}

/** Cost to go from the current tier to the next, or null if maxed. */
export function nextUpgradeCost(line: UpgradeLine, currentTier: number): number | null {
  if (currentTier >= MAX_UPGRADE_TIER) return null;
  return UPGRADE_LINES[line].cost[currentTier];
}

/** The effect value at a given owned tier (0 = not purchased → neutral). */
export function upgradeEffect(line: UpgradeLine, tier: number): number {
  if (tier <= 0) {
    // Neutral value per line: multipliers → 1, additive → 0.
    return line === 'capacity' || line === 'quality' ? 0 : 1;
  }
  return UPGRADE_LINES[line].effect[Math.min(tier, MAX_UPGRADE_TIER) - 1];
}

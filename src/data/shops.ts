import type { ShopDef } from './types';

// §5.1 — 7 shops. Unlock gates, costs, base spawn rates, station lists.
// The archetype pool is derived from customers.ts (shopWeights); the recipe pool
// from recipes.ts (shopKey). Note the inverse relationship: Περίπτερο is a firehose
// of tiny transactions; Ψαροταβέρνα is a trickle of €16 fish.

export const SHOPS: Record<string, ShopDef> = {
  kafeneio: {
    key: 'kafeneio',
    nameEL: 'Καφενείο',
    nameEN: 'Kafeneio',
    unlock: { kind: 'start' },
    unlockCost: 0,
    baseSpawnRate: 0.09,  // spec original ×~0.30 (sim-tuned)
    stationKeys: ['briki', 'frapiera', 'espresso'],
    bgAsset: 'bg_kafeneio',
    iconAsset: 'icon_kafeneio',
    signAsset: 'sign_kafeneio',
  },
  fournos: {
    key: 'fournos',
    nameEL: 'Φούρνος',
    nameEN: 'Bakery',
    unlock: { kind: 'rep', repShop: 'kafeneio', rep: 40 },
    unlockCost: 800,
    baseSpawnRate: 0.10,  // spec original ×~0.30 (sim-tuned)
    stationKeys: ['oven', 'dough'],
    bgAsset: 'bg_fournos',
    iconAsset: 'icon_fournos',
    signAsset: 'sign_fournos',
  },
  souvlatzidiko: {
    key: 'souvlatzidiko',
    nameEL: 'Σουβλατζίδικο',
    nameEN: 'Souvlaki shop',
    unlock: { kind: 'rep', repShop: 'fournos', rep: 50 },
    unlockCost: 1500,
    baseSpawnRate: 0.11,  // spec original ×~0.30 (sim-tuned)
    stationKeys: ['gyros', 'grill', 'wrap', 'fryer'],
    bgAsset: 'bg_souvlatzidiko',
    iconAsset: 'icon_souvlatzidiko',
    signAsset: 'sign_souvlatzidiko',
  },
  periptero: {
    key: 'periptero',
    nameEL: 'Περίπτερο',
    nameEN: 'Kiosk',
    unlock: { kind: 'rep', repShop: 'souvlatzidiko', rep: 45 },
    unlockCost: 1200,
    baseSpawnRate: 0.14,  // spec original ×~0.30 (sim-tuned)
    stationKeys: ['fridge', 'shelf', 'register'],
    bgAsset: 'bg_periptero',
    iconAsset: 'icon_periptero',
    signAsset: 'sign_periptero',
  },
  zacharoplasteio: {
    key: 'zacharoplasteio',
    nameEL: 'Ζαχαροπλαστείο',
    nameEN: 'Patisserie',
    unlock: { kind: 'rep', repShop: 'fournos', rep: 60 },
    unlockCost: 2500,
    baseSpawnRate: 0.08,  // spec original ×~0.30 (sim-tuned)
    stationKeys: ['oven', 'mixer', 'syrup'],
    bgAsset: 'bg_zacharoplasteio',
    iconAsset: 'icon_zacharoplasteio',
    signAsset: 'sign_zacharoplasteio',
  },
  psarotaverna: {
    key: 'psarotaverna',
    nameEL: 'Ψαροταβέρνα',
    nameEN: 'Fish tavern',
    unlock: { kind: 'rep', repShop: 'souvlatzidiko', rep: 65 },
    unlockCost: 3500,
    baseSpawnRate: 0.06,  // spec original ×~0.30 (sim-tuned)
    stationKeys: ['ice', 'clean', 'grill', 'fryer'],
    bgAsset: 'bg_psarotaverna',
    iconAsset: 'icon_psarotaverna',
    signAsset: 'sign_psarotaverna',
  },
  mezedopoleio: {
    key: 'mezedopoleio',
    nameEL: 'Μεζεδοπωλείο',
    nameEN: 'Meze house',
    unlock: { kind: 'anyThree', rep: 70 },
    unlockCost: 5000,
    baseSpawnRate: 0.065,  // spec original ×~0.30 (sim-tuned)
    stationKeys: ['meze', 'grill', 'fridge', 'ouzo'],
    bgAsset: 'bg_mezedopoleio',
    iconAsset: 'icon_mezedopoleio',
    signAsset: 'sign_mezedopoleio',
  },
};

export const SHOP_KEYS = Object.keys(SHOPS);
export const STARTING_SHOP = 'kafeneio';

export function getShop(key: string): ShopDef {
  const s = SHOPS[key];
  if (!s) throw new Error(`Unknown shop: ${key}`);
  return s;
}

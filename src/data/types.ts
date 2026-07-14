// Declarative content type definitions (RULE 4 — data is declarative, zero logic).
// These describe the *shape* of the content in this folder; the engine reads them
// by string key. Nothing here has behavior.

import type { AssetKey } from '../assets/registry';

export interface StationDef {
  key: string;
  nameEL: string;
  nameEN: string;
  cookTime: number; // seconds at upgrade tier 0
  burnTime: number; // seconds after ready before burning; Infinity = never burns
  baseCapacity: number;
  assetKeyPrefix: string; // e.g. 'st_briki' → st_briki_idle/_working/_ready/_burnt
}

export interface RecipeStep {
  stationKey: string;
}

export interface RecipeDef {
  itemKey: string;
  shopKey: string;
  steps: RecipeStep[];
  basePrice: number;
  assetKey: AssetKey;
}

export type ShopUnlock =
  | { kind: 'start' }
  | { kind: 'rep'; repShop: string; rep: number }
  | { kind: 'anyThree'; rep: number };

export interface ShopDef {
  key: string;
  nameEL: string;
  nameEN: string;
  unlock: ShopUnlock;
  unlockCost: number;
  baseSpawnRate: number;
  stationKeys: string[];
  bgAsset: AssetKey;
  iconAsset: AssetKey;
  signAsset: AssetKey;
}

export interface ArchetypeDef {
  key: string;
  nameEL: string;
  nameEN: string;
  patienceDrainRate: number;
  orderSize: [number, number];
  tipMult: number;
  shopWeights: Record<string, number>; // shopKey → base spawn weight
  monthWeights: Record<number, number>; // month(1..12) → multiplier (default 1 when absent)
  assetPrefix: string; // 'cu_pappous'
}

export interface RegularDef {
  key: string;
  nameEL: string;
  nameEN: string;
  shopKey: string;
  repThreshold: number;
  spawnChance: number;
  favoriteOrder: string[]; // itemKeys
  patienceDrainRate: number;
  personalityEL: string;
  personalityEN: string;
  assetPrefix: string; // 'rg_thanasis'
}

export type UpgradeLine = 'speed' | 'capacity' | 'quality' | 'comfort';

export interface UpgradeDef {
  line: UpgradeLine;
  nameEL: string;
  nameEN: string;
  descEL: string; // plain-language effect, per §8 ("never a raw multiplier")
  descEN: string;
  effect: [number, number, number]; // value at tier 1 / 2 / 3
  cost: [number, number, number];
}

export interface MonthEvent {
  dayInYear: number; // 1..48, the day the event fires
  key: string; // 'pasxa', 'xristougenna', 'apokries'
  spawnDefaultMult?: number; // applied to all shops that day
  spawnPerShopMult?: Record<string, number>;
  setFlag?: string;
}

export interface MonthDef {
  month: number; // 1..12
  key: string; // 'avgoustos'
  nameEL: string;
  nameEN: string;
  spawnDefault: number; // spawn multiplier for shops not in spawnPerShop
  spawnPerShop: Record<string, number>;
  patienceMod: number; // multiplier on patience drain
  event: MonthEvent | null;
  moAsset: AssetKey;
}

export interface DialogueSet {
  greeting: string;
  servedHappy: string;
  leftAngry: string;
  plateiaIdle: string;
}

export type NodeType =
  | 'shop'
  | 'plateia'
  | 'laiki'
  | 'trapeza'
  | 'ekklisia'
  | 'spiti'
  | 'eforia'
  | 'paralia'
  | 'steno';

export interface WorldNodeDef {
  id: string;
  x: number;
  y: number;
  type: NodeType;
  assetKey: AssetKey;
  shopKey?: string; // for type 'shop'
  labelEL: string;
  labelEN: string;
  unlockFlag?: string; // e.g. eforia unlocked by a flag
}

export interface WorldEdgeDef {
  a: string;
  b: string;
}

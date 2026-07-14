import type { WorldEdgeDef, WorldNodeDef } from './types';
import type { AssetKey } from '../assets/registry';

// §7.2 — the neighborhood as a waypoint graph in a 2048×2048 coordinate space.
// NOT a nav-mesh, NOT collision. Pathfinding is BFS over these edges (world/pathfind.ts).

export const MAP_SIZE = 2048;
export const START_NODE = 'spiti';

export const WORLD_NODES: WorldNodeDef[] = [
  // Upper cluster around the πλατεία
  { id: 'plateia', x: 1024, y: 600, type: 'plateia', assetKey: 'poi_plateia', labelEL: 'Πλατεία', labelEN: 'Square' },
  { id: 'kafeneio', x: 700, y: 500, type: 'shop', shopKey: 'kafeneio', assetKey: 'icon_kafeneio', labelEL: 'Καφενείο', labelEN: 'Kafeneio' },
  { id: 'fournos', x: 1024, y: 400, type: 'shop', shopKey: 'fournos', assetKey: 'icon_fournos', labelEL: 'Φούρνος', labelEN: 'Bakery' },
  { id: 'zacharoplasteio', x: 1350, y: 500, type: 'shop', shopKey: 'zacharoplasteio', assetKey: 'icon_zacharoplasteio', labelEL: 'Ζαχαροπλαστείο', labelEN: 'Patisserie' },
  { id: 'ekklisia', x: 1024, y: 780, type: 'ekklisia', assetKey: 'poi_ekklisia', labelEL: 'Εκκλησία', labelEN: 'Church' },

  // Junction
  { id: 'steno', x: 1024, y: 1000, type: 'steno', assetKey: 'poi_steno', labelEL: 'Στενό', labelEN: 'Alley' },

  // Middle cluster
  { id: 'periptero', x: 700, y: 1100, type: 'shop', shopKey: 'periptero', assetKey: 'icon_periptero', labelEL: 'Περίπτερο', labelEN: 'Kiosk' },
  { id: 'souvlatzidiko', x: 1024, y: 1150, type: 'shop', shopKey: 'souvlatzidiko', assetKey: 'icon_souvlatzidiko', labelEL: 'Σουβλατζίδικο', labelEN: 'Souvlaki' },
  { id: 'mezedopoleio', x: 1380, y: 1100, type: 'shop', shopKey: 'mezedopoleio', assetKey: 'icon_mezedopoleio', labelEL: 'Μεζεδοπωλείο', labelEN: 'Meze house' },
  { id: 'eforia', x: 1500, y: 900, type: 'eforia', assetKey: 'poi_eforia', labelEL: 'Εφορία', labelEN: 'Tax office', unlockFlag: 'eforiaUnlocked' },

  // Lower services
  { id: 'laiki', x: 800, y: 1300, type: 'laiki', assetKey: 'poi_laiki', labelEL: 'Λαϊκή', labelEN: 'Market' },
  { id: 'trapeza', x: 1300, y: 1300, type: 'trapeza', assetKey: 'poi_trapeza', labelEL: 'Τράπεζα', labelEN: 'Bank' },
  { id: 'spiti', x: 1024, y: 1450, type: 'spiti', assetKey: 'poi_spiti', labelEL: 'Σπίτι', labelEN: 'Home' },

  // Seaside
  { id: 'paralia', x: 1024, y: 1700, type: 'paralia', assetKey: 'poi_paralia', labelEL: 'Παραλία', labelEN: 'Beach' },
  { id: 'psarotaverna', x: 1024, y: 1850, type: 'shop', shopKey: 'psarotaverna', assetKey: 'icon_psarotaverna', labelEL: 'Ψαροταβέρνα', labelEN: 'Fish tavern' },
];

export const WORLD_EDGES: WorldEdgeDef[] = [
  { a: 'plateia', b: 'kafeneio' },
  { a: 'plateia', b: 'fournos' },
  { a: 'plateia', b: 'zacharoplasteio' },
  { a: 'plateia', b: 'ekklisia' },
  { a: 'ekklisia', b: 'steno' },
  { a: 'steno', b: 'periptero' },
  { a: 'steno', b: 'souvlatzidiko' },
  { a: 'steno', b: 'mezedopoleio' },
  { a: 'steno', b: 'eforia' },
  { a: 'souvlatzidiko', b: 'laiki' },
  { a: 'souvlatzidiko', b: 'trapeza' },
  { a: 'souvlatzidiko', b: 'spiti' },
  { a: 'laiki', b: 'spiti' },
  { a: 'trapeza', b: 'spiti' },
  { a: 'spiti', b: 'paralia' },
  { a: 'paralia', b: 'psarotaverna' },
];

const NODE_BY_ID: Record<string, WorldNodeDef> = Object.fromEntries(
  WORLD_NODES.map((n) => [n.id, n]),
);

export function worldNode(id: string): WorldNodeDef {
  const n = NODE_BY_ID[id];
  if (!n) throw new Error(`Unknown world node: ${id}`);
  return n;
}

export function allNodeAssetKeys(): AssetKey[] {
  return WORLD_NODES.map((n) => n.assetKey);
}

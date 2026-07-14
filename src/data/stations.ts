import type { StationDef } from './types';

// §5.2 — 18 stations. baseCapacity = 1 for all; the `capacity` upgrade adds instances.
// burnTime Infinity for fridge/shelf/register/ice/ouzo (they never burn).

export const STATIONS: Record<string, StationDef> = {
  briki: { key: 'briki', nameEL: 'Μπρίκι', nameEN: 'Briki', cookTime: 6, burnTime: 8, baseCapacity: 1, assetKeyPrefix: 'st_briki' },
  frapiera: { key: 'frapiera', nameEL: 'Φραπιέρα', nameEN: 'Frappe mixer', cookTime: 4, burnTime: 8, baseCapacity: 1, assetKeyPrefix: 'st_frapiera' },
  espresso: { key: 'espresso', nameEL: 'Μηχανή espresso', nameEN: 'Espresso machine', cookTime: 5, burnTime: 8, baseCapacity: 1, assetKeyPrefix: 'st_espresso' },
  oven: { key: 'oven', nameEL: 'Φούρνος', nameEN: 'Oven', cookTime: 12, burnTime: 8, baseCapacity: 1, assetKeyPrefix: 'st_oven' },
  dough: { key: 'dough', nameEL: 'Ζυμωτήριο', nameEN: 'Dough station', cookTime: 8, burnTime: 8, baseCapacity: 1, assetKeyPrefix: 'st_dough' },
  gyros: { key: 'gyros', nameEL: 'Γύρος', nameEN: 'Gyros spit', cookTime: 10, burnTime: 8, baseCapacity: 1, assetKeyPrefix: 'st_gyros' },
  grill: { key: 'grill', nameEL: 'Σχάρα', nameEN: 'Grill', cookTime: 9, burnTime: 8, baseCapacity: 1, assetKeyPrefix: 'st_grill' },
  wrap: { key: 'wrap', nameEL: 'Πάγκος τυλίγματος', nameEN: 'Wrap counter', cookTime: 3, burnTime: 8, baseCapacity: 1, assetKeyPrefix: 'st_wrap' },
  fryer: { key: 'fryer', nameEL: 'Φριτέζα', nameEN: 'Fryer', cookTime: 7, burnTime: 8, baseCapacity: 1, assetKeyPrefix: 'st_fryer' },
  fridge: { key: 'fridge', nameEL: 'Ψυγείο', nameEN: 'Fridge', cookTime: 1, burnTime: Infinity, baseCapacity: 1, assetKeyPrefix: 'st_fridge' },
  shelf: { key: 'shelf', nameEL: 'Ράφι', nameEN: 'Shelf', cookTime: 1, burnTime: Infinity, baseCapacity: 1, assetKeyPrefix: 'st_shelf' },
  register: { key: 'register', nameEL: 'Ταμείο', nameEN: 'Register', cookTime: 2, burnTime: Infinity, baseCapacity: 1, assetKeyPrefix: 'st_register' },
  mixer: { key: 'mixer', nameEL: 'Μίξερ', nameEN: 'Mixer', cookTime: 10, burnTime: 8, baseCapacity: 1, assetKeyPrefix: 'st_mixer' },
  syrup: { key: 'syrup', nameEL: 'Σιρόπι', nameEN: 'Syrup', cookTime: 5, burnTime: 8, baseCapacity: 1, assetKeyPrefix: 'st_syrup' },
  ice: { key: 'ice', nameEL: 'Πάγος', nameEN: 'Ice', cookTime: 2, burnTime: Infinity, baseCapacity: 1, assetKeyPrefix: 'st_ice' },
  clean: { key: 'clean', nameEL: 'Πάγκος καθαρίσματος', nameEN: 'Cleaning bench', cookTime: 6, burnTime: 8, baseCapacity: 1, assetKeyPrefix: 'st_clean' },
  meze: { key: 'meze', nameEL: 'Πάγκος μεζέ', nameEN: 'Meze bench', cookTime: 5, burnTime: 8, baseCapacity: 1, assetKeyPrefix: 'st_meze' },
  ouzo: { key: 'ouzo', nameEL: 'Ούζο', nameEN: 'Ouzo', cookTime: 2, burnTime: Infinity, baseCapacity: 1, assetKeyPrefix: 'st_ouzo' },
};

export const DEFAULT_BURN_TIME = 8;
export const CLEAR_TIME = 2.0;

export function getStation(key: string): StationDef {
  const s = STATIONS[key];
  if (!s) throw new Error(`Unknown station: ${key}`);
  return s;
}

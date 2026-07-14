import type { RecipeDef } from './types';

// §5.3 — 49 items. Multi-step recipes are the high-value items; the chain is the skill test.
// step order matters: steps[i].stationKey is the station used for step i.

const r = (
  itemKey: string,
  shopKey: string,
  stations: string[],
  basePrice: number,
): RecipeDef => ({
  itemKey,
  shopKey,
  steps: stations.map((stationKey) => ({ stationKey })),
  basePrice,
  assetKey: `it_${itemKey}` as RecipeDef['assetKey'],
});

export const RECIPES: RecipeDef[] = [
  // ---- Καφενείο (6) ----
  r('ellinikos', 'kafeneio', ['briki'], 2.0),
  r('soda', 'kafeneio', ['frapiera'], 2.0),
  r('nescafe', 'kafeneio', ['frapiera'], 2.5),
  r('frape', 'kafeneio', ['frapiera'], 3.0),
  r('freddo_espresso', 'kafeneio', ['espresso', 'frapiera'], 3.5),
  r('freddo_cappuccino', 'kafeneio', ['espresso', 'frapiera'], 4.0),

  // ---- Φούρνος (7) ----
  r('koulouri', 'fournos', ['oven'], 1.5),
  r('kritsinia', 'fournos', ['oven'], 1.5),
  r('psomi', 'fournos', ['dough', 'oven'], 2.0),
  r('tiropita', 'fournos', ['dough', 'oven'], 2.5),
  r('spanakopita', 'fournos', ['dough', 'oven'], 2.5),
  r('ladopsomo', 'fournos', ['dough', 'oven'], 3.0),
  r('bougatsa', 'fournos', ['dough', 'oven'], 3.5),

  // ---- Σουβλατζίδικο (7) ----
  r('tzatziki', 'souvlatzidiko', ['wrap'], 1.5),
  r('patates', 'souvlatzidiko', ['fryer'], 2.5),
  r('kalamaki', 'souvlatzidiko', ['grill'], 3.0),
  r('pita_souvlaki', 'souvlatzidiko', ['grill', 'wrap'], 4.0),
  r('pita_gyros', 'souvlatzidiko', ['gyros', 'wrap'], 4.0),
  r('pita_apola', 'souvlatzidiko', ['gyros', 'fryer', 'wrap'], 5.0),
  r('merida_gyros', 'souvlatzidiko', ['gyros', 'fryer', 'wrap'], 9.0),

  // ---- Περίπτερο (7) ----
  r('nero', 'periptero', ['fridge'], 0.5),
  r('frigania', 'periptero', ['shelf'], 1.0),
  r('gum', 'periptero', ['shelf'], 1.0),
  r('efimerida', 'periptero', ['shelf'], 2.0),
  r('lachio', 'periptero', ['register'], 2.0),
  r('pagoto', 'periptero', ['fridge'], 2.0),
  r('tsigara', 'periptero', ['shelf'], 5.0),

  // ---- Ζαχαροπλαστείο (7) ----
  r('loukoumades', 'zacharoplasteio', ['mixer', 'syrup'], 4.0),
  r('baklava', 'zacharoplasteio', ['oven', 'syrup'], 4.0),
  r('kataifi', 'zacharoplasteio', ['oven', 'syrup'], 4.0),
  r('profiterol', 'zacharoplasteio', ['mixer', 'syrup'], 5.0),
  r('galaktoboureko', 'zacharoplasteio', ['mixer', 'oven', 'syrup'], 5.0),
  r('ekmek', 'zacharoplasteio', ['mixer', 'oven', 'syrup'], 5.0),
  r('tourta', 'zacharoplasteio', ['mixer', 'oven', 'syrup'], 18.0),

  // ---- Ψαροταβέρνα (7) ----
  r('ouzo_glass', 'psarotaverna', ['ice'], 3.0),
  r('horiatiki', 'psarotaverna', ['clean'], 7.0),
  r('gavros', 'psarotaverna', ['clean', 'fryer'], 8.0),
  r('kalamaraki', 'psarotaverna', ['clean', 'fryer'], 10.0),
  r('htapodi', 'psarotaverna', ['clean', 'grill'], 12.0),
  r('barbouni', 'psarotaverna', ['clean', 'grill'], 14.0),
  r('tsipoura', 'psarotaverna', ['clean', 'grill'], 16.0),

  // ---- Μεζεδοπωλείο (8) ----
  r('karafaki', 'mezedopoleio', ['ouzo'], 5.0),
  r('fava', 'mezedopoleio', ['meze'], 5.0),
  r('taramas', 'mezedopoleio', ['meze'], 5.0),
  r('melitzanosalata', 'mezedopoleio', ['meze'], 5.0),
  r('dolmadakia', 'mezedopoleio', ['meze'], 6.0),
  r('saganaki', 'mezedopoleio', ['meze', 'grill'], 7.0),
  r('keftedakia', 'mezedopoleio', ['meze', 'grill'], 8.0),
  r('pikilia', 'mezedopoleio', ['meze', 'grill', 'fridge'], 16.0),
];

const BY_KEY: Record<string, RecipeDef> = Object.fromEntries(RECIPES.map((rc) => [rc.itemKey, rc]));
const BY_SHOP: Record<string, RecipeDef[]> = {};
for (const rc of RECIPES) (BY_SHOP[rc.shopKey] ??= []).push(rc);

export function getRecipe(itemKey: string): RecipeDef {
  const rc = BY_KEY[itemKey];
  if (!rc) throw new Error(`Unknown recipe: ${itemKey}`);
  return rc;
}

export function recipesForShop(shopKey: string): RecipeDef[] {
  return BY_SHOP[shopKey] ?? [];
}

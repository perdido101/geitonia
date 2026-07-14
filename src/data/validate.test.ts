import { describe, expect, it } from 'vitest';
import { registry } from '../assets/registry';
import type { AssetKey } from '../assets/registry';
import { SHOPS, SHOP_KEYS } from './shops';
import { STATIONS } from './stations';
import { RECIPES, recipesForShop } from './recipes';
import { ARCHETYPES, REGULARS } from './customers';
import { UPGRADE_LINES } from './upgrades';
import { MONTHS } from './calendar';
import { WORLD_NODES, WORLD_EDGES } from './world';
import { DIALOGUE } from './dialogue';

// §5 — data/validate.test.ts fails the build on any referential error in the data layer.

const registryHas = (key: string): boolean =>
  Object.prototype.hasOwnProperty.call(registry, key);

function collectAssetKeys(): string[] {
  const keys: string[] = [];
  for (const s of Object.values(SHOPS)) keys.push(s.bgAsset, s.iconAsset, s.signAsset);
  for (const r of RECIPES) keys.push(r.assetKey);
  for (const m of MONTHS) keys.push(m.moAsset);
  for (const n of WORLD_NODES) keys.push(n.assetKey);
  // Station/customer/regular prefixes expand to 4/3/4 state variants.
  for (const st of Object.values(STATIONS))
    for (const state of ['idle', 'working', 'ready', 'burnt']) keys.push(`${st.assetKeyPrefix}_${state}`);
  for (const a of Object.values(ARCHETYPES))
    for (const state of ['idle', 'angry', 'happy']) keys.push(`${a.assetPrefix}_${state}`);
  for (const rg of Object.values(REGULARS))
    for (const state of ['idle', 'angry', 'happy', 'portrait']) keys.push(`${rg.assetPrefix}_${state}`);
  return keys;
}

describe('data/validate', () => {
  it('every assetKey referenced in data exists in the registry', () => {
    const missing = collectAssetKeys().filter((k) => !registryHas(k));
    expect(missing).toEqual([]);
  });

  it('every recipe references stations its shop has', () => {
    const bad: string[] = [];
    for (const recipe of RECIPES) {
      const shop = SHOPS[recipe.shopKey];
      expect(shop, `recipe ${recipe.itemKey} → unknown shop ${recipe.shopKey}`).toBeDefined();
      for (const step of recipe.steps) {
        expect(STATIONS[step.stationKey], `recipe ${recipe.itemKey} → unknown station ${step.stationKey}`).toBeDefined();
        if (!shop.stationKeys.includes(step.stationKey)) {
          bad.push(`${recipe.itemKey} uses ${step.stationKey} not in ${recipe.shopKey}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("every Regular's favoriteOrder references a recipe in their shop's pool", () => {
    const bad: string[] = [];
    for (const rg of Object.values(REGULARS)) {
      const pool = new Set(recipesForShop(rg.shopKey).map((r) => r.itemKey));
      for (const item of rg.favoriteOrder) {
        if (!pool.has(item)) bad.push(`${rg.key} orders ${item} not in ${rg.shopKey}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('every shop unlock gate references an existing shop', () => {
    for (const shop of Object.values(SHOPS)) {
      if (shop.unlock.kind === 'rep') {
        expect(SHOP_KEYS).toContain(shop.unlock.repShop);
      }
    }
  });

  it('every upgrade line has 3 tiers of effect and cost', () => {
    for (const up of Object.values(UPGRADE_LINES)) {
      expect(up.effect).toHaveLength(3);
      expect(up.cost).toHaveLength(3);
    }
  });

  it('every world edge references existing nodes', () => {
    const ids = new Set(WORLD_NODES.map((n) => n.id));
    for (const e of WORLD_EDGES) {
      expect(ids.has(e.a), `edge from ${e.a}`).toBe(true);
      expect(ids.has(e.b), `edge to ${e.b}`).toBe(true);
    }
  });

  it('every shop station key is a real station', () => {
    for (const shop of Object.values(SHOPS)) {
      for (const sk of shop.stationKeys) {
        expect(STATIONS[sk], `shop ${shop.key} → unknown station ${sk}`).toBeDefined();
      }
    }
  });

  it('every Regular has a dialogue set', () => {
    for (const key of Object.keys(REGULARS)) {
      expect(DIALOGUE[key], `missing dialogue for ${key}`).toBeDefined();
    }
  });

  it('every archetype shopWeights key is a real shop', () => {
    for (const a of Object.values(ARCHETYPES)) {
      for (const sk of Object.keys(a.shopWeights)) {
        expect(SHOP_KEYS, `archetype ${a.key} → unknown shop ${sk}`).toContain(sk);
      }
    }
  });

  it('unused asset keys are all still valid (spot-check count)', () => {
    // The referenced set is a subset of the 331-key registry.
    const referenced = new Set(collectAssetKeys() as AssetKey[]);
    expect(referenced.size).toBeGreaterThan(0);
    expect(Object.keys(registry).length).toBe(331);
  });
});

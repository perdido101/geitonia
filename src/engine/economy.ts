// §4.5 — the economy. Revenue per served customer, fixed costs, loans. Pure.

import type { Customer, ShopRuntime } from './types';
import { getRecipe } from '../data/recipes';
import { ARCHETYPES } from '../data/customers';
import { upgradeEffect } from '../data/upgrades';

export const INGREDIENT_COST_RATE = 0.3; // 30% of shift gross
export const INGREDIENT_COST_RATE_DISCOUNT = 0.2; // 20% with λαϊκή discount
export const RENT_PER_SHOP = 40;
export const EFKA = 150; // flat, unavoidable
export const REGULAR_PAYOUT_MULT = 3.0;

export const LOAN_MAX_SINGLE = 2000;
export const DEBT_CAP = 5000;
export const MONTHLY_INTEREST = 0.05;
export const FORCED_LOAN_RATE = 0.1;

/** tipMultiplier = 1 + (reputation/100) × 0.5 → up to 1.5×. Captured at spawn time. */
export function tipMultiplierForRep(rep: number): number {
  return 1 + (rep / 100) * 0.5;
}

/** archetype.tipMult for a customer; Regulars contribute a neutral 1.0. */
export function archetypeTipMult(customer: Customer): number {
  if (customer.regularKey) return 1.0;
  return ARCHETYPES[customer.archetypeKey]?.tipMult ?? 1.0;
}

/**
 * Payout for a single item:
 *   basePrice × (1 + qualityTier×0.15) × tipMultiplier × (isRegular?3:1) × archetype.tipMult
 */
export function itemPayout(
  basePrice: number,
  qualityTier: number,
  tipMultiplier: number,
  isRegular: boolean,
  archTip: number,
): number {
  const qualityBonus = 1 + upgradeEffect('quality', qualityTier); // effect is the fraction
  return (
    basePrice * qualityBonus * tipMultiplier * (isRegular ? REGULAR_PAYOUT_MULT : 1) * archTip
  );
}

/** Total payout for serving all of a customer's order items. */
export function customerPayout(customer: Customer, shop: ShopRuntime): number {
  const qualityTier = shop.upgrades.quality ?? 0;
  const isRegular = customer.regularKey != null;
  const archTip = archetypeTipMult(customer);
  let total = 0;
  for (const item of customer.order) {
    const recipe = getRecipe(item.itemKey);
    total += itemPayout(recipe.basePrice, qualityTier, customer.tipMultiplier, isRegular, archTip);
  }
  return total;
}

/** Ingredient cost deducted at END_SHIFT. */
export function ingredientCost(gross: number, discountActive: boolean): number {
  const rate = discountActive ? INGREDIENT_COST_RATE_DISCOUNT : INGREDIENT_COST_RATE;
  return gross * rate;
}

/** Rent = €40 × number of unlocked shops. */
export function rentFor(unlockedShopCount: number): number {
  return RENT_PER_SHOP * unlockedShopCount;
}

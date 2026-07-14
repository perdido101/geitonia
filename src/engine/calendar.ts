// §4.6 — calendar helpers over the declarative MONTHS table. Pure.

import { monthDefForDay, monthForDay, dayInYear, DAYS_PER_MONTH } from '../data/calendar';

export { monthForDay, dayInYear, monthDefForDay };

/**
 * Spawn multiplier for a shop on a given day: the month's per-shop or default modifier,
 * further multiplied by any event bump firing that day (Απόκριες, Πάσχα, Χριστούγεννα).
 */
export function monthSpawnModifier(day: number, shopKey: string): number {
  const m = monthDefForDay(day);
  let mult = m.spawnPerShop[shopKey] ?? m.spawnDefault;
  const diy = dayInYear(day);
  if (m.event && m.event.dayInYear === diy) {
    if (m.event.spawnDefaultMult != null) mult *= m.event.spawnDefaultMult;
    if (m.event.spawnPerShopMult && m.event.spawnPerShopMult[shopKey] != null) {
      mult *= m.event.spawnPerShopMult[shopKey];
    }
  }
  return mult;
}

/** Patience drain multiplier for the month (higher = customers get impatient faster). */
export function monthPatienceModifier(day: number): number {
  return monthDefForDay(day).patienceMod;
}

/** True when the given day is the last day of its month (days 4, 8, 12…) — billing day. */
export function isBillingDay(day: number): boolean {
  return day % DAYS_PER_MONTH === 0;
}

/** True when the given day is the first day of a month (days 1, 5, 9…). */
export function isMonthStart(day: number): boolean {
  return day % DAYS_PER_MONTH === 1;
}

/** The event firing on this exact day, if any. */
export function eventForDay(day: number) {
  const m = monthDefForDay(day);
  if (m.event && m.event.dayInYear === dayInYear(day)) return m.event;
  return null;
}

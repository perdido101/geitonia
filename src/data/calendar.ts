import type { MonthDef } from './types';

// §4.6 — the month modifier table, as pure data. 4 shifts per month × 12 months = 48 days.
// month = ((day - 1) / 4 % 12) + 1. Events fire on a specific dayInYear (1..48).
//
// spawnDefault applies to shops not listed in spawnPerShop. patienceMod multiplies the
// patience drain rate (higher = customers get impatient faster).

export const MONTHS: MonthDef[] = [
  {
    month: 1, key: 'ianouarios', nameEL: 'Ιανουάριος', nameEN: 'January',
    spawnDefault: 0.9, spawnPerShop: { kafeneio: 1.2, fournos: 1.2 },
    patienceMod: 1.0, event: null, moAsset: 'mo_ianouarios',
  },
  {
    month: 2, key: 'fevrouarios', nameEL: 'Φεβρουάριος', nameEN: 'February',
    spawnDefault: 1.0, spawnPerShop: {}, patienceMod: 1.0,
    event: { dayInYear: 8, key: 'apokries', spawnDefaultMult: 1.4 },
    moAsset: 'mo_fevrouarios',
  },
  {
    month: 3, key: 'martios', nameEL: 'Μάρτιος', nameEN: 'March',
    spawnDefault: 1.0, spawnPerShop: {}, patienceMod: 1.0, event: null, moAsset: 'mo_martios',
  },
  {
    month: 4, key: 'aprilios', nameEL: 'Απρίλιος', nameEN: 'April',
    spawnDefault: 1.0, spawnPerShop: {}, patienceMod: 1.3,
    event: { dayInYear: 14, key: 'pasxa', spawnDefaultMult: 1.8, setFlag: 'eforiaUnlocked' },
    moAsset: 'mo_aprilios',
  },
  {
    month: 5, key: 'maios', nameEL: 'Μάιος', nameEN: 'May',
    spawnDefault: 1.0, spawnPerShop: {}, patienceMod: 1.0, event: null, moAsset: 'mo_maios',
  },
  {
    month: 6, key: 'iounios', nameEL: 'Ιούνιος', nameEN: 'June',
    spawnDefault: 1.0, spawnPerShop: {}, patienceMod: 1.0, event: null, moAsset: 'mo_iounios',
  },
  {
    month: 7, key: 'ioulios', nameEL: 'Ιούλιος', nameEN: 'July',
    spawnDefault: 1.0, spawnPerShop: { kafeneio: 0.8 }, patienceMod: 1.0, event: null, moAsset: 'mo_ioulios',
  },
  {
    month: 8, key: 'avgoustos', nameEL: 'Αύγουστος', nameEN: 'August',
    spawnDefault: 0.4, spawnPerShop: {}, patienceMod: 1.0, event: null, moAsset: 'mo_avgoustos',
  },
  {
    month: 9, key: 'septemvrios', nameEL: 'Σεπτέμβριος', nameEN: 'September',
    spawnDefault: 1.1, spawnPerShop: {}, patienceMod: 1.0, event: null, moAsset: 'mo_septemvrios',
  },
  {
    month: 10, key: 'oktovrios', nameEL: 'Οκτώβριος', nameEN: 'October',
    spawnDefault: 1.0, spawnPerShop: {}, patienceMod: 1.0, event: null, moAsset: 'mo_oktovrios',
  },
  {
    month: 11, key: 'noemvrios', nameEL: 'Νοέμβριος', nameEN: 'November',
    spawnDefault: 1.0, spawnPerShop: { kafeneio: 1.2, fournos: 1.2 }, patienceMod: 1.0, event: null, moAsset: 'mo_noemvrios',
  },
  {
    month: 12, key: 'dekemvrios', nameEL: 'Δεκέμβριος', nameEN: 'December',
    spawnDefault: 1.0, spawnPerShop: {}, patienceMod: 0.7,
    event: { dayInYear: 46, key: 'xristougenna', spawnPerShopMult: { zacharoplasteio: 2.5 } },
    moAsset: 'mo_dekemvrios',
  },
];

export const DAYS_PER_MONTH = 4;
export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_YEAR = DAYS_PER_MONTH * MONTHS_PER_YEAR; // 48

/** Month number 1..12 for a monotonic day. */
export function monthForDay(day: number): number {
  return (Math.floor((day - 1) / DAYS_PER_MONTH) % MONTHS_PER_YEAR) + 1;
}

/** Day within the current 48-day year, 1..48. */
export function dayInYear(day: number): number {
  return ((day - 1) % DAYS_PER_YEAR) + 1;
}

export function monthDef(month: number): MonthDef {
  return MONTHS[month - 1];
}

export function monthDefForDay(day: number): MonthDef {
  return monthDef(monthForDay(day));
}

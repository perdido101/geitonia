// Locale-aware display names, reading nameEL/nameEN off the data defs. Keeps components
// from branching on locale everywhere.

import { useI18n } from '../../i18n';
import type { Locale } from '../../i18n';
import { itemLabel } from '../../data/labels';
import { STATIONS } from '../../data/stations';
import { SHOPS } from '../../data/shops';
import { ARCHETYPES, REGULARS } from '../../data/customers';
import { MONTHS } from '../../data/calendar';

function pick(locale: Locale, el: string, en: string): string {
  return locale === 'en' ? en : el;
}

export function useNames() {
  const { locale } = useI18n();
  return {
    item: (key: string) => {
      const l = itemLabel(key);
      return pick(locale, l.el, l.en);
    },
    station: (key: string) => {
      const s = STATIONS[key];
      return s ? pick(locale, s.nameEL, s.nameEN) : key;
    },
    shop: (key: string) => {
      const s = SHOPS[key];
      return s ? pick(locale, s.nameEL, s.nameEN) : key;
    },
    archetype: (key: string) => {
      const a = ARCHETYPES[key];
      return a ? pick(locale, a.nameEL, a.nameEN) : key;
    },
    regular: (key: string) => {
      const r = REGULARS[key];
      return r ? pick(locale, r.nameEL, r.nameEN) : key;
    },
    month: (month: number) => {
      const m = MONTHS[month - 1];
      return m ? pick(locale, m.nameEL, m.nameEN) : String(month);
    },
    locale,
  };
}

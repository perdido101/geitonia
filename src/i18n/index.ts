import { createContext, createElement, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { el } from './el';
import { en } from './en';

export type Locale = 'el' | 'en';

const DICTS: Record<Locale, Record<string, string>> = { el, en };
const DEFAULT_LOCALE: Locale = 'el';
const LOCALE_STORAGE_KEY = 'geitonia.locale';

const isDev = import.meta.env?.DEV ?? false;

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw === 'el' || raw === 'en') return raw;
  } catch {
    /* localStorage unavailable */
  }
  return DEFAULT_LOCALE;
}

function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const dict = DICTS[locale];
  let value = dict[key];
  if (value == null) {
    // Fall back to Greek, then flag hard so missing keys are impossible to miss.
    value = DICTS[DEFAULT_LOCALE][key];
    if (value == null) return isDev ? `⟦${key}⟧` : key;
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return value;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    try {
      document.documentElement.lang = l;
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale],
  );

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return createElement(I18nContext.Provider, { value }, children);
}

/** Access locale + setter. Throws if used outside an I18nProvider. */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}

/** Convenience hook: just the translate function. */
export function useT() {
  return useI18n().t;
}

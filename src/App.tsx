import { useEffect, useState } from 'react';
import { useI18n } from './i18n';
import type { Locale } from './i18n';
import { Placeholder } from './assets/Placeholder';
import type { GameState } from './engine/types';
import { createInitialState } from './engine/state';
import { clearSave, loadGame, saveGame } from './save';

/**
 * PHASE 0 shell. This is not the game — it is proof that the scaffold works:
 * the app boots, persists a save, speaks Greek by default, and can draw a labeled
 * placeholder box wherever real art will eventually go. Every later phase replaces
 * pieces of this screen with real UI.
 */
export default function App() {
  const { t, locale, setLocale } = useI18n();
  const [state, setState] = useState<GameState>(() => loadGame() ?? createInitialState());
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Autosave on any state change (Phase 0 smoke test of the save pipeline).
  useEffect(() => {
    if (saveGame(state)) setSavedAt(Date.now());
  }, [state]);

  const handleNewGame = () => setState(createInitialState());
  const handleAdvanceDay = () => setState((s) => ({ ...s, day: s.day + 1 }));
  const handleReset = () => {
    clearSave();
    setState(createInitialState());
    setSavedAt(null);
  };

  const previewKeys = [
    'bg_kafeneio',
    'st_briki_idle',
    'it_ellinikos',
    'cu_pappous_idle',
    'rg_thanasis_portrait',
    'ui_coin',
  ] as const;

  return (
    <div className="app-frame">
      {/* Header */}
      <header className="bg-ochre px-4 py-3 text-whitewash">
        <h1 className="text-2xl font-bold tracking-wide">{t('app.title')}</h1>
        <p className="text-sm opacity-90">{t('app.subtitle')}</p>
      </header>

      <main className="flex-1 space-y-5 p-4">
        <section className="rounded-lg border border-black/10 bg-white/60 p-3">
          <h2 className="mb-2 font-semibold text-terracotta">{t('phase.0.status')}</h2>
          <ul className="space-y-1 text-sm text-black/70">
            <li>✓ {t('phase.0.booted')}</li>
            <li>✓ {t('phase.0.speaks')}</li>
            <li>✓ {t('phase.0.saved')}</li>
            <li>✓ {t('phase.0.placeholders')}</li>
          </ul>
          <p className="mt-2 text-xs italic text-black/50">{t('app.tagline')}</p>
        </section>

        {/* Save state readout */}
        <section className="rounded-lg border border-black/10 bg-white/60 p-3">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <Stat label={t('save.day')} value={String(state.day)} />
            <Stat label={t('common.money')} value={`€${state.money}`} />
            <Stat label={t('common.debt')} value={`€${state.debt}`} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleAdvanceDay}
              className="rounded bg-aegean px-3 py-2 text-sm font-medium text-white active:scale-95"
            >
              {t('save.day')} +1
            </button>
            <button
              onClick={handleNewGame}
              className="rounded bg-olive px-3 py-2 text-sm font-medium text-white active:scale-95"
            >
              {t('save.new')}
            </button>
            <button
              onClick={handleReset}
              className="rounded bg-terracotta px-3 py-2 text-sm font-medium text-white active:scale-95"
            >
              {t('save.reset')}
            </button>
          </div>
          {savedAt != null && (
            <p className="mt-2 text-xs text-olive">
              ✓ {t('save.saved')} · {new Date(savedAt).toLocaleTimeString()}
            </p>
          )}
        </section>

        {/* Placeholder gallery — proof the registry + Placeholder pipeline works */}
        <section className="rounded-lg border border-black/10 bg-white/60 p-3">
          <div className="grid grid-cols-3 gap-2">
            {previewKeys.map((k) => (
              <Placeholder key={k} assetKey={k} h={72} className="rounded" />
            ))}
          </div>
        </section>

        {/* Language toggle */}
        <section className="rounded-lg border border-black/10 bg-white/60 p-3">
          <p className="mb-2 text-sm font-medium text-black/70">{t('settings.language')}</p>
          <div className="flex gap-2">
            {(['el', 'en'] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`rounded px-3 py-2 text-sm font-medium active:scale-95 ${
                  locale === l ? 'bg-ochre text-white' : 'bg-black/10 text-black/60'
                }`}
              >
                {t(`settings.language.${l}`)}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-black/5 px-2 py-1">
      <div className="text-xs uppercase tracking-wide text-black/40">{label}</div>
      <div className="text-base font-semibold text-black/80">{value}</div>
    </div>
  );
}

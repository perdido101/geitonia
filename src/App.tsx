import { useGame } from './ui/GameContext';
import { ShiftScreen } from './ui/shift/ShiftScreen';
import { useT } from './i18n';
import type { Locale } from './i18n';
import { useI18n } from './i18n';
import { SHOP_KEYS } from './data/shops';
import { useNames } from './ui/common/names';

/**
 * TEMPORARY root router for Phase 3. Renders the ShiftScreen during a shift and a bare
 * launcher otherwise. Phase 3.5 replaces the launcher with the walkable map, and Phase 4/5
 * add the summary, meta screens, title, and game-over.
 */
export default function App() {
  const { state } = useGame();

  if (state.activeShift) {
    return (
      <div className="app-frame">
        <ShiftScreen />
      </div>
    );
  }

  return (
    <div className="app-frame">
      <Launcher />
    </div>
  );
}

function Launcher() {
  const { state, dispatch, newGame } = useGame();
  const t = useT();
  const { locale, setLocale } = useI18n();
  const names = useNames();
  const month = ((Math.floor((state.day - 1) / 4)) % 12) + 1;

  return (
    <div className="flex h-full flex-col">
      <header className="bg-ochre px-4 py-3 text-whitewash">
        <h1 className="text-2xl font-bold">{t('app.title')}</h1>
        <p className="text-xs opacity-90">
          {t('common.day')} {state.day} · {names.month(month)}
        </p>
      </header>
      <main className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <Stat label={t('common.money')} value={`€${Math.round(state.money)}`} />
          <Stat label={t('common.debt')} value={`€${Math.round(state.debt)}`} />
          <Stat label={t('common.reputation')} value={state.shops.kafeneio.reputation.toFixed(0)} />
        </div>

        <div className="space-y-2">
          {SHOP_KEYS.filter((k) => state.shops[k].unlocked).map((k) => (
            <button
              key={k}
              onClick={() => dispatch({ type: 'START_SHIFT', shopKey: k })}
              className="w-full rounded-lg bg-aegean px-4 py-3 text-left font-semibold text-white active:scale-95"
            >
              {names.shop(k)} · {t('map.open')} →
            </button>
          ))}
          <button
            onClick={() => dispatch({ type: 'ADVANCE_DAY' })}
            className="w-full rounded-lg bg-olive px-4 py-3 font-semibold text-white active:scale-95"
          >
            {t('spiti.sleep')} →
          </button>
          <button
            onClick={() => newGame(true)}
            className="w-full rounded-lg bg-terracotta/80 px-4 py-2 text-sm font-medium text-white active:scale-95"
          >
            {t('save.new')}
          </button>
        </div>

        <div className="flex gap-2 pt-2">
          {(['el', 'en'] as Locale[]).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`rounded px-3 py-1.5 text-sm ${locale === l ? 'bg-ochre text-white' : 'bg-black/10 text-black/60'}`}
            >
              {t(`settings.language.${l}`)}
            </button>
          ))}
        </div>
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

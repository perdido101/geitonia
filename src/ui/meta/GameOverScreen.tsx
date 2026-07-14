import { useGame } from '../GameContext';
import { useT } from '../../i18n';
import { Placeholder } from '../../assets/Placeholder';

/** Game over (§9): debt > €5000. Lifetime stats + restart. */
export function GameOverScreen() {
  const { state, newGame } = useGame();
  const t = useT();

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/85 p-6 text-center text-white">
      <Placeholder assetKey="ui_logo" h={80} className="rounded opacity-70" />
      <h1 className="text-3xl font-black tracking-widest text-terracotta">{t('gameover.title')}</h1>
      <p className="text-sm text-white/70">{t('gameover.desc')}</p>
      <div className="my-2 space-y-1 text-sm">
        <div>
          {t('gameover.lifetime')}: <b>€{Math.round(state.lifetimeEarnings)}</b>
        </div>
        <div>
          {t('gameover.days')}: <b>{state.day}</b>
        </div>
        <div className="text-white/50">
          {t('common.debt')}: €{Math.round(state.debt)}
        </div>
      </div>
      <button
        onClick={() => newGame(true)}
        className="rounded-lg bg-ochre px-6 py-3 font-bold text-white active:scale-95"
      >
        {t('gameover.restart')}
      </button>
    </div>
  );
}

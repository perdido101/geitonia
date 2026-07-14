import { useGame } from '../GameContext';
import { useNames } from '../common/names';
import { useT } from '../../i18n';

/** Renders transient juice from engine ShiftEvents: payout pops, confetti, regular nameplates. */
export function EffectsLayer() {
  const { effects, clearEffect } = useGame();
  const names = useNames();
  const t = useT();

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {effects.map((fx, i) => {
        const { event } = fx;
        if (event.kind === 'served') {
          const offset = (i % 5) * 18 - 36;
          return (
            <div
              key={fx.id}
              className="fx-float absolute left-1/2 top-[36%] -translate-x-1/2 text-center"
              style={{ marginLeft: offset }}
              onAnimationEnd={() => clearEffect(fx.id)}
            >
              <div className={`text-xl font-black ${event.regular ? 'text-ochre' : 'text-olive'} drop-shadow`}>
                +€{event.payout.toFixed(2)}
              </div>
              {event.regular && <div className="text-2xl">✨</div>}
            </div>
          );
        }
        if (event.kind === 'regular_arrive') {
          return (
            <div
              key={fx.id}
              className="fx-nameplate absolute left-0 top-[30%] rounded-r-xl bg-ochre px-4 py-2 text-white shadow-lg"
              onAnimationEnd={() => clearEffect(fx.id)}
            >
              <div className="text-[10px] uppercase tracking-wide opacity-80">{t('shift.regularArrived')}</div>
              <div className="text-base font-bold">{names.regular(event.regularKey)}</div>
            </div>
          );
        }
        if (event.kind === 'left_angry') {
          return (
            <div
              key={fx.id}
              className="fx-float absolute left-1/2 top-[38%] -translate-x-1/2 text-2xl"
              onAnimationEnd={() => clearEffect(fx.id)}
            >
              😠
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

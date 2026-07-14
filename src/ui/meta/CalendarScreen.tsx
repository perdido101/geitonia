import { useGame } from '../GameContext';
import { MONTHS } from '../../data/calendar';
import { monthForDay, dayInYear } from '../../engine';
import { Modal } from '../common/Modal';
import { useT, useI18n } from '../../i18n';
import { Placeholder } from '../../assets/Placeholder';

/** Calendar (§8): the year at a glance, current month marked, Αύγουστος flagged red from June. */
export function CalendarScreen({ onClose }: { onClose: () => void }) {
  const { state } = useGame();
  const t = useT();
  const { locale } = useI18n();
  const currentMonth = monthForDay(state.day);
  const diy = dayInYear(state.day);

  return (
    <Modal title={t('calendar.title')} onClose={onClose}>
      <div className="grid grid-cols-3 gap-2">
        {MONTHS.map((m) => {
          const isCurrent = m.month === currentMonth;
          const augFlag = m.month === 8 && currentMonth >= 6;
          const hasEvent = m.event != null;
          return (
            <div
              key={m.month}
              className={`relative rounded-xl border p-1.5 text-center ${
                isCurrent ? 'border-ochre bg-ochre/15' : augFlag ? 'border-red-400 bg-red-50' : 'border-black/10 bg-white/60'
              }`}
            >
              <Placeholder assetKey={m.moAsset} h={40} className="mb-1 rounded" />
              <div className="truncate text-[10px] font-semibold text-black/70">
                {locale === 'en' ? m.nameEN : m.nameEL}
              </div>
              {m.spawnDefault < 0.6 && (
                <div className="text-[9px] font-bold text-red-500">×{m.spawnDefault}</div>
              )}
              {hasEvent && <div className="text-[9px] text-aegean">★</div>}
              {isCurrent && (
                <div className="text-[9px] text-ochre">
                  {t('common.day')} {Math.floor((diy - 1) % 4) + 1}/4
                </div>
              )}
            </div>
          );
        })}
      </div>
      {currentMonth >= 6 && currentMonth < 8 && (
        <div className="mt-3 rounded-lg bg-red-500 px-3 py-2 text-center text-xs font-bold text-white">
          {t('calendar.augustWarning')}
        </div>
      )}
    </Modal>
  );
}

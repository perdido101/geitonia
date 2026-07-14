import { useGame } from '../GameContext';
import { rentFor, EFKA, isBillingDay } from '../../engine';
import { Modal } from '../common/Modal';
import { useT } from '../../i18n';
import { useNames } from '../common/names';

/** Shift summary, shown on Sleep at ΣΠΙΤΙ (§8). ADVANCE_DAY has already run. */
export function ShiftSummary({ onClose }: { onClose: () => void }) {
  const { state, lastShift } = useGame();
  const t = useT();
  const names = useNames();

  const revenue = lastShift?.gross ?? 0;
  const ingredients = lastShift?.ingredientCost ?? 0;
  const billing = isBillingDay(state.day);
  const unlockedCount = Object.values(state.shops).filter((s) => s.unlocked).length;
  const rent = billing ? rentFor(unlockedCount) : 0;
  const efka = billing ? EFKA : 0;
  const net = revenue - ingredients - rent - efka;

  const Row = ({ label, value, strong }: { label: string; value: number; strong?: boolean }) => (
    <div className={`flex justify-between ${strong ? 'border-t border-black/20 pt-1 font-bold' : ''}`}>
      <span className={strong ? 'text-black/80' : 'text-black/60'}>{label}</span>
      <span className={value < 0 ? 'text-terracotta' : 'text-olive'}>
        {value < 0 ? '−' : ''}€{Math.abs(value).toFixed(2)}
      </span>
    </div>
  );

  return (
    <Modal title={t('summary.title')} onClose={onClose} closeLabel={t('summary.continue')}>
      {lastShift && (
        <div className="mb-3 flex justify-between text-sm">
          <span className="text-olive">
            {t('summary.served')}: <b>{lastShift.served}</b>
          </span>
          <span className="text-terracotta">
            {t('summary.left')}: <b>{lastShift.failed}</b>
          </span>
        </div>
      )}
      <div className="space-y-1 text-sm">
        <Row label={t('summary.revenue')} value={revenue} />
        <Row label={t('summary.ingredients')} value={-ingredients} />
        {billing && <Row label={t('summary.rent')} value={-rent} />}
        {billing && <Row label={t('summary.efka')} value={-efka} />}
        <Row label={t('summary.net')} value={net} strong />
      </div>
      <div className="mt-3 flex justify-between text-xs text-black/50">
        <span>{lastShift ? names.shop(lastShift.shopKey) : ''}</span>
        <span>
          {t('common.money')}: €{Math.round(state.money)} · {t('common.debt')}: €{Math.round(state.debt)}
        </span>
      </div>
    </Modal>
  );
}

import { useGame } from '../GameContext';
import { REGULARS, REGULAR_KEYS } from '../../data/customers';
import { Modal } from '../common/Modal';
import { useT, useI18n } from '../../i18n';
import { useNames } from '../common/names';
import { Placeholder } from '../../assets/Placeholder';
import type { AssetKey } from '../../assets/registry';

/** Regulars roster (§8), reached from ΣΠΙΤΙ. Locked Regulars are silhouettes with their gate. */
export function RosterScreen({ onClose }: { onClose: () => void }) {
  const { state } = useGame();
  const t = useT();
  const { locale } = useI18n();
  const names = useNames();

  return (
    <Modal title={t('roster.title')} onClose={onClose}>
      <div className="space-y-2">
        {REGULAR_KEYS.map((key) => {
          const def = REGULARS[key];
          const rec = state.regulars[key];
          const unlocked = rec?.unlocked;
          return (
            <div key={key} className="flex gap-3 rounded-xl border border-black/10 bg-white/60 p-2">
              <div className={unlocked ? '' : 'brightness-0 opacity-30'}>
                <Placeholder assetKey={`rg_${key}_portrait` as AssetKey} h={54} w={54} className="rounded-lg" />
              </div>
              <div className="min-w-0 flex-1">
                {unlocked ? (
                  <>
                    <div className="text-sm font-bold text-black/80">{names.regular(key)}</div>
                    <p className="text-[10px] italic leading-tight text-black/50">
                      {locale === 'en' ? def.personalityEN : def.personalityEL}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                      <span className="rounded bg-black/5 px-1.5 py-0.5">
                        {t('roster.favorite')}: {def.favoriteOrder.map((k) => names.item(k)).join(' + ')}
                      </span>
                    </div>
                    <div className="mt-1 flex gap-3 text-[10px] text-black/50">
                      <span>✓ {rec.timesServed}</span>
                      <span>✗ {rec.timesFailed}</span>
                      <span>
                        {t('roster.standing')}: {rec.standing > 0 ? '+' : ''}
                        {rec.standing}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-bold text-black/40">{t('roster.locked')}</div>
                    <p className="mt-1 text-[11px] text-black/40">
                      {t('roster.lockedReq', { rep: def.repThreshold, shop: names.shop(def.shopKey) })}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

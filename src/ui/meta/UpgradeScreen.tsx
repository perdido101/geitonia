import { useGame } from '../GameContext';
import { UPGRADE_LINES, UPGRADE_LINE_KEYS, nextUpgradeCost, MAX_UPGRADE_TIER } from '../../data/upgrades';
import type { UpgradeLine } from '../../data/types';
import { Modal } from '../common/Modal';
import { useT, useI18n } from '../../i18n';
import { useNames } from '../common/names';
import { Placeholder } from '../../assets/Placeholder';
import type { AssetKey } from '../../assets/registry';

/** Upgrade screen for a shop (§8). Effects stated in plain language, never a raw multiplier. */
export function UpgradeScreen({ shopKey, onClose }: { shopKey: string; onClose: () => void }) {
  const { state, dispatch } = useGame();
  const t = useT();
  const { locale } = useI18n();
  const names = useNames();
  const shop = state.shops[shopKey];

  return (
    <Modal title={`${names.shop(shopKey)} · ${t('upgrade.title')}`} onClose={onClose}>
      <div className="space-y-2">
        {UPGRADE_LINE_KEYS.map((line: UpgradeLine) => {
          const def = UPGRADE_LINES[line];
          const tier = shop.upgrades[line] ?? 0;
          const cost = nextUpgradeCost(line, tier);
          const maxed = cost == null;
          const affordable = cost != null && state.money >= cost;
          return (
            <div key={line} className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/60 p-2">
              <Placeholder assetKey={`up_${shopKey}_${line}` as AssetKey} h={40} w={40} className="rounded-lg" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-black/80">
                    {locale === 'en' ? def.nameEN : def.nameEL}
                  </span>
                  <span className="text-[10px] text-black/40">
                    {t('upgrade.tier', { n: tier })} / {MAX_UPGRADE_TIER}
                  </span>
                </div>
                <p className="text-[11px] text-black/50">{locale === 'en' ? def.descEN : def.descEL}</p>
                {/* Tier pips */}
                <div className="mt-1 flex gap-1">
                  {[1, 2, 3].map((ti) => (
                    <span
                      key={ti}
                      className={`h-1.5 flex-1 rounded-full ${ti <= tier ? 'bg-ochre' : 'bg-black/15'}`}
                    />
                  ))}
                </div>
              </div>
              <button
                disabled={maxed || !affordable}
                onClick={() => dispatch({ type: 'BUY_UPGRADE', shopKey, upgradeKey: line })}
                className={`w-20 shrink-0 rounded-lg px-2 py-2 text-xs font-bold active:scale-95 ${
                  maxed
                    ? 'bg-black/10 text-black/40'
                    : affordable
                      ? 'bg-olive text-white'
                      : 'bg-black/10 text-black/30'
                }`}
              >
                {maxed ? t('upgrade.maxed') : `€${cost}`}
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-black/50">
        {t('common.money')}: €{Math.round(state.money)}
      </p>
    </Modal>
  );
}

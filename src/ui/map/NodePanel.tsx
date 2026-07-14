import { useGame } from '../GameContext';
import type { WorldNodeDef } from '../../data/types';
import { getShop } from '../../data/shops';
import { REGULARS } from '../../data/customers';
import { dialogueFor } from '../../data/dialogue';
import { canUnlock, laikiPrice, taxBill, rentFor, EFKA, monthForDay, isBillingDay } from '../../engine';
import { Modal } from '../common/Modal';
import { Placeholder } from '../../assets/Placeholder';
import type { AssetKey } from '../../assets/registry';
import { useT, useI18n } from '../../i18n';
import { useNames } from '../common/names';

interface Props {
  node: WorldNodeDef;
  onClose: () => void;
  onOpenUpgrades: (shopKey: string) => void;
  onOpenRoster: () => void;
  onOpenCalendar: () => void;
  onSleep: () => void;
}

export function NodePanel(props: Props) {
  const { node } = props;
  switch (node.type) {
    case 'shop':
      return <ShopPanel {...props} />;
    case 'plateia':
      return <PlateiaPanel {...props} />;
    case 'laiki':
      return <LaikiPanel {...props} />;
    case 'trapeza':
      return <TrapezaPanel {...props} />;
    case 'spiti':
      return <SpitiPanel {...props} />;
    case 'eforia':
      return <EforiaPanel {...props} />;
    case 'ekklisia':
      return <EkklisiaPanel {...props} />;
    default:
      return <SimplePanel {...props} />;
  }
}

function Btn({ onClick, children, tone = 'primary', disabled }: { onClick: () => void; children: React.ReactNode; tone?: 'primary' | 'olive' | 'muted'; disabled?: boolean }) {
  const cls =
    tone === 'olive' ? 'bg-olive text-white' : tone === 'muted' ? 'bg-black/10 text-black/60' : 'bg-aegean text-white';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold active:scale-95 disabled:opacity-40 ${cls}`}
    >
      {children}
    </button>
  );
}

function ShopPanel({ node, onClose, onOpenUpgrades }: Props) {
  const { state, dispatch } = useGame();
  const t = useT();
  const names = useNames();
  const shopKey = node.shopKey!;
  const shop = state.shops[shopKey];
  const def = getShop(shopKey);

  if (shop.unlocked) {
    return (
      <Modal title={names.shop(shopKey)} onClose={onClose}>
        <Placeholder assetKey={def.bgAsset} h={120} className="mb-3 w-full rounded-xl" />
        <div className="mb-3 text-center text-sm text-black/60">
          {t('common.reputation')}: <b>{shop.reputation.toFixed(0)}</b>
        </div>
        <div className="space-y-2">
          <Btn onClick={() => dispatch({ type: 'START_SHIFT', shopKey })}>{t('map.confirmOpen')}</Btn>
          <Btn tone="olive" onClick={() => onOpenUpgrades(shopKey)}>{t('map.upgrades')}</Btn>
        </div>
      </Modal>
    );
  }

  // Locked → ΠΩΛΕΙΤΑΙ sign with the unlock requirement.
  const eligible = canUnlock(state, shopKey);
  const affordable = state.money >= def.unlockCost;
  const req =
    def.unlock.kind === 'rep'
      ? t('map.unlockReqRep', { rep: def.unlock.rep, shop: names.shop(def.unlock.repShop) })
      : def.unlock.kind === 'anyThree'
        ? t('map.unlockReqThree', { rep: def.unlock.rep })
        : '';

  return (
    <Modal title={names.shop(shopKey)} onClose={onClose}>
      <div className="relative mb-3">
        <Placeholder assetKey="poi_kleisto" h={120} className="w-full rounded-xl" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rotate-[-6deg] rounded bg-red-600 px-3 py-1 text-lg font-black text-white shadow-lg">
            {t('map.poleitai')}
          </span>
        </div>
      </div>
      <div className="mb-3 space-y-1 text-center text-sm">
        <div className="text-black/60">{req}</div>
        <div className="font-semibold text-black/80">{t('map.unlockCost', { cost: def.unlockCost })}</div>
      </div>
      <Btn onClick={() => dispatch({ type: 'UNLOCK_SHOP', shopKey })} disabled={!eligible || !affordable}>
        {t('map.unlockNow')}
      </Btn>
    </Modal>
  );
}

function PlateiaPanel({ onClose }: Props) {
  const { state, dispatch } = useGame();
  const t = useT();
  const { locale } = useI18n();
  const names = useNames();
  const unlocked = Object.values(REGULARS).filter((r) => state.regulars[r.key]?.unlocked);

  return (
    <Modal title={t('plateia.title')} onClose={onClose}>
      {unlocked.length === 0 && <p className="text-sm text-black/50">{t('plateia.empty')}</p>}
      <div className="space-y-2">
        {unlocked.map((r) => {
          const chatted = state.flags[`chat_${r.key}_${state.day}`];
          const d = dialogueFor(r.key);
          return (
            <div key={r.key} className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/60 p-2">
              <Placeholder assetKey={`rg_${r.key}_idle` as AssetKey} h={44} w={44} className="rounded-lg" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-black/80">{names.regular(r.key)}</div>
                <p className="truncate text-[11px] italic text-black/50">{d.plateiaIdle}</p>
              </div>
              <button
                onClick={() => dispatch({ type: 'PLATEIA_CHAT', regularKey: r.key })}
                disabled={chatted}
                className="shrink-0 rounded-lg bg-ochre px-3 py-2 text-xs font-bold text-white active:scale-95 disabled:opacity-40"
              >
                {chatted ? t('plateia.chatted') : t('plateia.chat')}
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-center text-[10px] text-black/40">{locale === 'en' ? '+0.5 reputation per chat, once/day' : '+0.5 φήμη ανά κουβέντα, μία φορά/μέρα'}</p>
    </Modal>
  );
}

function LaikiPanel({ onClose }: Props) {
  const { state, dispatch } = useGame();
  const t = useT();
  const open = state.day % 4 === 1 || state.day % 4 === 3;
  const price = laikiPrice(monthForDay(state.day));

  return (
    <Modal title={t('laiki.title')} onClose={onClose}>
      <Placeholder assetKey="poi_laiki" h={90} className="mb-3 w-full rounded-xl" />
      {!open ? (
        <p className="text-sm text-black/50">{t('laiki.closed')}</p>
      ) : (
        <>
          <p className="mb-1 text-sm text-black/60">{t('laiki.desc')}</p>
          <p className="mb-3 text-sm font-semibold">{t('laiki.price', { price })}</p>
          <Btn
            tone="olive"
            disabled={state.ingredientDiscountActive || state.money < price}
            onClick={() => dispatch({ type: 'BUY_LAIKI_DISCOUNT' })}
          >
            {state.ingredientDiscountActive ? t('laiki.bought') : t('laiki.buy')}
          </Btn>
        </>
      )}
    </Modal>
  );
}

function TrapezaPanel({ onClose }: Props) {
  const { state, dispatch } = useGame();
  const t = useT();
  const unlockedCount = Object.values(state.shops).filter((s) => s.unlocked).length;
  const nextBilling = isBillingDay(state.day + 1);

  return (
    <Modal title={t('trapeza.title')} onClose={onClose}>
      <div className="mb-3 space-y-1 rounded-xl bg-black/5 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-black/60">{t('trapeza.debt')}</span>
          <span className="font-bold text-terracotta">€{Math.round(state.debt)}</span>
        </div>
        <div className="text-[11px] text-black/40">{t('trapeza.interest')}</div>
        <div className="mt-2 border-t border-black/10 pt-2 text-[11px] text-black/50">
          {t('trapeza.upcoming')}: {nextBilling ? `€${rentFor(unlockedCount) + EFKA} (${t('trapeza.rent')} + ${t('trapeza.efka')})` : '—'}
        </div>
      </div>
      <div className="space-y-2">
        <Btn onClick={() => dispatch({ type: 'TAKE_LOAN', amount: 500 })}>{t('trapeza.borrow200', { n: 500 })}</Btn>
        <Btn tone="olive" disabled={state.debt <= 0 || state.money <= 0} onClick={() => dispatch({ type: 'REPAY_LOAN', amount: 500 })}>
          {t('trapeza.repay200', { n: 500 })}
        </Btn>
      </div>
      <p className="mt-2 text-center text-xs text-black/50">{t('common.money')}: €{Math.round(state.money)}</p>
    </Modal>
  );
}

function SpitiPanel({ onClose, onOpenRoster, onOpenCalendar, onSleep }: Props) {
  const { save } = useGame();
  const t = useT();
  return (
    <Modal title={t('spiti.title')} onClose={onClose}>
      <Placeholder assetKey="poi_spiti" h={90} className="mb-3 w-full rounded-xl" />
      <div className="space-y-2">
        <Btn onClick={onSleep}>{t('spiti.sleep')} 🌙</Btn>
        <Btn tone="olive" onClick={onOpenRoster}>{t('spiti.roster')}</Btn>
        <Btn tone="olive" onClick={onOpenCalendar}>{t('spiti.calendar')}</Btn>
        <Btn tone="muted" onClick={() => save()}>{t('spiti.save')}</Btn>
      </div>
    </Modal>
  );
}

function EforiaPanel({ onClose }: Props) {
  const { state, dispatch } = useGame();
  const t = useT();
  const yearKey = `eforia_paid_${state.year}`;
  const paid = state.flags[yearKey];
  const bill = taxBill(state.lifetimeEarnings);

  return (
    <Modal title={t('eforia.title')} onClose={onClose}>
      <Placeholder assetKey="poi_eforia" h={90} className="mb-3 w-full rounded-xl" />
      <p className="mb-2 text-sm text-black/60">{t('eforia.desc')}</p>
      {paid ? (
        <p className="text-sm font-semibold text-olive">{t('eforia.paid')}</p>
      ) : (
        <>
          <p className="mb-3 text-lg font-bold text-terracotta">{t('eforia.bill', { n: bill })}</p>
          <Btn onClick={() => dispatch({ type: 'PAY_TAX', amount: bill, yearKey })}>{t('eforia.pay')}</Btn>
        </>
      )}
    </Modal>
  );
}

function EkklisiaPanel({ onClose }: Props) {
  const { state } = useGame();
  const t = useT();
  const events = ['apokries', 'pasxa', 'xristougenna'].filter((k) => state.flags[`event_${k}`]);
  return (
    <Modal title={t('ekklisia.title')} onClose={onClose}>
      <Placeholder assetKey="poi_ekklisia" h={90} className="mb-3 w-full rounded-xl" />
      {events.length === 0 ? (
        <p className="text-sm text-black/50">{t('ekklisia.none')}</p>
      ) : (
        <ul className="space-y-1 text-sm text-black/70">
          {events.map((k) => (
            <li key={k}>★ {k}</li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

function SimplePanel({ node, onClose }: Props) {
  const { locale } = useI18n();
  return (
    <Modal title={locale === 'en' ? node.labelEN : node.labelEL} onClose={onClose}>
      <Placeholder assetKey={node.assetKey} h={90} className="w-full rounded-xl" />
    </Modal>
  );
}

import { useState } from 'react';
import { useGame } from '../GameContext';
import type { Station } from '../../engine';
import { SHIFT_DURATION } from '../../engine';
import { getRecipe, recipesForShop } from '../../data/recipes';
import type { RecipeDef } from '../../data/types';
import { Bar } from '../common/Bar';
import { Placeholder } from '../../assets/Placeholder';
import type { AssetKey } from '../../assets/registry';
import { useNames } from '../common/names';
import { useT } from '../../i18n';
import { CustomerQueue } from './CustomerQueue';
import { StationGrid } from './StationGrid';
import { RecipePicker } from './RecipePicker';
import { EffectsLayer } from './EffectsLayer';

export function ShiftScreen() {
  const { state, dispatch, shake } = useGame();
  const names = useNames();
  const t = useT();
  const [picker, setPicker] = useState<{ stationId: string; recipes: RecipeDef[] } | null>(null);

  const shift = state.activeShift;
  if (!shift) return null;
  const shop = state.shops[shift.shopKey];
  const speedTier = shop.upgrades.speed ?? 0;

  const timeLeft = Math.max(0, shift.duration - shift.elapsed);
  const timerValue = timeLeft / SHIFT_DURATION;
  const lastOrders = shift.elapsed >= shift.duration;
  const lastFifteen = !lastOrders && timeLeft <= 15;
  const t01 = shift.elapsed / shift.duration;
  const rush = t01 >= 0.45 && t01 <= 0.6;

  const onTapStation = (station: Station) => {
    if (station.state === 'ready') {
      dispatch({ type: 'TAP_STATION', stationId: station.id });
      return;
    }
    if (station.state === 'burnt') {
      dispatch({ type: 'TAP_STATION', stationId: station.id });
      return;
    }
    if (station.state !== 'idle') return;

    // Holding an intermediate whose next step runs here → continue the chain.
    if (shift.heldItem) {
      const recipe = getRecipe(shift.heldItem);
      const nextStep = shift.heldItemStep + 1;
      if (nextStep < recipe.steps.length && recipe.steps[nextStep].stationKey === station.typeKey) {
        dispatch({ type: 'START_COOKING', stationId: station.id, itemKey: shift.heldItem, stepIndex: nextStep });
      }
      return; // holding something else — do nothing
    }

    // Empty hands → start a new item (step 0) that begins at this station type.
    const startable = recipesForShop(shift.shopKey).filter((r) => r.steps[0].stationKey === station.typeKey);
    if (startable.length === 0) return;
    if (startable.length === 1) {
      dispatch({ type: 'START_COOKING', stationId: station.id, itemKey: startable[0].itemKey, stepIndex: 0 });
    } else {
      setPicker({ stationId: station.id, recipes: startable });
    }
  };

  const onPick = (itemKey: string) => {
    if (picker) dispatch({ type: 'START_COOKING', stationId: picker.stationId, itemKey, stepIndex: 0 });
    setPicker(null);
  };

  const repColor = shop.reputation > 60 ? '#c8781e' : shop.reputation > 30 ? '#6b7a3a' : '#b5533a';

  // Onboarding Day 1: a single contextual tip that follows the loop.
  const onboarding = state.flags.onboarding && state.day === 1;
  let tip: string | null = null;
  if (onboarding) {
    const briki = shop.stations.find((s) => s.typeKey === 'briki');
    if (shift.heldItem) tip = t('tut.serve');
    else if (briki?.state === 'ready') tip = t('tut.collect');
    else if (briki?.state === 'working') tip = t('tut.wait');
    else tip = t('tut.tapBriki');
  }

  return (
    <div className={`relative flex h-full flex-col ${shake ? 'fx-shake' : ''} ${rush ? 'rush-glow' : ''}`} key={shake}>
      {/* HUD — 10% */}
      <header className="shrink-0 bg-ochre/95 px-3 py-2 text-white">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold">{names.shop(shift.shopKey)}</span>
          <span>{names.month(((Math.floor((state.day - 1) / 4)) % 12) + 1)}</span>
          <span className="font-bold">€{shift.grossEarned.toFixed(2)}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex-1">
            <Bar value={timerValue} color={lastFifteen ? '#c0392b' : '#f3e9d8'} bg="rgba(0,0,0,0.25)" pulse={lastFifteen} height={7} />
          </div>
          <div className="w-24">
            <Bar value={shop.reputation / 100} color={repColor} bg="rgba(0,0,0,0.25)" height={7} />
          </div>
        </div>
        {lastOrders && (
          <div className="mt-1 text-center text-[11px] font-bold tracking-widest text-red-100">
            {t('shift.lastOrders')}
          </div>
        )}
      </header>

      {/* Customer queue — 30% */}
      <div className="h-[30%] shrink-0 border-b border-black/10 bg-black/5">
        <CustomerQueue queue={shift.queue} heldItem={shift.heldItem} onServe={(id) => dispatch({ type: 'TAP_CUSTOMER', customerId: id })} />
      </div>

      {/* Held item indicator */}
      {shift.heldItem && (
        <button
          onClick={() => dispatch({ type: 'DISCARD_HELD' })}
          className="z-20 flex shrink-0 items-center justify-center gap-2 bg-aegean/90 py-1.5 text-white"
        >
          <span className="text-[11px]">{t('shift.holding')}:</span>
          <Placeholder assetKey={`it_${shift.heldItem}` as AssetKey} h={24} w={24} className="rounded" />
          <span className="text-xs font-semibold">{names.item(shift.heldItem)}</span>
          <span className="ml-2 text-[10px] opacity-80">✕</span>
        </button>
      )}

      {/* Station grid — remaining */}
      <div className="flex-1 overflow-y-auto">
        <StationGrid stations={shop.stations} speedTier={speedTier} onTapStation={onTapStation} />
      </div>

      {tip && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center px-4">
          <div className="rounded-full bg-aegean/95 px-4 py-2 text-center text-sm font-medium text-white shadow-lg">
            {tip}
          </div>
        </div>
      )}

      <EffectsLayer />
      {picker && <RecipePicker recipes={picker.recipes} onPick={onPick} onCancel={() => setPicker(null)} />}
    </div>
  );
}

import type { Station } from '../../engine';
import { cookTime, burnTime, CLEAR_TIME } from '../../engine';
import { Placeholder } from '../../assets/Placeholder';
import type { AssetKey } from '../../assets/registry';
import { useNames } from '../common/names';

function Ring({ progress, color }: { progress: number; color: string }) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-xl"
      style={{
        background: `conic-gradient(${color} ${pct * 360}deg, transparent 0deg)`,
        opacity: 0.55,
        mask: 'radial-gradient(circle at center, transparent 58%, black 60%)',
        WebkitMask: 'radial-gradient(circle at center, transparent 58%, black 60%)',
      }}
    />
  );
}

function StationTile({
  station,
  speedTier,
  onTap,
}: {
  station: Station;
  speedTier: number;
  onTap: () => void;
}) {
  const names = useNames();
  const { state, typeKey, producing, timer } = station;

  let progress = 0;
  if (state === 'working') progress = timer / cookTime(typeKey, speedTier);
  else if (state === 'clearing') progress = timer / CLEAR_TIME;
  else if (state === 'ready' && Number.isFinite(burnTime(typeKey))) {
    progress = timer / burnTime(typeKey); // how close to burning
  }

  const spriteKey = `st_${typeKey}_${state === 'clearing' ? 'burnt' : state}` as AssetKey;

  const bg =
    state === 'burnt' || state === 'clearing'
      ? 'bg-red-200 border-red-400'
      : state === 'ready'
        ? 'bg-amber-100 border-amber-400'
        : 'bg-white/70 border-black/10';

  return (
    <button
      onClick={onTap}
      className={`relative flex aspect-square min-h-[88px] flex-col items-center justify-center rounded-xl border p-1 active:scale-95 ${bg} ${
        state === 'ready' ? 'fx-ready' : ''
      }`}
    >
      {/* Floating item above when ready */}
      {state === 'ready' && producing && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Placeholder assetKey={`it_${producing}` as AssetKey} h={26} w={26} className="rounded" />
        </div>
      )}
      <div className={state === 'working' ? 'opacity-60' : ''}>
        <Placeholder assetKey={spriteKey} h={46} w={46} className="rounded-lg" />
      </div>
      <span className="mt-0.5 text-[9px] font-semibold text-black/60">{names.station(typeKey)}</span>

      {(state === 'working' || state === 'clearing') && (
        <Ring progress={progress} color={state === 'clearing' ? '#c0392b' : '#1d6a96'} />
      )}
      {state === 'working' && producing && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <Placeholder assetKey={`it_${producing}` as AssetKey} h={24} w={24} />
        </div>
      )}
    </button>
  );
}

export function StationGrid({
  stations,
  speedTier,
  onTapStation,
}: {
  stations: Station[];
  speedTier: number;
  onTapStation: (station: Station) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 p-3">
      {stations.map((s) => (
        <StationTile key={s.id} station={s} speedTier={speedTier} onTap={() => onTapStation(s)} />
      ))}
    </div>
  );
}

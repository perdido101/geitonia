import type { RecipeDef } from '../../data/types';
import { Placeholder } from '../../assets/Placeholder';
import type { AssetKey } from '../../assets/registry';
import { useNames } from '../common/names';

/** A small overlay of recipes that can start at the tapped station. */
export function RecipePicker({
  recipes,
  onPick,
  onCancel,
}: {
  recipes: RecipeDef[];
  onPick: (itemKey: string) => void;
  onCancel: () => void;
}) {
  const names = useNames();
  return (
    <div className="absolute inset-0 z-40 flex items-end bg-black/40" onClick={onCancel}>
      <div
        className="w-full rounded-t-3xl bg-whitewash p-4 pb-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 h-1 w-10 self-center rounded-full bg-black/20" />
        <div className="grid grid-cols-3 gap-3">
          {recipes.map((r) => (
            <button
              key={r.itemKey}
              onClick={() => onPick(r.itemKey)}
              className="flex flex-col items-center rounded-xl border border-black/10 bg-white/70 p-2 active:scale-95"
            >
              <Placeholder assetKey={`it_${r.itemKey}` as AssetKey} h={48} w={48} className="rounded-lg" />
              <span className="mt-1 truncate text-[11px] font-semibold text-black/70">{names.item(r.itemKey)}</span>
              <span className="text-[10px] text-olive">€{r.basePrice.toFixed(1)}</span>
              {r.steps.length > 1 && (
                <span className="text-[9px] text-black/40">{r.steps.length} βήματα</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

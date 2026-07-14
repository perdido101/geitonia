import type { Customer } from '../../engine';
import { Placeholder } from '../../assets/Placeholder';
import type { AssetKey } from '../../assets/registry';
import { Bar } from '../common/Bar';
import { useNames } from '../common/names';

function patienceColor(p: number): string {
  if (p > 0.5) return '#4a9d3f';
  if (p > 0.25) return '#d8a72a';
  return '#c0392b';
}

function CustomerCard({
  customer,
  highlight,
  onTap,
}: {
  customer: Customer;
  highlight: boolean;
  onTap: () => void;
}) {
  const names = useNames();
  const isRegular = customer.regularKey != null;
  const spriteKey = (isRegular ? `rg_${customer.regularKey}_idle` : `cu_${customer.archetypeKey}_idle`) as AssetKey;
  const name = isRegular ? names.regular(customer.regularKey!) : names.archetype(customer.archetypeKey);
  const low = customer.patience < 0.25;

  return (
    <button
      onClick={onTap}
      className={`relative flex w-[92px] shrink-0 flex-col items-center rounded-xl border p-1.5 text-center active:scale-95 ${
        highlight ? 'border-ochre bg-ochre/10' : 'border-black/10 bg-white/70'
      } ${isRegular ? 'ring-2 ring-ochre/70' : ''}`}
    >
      <Placeholder assetKey={spriteKey} h={44} w={44} className="rounded-lg" />
      <div className="mt-0.5 w-full truncate text-[10px] font-semibold text-black/70">{name}</div>
      <div className="my-1 flex flex-wrap justify-center gap-0.5">
        {customer.order.map((o, i) => (
          <div key={i} className={o.fulfilled ? 'opacity-30 grayscale' : ''}>
            <Placeholder assetKey={`it_${o.itemKey}` as AssetKey} h={20} w={20} className="rounded" />
          </div>
        ))}
      </div>
      <div className="w-full">
        <Bar
          value={customer.patience}
          color={patienceColor(customer.patience)}
          pulse={low}
          height={6}
        />
      </div>
    </button>
  );
}

export function CustomerQueue({
  queue,
  heldItem,
  onServe,
}: {
  queue: Customer[];
  heldItem: string | null;
  onServe: (id: string) => void;
}) {
  return (
    <div className="flex h-full items-center gap-2 overflow-x-auto px-3 py-2">
      {queue.length === 0 && (
        <div className="w-full text-center text-sm text-black/30">…</div>
      )}
      {queue.map((c) => {
        const wants = heldItem != null && c.order.some((o) => !o.fulfilled && o.itemKey === heldItem);
        return <CustomerCard key={c.id} customer={c} highlight={wants} onTap={() => onServe(c.id)} />;
      })}
    </div>
  );
}

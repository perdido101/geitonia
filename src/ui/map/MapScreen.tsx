import { useEffect, useRef, useState } from 'react';
import { useGame } from '../GameContext';
import { WORLD_NODES, WORLD_EDGES, worldNode, START_NODE, MAP_SIZE } from '../../data/world';
import type { WorldNodeDef } from '../../data/types';
import { createWorldState } from '../../world/state';
import type { WorldState } from '../../world/state';
import { tickWorld, walkTo } from '../../world/tick';
import { getShop } from '../../data/shops';
import { canUnlock } from '../../engine';
import type { GameState } from '../../engine';
import { Placeholder } from '../../assets/Placeholder';
import type { AssetKey } from '../../assets/registry';
import { useT } from '../../i18n';
import { useNames } from '../common/names';
import { NodePanel } from './NodePanel';
import { UpgradeScreen } from '../meta/UpgradeScreen';
import { RosterScreen } from '../meta/RosterScreen';
import { CalendarScreen } from '../meta/CalendarScreen';
import { ShiftSummary } from '../meta/ShiftSummary';
import { SettingsModal } from '../meta/SettingsModal';

const SCALE = 0.46; // map units → screen px

type Overlay =
  | { kind: 'node'; nodeId: string }
  | { kind: 'upgrades'; shopKey: string }
  | { kind: 'roster' }
  | { kind: 'calendar' }
  | { kind: 'summary' }
  | { kind: 'settings' }
  | null;

export function MapScreen() {
  const { state, dispatch } = useGame();
  const t = useT();
  const names = useNames();

  const start = worldNode(START_NODE);
  const [world, setWorld] = useState<WorldState>(() => createWorldState(START_NODE, start.x, start.y));
  const worldRef = useRef(world);
  worldRef.current = world;
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);

  // World tick loop — advances the avatar and opens a node panel on arrival.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const w = worldRef.current;
      if (w.moving) {
        const next = tickWorld(w, dt, (nodeId) => {
          if (nodeId === pendingRef.current) {
            pendingRef.current = null;
            setOverlay({ kind: 'node', nodeId });
          }
        });
        setWorld(next);
        // Camera follows the avatar while walking.
        const el = scrollRef.current;
        if (el) {
          el.scrollTo({
            left: next.playerPos.x * SCALE - el.clientWidth / 2,
            top: next.playerPos.y * SCALE - el.clientHeight / 2,
            behavior: 'auto',
          });
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Center on the avatar once on mount.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = start.x * SCALE - el.clientWidth / 2;
      el.scrollTop = start.y * SCALE - el.clientHeight / 2;
    }
  }, [start.x, start.y]);

  const goToNode = (node: WorldNodeDef) => {
    // Locked eforia is not walkable until its flag is set.
    if (node.unlockFlag && !state.flags[node.unlockFlag]) return;
    if (node.id === world.currentNodeId && !world.moving) {
      setOverlay({ kind: 'node', nodeId: node.id });
      return;
    }
    pendingRef.current = node.id;
    setWorld((w) => walkTo(w, node.x, node.y));
  };

  const onSleep = () => {
    dispatch({ type: 'ADVANCE_DAY' });
    setOverlay({ kind: 'summary' });
  };

  const month = ((Math.floor((state.day - 1) / 4)) % 12) + 1;
  const avgRep = averageRep(state);
  const facing = world.facing;
  const avatarKey = (world.moving ? `av_walk_${facing}_1` : `av_idle_${facing}`) as AssetKey;

  return (
    <div className="relative flex h-full flex-col">
      {/* Map HUD */}
      <header className="z-20 flex items-center justify-between bg-ochre/95 px-3 py-2 text-xs text-white">
        <span className="font-bold">€{Math.round(state.money)}</span>
        <span className={state.debt > 0 ? 'text-red-200' : 'opacity-60'}>
          {t('common.debt')} €{Math.round(state.debt)}
        </span>
        <span>
          {t('common.day')} {state.day} · {names.month(month)}
        </span>
        <span>★ {avgRep.toFixed(0)}</span>
        <button onClick={() => setOverlay({ kind: 'settings' })} className="text-base leading-none active:scale-90">
          ⚙
        </button>
      </header>

      {/* Scrollable map viewport */}
      <div ref={scrollRef} className="relative flex-1 overflow-auto bg-[#cfe3d0]">
        <div className="relative" style={{ width: MAP_SIZE * SCALE, height: MAP_SIZE * SCALE }}>
          {/* Background */}
          <div className="absolute inset-0">
            <Placeholder assetKey="bg_map_geitonia" w={MAP_SIZE * SCALE} h={MAP_SIZE * SCALE} />
          </div>

          {/* Edges */}
          <svg className="pointer-events-none absolute inset-0" width={MAP_SIZE * SCALE} height={MAP_SIZE * SCALE}>
            {WORLD_EDGES_CACHE.map(([a, b], i) => (
              <line
                key={i}
                x1={a.x * SCALE}
                y1={a.y * SCALE}
                x2={b.x * SCALE}
                y2={b.y * SCALE}
                stroke="rgba(90,70,40,0.35)"
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray="2 10"
              />
            ))}
          </svg>

          {/* Nodes */}
          {WORLD_NODES.map((node) => (
            <MapNode key={node.id} node={node} onTap={() => goToNode(node)} />
          ))}

          {/* Avatar */}
          <div
            className="pointer-events-none absolute z-10"
            style={{
              left: world.playerPos.x * SCALE - 16,
              top: world.playerPos.y * SCALE - 24,
              transition: 'left 60ms linear, top 60ms linear',
            }}
          >
            <Placeholder assetKey={avatarKey} w={32} h={40} className="rounded" />
          </div>
        </div>
      </div>

      {/* Overlays */}
      {overlay?.kind === 'node' && (
        <NodePanel
          node={worldNode(overlay.nodeId)}
          onClose={() => setOverlay(null)}
          onOpenUpgrades={(shopKey) => setOverlay({ kind: 'upgrades', shopKey })}
          onOpenRoster={() => setOverlay({ kind: 'roster' })}
          onOpenCalendar={() => setOverlay({ kind: 'calendar' })}
          onSleep={onSleep}
        />
      )}
      {overlay?.kind === 'upgrades' && <UpgradeScreen shopKey={overlay.shopKey} onClose={() => setOverlay(null)} />}
      {overlay?.kind === 'roster' && <RosterScreen onClose={() => setOverlay(null)} />}
      {overlay?.kind === 'calendar' && <CalendarScreen onClose={() => setOverlay(null)} />}
      {overlay?.kind === 'summary' && <ShiftSummary onClose={() => setOverlay(null)} />}
      {overlay?.kind === 'settings' && <SettingsModal onClose={() => setOverlay(null)} />}
    </div>
  );
}

function MapNode({ node, onTap }: { node: WorldNodeDef; onTap: () => void }) {
  const { state } = useGame();
  const isShop = node.type === 'shop';
  const shop = isShop ? state.shops[node.shopKey!] : null;
  const locked = isShop ? !shop!.unlocked : node.unlockFlag ? !state.flags[node.unlockFlag] : false;

  // A locked shop whose gate is now met pulses (§8 unlock flow).
  const eligible = isShop && locked ? canUnlockNow(state, node.shopKey!) : false;

  return (
    <button
      onClick={onTap}
      className="absolute z-[5] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: node.x * SCALE, top: node.y * SCALE }}
    >
      <div className={`relative ${eligible ? 'animate-pulse' : ''} ${locked ? 'opacity-70' : ''}`}>
        <Placeholder assetKey={(locked && isShop ? 'poi_kleisto' : node.assetKey) as AssetKey} w={40} h={40} className="rounded-lg shadow" />
        {eligible && <span className="absolute -right-1 -top-1 text-xs">✨</span>}
      </div>
      <span className="mt-0.5 whitespace-nowrap rounded bg-black/50 px-1 text-[8px] font-semibold text-white">
        {labelFor(node, state)}
      </span>
    </button>
  );
}

// ---- helpers ----

const WORLD_EDGES_CACHE: [WorldNodeDef, WorldNodeDef][] = WORLD_EDGES.map((e) => [worldNode(e.a), worldNode(e.b)]);

function canUnlockNow(state: GameState, shopKey: string): boolean {
  return canUnlock(state, shopKey) && state.money >= getShop(shopKey).unlockCost;
}

function averageRep(state: GameState): number {
  const unlocked = Object.values(state.shops).filter((s) => s.unlocked);
  if (unlocked.length === 0) return 0;
  return unlocked.reduce((sum, s) => sum + s.reputation, 0) / unlocked.length;
}

function labelFor(node: WorldNodeDef, state: GameState): string {
  // English/Greek chosen by the document lang; keep it short on the map.
  const lang = typeof document !== 'undefined' ? document.documentElement.lang : 'el';
  void state;
  return lang === 'en' ? node.labelEN : node.labelEL;
}

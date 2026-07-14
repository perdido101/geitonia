import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { apply, tick, createInitialState, ingredientCost } from '../engine';
import type { Action, GameState, ShiftEvent } from '../engine';
import { loadGame, saveGame } from '../save';
import { playSfx, playMusic } from '../assets/audio';

const SFX_FOR: Partial<Record<ShiftEvent['kind'], Parameters<typeof playSfx>[0]>> = {
  served: 'sfx_coin',
  wrong_serve: 'sfx_serve_wrong',
  station_ready: 'sfx_station_ready',
  station_burnt: 'sfx_burn',
  regular_arrive: 'sfx_regular_arrive',
  customer_arrive: 'sfx_customer_arrive',
  left_angry: 'sfx_customer_angry',
};

export interface ShiftResult {
  shopKey: string;
  served: number;
  failed: number;
  gross: number;
  ingredientCost: number;
}

// Visual effect emitted from engine ShiftEvents for the juice layer (§6.3).
export interface VisualEffect {
  id: number;
  event: ShiftEvent;
  born: number;
}

interface GameContextValue {
  state: GameState;
  dispatch: (action: Action) => void;
  newGame: (onboarding?: boolean) => void;
  save: () => void;
  effects: VisualEffect[];
  clearEffect: (id: number) => void;
  shake: number; // increments to trigger a screen-shake
  lastShift: ShiftResult | null;
}

const GameContext = createContext<GameContextValue | null>(null);

const FIXED_DT = 1 / 60;
const MAX_FRAME = 0.05; // clamp long frames (tab was backgrounded)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => loadGame() ?? createInitialState({ onboarding: true }));
  const stateRef = useRef(state);
  stateRef.current = state;

  const [effects, setEffects] = useState<VisualEffect[]>([]);
  const [shake, setShake] = useState(0);
  const [lastShift, setLastShift] = useState<ShiftResult | null>(null);
  const effectIdRef = useRef(0);
  const nowRef = useRef(0);

  const emitEffects = useCallback((events: ShiftEvent[]) => {
    if (events.length === 0) return;
    for (const e of events) {
      const sfx = SFX_FOR[e.kind];
      if (sfx) playSfx(sfx);
    }
    if (events.some((e) => e.kind === 'station_burnt' || e.kind === 'wrong_serve')) {
      setShake((s) => s + 1);
    }
    // Only floaty events reach the effects layer; glows/shakes are handled elsewhere.
    const visual = events.filter(
      (e) => e.kind === 'served' || e.kind === 'regular_arrive' || e.kind === 'left_angry',
    );
    if (visual.length === 0) return;
    const born = nowRef.current;
    const fresh: VisualEffect[] = visual.map((event) => ({ id: ++effectIdRef.current, event, born }));
    setEffects((prev) => [...prev.slice(-24), ...fresh]);
  }, []);

  const clearEffect = useCallback((id: number) => {
    setEffects((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const dispatch = useCallback(
    (action: Action) => {
      setState((s) => {
        const next = apply(s, action);
        if (next.activeShift) emitEffects(next.activeShift.events);
        return next;
      });
    },
    [emitEffects],
  );

  const newGame = useCallback((onboarding = true) => {
    setState(createInitialState({ onboarding }));
    setEffects([]);
  }, []);

  const save = useCallback(() => {
    saveGame(stateRef.current);
  }, []);

  // Game loop — runs only during an active shift.
  const shiftActive = state.activeShift != null;
  useEffect(() => {
    if (!shiftActive) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const loop = (now: number) => {
      nowRef.current = now;
      let frame = (now - last) / 1000;
      last = now;
      if (frame > MAX_FRAME) frame = MAX_FRAME;
      acc += frame;
      let steps = 0;
      const collected: ShiftEvent[] = [];
      let ended: ShiftResult | null = null;
      setState((s) => {
        let next = s;
        while (acc >= FIXED_DT && steps < 8) {
          acc -= FIXED_DT;
          steps += 1;
          const before = next.activeShift;
          const after = tick(next, FIXED_DT);
          if (before && !after.activeShift) {
            ended = {
              shopKey: before.shopKey,
              served: before.served,
              failed: before.failed,
              gross: before.grossEarned,
              ingredientCost: ingredientCost(before.grossEarned, next.ingredientDiscountActive),
            };
          }
          next = after;
          if (after.activeShift) collected.push(...after.activeShift.events);
          else break;
        }
        return next;
      });
      if (collected.length) emitEffects(collected);
      if (ended) setLastShift(ended);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [shiftActive, emitEffects]);

  // Autosave whenever we're NOT mid-shift (day changes, purchases, shift end).
  useEffect(() => {
    if (!state.activeShift) saveGame(state);
  }, [state]);

  // Music: rush during the lunch peak, otherwise calm in-shift, meta on the map.
  const shift = state.activeShift;
  const month = (Math.floor((state.day - 1) / 4) % 12) + 1;
  const inRush = shift ? shift.elapsed / shift.duration >= 0.45 && shift.elapsed / shift.duration <= 0.6 : false;
  useEffect(() => {
    if (shiftActive) playMusic(inRush ? 'mus_shift_rush' : month === 8 ? 'mus_summer' : month === 12 ? 'mus_winter' : 'mus_shift_calm');
    else playMusic('mus_meta');
  }, [shiftActive, inRush, month]);

  const value = useMemo<GameContextValue>(
    () => ({ state, dispatch, newGame, save, effects, clearEffect, shake, lastShift }),
    [state, dispatch, newGame, save, effects, clearEffect, shake, lastShift],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}

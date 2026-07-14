// §9 — audio registry + hooks. Registry-based like the visual assets; real sound files get
// swapped in by filling these paths. Until then playback is a silent no-op, so the game runs
// without any audio files present. 13 SFX + 6 music tracks (§10).

import type { AssetKey } from './registry';

export type SfxKey = Extract<AssetKey, `sfx_${string}`>;
export type MusicKey = Extract<AssetKey, `mus_${string}`>;

// Fill these with real file URLs when audio ships. Empty = silent.
export const AUDIO_PATHS: Partial<Record<SfxKey | MusicKey, string>> = {};

let soundOn = true;
try {
  soundOn = localStorage.getItem('geitonia.sound') !== 'off';
} catch {
  /* ignore */
}

const cache = new Map<string, HTMLAudioElement>();
let currentMusic: { key: MusicKey; el: HTMLAudioElement } | null = null;

export function isSoundOn(): boolean {
  return soundOn;
}

export function setSoundOn(on: boolean): void {
  soundOn = on;
  try {
    localStorage.setItem('geitonia.sound', on ? 'on' : 'off');
  } catch {
    /* ignore */
  }
  if (!on && currentMusic) {
    currentMusic.el.pause();
  } else if (on && currentMusic) {
    void currentMusic.el.play().catch(() => {});
  }
}

function getAudio(key: string, path: string, loop: boolean): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null;
  let el = cache.get(key);
  if (!el) {
    el = new Audio(path);
    el.loop = loop;
    cache.set(key, el);
  }
  return el;
}

/** Play a one-shot sound effect. No-op if muted or the asset is unregistered. */
export function playSfx(key: SfxKey): void {
  if (!soundOn) return;
  const path = AUDIO_PATHS[key];
  if (!path) return;
  const el = getAudio(key, path, false);
  if (!el) return;
  try {
    el.currentTime = 0;
    void el.play().catch(() => {});
  } catch {
    /* ignore */
  }
}

/** Switch background music (no-op if already playing that track). */
export function playMusic(key: MusicKey): void {
  if (currentMusic?.key === key) return;
  if (currentMusic) currentMusic.el.pause();
  const path = AUDIO_PATHS[key];
  if (!path) {
    currentMusic = null;
    return;
  }
  const el = getAudio(key, path, true);
  if (!el) return;
  currentMusic = { key, el };
  if (soundOn) void el.play().catch(() => {});
}

export function stopMusic(): void {
  if (currentMusic) currentMusic.el.pause();
  currentMusic = null;
}

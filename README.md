# GEITONIA (Γειτονιά)

A Greek neighborhood shop tycoon. Browser PWA — time-management shifts + a walkable
neighborhood map + a seasonal survival economy.

See [`SPEC.md`](./SPEC.md) — the single source of truth for the build.

## Stack

React 18 · Vite · TypeScript · Tailwind · vite-plugin-pwa. No backend, localStorage only.
Mobile-first portrait, offline-capable.

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Typecheck (`tsc -b`) + production build |
| `npm run preview` | Preview the production build |
| `npm test` | Run the test suite (Vitest) |
| `npm run sim` | Headless year-long simulation (arrives in Phase 1) |

## Ground rules (SPEC.md §2.1)

1. **The engine is sacred.** After Phase 1, `src/engine/**` is byte-stable; it is pure
   TypeScript (zero React, zero I/O). UI dispatches actions and renders what comes back.
2. **All assets are placeholders.** Every visual is a `<Placeholder assetKey="…" />`.
   Every path lives in `src/assets/registry.ts` — never hardcode an image path elsewhere.
3. **Greek is the default locale.** Every user-facing string goes through `t()`.
4. **Data is declarative.** Content lives in `src/data/*.ts` as plain objects, zero logic.
5. **Stop after each phase and report.**

## Build status

- **Phase 0 — Scaffold** ✅ boots, saves (versioned localStorage + migration stub),
  speaks Greek by default (EL/EN toggle), and renders a labeled placeholder for any of
  the 331 registered asset keys.
- Phases 1–5 — not started.

## Folder structure

```
src/
  engine/   pure logic (byte-stable after Phase 1)
  world/    map + navigation logic
  data/     declarative content
  ui/       shift · map · meta · common
  i18n/     el.ts · en.ts · index.ts (t() hook, EL default)
  assets/   registry.ts (331 keys) · Placeholder.tsx
  save/     versioned localStorage persistence + migrate()
  sim/      headless simulation harness (Phase 1)
```

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

## Deploy

Pushing to `main` (or the active work branch) runs `.github/workflows/deploy.yml`, which
typechecks, tests, builds with `VITE_BASE=/geitonia/`, and publishes to **GitHub Pages** →
`https://perdido101.github.io/geitonia/`.

One-time setup: repo **Settings → Pages → Source = "GitHub Actions"** (the workflow can't
toggle this itself). No secrets required. To deploy to Vercel (the original spec target)
instead, swap the publish step for the Vercel Action and add `VERCEL_TOKEN`.

## Ground rules (SPEC.md §2.1)

1. **The engine is sacred.** After Phase 1, `src/engine/**` is byte-stable; it is pure
   TypeScript (zero React, zero I/O). UI dispatches actions and renders what comes back.
2. **All assets are placeholders.** Every visual is a `<Placeholder assetKey="…" />`.
   Every path lives in `src/assets/registry.ts` — never hardcode an image path elsewhere.
3. **Greek is the default locale.** Every user-facing string goes through `t()`.
4. **Data is declarative.** Content lives in `src/data/*.ts` as plain objects, zero logic.
5. **Stop after each phase and report.**

## Build status

All phases are functionally complete — every system works, every number is wired, on
placeholder art (§11 style-lock is the next pass, then Higgsfield fills `registry.ts`).

- **Phase 0 — Scaffold** ✅ boot, versioned save + migration, Greek default, 331-key registry.
- **Phase 1 — Engine** ✅ byte-stable pure `tick`/`apply`, guard snapshot, full §4.8 tests.
- **Phase 1.5 — Sim** ✅ `npm run sim` — year-long bot run; used to rebalance the economy.
- **Phase 2 — Data** ✅ shops/stations/recipes/customers/upgrades/dialogue/calendar/world,
  `validate.test.ts` fails the build on any referential error.
- **Phase 3 — Shift UI** ✅ HUD, patience queue, station grid, recipe picker, held item, juice.
- **Phase 3.5 — Map** ✅ walkable neighborhood (BFS waypoint graph), camera, node interactions.
- **Phase 4 — Meta** ✅ shift summary, upgrades, roster, calendar — all reached from the map.
- **Phase 5 — Polish** ✅ title, settings, audio hooks, scripted Day-1 onboarding, game over.

Balance note: several spec numbers were sim-tuned (base spawn rates ×~0.16, starting
reputation, serve rep-gains) to make the year read as a game — climb → Regulars → August
wall → survive. The spec-mandated fail penalties (−2 / −4) and ΕΦΚΑ (€150) are unchanged.
Originals are noted in comments where changed.

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

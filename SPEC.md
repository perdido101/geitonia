# GEITONIA (Γειτονιά) — Full Build Specification

**A Greek neighborhood shop tycoon.** Browser PWA. Time-management shifts + walkable neighborhood map + seasonal survival economy.

---

## 0. HOW TO USE THIS DOCUMENT

This is the single source of truth for the build. Place it at the project root as `SPEC.md`.

**Do not paste this whole file into Claude Code as a message.** Instead, put it in the repo and send:

> Read `SPEC.md`. Build Phase 0, then stop and report. Do not proceed to Phase 1 until I say so.

Then, one at a time: `Build Phase 1.` … `Build Phase 5.`

Claude Code can re-read the spec whenever it needs to, and each phase starts with a fresh context budget. This produces dramatically better output than one giant prompt that runs out of room by Phase 3.

---

## 1. THE PITCH

You inherit a καφενείο in a Greek neighborhood. You serve customers under time pressure. You earn money. You pay rent and ΕΦΚΑ whether or not you earned money. You buy the shuttered shop across the street. You do it again.

The genre is Cooking-Adventure-style time management. **The differentiator is that the neighborhood is a place, not a level select.** You walk around it. Regulars stand in the πλατεία and talk to you. The λαϊκή opens on Tuesdays. August arrives and everyone leaves for the islands and the rent is still due.

**Two design pillars. Everything serves one of them:**

1. **REPUTATION.** Not a score — a relationship. It gates unlocks, boosts tips, increases foot traffic, and summons named Regulars who tip triple and punish double.
2. **THE CALENDAR.** A twelve-month survival clock. Χριστούγεννα is a gold rush. Πάσχα is chaos. **Αύγουστος is a slow, quiet, brutal near-death experience that you must save for.**

---

## 2. TECH STACK & GROUND RULES

**Stack:** React 18 + Vite + TypeScript + Tailwind. No backend. localStorage only. Mobile-first portrait. 60fps. Offline-capable PWA. Vercel deployment target.

### 2.1 — Non-Negotiable Rules

**RULE 1 — The engine is sacred.**
After Phase 1, `src/engine/**` is byte-stable. `src/engine/guard.test.ts` snapshots the engine's public API surface and fails on any change. The engine is pure TypeScript: zero React, zero side effects, zero I/O. Its entire contract is `tick(state, dt) → state` and `apply(state, action) → state`. The UI never mutates state directly — it dispatches actions and renders whatever comes back.

**RULE 2 — All assets are placeholders.**
Every visual is `<Placeholder assetKey="bg_kafeneio" w={} h={} />` — a colored box with the key printed on it, background color derived by hashing the key string so every asset is visually distinct. Every asset path lives in `src/assets/registry.ts`. **Never hardcode an image path anywhere else.** Real art gets swapped in later by editing the registry and nothing else.

**RULE 3 — Greek is the default locale.**
Every user-facing string goes through `t()` from line one. `src/i18n/el.ts` and `src/i18n/en.ts`, flat key→value. No hardcoded strings in components, ever. Retrofitting i18n is miserable; doing it from the start costs nothing.

**RULE 4 — Data is declarative.**
All content lives in `src/data/*.ts` as plain objects. Zero logic in data files. Everything referenced by string key. A designer (you) should be able to rebalance the entire game by editing data files without touching a single line of engine or UI code.

**RULE 5 — Stop after each phase and report.**
Do not proceed to the next phase without being told.

### 2.2 — Folder Structure

```
src/
  engine/       pure logic, byte-stable after Phase 1
    types.ts
    state.ts
    tick.ts
    actions.ts
    spawn.ts
    economy.ts
    reputation.ts
    calendar.ts
    guard.test.ts
  world/        map + navigation logic (NOT byte-stable)
    state.ts
    pathfind.ts
    tick.ts
  data/         declarative content
    shops.ts
    stations.ts
    recipes.ts
    customers.ts
    upgrades.ts
    dialogue.ts
    calendar.ts
    world.ts
    validate.test.ts
  ui/
    shift/
    map/
    meta/
    common/
  i18n/
    el.ts
    en.ts
    index.ts
  assets/
    registry.ts
    Placeholder.tsx
  sim/          headless simulation harness (Phase 1)
```

---

## 3. PHASE 0 — SCAFFOLD

**Goal:** an empty shell that boots, saves, speaks Greek, and can draw a labeled colored box wherever art will eventually go.

### Tasks

1. **Vite + React + TS + Tailwind.** PWA manifest, service worker, offline shell. Portrait-locked viewport meta.

2. **Folder structure** exactly as in §2.2.

3. **`src/assets/Placeholder.tsx`:**
   - Props: `assetKey: AssetKey`, `w?: number`, `h?: number`, `className?: string`
   - Renders a `<div>` with `background-color` = `hsl(hash(assetKey) % 360, 65%, 60%)`
   - Centered monospace label showing the assetKey, auto-shrinking to fit
   - Thin dashed border so placeholder bounds are visible during layout work

4. **`src/assets/registry.ts`:**
   - `export type AssetKey = 'bg_kafeneio' | 'st_briki_idle' | ...` — the full union, all 331 keys from the Appendix
   - `export const registry: Record<AssetKey, string>` — all values `''` for now
   - `export function getAsset(key: AssetKey): string | null` — returns the path, or `null` if empty (signalling "use placeholder")

5. **i18n:** `t(key: string): string` hook. Locale held in React context. Default `'el'`. Missing keys render as `⟦key⟧` in dev so they're impossible to miss.

6. **Save system:** localStorage, versioned schema `{ schemaVersion: 1, state: GameState }`. Include a migration stub `migrate(raw): GameState` that switches on `schemaVersion` — you will need this later and it is trivial now.

**Report and stop.**

---

## 4. PHASE 1 — CORE ENGINE (BYTE-STABLE)

Pure TypeScript. The entire game as a function of state. No React. This is the phase that determines whether the game is any good, so it gets the most detail.

### 4.1 — Types (`engine/types.ts`)

```ts
type StationState = 'idle' | 'working' | 'ready' | 'burnt' | 'clearing';

interface Station {
  id: string;
  typeKey: string;              // → data/stations
  state: StationState;
  timer: number;                // seconds elapsed in current state
  producing: string | null;     // itemKey currently being made
  stepIndex: number;            // which step of a multi-step recipe this is
}

interface OrderItem {
  itemKey: string;
  fulfilled: boolean;
}

interface Customer {
  id: string;
  archetypeKey: string;         // → data/customers
  regularKey: string | null;    // set if this is a named Regular
  order: OrderItem[];
  patience: number;             // 1.0 → 0.0
  patienceDrainRate: number;    // per second, already modified
  basePayout: number;           // sum of recipe basePrices
  tipMultiplier: number;
  state: 'waiting' | 'served' | 'left_angry';
  spawnedAt: number;            // shift.elapsed when they arrived
}

interface ShopRuntime {
  shopKey: string;
  unlocked: boolean;
  stations: Station[];
  reputation: number;                    // 0..100, persists across shifts
  upgrades: Record<string, number>;      // upgradeKey → tier 0..3
  lifetimeServed: number;
  lifetimeFailed: number;
  lastOpenedDay: number;                 // for neglect decay
}

interface RegularRecord {
  key: string;
  unlocked: boolean;
  timesServed: number;
  timesFailed: number;
  standing: number;                      // -10..+10, personal relationship
}

interface ShiftState {
  shopKey: string;
  elapsed: number;              // seconds
  duration: number;             // seconds, default 180
  served: number;
  failed: number;
  grossEarned: number;
  heldItem: string | null;      // item collected from a ready station
  spawnAccumulator: number;
  queue: Customer[];            // max 5 visible
  nextCustomerId: number;
  regularInQueue: boolean;      // max one Regular at a time
}

interface GameState {
  schemaVersion: number;
  money: number;
  debt: number;
  lifetimeEarnings: number;
  day: number;                  // 1-indexed, monotonic. Month = ((day-1)/4 % 12)+1
  year: number;
  shops: Record<string, ShopRuntime>;
  regulars: Record<string, RegularRecord>;
  activeShift: ShiftState | null;
  flags: Record<string, boolean>;       // events fired, tutorial done, game over
  ingredientDiscountActive: boolean;    // bought at the λαϊκή
}
```

### 4.2 — The Tick (`engine/tick.ts`)

Fixed timestep. `tick(state: GameState, dt: number): GameState`. Called at 60fps. Must be deterministic given the same seed.

**Per tick, during an active shift, in this exact order:**

**Step 1 — Advance shift clock.** `shift.elapsed += dt`.

**Step 2 — Advance stations.**
- `working`: `timer += dt`. When `timer >= cookTime(stationType, speedUpgradeTier)` → state becomes `ready`, `timer` resets to 0.
- `ready`: `timer += dt`. When `timer >= burnTime` (default 8s) → state becomes `burnt`, `producing` is lost. Stations with `burnTime: Infinity` (fridge, shelf, register) never burn.
- `clearing`: `timer += dt`. When `timer >= 2.0` → state becomes `idle`. (Burnt stations must be cleared before reuse — this is the punishment.)
- `idle`, `burnt`: no timer advance.

**Step 3 — Drain patience.** For every customer in `queue` with `state === 'waiting'`:
```
customer.patience -= customer.patienceDrainRate
                   * comfortModifier(shop.upgrades.comfort)
                   * monthPatienceModifier(month)
                   * dt
```

**Step 4 — Process failures.** Any customer whose `patience <= 0`:
- `state = 'left_angry'`
- remove from `queue`
- `shift.failed++`
- apply reputation penalty (see §4.4)
- if a Regular: `regulars[key].timesFailed++`, `standing -= 2`, `regularInQueue = false`

**Step 5 — Spawn.**
```
shift.spawnAccumulator += dt * spawnRate(state)
while (shift.spawnAccumulator >= 1.0 && queue.length < 5) {
  shift.spawnAccumulator -= 1.0
  spawnCustomer(state)
}
```

**Step 6 — Check shift end.** If `shift.elapsed >= shift.duration` **and** `queue.length === 0` → dispatch `END_SHIFT`.

> **Design note:** the shift does not end while customers are still waiting. This creates a natural "last orders" tension — the timer hits zero, spawning stops, and you're racing to clear the queue. It also means a badly-managed shift runs long, which *feels* like the punishment it is.

### 4.3 — Spawning (`engine/spawn.ts`)

```
spawnRate(state) = shop.baseSpawnRate
                 * shiftCurve(shift.elapsed / shift.duration)
                 * repMultiplier(shop.reputation)
                 * monthSpawnModifier(month, shopKey)
```

**`shiftCurve(t)` — the rush.** Piecewise:
- `t ∈ [0, 0.20]`: ramp linearly `0.3 → 1.0`
- `t ∈ [0.20, 0.75]`: hold at `1.0`, with a **peak bump to `1.35` between `t ∈ [0.45, 0.60]`** — this is the lunch rush
- `t ∈ [0.75, 1.0]`: taper linearly `1.0 → 0.2`

**`repMultiplier(rep)` = `0.6 + (rep / 100) * 0.8`** → range 0.6× to 1.4×. Bad reputation means an empty shop, which means no money, which means you can't fix the reputation. This death spiral is intentional but must be escapable — that's what the Πλατεία rep-chat and cheap `comfort` upgrades are for.

**Archetype selection.** Weighted random from the shop's archetype pool. Weights multiplied by the month's archetype modifiers (e.g. `touristas` weight = 0 outside Ιούν–Σεπ).

**Order generation.** Roll `orderSize` from the archetype's `[min, max]`. Pick that many random recipes from the shop's pool, weighted toward cheaper items (so a 4-item παρέα order isn't automatically a €60 jackpot).

**Regular spawning.** On every spawn, before rolling an archetype:
- If `regularInQueue`, skip.
- For each Regular whose `shopKey` matches and whose `repThreshold <= shop.reputation` and who is `unlocked`:
  - Roll `spawnChance` (0.15). First one that hits, spawns.
  - Their order is always their `favoriteOrder` — fixed, never random.
  - Set `regularInQueue = true`.

**First unlock.** When `shop.reputation` first crosses a Regular's `repThreshold`, set `regulars[key].unlocked = true` and set a flag so the map/UI can announce it. **This is a celebration moment.** Κυρ-Θανάσης noticing you is the first real reward in the game.

### 4.4 — Reputation (`engine/reputation.ts`)

The heart. Numbers here are the tuning surface — expect to change them.

| Event | Δ Reputation |
|---|---|
| Customer served correctly | `+0.5 × speedBonus` |
| Customer leaves angry | `−2.0` |
| **Regular** served correctly | `+1.5` |
| **Regular** leaves angry | **`−4.0`** |
| Wrong item served | `−0.3` |
| Πλατεία chat with a Regular | `+0.5` (once per shift, per Regular) |
| Shop not opened for a full day | `−0.2` (neglect decay) |

**`speedBonus = 1.0 + patienceRemaining`** → serving a customer instantly gives ~2.0×; serving them at the last second gives ~1.0×. Speed is rewarded, not just completion.

Clamp `reputation` to `[0, 100]`.

**Regular `standing`** is a separate, personal track: `+1` on serve, `−2` on failure, clamped `[-10, +10]`. It doesn't affect mechanics in v1 — it drives dialogue variants and the roster screen. It exists so that the player *feels* the relationship independently of the number that gates their progression.

### 4.5 — Economy (`engine/economy.ts`)

**Revenue per item served:**
```
payout = recipe.basePrice
       × (1 + qualityUpgradeTier × 0.15)
       × tipMultiplier
       × (isRegular ? 3.0 : 1.0)
       × archetype.tipMult
```
`tipMultiplier = 1 + (reputation / 100) × 0.5` → up to 1.5×.

**Regulars pay 3×.** This is enormous and it is the point. A high-reputation shop with three Regulars cycling through is worth more than a mid-reputation shop at double the volume. The game should teach this by ~Day 12.

**Fixed costs — the pressure clock:**

| Cost | Amount | Cadence |
|---|---|---|
| Ingredients | 30% of shift gross (20% if λαϊκή discount active) | Every shift |
| Rent | €40 × number of unlocked shops | Every 4th day (start of month) |
| **ΕΦΚΑ** | **€150 flat** | **Every 4th day** |

ΕΦΚΑ is flat, unavoidable, and does not care how your month went. It is the single most important number in the game. In Αύγουστος, when your spawn rate is 0.4×, it is the antagonist.

**Loans (Τράπεζα):**
- Borrow up to €2000 at a time. Total debt cap €5000.
- Interest: **5% per month**, compounded on the 1st of each month (day % 4 === 1).
- If money would go below €0 and you have loan headroom: **forced automatic loan** at a punitive 10% to cover the shortfall. You do not get to simply be broke.
- **`debt > 5000` → game over.** Set `flags.gameOver = true`.

### 4.6 — The Calendar (`engine/calendar.ts`)

**4 shifts per month × 12 months = 48 days per year.** The game runs indefinitely; `year` increments. `month = ((day - 1) / 4 % 12) + 1`.

| # | Month | Spawn Modifier | Patience | Event |
|---|---|---|---|---|
| 1 | Ιανουάριος | Καφενείο/Φούρνος ×1.2, others ×0.9 | — | — |
| 2 | Φεβρουάριος | — | — | **Απόκριες** (day 8): all spawn ×1.4 |
| 3 | Μάρτιος | — | — | — |
| 4 | Απρίλιος | — | ×1.3 (everyone's stressed) | **ΠΑΣΧΑ** (day 14): spawn ×1.8. **Εφορία unlocks.** |
| 5 | Μάιος | — | — | Ψαροταβέρνα gains `touristas` |
| 6 | Ιούνιος | — | — | `touristas` weight ×2 |
| 7 | Ιούλιος | Καφενείο ×0.8 (too hot) | — | `touristas` weight ×3 |
| 8 | **ΑΥΓΟΥΣΤΟΣ** | **×0.4 EVERYWHERE** | — | **Rent and ΕΦΚΑ still due. This is the wall.** |
| 9 | Σεπτέμβριος | ×1.1 (recovery) | — | — |
| 10 | Οκτώβριος | — | — | — |
| 11 | Νοέμβριος | Καφενείο/Φούρνος ×1.2 | — | — |
| 12 | Δεκέμβριος | — | ×0.7 (everyone's frantic) | **ΧΡΙΣΤΟΥΓΕΝΝΑ** (day 46): Ζαχαροπλαστείο ×2.5 |

> **Αύγουστος is the design.** A 0.4× spawn rate for four consecutive shifts, against €150 ΕΦΚΑ + rent, means you must arrive in August with roughly €800 banked or you take a loan. The entire first year of play is secretly a lesson about this. The calendar screen must warn about it starting in Ιούνιος. When the player survives their first August, they have learned the game.

### 4.7 — Actions (`engine/actions.ts`)

Pure reducers. `apply(state: GameState, action: Action): GameState`.

| Action | Behavior |
|---|---|
| `START_SHIFT { shopKey }` | Build fresh `ShiftState`. Instantiate stations from shop data + capacity upgrades. Reset accumulators. |
| `TAP_STATION { stationId }` | **idle** → open recipe selection (UI concern; engine receives `START_COOKING`). **ready** → collect into `heldItem` (only if `heldItem === null`), station → `idle`. **burnt** → state becomes `clearing`. |
| `START_COOKING { stationId, itemKey, stepIndex }` | Station → `working`, `producing = itemKey`, `timer = 0`. |
| `TAP_CUSTOMER { customerId }` | If `heldItem` matches an unfulfilled `OrderItem` → mark fulfilled, `heldItem = null`. If **all** items now fulfilled → serve: payout, rep gain, remove from queue, `shift.served++`. If no match → **wrong serve**: `heldItem = null` (wasted), rep `−0.3`. |
| `DISCARD_HELD` | `heldItem = null`. No penalty. |
| `END_SHIFT` | Tally. Deduct ingredient cost. Add net to `money`. Add to `lifetimeEarnings`. Clear `activeShift`. |
| `ADVANCE_DAY` | `day++`. If `day % 4 === 1`: charge rent + ΕΦΚΑ, compound interest. Apply neglect decay to unopened shops. Roll month events. Check game over. |
| `BUY_UPGRADE { shopKey, upgradeKey }` | Validate cost & tier. Deduct money. Increment tier. |
| `UNLOCK_SHOP { shopKey }` | Validate rep gate & cost. Deduct. Set `unlocked = true`. |
| `TAKE_LOAN { amount }` / `REPAY_LOAN { amount }` | Adjust `money` and `debt`. |
| `PLATEIA_CHAT { regularKey }` | `+0.5` rep to that Regular's shop. Once per Regular per day. |
| `BUY_LAIKI_DISCOUNT` | Deduct cost. `ingredientDiscountActive = true` for the next shift only. |

### 4.8 — Tests (`engine/*.test.ts`)

Prove, at minimum:
- Patience hits 0 → customer leaves, `failed++`, rep `−2.0`
- **Regular leaves → rep `−4.0`** (double)
- Regular served → payout is exactly `3×` base × multipliers
- Correct serve → `payout = basePrice × tipMultiplier × archetype.tipMult`
- Wrong serve → item destroyed, rep `−0.3`, customer unchanged
- Rent + ΕΦΚΑ deducted on day 4, 8, 12… and **not** on days 1–3
- Αύγουστος spawn modifier resolves to exactly `0.4`
- Station burns exactly `8.0s` after becoming `ready`
- Burnt station cannot be used until `clearing` completes (`2.0s`)
- `debt > 5000` → `flags.gameOver === true`
- Shift does **not** end while the queue is non-empty, even past `duration`
- `guard.test.ts` — API surface snapshot

### 4.9 — ⚠ THE HEADLESS SIM (`src/sim/`) — DO THIS BEFORE ANY UI

**This is the single highest-value thing in the whole build.**

Write `src/sim/run.ts`: a Node script that instantiates a fresh `GameState`, simulates **48 days** (one full year) headlessly with a simple bot policy (e.g. "always cook the highest-value item the queue needs; always serve the customer with the lowest patience"), and prints a table:

```
Day  Month        Served  Failed  Gross   Rent  ΕΦΚΑ  Net     Money   Debt   Rep(kaf)
1    Ιανουάριος   14      2       €38     €0    €0    €27     €127    €0     52.1
...
29   Αύγουστος    6       0       €14     €40   €150  −€180   €410    €0     61.3
```

Then read it. Ask:
- Does money go up forever? → the game is trivially easy, raise costs
- Does everyone go bankrupt in August regardless of play? → the wall is too high
- Does reputation only ever climb? → failure isn't punishing enough
- Is the second shop reachable by ~Day 10–14? → if not, the unlock cost is wrong

**Twenty minutes here saves a week later.** You will find at least two broken numbers. Fix them in `data/`, re-run, repeat. Only when the year-long curve looks like a *game* do you build a single pixel of UI.

**Report and stop.**

---

## 5. PHASE 2 — DATA LAYER

Everything in `src/data/`. Zero logic. Add `data/validate.test.ts` that **fails the build** if:
- any `assetKey` referenced in data has no entry in the registry
- any recipe references a station its shop doesn't have
- any Regular's `favoriteOrder` references a recipe not in their shop's pool
- any upgrade's shop doesn't exist

### 5.1 — `shops.ts` (7)

| Key | Name (EL) | Unlock Gate | Cost | Base Spawn | Stations |
|---|---|---|---|---|---|
| `kafeneio` | Καφενείο | *start* | — | 0.55/s | briki, frapiera, espresso |
| `fournos` | Φούρνος | rep 40 @ kafeneio | €800 | 0.60/s | oven, dough |
| `souvlatzidiko` | Σουβλατζίδικο | rep 50 @ fournos | €1,500 | 0.70/s | gyros, grill, wrap, fryer |
| `periptero` | Περίπτερο | rep 45 @ souvlatzidiko | €1,200 | 0.90/s | fridge, shelf, register |
| `zacharoplasteio` | Ζαχαροπλαστείο | rep 60 @ fournos | €2,500 | 0.45/s | oven, mixer, syrup |
| `psarotaverna` | Ψαροταβέρνα | rep 65 @ souvlatzidiko | €3,500 | 0.35/s | ice, clean, grill, fryer |
| `mezedopoleio` | Μεζεδοπωλείο | rep 70 @ any 3 | €5,000 | 0.40/s | meze, grill, fridge, ouzo |

> Note the inverse relationship: Περίπτερο is a firehose of tiny transactions. Ψαροταβέρνα is a trickle of €16 fish. They are different games, and the player should feel that.

### 5.2 — `stations.ts` (18)

`{ key, nameEL, nameEN, cookTime, burnTime, baseCapacity, assetKeyPrefix }`

| Station | Key | Cook | Burn |
|---|---|---|---|
| Μπρίκι | `briki` | 6s | 8s |
| Φραπιέρα | `frapiera` | 4s | 8s |
| Μηχανή espresso | `espresso` | 5s | 8s |
| Φούρνος | `oven` | 12s | 8s |
| Ζυμωτήριο | `dough` | 8s | 8s |
| Γύρος | `gyros` | 10s | 8s |
| Σχάρα | `grill` | 9s | 8s |
| Πάγκος τυλίγματος | `wrap` | 3s | 8s |
| Φριτέζα | `fryer` | 7s | 8s |
| Ψυγείο | `fridge` | 1s | **∞** |
| Ράφι | `shelf` | 1s | **∞** |
| Ταμείο | `register` | 2s | **∞** |
| Μίξερ | `mixer` | 10s | 8s |
| Σιρόπι | `syrup` | 5s | 8s |
| Πάγος | `ice` | 2s | **∞** |
| Πάγκος καθαρίσματος | `clean` | 6s | 8s |
| Πάγκος μεζέ | `meze` | 5s | 8s |
| Ούζο | `ouzo` | 2s | **∞** |

`baseCapacity` = 1 for all. The `capacity` upgrade adds instances.

### 5.3 — `recipes.ts` (49 items)

`{ itemKey, shopKey, steps: [{ stationKey }], basePrice, assetKey }`

Multi-step recipes are the high-value items. The chain is the skill test.

**Καφενείο (6)**

| Item | Steps | € |
|---|---|---|
| `ellinikos` | briki | 2.0 |
| `soda` | frapiera | 2.0 |
| `nescafe` | frapiera | 2.5 |
| `frape` | frapiera | 3.0 |
| `freddo_espresso` | espresso → frapiera | 3.5 |
| `freddo_cappuccino` | espresso → frapiera | 4.0 |

**Φούρνος (7)**

| Item | Steps | € |
|---|---|---|
| `koulouri` | oven | 1.5 |
| `kritsinia` | oven | 1.5 |
| `psomi` | dough → oven | 2.0 |
| `tiropita` | dough → oven | 2.5 |
| `spanakopita` | dough → oven | 2.5 |
| `ladopsomo` | dough → oven | 3.0 |
| `bougatsa` | dough → oven | 3.5 |

**Σουβλατζίδικο (7)**

| Item | Steps | € |
|---|---|---|
| `tzatziki` | wrap | 1.5 |
| `patates` | fryer | 2.5 |
| `kalamaki` | grill | 3.0 |
| `pita_souvlaki` | grill → wrap | 4.0 |
| `pita_gyros` | gyros → wrap | 4.0 |
| `pita_apola` | gyros → fryer → wrap | 5.0 |
| `merida_gyros` | gyros → fryer → wrap | 9.0 |

**Περίπτερο (7)**

| Item | Steps | € |
|---|---|---|
| `nero` | fridge | 0.5 |
| `frigania` | shelf | 1.0 |
| `gum` | shelf | 1.0 |
| `efimerida` | shelf | 2.0 |
| `lachio` | register | 2.0 |
| `pagoto` | fridge | 2.0 |
| `tsigara` | shelf | 5.0 |

**Ζαχαροπλαστείο (7)**

| Item | Steps | € |
|---|---|---|
| `loukoumades` | mixer → syrup | 4.0 |
| `baklava` | oven → syrup | 4.0 |
| `kataifi` | oven → syrup | 4.0 |
| `profiterol` | mixer → syrup | 5.0 |
| `galaktoboureko` | mixer → oven → syrup | 5.0 |
| `ekmek` | mixer → oven → syrup | 5.0 |
| `tourta` | mixer → oven → syrup | **18.0** |

**Ψαροταβέρνα (7)**

| Item | Steps | € |
|---|---|---|
| `ouzo_glass` | ice | 3.0 |
| `horiatiki` | clean | 7.0 |
| `gavros` | clean → fryer | 8.0 |
| `kalamaraki` | clean → fryer | 10.0 |
| `htapodi` | clean → grill | 12.0 |
| `barbouni` | clean → grill | 14.0 |
| `tsipoura` | clean → grill | **16.0** |

**Μεζεδοπωλείο (8)**

| Item | Steps | € |
|---|---|---|
| `karafaki` | ouzo | 5.0 |
| `fava` | meze | 5.0 |
| `taramas` | meze | 5.0 |
| `melitzanosalata` | meze | 5.0 |
| `dolmadakia` | meze | 6.0 |
| `saganaki` | meze → grill | 7.0 |
| `keftedakia` | meze → grill | 8.0 |
| `pikilia` | meze → grill → fridge | **16.0** |

### 5.4 — `customers.ts`

**10 archetypes.** `{ key, patienceDrainRate, orderSize: [min,max], tipMult, shopWeights, monthWeights }`

| Key | Name (EL) | Drain/s | Order | Tip | Character |
|---|---|---|---|---|---|
| `pappous` | Παππούς | 0.03 | 1–1 | 0.8× | Will wait all day. Tips like it's 1974. |
| `giagia` | Γιαγιά | 0.06 | 2–3 | 1.2× | Big order, fair, generous. |
| `mathitis` | Μαθητής | 0.12 | 1–2 | 0.7× | Fast, broke, impatient. |
| `taxitzis` | Ταξιτζής | **0.18** | 1–1 | 1.0× | Double-parked. Engine running. |
| `ypallilos` | Υπάλληλος | 0.09 | 1–2 | 1.0× | The lunch-rush baseline. |
| `touristas` | Τουρίστας | 0.14 | 2–3 | **2.0×** | Summer only. Impatient. Rich. |
| `mama` | Μαμά με παιδί | 0.05 | 3–4 | 1.3× | Slow, huge order, big rep swing. |
| `parea` | Νεαρή παρέα | 0.08 | 4–4 | 1.4× | Group order. High payout, high risk. |
| `ergatis` | Εργάτης | 0.07 | 1–2 | 1.0× | Early morning. Loyal. |
| `kyria_skylo` | Κυρία με σκύλο | 0.15 | 1–1 | **0.6×** | Fussy. Punishing. Tips nothing. |

**8 Regulars.** `{ key, nameEL, shopKey, repThreshold, spawnChance, favoriteOrder[], patienceDrainRate, personality }`

All Regulars: `patienceDrainRate: 0.10`, `spawnChance: 0.15`. They pay **3×** and failing them costs **double**.

| Key | Name | Shop | Rep | Always Orders | Personality |
|---|---|---|---|---|---|
| `thanasis` | Κυρ-Θανάσης | kafeneio | 30 | ellinikos | Forty years in this καφενείο. Reads the paper. Judges you in silence. |
| `mitsos` | Ο Μήτσος ο ταξιτζής | souvlatzidiko | 40 | pita_apola | Double-parked outside. Always. Engine running. |
| `roula` | Δεσποινίς Ρούλα | fournos | 45 | bougatsa | Teacher. Corrects your Greek. Tips well if you're polite. |
| `voula` | Θεία Βούλα | kafeneio | 50 | frape + tiropita | Knows everything about everyone. Will tell your mother. |
| `spyros` | Ο Σπύρος | psarotaverna | 50 | ouzo_glass + gavros | Fisherman. Brings you the good catch — if your rep is high. |
| `panagiotis` | Ο Παναγιώτης | mezedopoleio | 55 | karafaki + pikilia | Owns three buildings. Complains about rent anyway. |
| `eleni` | Η Ελένη | kafeneio | 60 | freddo_cappuccino | Runs the salon next door. Your only real ally. |
| `kostas` | Ο Κώστας ο Εφοριακός | kafeneio | 70 | ellinikos | Tax office. Appears in Απρίλιο. Ominous. |

> **Κυρ-Θανάσης at rep 30 is the first Regular you can unlock, and he must be reachable by around Day 6.** He is the game teaching you that reputation is the point. Getting his ελληνικό right, fast, three days running, is the whole design compressed into one interaction.

### 5.5 — `upgrades.ts`

Four lines × seven shops × three tiers.

| Line | Effect (T1 / T2 / T3) | Cost (T1 / T2 / T3) |
|---|---|---|
| `speed` | cookTime ×0.85 / ×0.72 / ×0.60 | €300 / €800 / €2,000 |
| `capacity` | +1 / +2 / +3 station instances | €500 / €1,200 / €3,000 |
| `quality` | basePrice +15% / +30% / +50% | €400 / €1,000 / €2,500 |
| `comfort` | patience drain ×0.90 / ×0.80 / ×0.65 | €350 / €900 / €2,200 |

`comfort` is deliberately the cheapest meaningful lever. It's the escape hatch from the low-reputation death spiral.

### 5.6 — `dialogue.ts`

Per Regular, four lines: `greeting`, `served_happy`, `left_angry`, `plateia_idle`.

Placeholder Greek is fine for now — mark every line `// TODO: write properly`. The writing is a separate pass and it matters enormously, but it should not block the build.

### 5.7 — `calendar.ts`

The month modifier table from §4.6, as pure data.

**Report and stop.**

---

## 6. PHASE 3 — SHIFT UI

Portrait. Thumb-reachable. **Everything is a pure render of engine state.** No local game state in components.

### 6.1 — Layout (top → bottom)

**HUD — 10% height**
Shift timer (draining bar) · € earned this shift · reputation bar · month name

**Customer queue — 30% height**
Up to 5 cards, horizontal, scrollable if needed. Each card shows:
- Customer sprite (`cu_*_idle` or `rg_*_idle`)
- Order rendered as item icons, greyed out when fulfilled
- **Patience bar:** green → yellow → red. Below 25%: turns red and **pulses**. This is the most important pixel on the screen.

**Station grid — 60% height**
Big tap targets, **minimum 88×88px**. This is a mobile game played with a thumb, in one hand, probably on a bus.

| Station State | Visual |
|---|---|
| `idle` | Neutral. Tappable. |
| `working` | Filling ring around the station. Item icon faded inside. |
| `ready` | **Pulsing glow.** Item icon floating above. Urgent. |
| `burnt` | Red. Smoke particles. Tap-and-hold to clear (2s, with a progress ring). |
| `clearing` | Progress ring filling. |

**Held item indicator**
When `heldItem !== null`, the item floats in a fixed position above the station grid. Tapping a customer serves it. Tapping empty space discards it.

### 6.2 — Recipe Selection

Tapping an `idle` station opens a small radial (or list, if >4 options) of recipes whose current step can start here. Tap to commit → `START_COOKING`.

**Optimization:** if a station has only one valid recipe, skip the menu and start immediately. Never make the player tap twice for a decision with one option.

### 6.3 — Juice (NON-NEGOTIABLE — THIS IS THE GAME)

A time-management game without feedback is a spreadsheet with a countdown. Budget real time here.

| Event | Feedback |
|---|---|
| Payout | Number pops up, floats, fades. Coin SFX. |
| Correct serve | Customer flashes `_happy` sprite. `+€` pop. Small confetti burst. |
| Wrong serve | Screen shake. Red flash. Item puffs into smoke. |
| Station burns | **Screen shake + red vignette pulse.** Harsh SFX. This should hurt. |
| Customer leaves angry | Flashes `_angry` sprite, walks off-screen. **Reputation bar visibly drops** — the player must *see* the cost. |
| **Regular arrives** | **Portrait slides in with a nameplate. Distinct SFX. This is an EVENT.** Everything else on screen quiets for a beat. |
| Rush period (curve peak) | Music intensity swaps to `mus_shift_rush`. Subtle red edge glow. |
| Last 15 seconds | Timer bar pulses. Spawning has stopped — this is the "clear the queue" scramble. |

**Report and stop.**

---

## 7. PHASE 3.5 — THE MAP (WALKABLE NEIGHBORHOOD)

**This is a place, not a menu.** If it ends up feeling like a level select, the phase has failed.

### 7.1 — `world/` (separate module, NOT byte-stable)

```ts
interface WorldState {
  playerPos: { x: number; y: number };
  path: string[];                    // remaining node ids
  targetNodeId: string | null;
  currentNodeId: string | null;
  facing: 'n' | 's' | 'e' | 'w';
  moving: boolean;
  walkSpeed: number;                 // px/sec in map space, default 220
}
```

**Waypoint graph — NOT a nav-mesh, NOT collision.**

`data/world.ts` defines:
- `nodes[]`: `{ id, x, y, type, assetKey, unlockCondition }`
- `edges[]`: pairs of node ids

Pathfinding is **BFS over the graph**. The avatar lerps along edges at `walkSpeed`. Tapping anywhere on the map finds the nearest node and walks there. `facing` is derived from the movement vector.

This is sufficient and it will not fight you. **Do not build a nav-mesh. Do not build collision detection.** The scope creep here is real and it will eat a week for no player-facing benefit.

`tickWorld(world, dt)` advances the avatar, fires `onNodeArrive(nodeId)` on arrival.

### 7.2 — Map Layout (2048 × 2048 coordinate space)

```
                     [ΠΛΑΤΕΙΑ  1024,600]
                    /         |         \
      [ΚΑΦΕΝΕΙΟ    [ΦΟΥΡΝΟΣ    [ΖΑΧΑΡΟΠΛΑΣΤΕΙΟ
        700,500]    1024,400]     1350,500]
                              |
                    [ΕΚΚΛΗΣΙΑ  1024,780]
                              |
                     [ΣΤΕΝΟ  1024,1000]  ← junction
                    /         |         \
    [ΠΕΡΙΠΤΕΡΟ   [ΣΟΥΒΛΑΤΖΙΔΙΚΟ  [ΜΕΖΕΔΟΠΩΛΕΙΟ    [ΕΦΟΡΙΑ
      700,1100]     1024,1150]      1380,1100]      1500,900]
                              |                     (locked until Απρίλιος)
             [ΛΑΪΚΗ 800,1300]   [ΤΡΑΠΕΖΑ 1300,1300]
                              |
                     [ΣΠΙΤΙ  1024,1450]
                              |
                    [ΠΑΡΑΛΙΑ  1024,1700]  ← junction
                              |
                  [ΨΑΡΟΤΑΒΕΡΝΑ  1024,1850]
```

**Camera:** follows the avatar, clamped to map bounds. Drag to pan freely; auto-recenters on the avatar after 2s of no input. Pinch to zoom, clamped `0.7× – 1.5×`.

### 7.3 — Node Types & Interactions

**Shop entrances**
- **Unlocked:** walk in → confirm panel ("Άνοιγμα βάρδιας;") → `START_SHIFT`.
- **Locked:** shows the shuttered sprite (`poi_kleisto`) with a **ΠΩΛΕΙΤΑΙ sign** displaying the unlock requirement and cost.
- **Locked shops are visible from Day 1.** All six of them. This is not an oversight — it is the engine of desire. The player should want the Σουβλατζίδικο before they can have it.

**ΠΛΑΤΕΙΑ — the soul of the game**
Regulars you've unlocked idle here between shifts. Tap one → dialogue panel with their `plateia_idle` line. Gives **+0.5 rep**, once per Regular per day.

This is the single most important non-shift interaction. It's where Κυρ-Θανάσης stops being a customer and becomes a person. It's also the mechanical escape hatch from a reputation death spiral. Do not cut it.

**ΛΑΪΚΗ — street market**
Open when `day % 4 === 1` or `day % 4 === 3` (Tuesdays and Fridays). Buy an **ingredient discount** for the next shift: cost drops 30% → 20% of gross. Price €50, fluctuating ±30% by month (expensive in Δεκέμβριος, cheap in Σεπτέμβριος).

**ΤΡΑΠΕΖΑ**
Loan panel. Shows: current debt, accruing interest, **and the upcoming rent + ΕΦΚΑ bill**. Borrow / repay. The bank is the only place that tells you the truth about what's coming.

**ΕΚΚΛΗΣΙΑ**
Fires seasonal events (Πάσχα, Χριστούγεννα, Απόκριες). Purely narrative + sets a flag the calendar reads. Cheap to build, adds enormous texture.

**ΣΠΙΤΙ — your house**
- Save game
- View Regulars roster
- View calendar
- **"Κοιμήσου" (Sleep)** → `ADVANCE_DAY` → shift summary → next day

This is the diegetic "end turn" button. You go home, you sleep, tomorrow happens. Much better than a `[Next Day →]` button in a corner.

**ΕΦΟΡΙΑ — the tax office**
Locked until Απρίλιος. Ominous on the map from Day 1 — greyed out, but *there*. When it unlocks, entering triggers a tax bill scaled to `lifetimeEarnings`. The player will have seen it looming for three in-game months.

### 7.4 — Map HUD

`€ money` · `debt` · `Ημέρα X — Μήνας` · `avg reputation` · `⚙ settings`

**Report and stop.**

---

## 8. PHASE 4 — META SCREENS

All reached **from the map**, never from a menu. Every screen is a place you walk to.

**Shift Summary** *(fires on Sleep at ΣΠΙΤΙ)*
```
Σερβιρίστηκαν: 22    Έφυγαν: 3
─────────────────────────
Έσοδα            €84.50
Πρώτες ύλες     −€25.35
Ενοίκιο         −€40.00
ΕΦΚΑ           −€150.00
─────────────────────────
ΚΑΘΑΡΑ        −€130.85
```
Plus: reputation change per shop, any unlocks triggered, any Regulars newly available.

**Upgrade Screen** *(from inside each shop, before starting a shift)*
Four lines × three tiers. Cost, current tier, and the effect stated in plain language ("Οι πελάτες περιμένουν 20% περισσότερο"), never as a raw multiplier.

**Regulars Roster** *(from ΣΠΙΤΙ)*
Portrait · name · personality line · favorite order · times served · times failed · current standing. Locked Regulars show as silhouettes with their unlock requirement.

**Calendar** *(from ΣΠΙΤΙ)*
The year at a glance. Current day marked. Upcoming month modifiers shown as warnings.

**From Ιούνιος onward, ΑΥΓΟΥΣΤΟΣ is flagged in red: "ΠΡΟΣΟΧΗ — Η ΓΕΙΤΟΝΙΑ ΑΔΕΙΑΖΕΙ."**

**Shop Unlock Flow**
When a reputation threshold is crossed, the locked shop's ΠΩΛΕΙΤΑΙ sign **starts pulsing on the map**. The player sees it from across the neighborhood. Tap → purchase confirm → unlocked.

**Report and stop.**

---

## 9. PHASE 5 — POLISH & SHIP

**Title screen.** Settings: language toggle (EL/EN), sound, save management.

**Audio.** Registry-based hooks. Placeholder silent files. 13 SFX + 6 music tracks.

**Onboarding — Day 1 is scripted and forgiving.**
- Καφενείο only. **Only the μπρίκι is active.**
- Only `pappous` (drain 0.03 — nearly infinite patience) spawns.
- Tooltips walk through the loop: *tap the μπρίκι → wait → tap to collect → tap the customer.*
- **Rent and ΕΦΚΑ do not apply until Day 5.**
- Κυρ-Θανάσης is scripted to appear on **Day 3**, regardless of reputation. The player meets him before they understand the system, so that when they later learn Regulars are gated behind rep, they realize they were *given* something.

**Game over.** `debt > €5000`. Screen shows lifetime stats. Restart.

**Ship.** `vite build` clean, zero console errors, Vercel-ready. Lighthouse PWA pass.

**Report and stop.**

---

## 10. APPENDIX — FULL ASSET REGISTRY (331 keys)

Every key below goes in `src/assets/registry.ts`. Claude Code generates a placeholder for each. Higgsfield fills them in later.

### Shops — 21
```
bg_kafeneio, bg_fournos, bg_souvlatzidiko, bg_periptero,
bg_zacharoplasteio, bg_psarotaverna, bg_mezedopoleio          (7 × 1080×1920)

icon_kafeneio, icon_fournos, icon_souvlatzidiko, icon_periptero,
icon_zacharoplasteio, icon_psarotaverna, icon_mezedopoleio    (7 × 256×256)

sign_kafeneio, sign_fournos, sign_souvlatzidiko, sign_periptero,
sign_zacharoplasteio, sign_psarotaverna, sign_mezedopoleio    (7 × 512×256)
```

### Stations — 72
For each of: `briki, frapiera, espresso, oven, dough, gyros, grill, wrap, fryer, fridge, shelf, register, mixer, syrup, ice, clean, meze, ouzo`
→ `st_{name}_idle`, `st_{name}_working`, `st_{name}_ready`, `st_{name}_burnt`
*(18 × 4 = 72, at 256×256)*

### Items — 49 *(256×256, transparent bg)*
```
it_ellinikos, it_frape, it_freddo_espresso, it_freddo_cappuccino,
it_nescafe, it_soda

it_tiropita, it_spanakopita, it_bougatsa, it_koulouri, it_psomi,
it_ladopsomo, it_kritsinia

it_pita_gyros, it_pita_souvlaki, it_pita_apola, it_merida_gyros,
it_patates, it_tzatziki, it_kalamaki

it_tsigara, it_nero, it_frigania, it_gum, it_efimerida, it_lachio,
it_pagoto

it_galaktoboureko, it_baklava, it_kataifi, it_ekmek, it_profiterol,
it_tourta, it_loukoumades

it_gavros, it_barbouni, it_kalamaraki, it_htapodi, it_tsipoura,
it_horiatiki, it_ouzo_glass

it_saganaki, it_dolmadakia, it_keftedakia, it_fava, it_taramas,
it_melitzanosalata, it_pikilia, it_karafaki
```

### Customer Archetypes — 30
For each of: `pappous, giagia, mathitis, taxitzis, ypallilos, touristas, mama, parea, ergatis, kyria_skylo`
→ `cu_{name}_idle`, `cu_{name}_angry`, `cu_{name}_happy`
*(10 × 3 = 30)*

### Regulars — 32
For each of: `thanasis, voula, mitsos, eleni, panagiotis, roula, spyros, kostas`
→ `rg_{name}_idle`, `rg_{name}_angry`, `rg_{name}_happy`, `rg_{name}_portrait`
*(8 × 4 = 32)*

### Map & Avatar — 37
```
bg_map_geitonia                                          (1 × 2048×2048)

av_walk_n_1..4, av_walk_s_1..4,
av_walk_e_1..4, av_walk_w_1..4                           (16)

av_idle_n, av_idle_s, av_idle_e, av_idle_w               (4)

poi_plateia, poi_laiki, poi_trapeza, poi_ekklisia,
poi_spiti, poi_eforia, poi_paralia, poi_steno,
poi_kleisto                                              (9)

ui_poleitai, ui_node_locked, ui_node_open, ui_node_event,
ui_map_hud, ui_dialogue_box, ui_map_compass               (7)
```

### UI — 31
```
ui_patience_bar_frame, ui_patience_fill, ui_rep_bar_frame, ui_rep_fill,
ui_timer_ring, ui_coin, ui_euro, ui_star, ui_lock, ui_check, ui_x,
ui_speech_bubble, ui_order_ticket, ui_button_primary, ui_button_secondary,
ui_panel_bg, ui_modal_bg, ui_map_bg, ui_map_node_locked,
ui_map_node_unlocked, ui_map_path, ui_calendar_bg, ui_month_card,
ui_upgrade_slot, ui_upgrade_locked, ui_shift_summary_bg, ui_logo,
ui_title_bg, ui_settings_gear, ui_flag_el, ui_flag_en
```

### Upgrades — 28 *(128×128)*
For each of the 7 shops:
`up_{shop}_speed`, `up_{shop}_capacity`, `up_{shop}_quality`, `up_{shop}_comfort`

### Seasonal — 12 *(512×512 mood cards)*
```
mo_ianouarios, mo_fevrouarios, mo_martios, mo_aprilios,
mo_maios, mo_iounios, mo_ioulios, mo_avgoustos,
mo_septemvrios, mo_oktovrios, mo_noemvrios, mo_dekemvrios
```

### Audio — 19
```
SFX (13):
sfx_tap, sfx_serve_correct, sfx_serve_wrong, sfx_burn, sfx_coin,
sfx_customer_arrive, sfx_customer_angry, sfx_customer_leave,
sfx_station_ready, sfx_upgrade, sfx_shift_end, sfx_shop_unlock,
sfx_regular_arrive

MUSIC (6):
mus_title, mus_shift_calm, mus_shift_rush, mus_meta,
mus_summer, mus_winter
```

### Total

| Category | Count |
|---|---|
| Shops | 21 |
| Stations | 72 |
| Items | 49 |
| Customer archetypes | 30 |
| Named Regulars | 32 |
| Map & Avatar | 37 |
| UI | 31 |
| Upgrades | 28 |
| Seasonal | 12 |
| Audio | 19 |
| **TOTAL** | **331** |

---

## 11. HIGGSFIELD STYLE LOCK

Do not generate a single asset until this is locked. Same discipline as the Runecast enemy rules — the constraints are what make 331 images look like one game instead of 331 images.

### Visual Constraints

- **Palette:** warm, sun-bleached Mediterranean. Ochre, terracotta, whitewash, olive green, deep Aegean blue. Nothing neon. Nothing grey.
- **Style:** flat vector illustration with soft cel shading. Thick, clean outlines. Readable at 128px.
- **Perspective:** slight isometric ¾ view for stations and shop interiors. Straight-on for customers and items.
- **NO TEXT IN ANY GENERATED IMAGE.** All text is UI-layer so it can be bilingual. Signs are drawn as shapes, not letters.
- **Customers:** full-body, simple silhouettes, exaggerated readable expressions. Consistent head-to-body ratio (~1:4). Each archetype must be identifiable in one glance from a 96px card.
- **Items:** centered, transparent background, no drop shadow, consistent scale within a shop.
- **Nothing photoreal. Nothing cluttered.**

### Generation Order

Do not generate all 331 at once. Generate a **playable first shop** and playtest it dressed:

1. **UI (31)** — you need these for everything else to be legible
2. **Καφενείο stations (12)** — briki, frapiera, espresso × 4 states
3. **Καφενείο items (6)**
4. **3 archetypes (9)** — pappous, ypallilos, mathitis
5. **`rg_thanasis` (4)** — the first Regular
6. **`bg_kafeneio`, `icon_kafeneio`, `sign_kafeneio` (3)**

**= 65 assets, and you have a fully-dressed, fully-playable first shop.** Play it. If it isn't fun with real art on it, generating the other 266 will not fix that.

**Per your standing Higgsfield workflow:** generate one image at a time (`count: 1`); single start-frame animation by default; start+end frame transitions only where the two frames are nearly identical.

---

## 12. RECOMMENDED BUILD ORDER

| Step | What | Why |
|---|---|---|
| 1 | Phases 0–2 in one session | Engine + data. Deterministic logic. Claude Code will nail this. |
| 2 | **§4.9 — RUN THE HEADLESS SIM** | **Twenty minutes. Finds broken numbers before you build anything on top of them.** |
| 3 | Rebalance in `data/`, re-run sim, repeat | Iterate until the year-long curve looks like a game |
| 4 | Phase 3 (Shift UI) — own session | Where the game lives or dies. Expect 3–4 iterations on feel alone. |
| 5 | Phase 3.5 (Map) — own session | Own session; it's a different problem domain. |
| 6 | Phases 4–5 | Meta + polish |
| 7 | **Only now:** Higgsfield, in the §11 order | 65 assets → playtest → the remaining 266 |

**Set expectations honestly:** this will not one-shot into a finished game. What it *will* one-shot is a **complete, functional, correct, and boring** game. Every system works. Every number is wired. Nothing is fun yet.

Then you make it fun. That's the actual job, and no prompt does it for you.

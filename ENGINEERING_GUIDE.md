# Engineering Guide — From 101 to Principal

A progressive textbook-style walkthrough of how **ScriptLab by GOACTO** is built, for engineers at every level. Read top to bottom once to understand the whole system; skim the level that matches where you are when you pick up a ticket.

> **Policy:** this file is a living doc. Any PR that changes the architecture, adds a new major feature, changes the theme/background, renames a contract (schema, storage key, route), or introduces a new subsystem **must** update the relevant level(s) here — at minimum the one that describes the subsystem you touched. Small bug fixes don't need to update this guide.

---

## Level 0 — What we're building, in one paragraph

ScriptLab is a Next.js web app that treats a user's daily habits as source code. Habits are `.gss` files (GOACTO Self Script), categorised as `baseline` (self-care), `update` (learning), `upgrade` (paradigm shift), `bug` (bad habit to patch), or `virus` (limiting belief). A day is an "executable" — a timeline of `.gss` runs. The app ships as a client-only web app today (localStorage), with the storage layer intentionally thin so we can bolt on a cloud backend when we launch paid. Visuals lean Matrix: green-on-black, digital rain, CRT glow.

---

## Level 1 — Engineer 101: getting the app running

**Prereqs:** Node 20+, npm 10+, a browser.

```bash
git clone <repo>
cd PersonalScriptLab
npm install
npm run dev       # http://localhost:3000
```

**What you'll see**

1. `/` renders the splash: a Matrix digital-rain canvas behind a CRT boot log that auto-advances to `/onboard` (new user) or `/dashboard` (returning).
2. Onboard: a 5-step installer wizard collects a name, one or more wake-up statements, values, goals, and seed templates.
3. After onboarding, your data lives in `localStorage` under key `scriptlab:v1`.

**The four auth'd routes**

| Route | Does |
| --- | --- |
| `/dashboard` | Build Status HUD — XP, streak, script counts, achievements, wake-ups |
| `/library` | IDE-style `.gss` editor |
| `/packages` | Bundle scripts into named packages |
| `/day` | Drag `.gss` or 📦 onto an hourly timeline → "compile" the day |
| `/tester` | Pomodoro runner for a selected script (deep-link via `?id=`) |
| `/profile` | Edit name, wake-ups, values, goals after onboarding |

Press `⌘K` (or `Ctrl+K`) anywhere to open the command palette.

**Useful scripts**

```bash
npm run dev         # dev server
npm run build       # production build (Next's static prerender)
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm test            # vitest run
npm run test:watch  # vitest watch
```

**Where the source lives**

```
app/         Next.js App Router routes + layout + global CSS
components/  React components (splash, wizard, editor, timer, HUD, nav)
lib/         Types, storage, gss helpers, gamification, Context provider
public/      Static assets (logo.svg)
project.md   Canonical spec + seed config
```

---

## Level 2 — Mid Engineer: how the pieces fit

### 2.1 Data flow

All state is held in a single `ScriptLabProvider` (React Context + `useReducer`) defined in `lib/ScriptLabProvider.tsx`. The provider:

1. On mount, reads `localStorage` via `loadState()` and dispatches `{ type: "hydrate", state }`.
2. Wraps every state change in a `useEffect` that re-serialises to `localStorage` via `saveState()`.
3. Exposes `{ state, dispatch, hydrated }` through `useScriptLab()`.

The reducer itself lives in `lib/reducer.ts` as a pure function with an exported `Action` union. Keep it pure — the tests in `lib/reducer.test.ts` import it directly and rely on no I/O.

Routes are `"use client"` components that read `useScriptLab()` and early-return `null` until `hydrated` is true (prevents SSR/CSR mismatch).

### 2.2 The `.gss` model

Defined in `lib/types.ts`:

```ts
interface GssFile {
  id: string;
  name: string;        // file-name slug
  title: string;       // human title
  type: GssType;       // baseline | update | upgrade | bug | virus
  durationMin: number; // default 25 (Pomodoro)
  intent: string;
  steps: string[];
  tags: string[];
  linkedValue?: string;
  createdAt: string;
  updatedAt: string;
  runs: GssRun[];      // append-only run log
}
```

Helpers in `lib/gss.ts` (`makeGss`, `slugify`, `uid`, plus `typeLabel` / `typeIcon` / `typeColor` maps) keep the UI consistent.

### 2.3 Gamification

`lib/gamification.ts` holds:

- `xpForRun(script, durationMin)` — `durationMin * typeMultiplier`. Patching bugs and viruses is worth 3×, upgrades 2×, updates 1.5×, baseline 1×.
- `LEVELS` — six-tier progression, Junior Dev → Architect of Self.
- `levelFor(xp)` — returns `{ current, next, progress }` for the XP bar.
- `maybeUnlockAchievements(state, event)` — pure function that returns any newly-unlocked achievements for a given event.
- `bumpStreak(state)` — idempotent per-day, resets if yesterday wasn't passed.

Keep these pure. The reducer is the only place that applies their results to state.

### 2.4 Storage contract

`lib/storage.ts` exports `loadState`, `saveState`, `exportState`, `importState`, `resetState`, and the storage key `scriptlab:v1`. **If you change the shape of `ScriptLabState`, bump the key** (`scriptlab:v2`) and write a migration in `loadState`. Never quietly read a new shape from an old key.

### 2.5 Theme

Tailwind config in `tailwind.config.ts` defines the palette (`matrix`, `matrix-dim`, `amber-bug`, `virus`, `ink`, `muted`). Global CSS in `app/globals.css` holds the CRT text shadow (`.crt-text`), the scanline overlay (`.scanlines::before`), and button / panel utilities. The `MatrixRain` canvas is a standalone client component — drop it anywhere and position it absolute.

---

## Level 3 — Senior Engineer: the invariants and extension points

### 3.1 Reducer invariants

`reducer` in `lib/ScriptLabProvider.tsx` is the single source of truth for mutations. Key invariants:

- **Append-only runs.** `recordRun` never mutates history; it appends to `script.runs`.
- **Referential cleanup.** `deleteScript` also strips the id from every `package.scriptIds`. When you add new cross-references, extend this.
- **Idempotent day-pass.** `passDay` is safe to call multiple times the same day; `bumpStreak` short-circuits on a same-day repeat.
- **Achievements never fire twice.** `maybeUnlockAchievements` checks `state.achievements` before emitting.

New actions should follow the pattern: pure reducer, no I/O, no `Date.now()` in test-critical paths (prefer passing an ISO string from the action or a helper like `todayStr()` that can be swapped in tests later).

### 3.2 Adding a new screen

1. Add a `"use client"` page under `app/<route>/page.tsx`.
2. Guard with `useScriptLab()` + `useEffect` redirect to `/onboard` if `!state.profile`, mirroring the existing routes.
3. Render `<NavBar />` at the top for consistency.
4. Add the route to the `NAV` array in `components/NavBar.tsx`.
5. Build any new components under `components/` — keep them presentational and accept callbacks rather than dispatch directly where possible (see `FileTree`, `ScriptEditor` for the pattern).

### 3.3 Cross-cutting UI: toasts

Transient notifications live in `components/AchievementToasts.tsx`, mounted once in the root layout next to `{children}`. It watches `state.achievements` and renders any newly-unlocked ones for ~4.5s. The seed pattern (`seenRef` initialised from current achievements on first render) is what prevents re-toasting past achievements on page refresh — reuse this pattern if you add any other "unlocked" notification.

### 3.4 Recommendations

`lib/recommendations.ts#recommendTemplates(profile, ownedTitles)` keyword-scores templates against tokens extracted from the user's wake-up statements, values, and goals. Pure, no network. The Library shows the top 4 unowned matches above the manual import drawer. If you add more template metadata (e.g. `forValues: string[]`), extend `templateTokens` rather than adding new scoring logic.

### 3.4a Packages

Packages are simple containers — `{ id, title, name, scriptIds[] }` in `lib/types.ts`. The Packages view (`app/packages/page.tsx` + `components/PackagesView.tsx`) is the only place that creates/edits them. The Day Builder accepts both `scriptId` and `packageId` in a slot; total minutes and projected XP sum across the package's scripts. When you delete a script the reducer also strips its id from every package's `scriptIds` (see `deleteScript` in `ScriptLabProvider`) — keep that invariant if you add new cross-references.

### 3.4b Command palette

`components/CommandPalette.tsx` is mounted once in the root layout. It listens for `⌘K`/`Ctrl+K` globally, builds a flat list of commands at render time (route jumps, "new <type>" creators, run-this-script entries derived from `state.scripts`, plus state actions like compile-day / export / reset), filters by query, and runs the first match on `Enter`. To add a command, push it into the `cmds` array — keep them flat, don't introduce a category abstraction until we have >25 entries.

### 3.4c Tests

`vitest` runs the suite in `lib/**/*.test.ts`. `vitest.config.ts` aliases `@` so production `import "@/lib/..."` paths work in tests. Pattern: arrange a tiny state via the helpers (`makeGss`, `emptyState`), call the pure function, assert. Keep test files next to the unit they cover. When you next add the reducer test, import `reducer` directly — it's already a pure function with no I/O.

### 3.5 Adding a new `.gss` type

1. Add to `GssType` in `lib/types.ts`.
2. Extend `typeLabel`, `typeIcon`, `typeColor` in `lib/gss.ts`.
3. Add a multiplier in `gamification.ts#typeMultiplier`.
4. Decide whether the `FileTree` `ORDER` array should show it.
5. Decide whether the Day Builder / Tester should allow it (both currently filter out `bug` and `virus`).
6. Update `project.md` and this guide.

### 3.4 Performance posture

- All routes are statically prerendered (`○ Static` in the build output). Anything blocking SSR breaks the splash → onboarding handoff, so keep screens client-only.
- `MatrixRain` uses `requestAnimationFrame` and a single canvas. If you add more heavy animations, prefer one canvas over many DOM nodes.
- State is small (profile + scripts + executables + achievements). If we get to the point where localStorage feels slow, *that's* when we switch to IndexedDB — don't pre-optimise.

### 3.5 Testing (aspirational today)

There's no test suite yet (tracked in `BACKLOG.md`). The seams that make testing cheap exist:

- Pure helpers in `gamification.ts`, `gss.ts`, `templates.ts`.
- Reducer is a pure function you can call directly.
- `loadState` / `saveState` are the only I/O; easy to mock.

When you add the first test, put it next to the file (`gamification.test.ts`) and wire `vitest` into `package.json`.

---

## Level 4 — Staff Engineer: architectural bets and trade-offs

### 4.1 Why client-only, why localStorage first

We optimised for **speed to a usable product** and **user control of their own data**. Consequences we accepted:

- **Pro:** Zero backend bill, zero signup friction, works offline, users can export a JSON file and own their life.
- **Con:** No cross-device sync, no social features, no server-side analytics, browser storage is fragile.

The bet is: the product has to be loved locally before we try to monetise sync. We mitigate the fragility with an always-available export/import (see the nav bar) and by keeping the storage shape stable behind `lib/storage.ts`.

**Migration path to cloud.** `lib/storage.ts` is the *only* file that talks to `window.localStorage`. When we go paid:

1. Create `lib/cloudStorage.ts` that implements the same `{ loadState, saveState, exportState, importState, resetState }` interface against Supabase (Postgres row-per-user, JSONB column for state).
2. Introduce a feature flag (`NEXT_PUBLIC_STORAGE=local|cloud`) and select the module in the provider.
3. Give users a "sync this device" flow that calls `importState(exportState(local))` into cloud on first auth.

### 4.2 Why React Context + useReducer, not Redux/Zustand

State is small, mutations are low-frequency, there's one writer. Context + reducer gets us time-travel-style reasoning (pure reducer) without the ceremony. When (if) we add optimistic network mutations, server-synced collections, or multi-tab sync, that's the trigger to pull in Zustand or TanStack Query — not before.

### 4.3 Why `.gss` as structured JSON, not Markdown or a DSL

Weighed three options during onboarding (see `project.md`). JSON won because:

- It maps 1:1 onto React forms without a parser.
- It serialises losslessly for export/import and for the eventual cloud sync.
- A DSL can still be layered on later as a view-over-JSON — the reverse is painful.

The DSL spike is parked in `BACKLOG.md#research--spikes`.

### 4.4 Theme as identity, not decoration

The Matrix aesthetic is the brand promise: *you are the developer of your own life*. Tokens live in `tailwind.config.ts`; effects (CRT text, scanlines, digital rain) are global. **Don't introduce a second theme casually** — every new visual grammar dilutes the identity. If we need a high-contrast or print mode, treat it as a feature ticket with its own design doc.

### 4.5 iOS readiness

We're a PWA-ready web app today. The cheapest iOS path is a Capacitor wrap once we have cloud sync (so the app is useful on install). A React Native rewrite is a Level-5 decision: revisit only if native APIs (HealthKit integration, rich notifications, Shortcuts) become product-critical.

---

## Level 5 — Principal: stewardship

At this level you're not shipping features — you're shaping the direction.

### 5.1 The product thesis

Humans already run on scripts; most are unconscious. ScriptLab makes them legible, editable, and version-controlled. Everything we build should make one of these four loops tighter:

1. **Capture** — get a script out of a user's head into a file.
2. **Edit** — let them refactor their own behaviour.
3. **Run** — remove friction between intending and doing.
4. **Learn** — show them what's compiling and what's failing, without shame.

If a proposed feature doesn't obviously serve one of these, push back before it ships.

### 5.2 Contracts we protect

- **The `.gss` schema.** Backwards-compatible additions only; breaking changes require a migration and a version bump in the storage key.
- **The storage interface in `lib/storage.ts`.** This is what lets us swap to cloud without rewriting the app.
- **The splash → onboarding handoff.** New users must reach the installer within 3 seconds. Every regression here costs activation.
- **The Matrix identity.** Palette, mono font, CRT effects. Treat these as brand — don't ship anything that breaks them.
- **Export/import.** The user owns their data. If a feature can't survive export/import, don't ship it until it can.

### 5.3 When to break rank

It's fine to break every rule above *once* you've written down why in an ADR (to be added under `/docs/adr/` when we hit the first hard choice). Default to reversibility; one-way doors deserve a PR description as long as the change.

### 5.4 What "done" means for a release

A new version ships when:

1. `npm run build` is clean.
2. `CHANGELOG.md` has the version block moved out of `[Unreleased]`.
3. `BACKLOG.md` has completed items removed.
4. This guide is updated for anything architectural.
5. The four loops (capture, edit, run, learn) are all exercised by hand in a browser with a fresh profile.

### 5.5 Handoff

When you leave this codebase better than you found it, the signal is that a 101-level engineer can read Level 1 of this doc and ship a first PR the same day. If that stops being true, fix Level 1 before you fix anything else.

---

## Appendix — Quick reference

**Storage key:** `scriptlab:v1`
**File tree root shown in UI:** `/dev/self`
**Default Pomodoro:** 25 min
**Level thresholds (XP):** 0 · 150 · 500 · 1200 · 2500 · 5000
**XP multipliers:** baseline ×1 · update ×1.5 · upgrade ×2 · bug/virus ×3

# Changelog

All notable changes to **ScriptLab by GOACTO** are tracked here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Policy:** every PR that changes behavior, adds a feature, fixes a bug, changes the background/theme, or alters a contract (schema, route, storage key) **must** update this file under `[Unreleased]` before merge. On release, move `[Unreleased]` entries into a dated version block.

---

## [Unreleased]

### Added
- **Profile editor (`/profile`)** — edit developer name, wake-up statements (add / remove), core values, and goals after onboarding. Linked from the nav bar, the HUD's "wake-up statements" panel, and the command palette. Writes through the existing `setProfile` action; recommendations and the splash echo update on next render.
- **Splash wake-up echo** — after the boot log finishes, the splash renders one of the user's wake-up statements in italic CRT text as a "why you booted" banner. Picked at random on each visit.
- **Reducer extracted to `lib/reducer.ts`** — pure `reducer(state, action)` export with an exported `Action` union. `ScriptLabProvider` is now a thin shell around it.
- **Reducer test suite** — 9 tests covering addScript/updateScript, deleteScript referential cleanup across packages, recordRun (no-op + XP award + bail), passDay (streak + achievement-once), reset, and importAll.

### Added (previous)
- **Achievement toasts** — transient Matrix-style toast in the bottom-right when a new achievement unlocks (`components/AchievementToasts.tsx`, mounted once in the root layout). Past achievements are seeded on mount so you don't get re-toasted on page load.
- **Day Builder validation** — highlights overlapping slots in amber, shows a warning strip with overlap count and total-duration overflow (>24h), and surfaces scheduled minutes in the header.
- **Wake-up → template recommendations** — Library now shows a "recommended for your wake-ups" band when the user's wake-up statements, values, or goals keyword-match any unowned template. Lives in `lib/recommendations.ts`; pure function, no LLM cost.
- **Packages view (`/packages`)** — UI to bundle `.gss` files into named packages. Sidebar lists all packages, right pane lets you rename and tick scripts in/out. Day Builder now accepts package drops too (renders as `📦 title` in the slot, contributes to total duration and projected XP).
- **Command palette (`⌘K` / `Ctrl+K`)** — global launcher with route jumps, "new <type> .gss" creators, "compile & ship today", export, reset, and a `Run "<title>"` entry per script that deep-links into the Tester via `?id=`. Tester now reads the `id` query param to autoselect.
- **First test suite (Vitest)** — 21 tests covering `lib/gamification.ts` (XP, levels, achievements, streak), `lib/recommendations.ts` (token matching, ownership filtering), and `lib/gss.ts` (uid, slugify, makeGss). Run with `npm test` (one-shot) or `npm run test:watch`.

### Changed
- Nav bar shows the `⌘K` hint on desktop widths and now includes "Packages" and "Profile" entries.
- **Splash no longer auto-advances.** After the boot sequence it waits for the user to click `[ enter ]`, press `Enter`, or press `Space`. The button auto-focuses and a subtle "press enter or space" hint sits below it.

---

## [0.1.0] — 2026-04-16

### Added
- **`project.md`** — canonical spec + seed config for the app.
- **Next.js 15 + React 19 + Tailwind scaffold** with 7 prerendered routes.
- **Splash screen (`/`)** — Matrix digital-rain canvas + CRT boot sequence, auto-routes to `/onboard` or `/dashboard`.
- **Installer-style Onboarding Wizard (`/onboard`)** — 5 steps: developer profile, multiple wake-up statements (3 pre-seeded examples), core values, goals, curated template seeding.
- **Build Status HUD / Dashboard (`/dashboard`)** — today's build state, XP bar with 6 levels (Junior Dev → Architect of Self), streak counter, script counts by type, wake-up recap, achievements.
- **Script Library (`/library`)** — IDE-style file tree grouped by `baseline-os/ updates/ upgrades/ bugs/ viruses/`; editor pane for title, type, duration, intent, steps, tags, linked value, and run log; on-demand template import.
- **Day Builder (`/day`)** — drag `.gss` files onto an hourly timeline, projected-XP readout, one-click "compile & ship" that passes the day and bumps the streak.
- **Script Tester (`/tester`)** — dropdown + Pomodoro timer with step checklist; records runs, awards XP, may unlock achievements.
- **`.gss` (GOACTO Self Script) schema** — typed model covering 5 script categories (baseline, update, upgrade, bug, virus).
- **Curated template library** — 8 starter templates (morning breath, hydrate, evening reflection, deep read, skill drill, identity install, plus bug/virus examples).
- **Gamification layer** — XP, levels, streaks, and 4 achievements (first-run, first-compile, first-bug-patched, first-virus-deleted, 7-day streak).
- **Local persistence** — `localStorage` with JSON export / import / reset (via the nav bar). Wrapped in `lib/storage.ts` so a cloud backend can be slotted in later.
- **Matrix theme tokens** — green-on-black palette, CRT text glow, scanline overlay, digital-rain canvas, flicker + blink animations.

### Notes
- No backend in this release — all data lives in the browser.
- Branch: `claude/create-scriptlab-app-b2DUK`.

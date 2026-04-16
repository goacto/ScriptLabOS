# Changelog

All notable changes to **ScriptLab by GOACTO** are tracked here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Policy:** every PR that changes behavior, adds a feature, fixes a bug, changes the background/theme, or alters a contract (schema, route, storage key) **must** update this file under `[Unreleased]` before merge. On release, move `[Unreleased]` entries into a dated version block.

---

## [Unreleased]

_(Nothing queued yet — add your entry here when you open a PR.)_

### Added
### Changed
### Fixed
### Removed

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

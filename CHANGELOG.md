# Changelog

All notable changes to **ScriptLabOS by GOACTO** are tracked here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Policy:** every PR that changes behavior, adds a feature, fixes a bug, changes the background/theme, or alters a contract (schema, route, storage key) **must** update this file under `[Unreleased]` before merge. On release, move `[Unreleased]` entries into a dated version block.

---

## [Unreleased]

### Added
- **Another way to focus.** The splash, the onboarding footer, and Settings → About say how ScriptLabOS differs: habits as code in a terminal-style OS. Focus Log (https://focus.goacto.com) is first and labeled the main focus app. Mindscape (https://mindscape.goacto.com) is one line as a focus game. The footer link **Free one-page book guide** opens https://goacto.com/pages/atomic-habits. The in-app workbook link is unchanged.
- **Try it first.** Onboarding step 1 leads with "Your day runs on habits. Write the ones you want, and run them each morning." The code tags stay as styling. **Skip setup, show me a sample day** loads the seed templates, lays a sample day on today, and opens Home.
- **Set up my scripts** in Settings adds any seed templates that are not already in the library.
- Wake-up is one optional field with three tap-to-pick examples. Values are chips: pick 3, or skip for now.

### Changed
- A new user no longer taps `[ enter ]` on the splash. The boot sequence opens onboarding step 1. Returning users still tap `[ enter ]`.
- The footer line reads "Growing Ourselves and Contributing To Others".

### Fixed
- **Achievement toasts on load.** Saved achievements are marked seen only after local data hydrates, so opening the app no longer replays every unlock.
- **Deleted scripts and packages** are removed from day-plan slots, so an hour does not stay occupied with nothing to clear.
- **Library tags.** The tag field keeps the comma you type, so a second tag can be entered.
- **Quick Log dates.** "Last: today" and "Last: yesterday" follow the local calendar day.
- **Tester deep links.** A bug or virus `?id=` (or a command-palette Run) no longer opens that script in the Pomodoro runner. A 0-minute script no longer produces a broken progress bar.
- **Planned-script counts** on the dashboard and in History include scripts that sit inside a package.
- **Overlap warning** counts the hours involved instead of printing a fraction.
- **Settings theme switch** starts in the dark position, matching the default theme.
- **Analytics empty state** points at the Tester when the last 30 days have no sessions.
- **Splash hint** says to tap `[ enter ]` as well as the keyboard keys.
- **Workbook line after ship.** The quiet $7 workbook sentence on Day Builder stays for the rest of that local day, including after a refresh. It is still one plain link, shown only once the day is shipped.
- **Local calendar days.** Day boundaries, streaks, daily logs, export filenames, and Analytics labels use the user's local date. They no longer flip to the next day in the evening (after 00:00 UTC).
- **Import validation.** Invalid JSON and wrong-shaped files show the real error and leave current data alone. A backup import asks before it overwrites existing data.
- **Day Builder on touch.** Tap a script, then tap an hour to place it. Drag still works with a pointer.
- **Timer survives navigation.** The running session is stored with a start timestamp and the time left is derived from the clock. A chime plays when it finishes if the browser has allowed sound.
- **Greeting follows the local hour** (morning, afternoon, evening).
- **Touch targets.** The mobile menu, library rows, and history filters are at least 44px tall.

### Added
- **Yesterday's focus on the HUD.** When the previous local day has an optional tomorrow's focus, the dashboard build card shows that line. A blank focus stays hidden.
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
- **Splash for a returning user.** After the boot sequence it waits for `[ enter ]` (tap, Enter, or Space). A new user still goes straight to onboarding. The hint under the button says to tap or use the keyboard.
- **Mobile / iOS readiness.** Root layout now exports `viewport` (`device-width`, `initialScale: 1`) and `themeColor: #04070a` so iOS Safari scales correctly and tints the status bar. Apple Web App metadata (`capable: true`, `statusBarStyle: black-translucent`, title `ScriptLab`) and an SVG icon/apple-touch-icon are declared so Add-to-Home-Screen renders branded.

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

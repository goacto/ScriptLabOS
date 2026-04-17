# Changelog

All notable changes to **ScriptLabOS by GOACTO** are documented here.

---

## 📦 Version 0.2.0 — Coming Soon

### 🎯 New Features

**Quick-Log System for Bad Habits**
- Dashboard widget for bugs/viruses with one-click "Quick Log" buttons
- Zero-duration tracking (no Pomodoro session required)
- 21-day elimination: scripts move to "Eliminated" after 21 days clean
- Resurrection: log an eliminated script to bring it back
- Shows days clean and total tallies for each negative pattern

**Analytics & History**
- `/analytics` — 30-day performance dashboard with XP charts, completion rates, and build quality metrics
- `/history` — git-style commit log of all life events (runs, achievements, builds)
- Filtering, search, and color-coded event types
- Relative timestamps ("2 days ago") plus full dates

**Settings & Configuration**
- `/settings` — centralized OS configuration page
- Light/dark mode toggle with persistence
- Data management (export/import/reset)
- Interactive tutorial viewer (8 guides)
- Developer documentation viewer (changelog, backlog, engineering guide)
- About section with user stats

**Mobile Navigation**
- Responsive hamburger menu (☰) for screens < 1024px
- Full dropdown navigation with backdrop overlay
- Adaptive text sizing and spacing
- Fixed horizontal scrolling issues

**Pomodoro Education**
- Info modal explaining the Pomodoro Technique
- Link to Grokipedia for deeper learning
- Accessible from `/tester` page

**Navigation Improvements**
- Back buttons added to `/settings`, `/analytics`, `/history`
- Nav bar now includes all 9 routes
- ⌘K hint visible on mobile to encourage Command Palette use

### 🔄 Changes

**Day Builder Workflow Redesign**
- 3-stage build lifecycle: Draft → In-Progress → Complete
- Real-time execution fidelity tracking (% of planned scripts completed)
- Mandatory end-of-day reflection before shipping
- Color-coded build quality (green/amber/red based on fidelity)

**Reflection Requirements**
- Post-session reflection now mandatory (at least one field required)
- End-of-day reflection requires all three fields (wins, challenges, tomorrow's focus)
- Removed skip buttons to ensure conscious iteration

**Bug/Virus Behavior**
- Bugs and viruses filtered from Day Builder planning view
- Filtered from Tester script dropdown
- Can't voluntarily schedule bad habits for Pomodoro sessions
- Use quick-log system on dashboard instead

**UI Polish**
- Documentation viewer redesigned with clean white/dark mode styling
- Better spacing and typography using react-markdown
- Improved readability across all markdown content
- Responsive text and padding throughout

---

## 📦 Version 0.1.1 — 2026-04-16

### 🎯 New Features

**Profile Management**
- `/profile` route for editing name, wake-ups, values, and goals after onboarding
- Accessible from nav bar, dashboard, and command palette
- Changes update recommendations and splash wake-up echo immediately

**Recommendations System**
- Library shows "recommended for your wake-ups" templates
- Keyword matching against wake-up statements, values, and goals
- Pure function, no AI/LLM cost
- Lives in `lib/recommendations.ts`

**Packages**
- `/packages` route for bundling scripts together
- Create named packages (e.g., "Morning Routine")
- Day Builder accepts package drops
- Shows total duration and projected XP

**Command Palette**
- Global launcher with `⌘K` / `Ctrl+K`
- Route jumps, script creators, run commands
- Deep-links to Tester with `?id=` parameter
- Export, reset, and compile-day actions

**Achievement System**
- Transient Matrix-style toasts for new achievements
- Bottom-right placement with slide-in animation
- Past achievements seeded to prevent re-toasting

**Testing**
- Vitest test suite (21 tests)
- Covers gamification, recommendations, and gss helpers
- Pure reducer tests
- Run with `npm test` or `npm run test:watch`

### 🔄 Changes

**Splash Screen**
- Wake-up echo: displays random wake-up statement after boot
- No longer auto-advances — waits for user to press Enter/Space
- Button auto-focuses with keyboard hint

**Day Builder**
- Validation: highlights overlapping time slots
- Warning strip for schedule conflicts
- Shows total scheduled minutes in header

**Navigation**
- Nav bar shows `⌘K` hint on desktop
- Added Packages and Profile entries

---

## 📦 Version 0.1.0 — 2026-04-15

**🎉 Initial Release**

### Core Application

**Onboarding**
- Installer-style wizard (`/onboard`)
- 5 steps: name, wake-up statements, values, goals, templates
- 8 curated starter templates included

**Dashboard**
- Build Status HUD showing XP, streak, achievements
- Level system: Junior Dev → Architect of Self (6 levels)
- Script counts by type
- Wake-up recap and achievement display

**Script Management**
- Library (`/library`) with IDE-style file tree
- Grouped folders: baseline-os, updates, upgrades, bugs, viruses
- Full editor: title, type, duration, intent, steps, tags, linked value
- Run log with completion tracking

**Daily Planning**
- Day Builder (`/day`) with hourly timeline (5am-10pm)
- Drag-and-drop script scheduling
- Projected XP calculation
- "Compile & ship" to pass the day

**Script Execution**
- Tester (`/tester`) with Pomodoro timer
- Step checklist during execution
- Records runs, awards XP
- May unlock achievements

### Technical Foundation

**Data Model**
- `.gss` schema (GOACTO Self Script)
- 5 script types: baseline, update, upgrade, bug, virus
- Append-only run log
- Pure reducer with exported Action union

**Gamification**
- XP system with type multipliers (baseline ×1, upgrade ×2, bug/virus ×3)
- 6-tier level progression
- Streak tracking with daily reset
- 4 starter achievements

**Storage**
- localStorage with `scriptlab:v1` key
- JSON export/import
- Reset functionality
- Thin storage layer for future cloud migration

**Theme**
- Matrix aesthetic (green-on-black)
- CRT text glow and scanline effects
- Digital rain canvas
- Monospace font (JetBrains Mono)

**Tech Stack**
- Next.js 15 + React 19
- Tailwind CSS
- TypeScript
- App Router with 7 routes
- Client-only (no backend)

---

## Notes

- **Format**: Follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- **Versioning**: Adheres to [Semantic Versioning](https://semver.org/)
- **Policy**: Every PR that changes behavior must update the "Coming Soon" section before merge

# ScriptLab by GOACTO — Project Manifest

> "Your brain is a computer. Each minute of your day is a line of code. You are the developer of your own life."

ScriptLab is a web application that lets users visualize and edit their daily scripts and habits as if they were source files in an IDE. It is part of the GOACTO ecosystem and will later be ported to iOS.

This file is **both** the canonical spec for engineering *and* the seed config used to initialize a new user's environment at onboarding.

## Living docs

Three companion files are living — every PR that changes behavior, visuals, or architecture **must** update the relevant one(s):

- [`CHANGELOG.md`](./CHANGELOG.md) — what shipped, organised by version. Add entries under `[Unreleased]` in every PR.
- [`BACKLOG.md`](./BACKLOG.md) — what we've deferred. Move items out when they ship, add items in when you discover them.
- [`ENGINEERING_GUIDE.md`](./ENGINEERING_GUIDE.md) — "From 101 to Principal" textbook on the codebase. Update the level(s) affected by any architectural or feature change.

---

## 1. Core Metaphor

| Concept | Maps to |
| --- | --- |
| **Baseline OS** | Heartbeat / self-care scripts (sleep, hydrate, meditate, breathe) |
| **Update** | Reading, learning, skill practice |
| **OS Upgrade** | Positive paradigm shift (identity-level change) |
| **Bug / Pop** | Bad or ineffective habit |
| **Virus** | Limiting belief |
| **.gss file** | *GOACTO Self Script* — a single atomic habit/practice, defaults to 25 min (Pomodoro) |
| **Package** | A bundle of related .gss files (e.g. "Morning Routine") |
| **Executable** | A full day, composed of packages on a timeline |
| **Compile / Build** | Successfully completing a day's executable |
| **Developer** | The user — author of their own life |

---

## 2. Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 with a Matrix-inspired token set
- **Persistence:** Browser `localStorage` with JSON export/import; cloud-ready abstraction in `lib/storage.ts` so we can swap in Supabase/Firebase when the app goes paid
- **State:** React Context (`ScriptLabProvider`) + `useReducer`
- **No backend** in MVP. All logic runs client-side.
- **Future:** Capacitor / React Native port for iOS.

---

## 3. Screens

### 3.1 Splash (`/`)
- Matrix digital-rain canvas background
- Centered GOACTO logo + "ScriptLab" wordmark, "Boot your OS" tagline
- Auto-advance after ~2.5s (or on click) to `/onboard` (new user) or `/dashboard` (returning)

### 3.2 Onboarding Installer Wizard (`/onboard`)
Styled as an OS installer with steps and a progress bar ("Installing ScriptLab OS...").
1. **Developer Profile** — display name
2. **Wake-up Statements** — users can add *multiple* statements of the form *"I wake up to X so that Y so that Z"*. Three example statements are pre-seeded as inspiration and can be edited or removed.
3. **Core Values** — pick/enter top 5
4. **Goals** — enter 1–3 goals
5. **Template Seeding** — user selects which curated templates to import as starting .gss files

### 3.3 Dashboard / Build Status HUD (`/dashboard`)
- "Today's Build" card (passing / failing / not started)
- XP bar, level, streak counter
- Bug count, virus count, active updates
- Quick links into Library, Day Builder, Tester

### 3.4 Script Library — IDE View (`/library`)
- Left sidebar: file tree grouped by type
  - `baseline-os/` (heartbeat)
  - `updates/` (learning)
  - `upgrades/` (paradigm shifts)
  - `bugs/` (bad habits)
  - `viruses/` (limiting beliefs)
  - `packages/` (grouped bundles)
- Right pane: .gss editor — title, type, duration, intent, steps[], tags[], related-value
- "New .gss", duplicate, delete, enhance-with-AI (stub)
- Import from template library

### 3.5 Day Builder — Daily Executable (`/day`)
- Vertical 24-hour timeline
- Drag .gss files and packages onto time slots
- Save as today's `.gxe` (GOACTO eXecutable)
- "Compile Day" button → validates no overlap, calculates XP estimate

### 3.6 Script Tester — Pomodoro Runner (`/tester`)
- Dropdown of existing .gss files (grouped by type)
- Start / pause / reset 25-min timer (or custom duration from the file)
- Step checklist visible during run
- On completion: mark run, award XP, bump streak, maybe unlock achievement

---

## 4. .gss File Schema

```ts
type GssType = "baseline" | "update" | "upgrade" | "bug" | "virus";

interface GssFile {
  id: string;            // uuid
  name: string;          // e.g. "morning-meditation"
  title: string;         // human title
  type: GssType;
  durationMin: number;   // default 25
  intent: string;        // one-liner "why"
  steps: string[];       // atomic checklist items
  tags: string[];
  linkedValue?: string;  // which user value this serves
  createdAt: string;     // ISO
  updatedAt: string;     // ISO
  runs: { at: string; completed: boolean; durationMin: number }[];
}

interface Package {
  id: string;
  name: string;
  scriptIds: string[];
}

interface Executable {       // a day
  id: string;
  date: string;              // YYYY-MM-DD
  slots: { time: string; scriptId?: string; packageId?: string }[];
  status: "draft" | "running" | "passed" | "failed";
}
```

---

## 5. Curated Template Library

Seeded in `lib/templates.ts`. All user-importable from onboarding or from the Library.

- `baseline/morning-breath.gss` — 10 min breathwork
- `baseline/hydrate.gss` — 5 min water + stretch
- `baseline/evening-reflection.gss` — 15 min journaling
- `update/deep-read.gss` — 25 min focused reading
- `update/skill-drill.gss` — 25 min deliberate practice
- `upgrade/identity-install.gss` — 25 min writing a new identity statement
- `bug/doomscroll.gss` — example bug script (to be patched/removed)
- `virus/not-enough.gss` — example limiting belief (to be quarantined/deleted)

Bug & virus templates are provided as *examples of what to identify and patch*, not to practice.

---

## 6. Gamification

- **XP** per completed run = `durationMin × typeMultiplier`
  - baseline ×1, update ×1.5, upgrade ×2, bug/virus patched ×3
- **Levels:** Junior Dev → Dev → Senior Dev → Staff → Architect of Self
- **Streaks:** consecutive days with ≥1 passing executable
- **Achievements:** first-compile, 7-day streak, first-bug-patched, first-virus-deleted, ship-7-executables, level-up
- **Build Status HUD:** shows today's state like a CI dashboard

---

## 7. Theme Tokens

```css
--bg:            #04070a;
--bg-elev:       #0a1410;
--matrix-green:  #00ff9c;
--matrix-dim:    #00b36b;
--accent-amber:  #ffb400;   /* bugs */
--accent-red:    #ff3860;   /* viruses */
--text:          #d6fff0;
--muted:         #6b8377;
font-mono:       "JetBrains Mono", ui-monospace, monospace;
```

---

## 8. File Tree

```
/
├── project.md                     ← this file
├── package.json
├── next.config.mjs
├── tsconfig.json
├── postcss.config.mjs
├── tailwind.config.ts
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                   ← Splash
│   ├── onboard/page.tsx           ← Installer wizard
│   ├── dashboard/page.tsx         ← Build status HUD
│   ├── library/page.tsx           ← IDE view
│   ├── day/page.tsx               ← Day builder
│   └── tester/page.tsx            ← Pomodoro runner
├── components/
│   ├── MatrixRain.tsx
│   ├── Splash.tsx
│   ├── NavBar.tsx
│   ├── OnboardingWizard.tsx
│   ├── FileTree.tsx
│   ├── ScriptEditor.tsx
│   ├── DayBuilder.tsx
│   ├── PomodoroTimer.tsx
│   ├── XPBar.tsx
│   └── BuildStatusHUD.tsx
├── lib/
│   ├── types.ts
│   ├── storage.ts
│   ├── gss.ts
│   ├── templates.ts
│   ├── gamification.ts
│   └── ScriptLabProvider.tsx
└── public/
    └── logo.svg
```

---

## 9. Roadmap After MVP

1. Cloud sync (Supabase) + auth for paid launch
2. LLM-enhanced template generation using the user's wake-up statements
3. iOS port (Capacitor first, then potentially React Native)
4. Social: share .gss files, clone a friend's package
5. Analytics: daily/weekly "commit log" replay of the user's life

# Backlog

Living list of everything we've deferred or haven't started yet. Ordered loosely by priority inside each section. Anything in `Now` is fair game to pick up in the next PR.

> **Policy:** when you open a PR that implements or cancels an item, move it to `CHANGELOG.md` (or delete it with a one-line "cancelled because X"). When you discover new work, add it here in the relevant section instead of letting it rot in a chat thread.

---

## Now (next up)

- [ ] **Packages view** — UI to bundle `.gss` files into named packages (schema already exists in `lib/types.ts`, no UI yet).
- [ ] **Keyboard shortcuts** — `⌘K` command palette for "new .gss", "jump to tester", "compile day".
- [ ] **Tests** — first unit coverage for `gamification.ts`, `recommendations.ts`, and the reducer.

## Next (soon)

- [ ] **Cloud backend (paid launch)** — swap `lib/storage.ts` for Supabase (auth + Postgres). Keep the local import/export as an offline/migration path.
- [ ] **LLM-enhanced template generation** — "enhance with AI" button on the Library template drawer; uses the user's wake-up statements, values, and goals to generate a personalized `.gss`. Gate behind an API key.
- [ ] **Run analytics** — weekly graph of passed vs. bailed runs, bug-patch count, virus-delete count, XP per day.
- [ ] **Commit log replay** — chronological feed of runs + achievements that reads like a `git log` of the user's life.
- [ ] **Social .gss sharing** — export a single `.gss` file as a shareable link; import someone else's.

## Later (nice to have)

- [ ] **iOS port** — Capacitor wrap first, then evaluate a React Native rewrite.
- [ ] **Notifications / reminders** — browser notifications at scheduled slot times; on iOS, native push.
- [ ] **Multiple executable profiles** — weekday vs. weekend templates, "travel mode" override.
- [ ] **Daily journaling integration** — attach a short reflection to each completed executable.
- [ ] **Team mode** — shared packages for families, coaches, accountability partners.

## Tech debt

- [ ] **Tests** — no Jest/Vitest suite yet. Add unit coverage for `gamification.ts`, reducer in `ScriptLabProvider.tsx`, and `gss.ts` helpers.
- [ ] **E2E** — a Playwright smoke test that runs the onboarding → create script → start timer → compile day flow.
- [ ] **ESLint config** — `next lint` currently uses Next's defaults; tighten with `@typescript-eslint` strict rules.
- [ ] **A11y pass** — the IDE look is keyboard-unfriendly in places (file tree focus ring, modal dialogs). Audit with axe.
- [ ] **Mobile polish** — the Day Builder drag-and-drop is desktop-first; add a tap-to-select fallback for touch.
- [ ] **Time-zone handling** — `todayStr()` currently uses UTC; should use the user's local date.

## Known bugs

- [ ] _(none filed — please log here with a short repro and the route/file involved)_

## Research / spikes

- [ ] Evaluate `framer-motion` for more satisfying level-up and ship-day transitions.
- [ ] Explore a "virus-scan" AI feature that reads the user's journaled limiting beliefs and suggests overwrites.
- [ ] Decide whether `.gss` should eventually support a mini DSL (`meditate(10m) -> journal(15m)`) as an alternative authoring mode.

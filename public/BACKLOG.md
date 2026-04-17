# Backlog

Living list of everything we've deferred or haven't started yet. Ordered loosely by priority inside each section. Anything in `Now` is fair game to pick up in the next PR.

> **Policy:** when you open a PR that implements or cancels an item, move it to `CHANGELOG.md` (or delete it with a one-line "cancelled because X"). When you discover new work, add it here in the relevant section instead of letting it rot in a chat thread.

---

## Now (next up)

- [ ] **Script versioning** — track edit history for `.gss` files; ability to rollback to previous versions of a script.
- [ ] **Weekly/monthly analytics views** — extend `/analytics` with longer time ranges and trend analysis.
- [ ] **Custom achievement creation** — allow users to define their own achievement criteria and rewards.

## Next (soon)

- [ ] **Cloud backend (paid launch)** — swap `lib/storage.ts` for Supabase (auth + Postgres). Keep the local import/export as an offline/migration path.
- [ ] **LLM-enhanced template generation** — "enhance with AI" button on the Library template drawer; uses the user's wake-up statements, values, and goals to generate a personalized `.gss`. Gate behind an API key.
- [ ] **Social .gss sharing** — export a single `.gss` file as a shareable link; import someone else's.
- [ ] **Habit streak visualization** — visual calendar heatmap showing daily activity like GitHub contributions graph.
- [ ] **Export history to PDF** — generate formatted report of commit log with charts and reflections.

## Later (nice to have)

- [ ] **iOS port** — Capacitor wrap first, then evaluate a React Native rewrite.
- [ ] **Notifications / reminders** — browser notifications at scheduled slot times; on iOS, native push.
- [ ] **Multiple executable profiles** — weekday vs. weekend templates, "travel mode" override.
- [ ] **Daily journaling integration** — attach a short reflection to each completed executable.
- [ ] **Team mode** — shared packages for families, coaches, accountability partners.

## Tech debt

- [ ] **E2E** — a Playwright smoke test that runs the onboarding → create script → start timer → compile day flow.
- [ ] **ESLint config** — `next lint` currently uses Next's defaults; tighten with `@typescript-eslint` strict rules.
- [ ] **A11y pass** — the IDE look is keyboard-unfriendly in places (file tree focus ring, modal dialogs). Audit with axe.
- [ ] **Mobile Day Builder** — drag-and-drop is desktop-first; add a tap-to-select fallback for touch devices.
- [ ] **Time-zone handling** — `todayStr()` currently uses UTC; should use the user's local date.
- [ ] **Light/dark mode persistence** — theme preference stored in localStorage but not synced to ScriptLabState; may cause issues with future cloud sync.

## Known bugs

- [ ] _(none filed — please log here with a short repro and the route/file involved)_

## Research / spikes

- [ ] Evaluate `framer-motion` for more satisfying level-up and ship-day transitions.
- [ ] Explore a "virus-scan" AI feature that reads the user's journaled limiting beliefs and suggests overwrites.
- [ ] Decide whether `.gss` should eventually support a mini DSL (`meditate(10m) -> journal(15m)`) as an alternative authoring mode.

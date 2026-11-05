# ScriptLabOS audit — 2026-11-05

One pass on the live app at https://scriptlabos.goacto.com and on `main` (`3357b3e`, "S4: One quiet $7 workbook link after the evening reflection"). Phone checks used a 390×844 viewport. Security items are report-only: this branch does not change auth, storage rules, headers, or dependencies.

## Top 5

### 1. UX · High · The first minute is a six-step installer

A new phone session cannot run a habit. Splash holds for the boot log (~2s), then `[ enter ]` goes to `/onboard`. That wizard is six steps with no skip: metaphor, name, a wake-up statement, at least three values, a goal, then templates. `canNext` blocks advance until those fields are filled (`components/OnboardingWizard.tsx`). Dashboard, Day Builder, and Tester all redirect to onboarding when there is no profile.

**390px proof should show:**

- Splash: the wordmark wraps as `</>` over `ScriptLabOS` (it fits; it is not clipped). `[ enter ]` is on screen. Under it, the hint reads `press enter or space`. A thumb can tap the button; the hint describes a keyboard the phone does not show.
- Onboarding, step 1 of 6, without scrolling: the heading "Welcome to ScriptLabOS", the progress bar, and the metaphor card. The card is cut off around "How It Works" / Tester. `next →` is below the fold. There is no "run one script" control in the first viewport.

**Fix:** Let step 0's `next` sit in the first viewport (shorter copy, or a sticky footer). Add a path that seeds the three default templates and opens Tester in one tap, and keep the long profile for later. Change the splash hint to "tap [ enter ]".

**Effort:** Copy and layout in `Splash.tsx` and `OnboardingWizard.tsx`. A real "run one script first" path also touches routing in `app/dashboard/page.tsx` (and the other profile gates). Not a one-line change.

### 2. Retention · High · Day 2 does not bring back what they wrote

Tomorrow's focus is saved on the executable (`reflection.tomorrowFocus`) and is optional at ship time. The next morning the HUD still says today's build is `draft` and offers "Plan Today". It never reads yesterday's executable. The line only appears inside a History commit card. There is no reminder (still on the backlog). Analytics with no runs is four zeros and a flat 30-day chart, with no prompt to log a session.

The splash wake-up echo is the one return hook that already works, and it quotes a wake-up statement, not yesterday's focus.

**390px proof should show:** After a shipped day whose optional focus is a short line such as "walk at lunch", open `/dashboard` on the next local day at 390px. The first card shows `draft`, the date, and "Plan Today". It should also show the label "yesterday's focus" and the saved line. Before this branch, that label was absent (the words existed only after opening History and finding the build commit).

**Fix:** This branch shows `priorDayFocus()` on the HUD build card when yesterday's focus is non-blank. Still open: an analytics empty state that links to Tester, and any reminder. Those are larger than this pass.

**Effort:** Done for the HUD line (`lib/reflection.ts`, `components/BuildStatusHUD.tsx`). Empty-state copy on `app/analytics/page.tsx` is a separate small change. Reminders are the existing backlog item.

### 3. Retention · Medium · The $7 workbook path died on refresh

The post-ship sentence is one plain link, which is right: no modal, no timer (`lib/workbookLink.ts`, `data-testid="workbook-quiet-link"`). On live `main` it was gated by `justShipped` React state. Refresh, or leaving `/day`, dropped the sentence. The shipped executable stayed in `localStorage` (`scriptlab:v1`) with `status: "complete"`, but the link did not. It is also absent from the dashboard and from History. The product URL itself is public and already in the `/day` client chunk.

**390px proof should show:** On `/day`, after "Ship Today's Build", a full-width line under the header: "Day shipped. If paper helps, there's a 30-Day Habit Builder Workbook ($7)." Then reload `/day` at 390px the same local day. The line should still be there, above the script palette. Before this branch, reload left only "Shipped on …" and the timeline.

**Fix:** This branch renders that same sentence whenever today's executable is `complete`, so a same-day refresh keeps it. It is still one quiet link, still only on Day Builder, still gone the next local day. Putting it on the dashboard the morning after would be a product choice, not done here.

**Effort:** Done (`components/DayBuilder.tsx`). A second placement would be another small HUD line.

### 4. Security · Medium · Document responses are frameable, and the journal is in localStorage

`HEAD` on `/`, `/dashboard`, and the layout JS chunk (2026-11-05):

| Present | Absent on HTML and JS |
| --- | --- |
| `strict-transport-security: max-age=63072000` (no `includeSubDomains`) | `Content-Security-Policy` |
| `server: Vercel` | `X-Content-Type-Options` |
| | `X-Frame-Options` or `frame-ancestors` |
| | `Referrer-Policy` |
| | `Permissions-Policy` |

`access-control-allow-origin: *` is set on those responses. The app has no credentialed API, and the bundle scan below found no secrets, so the CORS star is low impact.

`next.config.mjs` sets no `headers()`. There is no `middleware.ts`. Settings includes export and reset. A framed page on another site can still receive clicks against this origin, and reset wipes `localStorage`.

All profile text, reflections, and scripts live in `localStorage` key `scriptlab:v1` (`lib/storage.ts`). There is no account. The only `dangerouslySetInnerHTML` is a static theme snippet in `app/layout.tsx`. User strings render as React text. `react-markdown` is used for bundled docs, not for journal HTML. No injection sink turned up on this pass. A future XSS would still read the whole journal, because nothing limits script or frame origins.

**Client bundles (checked, no secrets):** Homepage chunks plus `app/day/page-*.js` and `app/layout-*.js`. No API key, `sk_live` / `sk_test`, Supabase, Firebase, Stripe, Google API key, or private key. The day chunk contains the public workbook URL and UTM params. The layout chunk contains the public ping URL `https://siagentspace.com/api/ping` and no credential. The anonymous id is generated in the browser (`crypto.randomUUID`), stored as `goacto:aid:v1`, and posted once per local day. Settings can turn that off, and Global Privacy Control skips it, but the ping runs from the root layout on first paint, before a new user can open Settings.

**Fix (not in this PR):** Add a headers block: `Content-Security-Policy` with `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a tight `Permissions-Policy`. Keep the inline theme script in mind when writing `script-src`. Move the usage ping until after the settings toggle has been shown, or default it off until then.

**Effort:** Headers are a small `next.config.mjs` change plus a check that the theme script and Vercel still load. The ping default is a behavior change in `components/UsagePing.tsx` and `components/UsageToggle.tsx`.

### 5. Security · High · `next@15.5.15` is inside critical advisory ranges; the image optimizer is on

`npm audit` against the lockfile on 2026-11-05: 3 critical, 6 high, 5 moderate. Lockfile resolves `next` to **15.5.15** (`package.json` allows `^15.1.6`). Audit severity for `next` is critical. `fixAvailable` is true. Vulnerable ranges called out by the advisories include builds through 15.5.27 for some issues, so "latest 15.5.15" is not enough; confirm a patched 15.5.x or newer before bumping.

Production-relevant:

- **Image optimizer is live.** `GET /_next/image?url=/icons/icon-192.png&w=64&q=75` returned 200 with the optimizer's `Content-Security-Policy: script-src 'none'; frame-src 'none'; sandbox` and `content-disposition: attachment`. The app does not use `next/image`, and `images.unoptimized` is unset, so the route still exists. Critical items in range include unauthenticated image-optimizer issues for SVG and AVIF (`GHSA-2464-fhr4-w9xw`, `GHSA-2xp9-vwfh-vxw4`). This pass did not send those payloads.
- High Server Action denial-of-service advisories apply to the framework. This repo has no `"use server"` and no server actions. Treat that as latent on the Next server, not as an app feature.
- Middleware bypass advisories have nothing to bypass: there is no `middleware.ts`.
- The rewrite in `next.config.mjs` is only `/manifest.json` → `/manifest.webmanifest`.
- The Windows image-optimizer RCE (`GHSA-p293-qw3h-jr36`) does not match this Vercel Linux host. It still ships in the same outdated package.

Also high, with different reach:

| Package | Locked | Reach | Note |
| --- | --- | --- | --- |
| `postcss` | 8.4.49 | Build | High. Audit offers 8.5.32 (not a major). Next also nests its own copy. |
| `sharp` | via Next | Image pipeline | High (libvips / libheif / librsvg). Leaves with a Next upgrade. |
| `browserslist`, `nanoid`, `source-map-js` | transitive | Build | High. `fixAvailable: true`. |
| `vitest` 2.1.9, `tinypool`, `vite` | dev | Not shipped | Critical/high. The offered fix is `vitest@5.1.0` (major). Do not drive-by upgrade. |

**Fix (not in this PR):** Upgrade `next` to a release outside the critical ranges, then re-run `npm audit` and re-check `/_next/image`. Upgrade direct `postcss` only if it does not fight Next's nested copy. Leave the Vitest major bump for a separate change.

**Effort:** A dependency upgrade plus a production smoke of `/`, `/dashboard`, and `/day`. No application code has to change for the Next bump itself.

## Also checked

- Nav hamburger, library rows, and history filters already use at least 44px. The dashboard "Quick Log" button still uses `!py-1` and is shorter than that. Left as-is.
- HSTS is present on HTML, JS, and the image response.
- No secrets in the client chunks listed above. Do not treat the workbook URL or the ping URL as credentials; both are public.
- Open PRs #10 and #15 were not merged or rebased.

## In this branch

Two retention fixes only. Security findings are unchanged on purpose.

1. Day Builder keeps the quiet workbook sentence for the rest of the local day after ship, including refresh.
2. The dashboard build card shows yesterday's optional focus when one was saved.

# SolidCraft — Quality Improvements

**Analysis date:** 2026-11-10
**Project type:** Static, multi-page demonstrational construction-services website (HTML with build-time partials, modular CSS via PostCSS, JavaScript ES modules bundled by esbuild, Service Worker, Netlify hosting)
**Analysis mode:** Evidence-based quality improvement review
**Focus:** Project-wide quality

## Improvement overview

SolidCraft already has project-specific verification: a partial renderer that fails on unresolved directives, link and asset checks over rendered pages, an axe-core gate over 12 routes, nine Playwright functional scenarios with an off-origin request guard, and a Service Worker lifecycle gate (`qa:sw`). Runtime modules guard storage access and use abortable listeners.

The main opportunities lie in the conditions and scope of that verification rather than in missing infrastructure. The accessibility gate scans pages before their reveal animations settle, with the first-visit modal open, and in the light theme only. Shipped offline behavior and two storage-backed user decisions (project notice dismissal, map consent) have no regression coverage. The static HTML checks also discover more than the maintained page set when local agent worktrees are present. Every proposal reuses existing tooling, conventions, and dependencies.

## Proposed improvements

### IMP-QUALITY-01 — Scan settled, unobstructed content in both themes in the accessibility gate

- **Status:** COMPLETED — implemented and verified.
- **Result:** `qa:a11y` scans every required route, now including `/thank-you.html`, in the light and dark themes, each in an isolated reduced-motion browser context seeded through the existing `theme` storage key; `/index.html` is scanned with the project modal open and again after dismissal through its accept button. Before each scan the gate requires loaded web fonts, the requested `data-theme`, fully opaque `[data-reveal]` elements, and the expected modal visibility and `aria-hidden` state, and fails otherwise. Failure lines name route, theme, and modal state, and the summary reports the actual scan count.
- **Verification:** `npm run qa:a11y` passed in two consecutive runs and within `npm run check:predeploy`, each with 28 scans (13 routes × 2 themes plus 2 dismissed-modal scans) and 0 serious/critical violations. A per-scan probe confirmed loaded fonts, the applied theme, full reveal opacity, and both modal states; fault-injected copies failed on disabled reduced motion, a wrong theme seed, a skipped dismissal, and injected low-contrast nodes, and `#bialy-montaz > p` on `/oferta/lazienki.html` passed `color-contrast` at 5.45:1 (light) and 7.13:1 (dark). Verified locally in Chromium only; no GitHub Actions run was observed.
- **Impact:** High
- **Effort:** Small

### IMP-QUALITY-02 — Cover Service Worker fetch strategies and the offline fallback in `qa:sw`

- **Status:** COMPLETED — implemented and verified.
- **Result:** Five new `qa:sw` effect-stage scenarios run canonical `sw.js` with an injected production manifest under an activated, controlling worker. They cover the offline `ignoreSearch` cache fallback, the `/offline.html` fallback, cache-first precached assets, the exclusion of 404 responses from runtime caching, and POST bypass, while the fixture server logs requests and simulates network loss by destroying connections, so `fetch()` rejects instead of resolving with an HTTP error.
- **Verification:** `node --check` and Prettier passed, and the final revision passed all 9 `qa:sw` scenarios in 22 sequential and 9 parallel runs. Seven temporary mutants (six worker-logic regressions, one replacing connection loss with HTTP 503) each failed their targeted scenario. Verified locally in Chromium only; cross-origin exclusion is not covered, and `qa:sw` remains outside `check:predeploy` and CI.
- **Impact:** High
- **Effort:** Medium

### IMP-QUALITY-03 — Add regression protection for the first-visit project modal

- **Affected area:** Project information modal on `index.html` (focus trap, dismissal, persistence).
- **Evidence:** `js/modules/project-banner.js:1-91`, `index.html:1250-1293`, `scripts/functional/harness.mjs:8-11`, `scripts/functional/harness.mjs:74-80`, `docs/CHANGELOG.md` (Fixed: first-visit modal keyboard operability; dismissal with unavailable `localStorage`).
- **Current implementation:** On a first visit the modal opens and moves focus into the dialog. It traps Tab and Shift+Tab, dismisses on Escape or **Akceptuję**, locks page scroll through `has-project-modal`, and persists `project-banner-accepted`. Storage reads and writes are wrapped in `try/catch`. The functional harness pre-accepts the modal in every context, so no scenario renders it. `qa:a11y` scans it open, but without interaction.
- **Proposed improvement:** Add a functional scenario that runs as a first-time visitor and verifies the modal's keyboard and persistence contract, including blocked storage.
- **Expected quality value:** Protects a dialog shown to every new visitor, and two previously fixed defects, against regression. Today these behaviors are excluded from the suite by design.
- **Implementation scope:** Add the scenario under `scripts/functional/` and register it in `scripts/qa-functional.mjs`. Add a per-scenario opt-out of the storage seed to `withPage()`, keeping the pre-accepted default for all other scenarios. `project-banner.js` and its markup stay unchanged.
- **Acceptance criteria:** In a fresh context, the modal is visible, `body` has `has-project-modal`, and focus is inside `#projectBanner`. Repeated Tab and Shift+Tab keep focus inside the modal. Escape and the accept button each hide the modal (`hidden`, `aria-hidden="true"`), remove the body class, and store `project-banner-accepted`, and the modal stays hidden after a reload. When storage access throws, the modal still opens and dismisses with no uncaught page error. All existing scenarios still pass unchanged.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-04 — Add regression protection for the consent-gated map embed

- **Affected area:** Google Maps consent gate in the shared footer (all 13 pages).
- **Evidence:** `js/modules/map-consent.js:3-37`, `partials/footer.html:72-91`, `_headers:9`, `cookies.html:271`, `scripts/functional/harness.mjs:84-106`.
- **Current implementation:** The footer renders a placeholder and a **Załaduj mapę** button. Only a click, or a stored `consent.maps` value of `"true"`, inserts the titled, lazy-loaded Google iframe, and the click persists consent. Storage access is guarded. The harness's off-origin guard incidentally shows that existing scenarios trigger no Google request, but no scenario verifies the consent action, the inserted iframe, or the stored-consent path.
- **Proposed improvement:** Add a functional scenario that verifies the consent gate end to end without contacting Google.
- **Expected quality value:** Protects a privacy contract disclosed on the cookies and privacy pages: no third-party embed before explicit consent, and the stored decision honored afterwards.
- **Implementation scope:** Add the scenario under `scripts/functional/` and register it in `scripts/qa-functional.mjs`. Intercept and abort the embed request locally. Any harness allowance must be scoped to this scenario and the exact embed origin, leaving the off-origin guard intact elsewhere. `map-consent.js`, the footer markup, and the CSP stay unchanged.
- **Acceptance criteria:** Before consent, `.ft-map` contains no iframe, the placeholder and button are present, and no request targets `www.google.com`. After the click, exactly one iframe exists with `src` equal to `data-map-src`, a non-empty `title`, and `loading="lazy"`, the placeholder is gone, and `consent.maps` is `"true"`. After a reload with stored consent, the iframe is inserted without a click. When storage access throws, the click still loads the map with no uncaught page error.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-05 — Scope static HTML checks to the maintained page set

- **Affected area:** `check:links` and `check:assets` (the `check:html` part of `check:predeploy`).
- **Evidence:** `scripts/check-links.mjs:87-97`, `scripts/check-html-assets.mjs:50-66`, `scripts/utils/html-discovery.js:15-23`, `scripts/utils/partials.js:119-122`, `docs/settings.md` (Scripts: `check:links`, `check:assets`).
- **Current implementation:** Each check has its own recursive traversal that skips only `node_modules`, `.git`, `dist`, `.lighthouse-reports`, and `partials`. The shared `listSourceHtmlFiles()` utility used by the build and sitemap also excludes `.claude` and `.codex`. The primary checkout currently holds five agent worktrees under `.claude/worktrees/`. A read-only count with the checks' exclusions finds 78 HTML files there, against 13 maintained pages. Worktree copies would be rendered against the primary checkout's `partials/`, because includes resolve from `rootDir`. CI runs on a clean checkout and is unaffected.
- **Proposed improvement:** Make both checks discover pages through the shared source-HTML discovery, so they validate exactly the page set that `build:dist` ships.
- **Expected quality value:** Local `check:predeploy` results match CI for the same commit. Failures and file counts are no longer influenced by other branches' worktree copies.
- **Implementation scope:** Change only the page-discovery step of `scripts/check-links.mjs` and `scripts/check-html-assets.mjs`. Keep link classification, external-link handling, anchor indexing, asset patterns, and output format unchanged. Changes to other consumers or to the shared exclusion list are excluded. This proposal is limited to verification scope; it does not reopen the completed IMP-TECH-04 build and sitemap consolidation.
- **Acceptance criteria:** In a checkout containing `.claude/worktrees/*` copies, both checks report 13 HTML files scanned and inspect no file under `.claude/` or `.codex/`. In a clean checkout, both checks scan the same 13 files and produce the same pass/fail result as before.
- **Impact:** Medium
- **Effort:** Small

## Selection summary

The five proposals strengthen accessibility verification (01), PWA and offline resilience (02), regression protection for an accessibility-sensitive dialog (03), a privacy and consent contract (04), and verification precision (05). Each protects behavior that already exists and is documented, and each reuses the project's Playwright, axe-core, and plain-Node harness conventions without new dependencies.

There are no hard dependencies. Proposals 03 and 04 both add a scoped option to `scripts/functional/harness.mjs`, so implement them one after the other. All other proposals are independent. Four are Small and one is Medium, which fits a focused development backlog.

Candidates considered but not selected:

- Regression coverage for the `?usluga=` service prefill and the second-stage phone-format validation: lower priority.
- Theme-toggle persistence: lower priority; dark-theme rendering is partly addressed by 01.
- Running `qa:sw` in CI: workflow scope.

## Analysis limitations

- This was a static review. Dependencies are not installed in this worktree, so no npm script, browser suite, build, or axe scan was executed. Current gate results were not reproduced.
- The reveal-timing effect on axe results comes from the CSS and JavaScript sources and the CI failure recorded in commit `55f2fd9`. How axe treats the modal overlay was not measured.
- The 78-file count for IMP-QUALITY-05 came from a read-only `find` with equivalent exclusions in the primary checkout. The checks themselves were not run there.
- Outside this report's scope: `js/modules/home.js` creates the `usluga` hidden field at runtime, and the field is absent from the static form markup (`index.html:1107-1241`). Whether Netlify Forms stores this field was not verified. It needs a deployment check, not an improvement proposal.

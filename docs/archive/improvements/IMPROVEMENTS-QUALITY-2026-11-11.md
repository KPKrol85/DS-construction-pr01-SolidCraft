# SolidCraft — Quality Improvements

**Analysis date:** 2026-11-10
**Project type:** Static, multi-page demonstrational construction-services website (HTML with build-time partials, modular CSS via PostCSS, JavaScript ES modules bundled by esbuild, Service Worker, Netlify hosting)
**Analysis mode:** Evidence-based quality improvement review
**Focus:** Project-wide quality

## Implementation closure

**Status:** COMPLETED — All five selected quality improvements were implemented and verified.
**Completion date:** 2026-11-11
**Archive note:** This quality improvement cycle is closed and the record is prepared for archival.

## Improvement overview

The original review identified five opportunities to strengthen SolidCraft's existing quality verification. These concerned accessibility scan conditions, Service Worker fetch and offline behavior, regression coverage for the first-visit project modal and consent-gated map, and the scope of static HTML checks in checkouts containing agent worktrees.

All five selected improvements were implemented using the project's existing tooling and conventions without introducing new dependencies. The completed verification coverage includes 28 accessibility scans, nine Service Worker scenarios, 14 functional browser scenarios, and static HTML checks scoped to the 13 maintained pages.

This document preserves the implemented results, recorded verification evidence, and relevant limitations of the completed quality-improvement cycle.

## Completed improvements

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

- **Status:** COMPLETED — implemented and verified.
- **Result:** Three `qa:functional` scenarios run as first-time visitors through a new `withPage()` option, `preAcceptProjectBanner: false`, while all other scenarios keep the pre-accepted default. They verify initial focus, Tab and Shift+Tab wraparound under real keyboard input, Escape and accept-button dismissal with synchronized `hidden`, `aria-hidden`, body class, and scroll lock, and persistence across a reload. Dismissal by both methods is also verified with no uncaught error when `localStorage` access or its operations throw.
- **Verification:** `node --check` and Prettier passed, each new scenario passed through `--only`, and `npm run qa:functional` passed three consecutive runs with 13 scenarios and 0 failures. Eleven temporary `project-banner.js` mutants, served through `context.route()` without editing the source, and a leaked acceptance seed each failed at least one targeted scenario. Verified locally in Chromium only; no GitHub Actions run was observed.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-04 — Add regression protection for the consent-gated map embed

- **Status:** COMPLETED — implemented and verified.
- **Result:** A `qa:functional` scenario on `/cookies.html` verifies that no off-origin request occurs before consent with the map area in view, that the click inserts one titled, lazy-loaded iframe matching `data-map-src` and stores `consent.maps`, that a reload restores the map without a click, and that the click still works when `localStorage` access or its operations throw. All off-origin requests are aborted in the browser, and a new `withPage()` option, `allowedOffOriginUrls`, exempts only the exact embed URL from the off-origin guard in the consenting contexts.
- **Verification:** `node --check`, Prettier, the `--only` run, and two consecutive `npm run qa:functional` runs passed, the latter with 14 scenarios and 0 failures. Fourteen temporary `map-consent.js` mutants served through `context.route()` each failed the scenario, an exact-match probe rejected every non-allowed URL, and every embed request ended in `net::ERR_BLOCKED_BY_CLIENT` with no off-origin response. Verified locally in Chromium only; no GitHub Actions run was observed.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-05 — Scope static HTML checks to the maintained page set

- **Status:** COMPLETED — implemented and verified.
- **Result:** `check:links` and `check:assets` now discover pages through the shared `listSourceHtmlFiles()` utility, mapped to absolute paths, so both validate exactly the page set `build:dist` ships and skip `.claude/` and `.codex/`. Their local traversals were removed; validation logic and PASS/FAIL output are unchanged.
- **Verification:** `node --check` and `npm run check:html` passed in a clean worktree with 13 files per check, matching the baseline; both files already failed Prettier at `HEAD` and were left unformatted. In the primary checkout, which holds 130 worktree copies, the scanned set dropped from 143 files to 13 and matched the `build:dist` list file for file. A scratch copy skipped broken pages under `.claude/` and `.codex/` and still failed on a broken link, a missing anchor, and a missing asset in a maintained page.
- **Impact:** Medium
- **Effort:** Small

## Completion summary

**5 of 5 improvements completed.** Accessibility verification, Service Worker regression coverage, first-visit modal testing, map-consent testing, and static HTML validation scope were strengthened within their approved boundaries. All selected improvement items have been implemented and verified; none remain open in this report.

The implementation records above preserve the actual verification results and limitations. Verification was performed locally, primarily in Chromium, and no additional tests were executed solely for this archival closure. The `qa:sw` suite remains outside CI and `check:predeploy`.

## Original analysis limitations

The initial review on 2026-11-10 was based on source inspection and existing project evidence. Dependencies were unavailable in the analysis worktree, so npm checks, browser suites, production builds, and accessibility scans were not rerun during that review. Subsequent implementation verification is recorded separately under each completed improvement.

The original accessibility findings were based on CSS and JavaScript behavior and a CI failure recorded in commit `55f2fd9`. The effect of reveal timing and the project-modal overlay on axe-core results was not directly measured during the initial analysis; the resulting regression coverage is documented under IMP-QUALITY-01.

The initial HTML discovery assessment counted 78 files through a read-only filesystem inspection using equivalent exclusions. The static checks were not executed in the primary checkout during that analysis. Subsequent verification under IMP-QUALITY-05 established a baseline of 143 HTML files, including 130 worktree copies, and confirmed that the updated checks inspect only the 13 maintained pages.

The original review also considered regression coverage for the `?usluga=` service prefill and second-stage phone validation, theme-toggle persistence, and inclusion of `qa:sw` in CI. These were not selected for this improvement cycle and remain outside its completed scope.

The review did not verify whether Netlify Forms stores the runtime-generated `usluga` hidden field created by `js/modules/home.js`, which is absent from the static form markup in `index.html`. This requires deployment-level verification and was not included as an improvement item.

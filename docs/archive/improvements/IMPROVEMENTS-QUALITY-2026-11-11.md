# SolidCraft — Quality Improvements

**Analysis date:** 2026-11-10
**Completion date:** 2026-11-11
**Status:** COMPLETED — 5/5 improvements verified.
**Focus:** Project-wide quality and regression verification.

## Overview

Five quality improvements strengthened accessibility, Service Worker testing, functional regression coverage, and HTML validation. All were completed using existing tooling without introducing new dependencies.

## Completed improvements

### IMP-QUALITY-01 — Scan settled, unobstructed content in both themes in the accessibility gate

- **Status:** COMPLETED — implemented and verified.
- **Result:** Extended `qa:a11y` to cover all 13 required routes in both themes, including `/thank-you.html` and the project modal before and after dismissal. Scans require settled fonts, animations, theme state, and modal visibility.
- **Verification:** Two consecutive runs and `check:predeploy` passed with 28 scans and zero serious/critical violations. State checks, fault-injection probes, and contrast verification passed; tested locally in Chromium without an observed CI run.
- **Impact:** High
- **Effort:** Small

### IMP-QUALITY-02 — Cover Service Worker fetch strategies and the offline fallback in `qa:sw`

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added five Service Worker scenarios covering offline navigation fallbacks, cache-first assets, exclusion of failed responses from runtime caching, and POST bypass under simulated network loss.
- **Verification:** All 9 scenarios passed across 22 sequential and 9 parallel runs; seven injected regressions were detected. Node syntax and Prettier passed; cross-origin exclusion was not covered.
- **Impact:** High
- **Effort:** Medium

### IMP-QUALITY-03 — Add regression protection for the first-visit project modal

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added three functional scenarios covering initial focus, keyboard focus trapping, dismissal, persistence, and unavailable `localStorage`.
- **Verification:** Three consecutive `qa:functional` runs passed 13/13 scenarios; 11 injected regressions and an invalid acceptance seed were detected. Syntax and Prettier passed; verification was local in Chromium.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-04 — Add regression protection for the consent-gated map embed

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added functional coverage for consent-controlled map loading, iframe attributes, persistent consent, storage failures, and restrictions on external requests.
- **Verification:** Two consecutive `qa:functional` runs passed 14/14 scenarios; 14 injected regressions were detected. External-request restrictions and exact URL matching passed; verification was local in Chromium.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-05 — Scope static HTML checks to the maintained page set

- **Status:** COMPLETED — implemented and verified.
- **Result:** Updated `check:links` and `check:assets` to use shared HTML discovery, excluding `.claude/` and `.codex/` worktrees while preserving existing validation behavior.
- **Verification:** `check:html` passed for all 13 maintained pages, matching the production build's page set and reducing discovery from 143 files to 13. Negative tests detected broken links, anchors, and assets; pre-existing Prettier deviations were left unchanged.
- **Impact:** Medium
- **Effort:** Small

## Completion

**5/5 improvements completed.** Accessibility, Service Worker, functional regression, and static HTML verification were strengthened without architectural changes.

Verification was performed during individual implementation tasks; no additional tests were executed solely for archival closure.

## Historical limitations

At completion on 2026-11-11, `qa:sw` remained outside CI and `check:predeploy`, and no updated GitHub Actions run was independently verified. The original analysis also left service-prefill and phone-validation coverage, theme persistence, and deployment-level verification of the Netlify Forms `usluga` field outside its approved scope.

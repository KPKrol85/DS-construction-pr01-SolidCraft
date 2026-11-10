# SolidCraft — Technical Improvements

**Analysis date:** 2026-11-08
**Project type:** Static, multi-page demonstrational construction-services website using HTML, modular CSS, JavaScript ES modules, PostCSS, esbuild, and Netlify hosting.
**Analysis mode:** Evidence-based technical improvement review
**Focus:** Project-wide technical implementation

## Implementation closure

**Status:** COMPLETED — All four selected technical improvements were implemented and verified.
**Completion date:** 2026-11-09
**Archive note:** This improvement cycle is closed and the record is prepared for archival.

## Improvement overview

The original review identified four maintainability improvements in SolidCraft's shared HTML declarations, browser modules, and production pipeline. The scope was limited to reducing duplicated logic and clarifying ownership without changing the project's architecture or established application contracts.

All four selected improvements were implemented. This document preserves their outcomes, recorded verification, and limitations as a completed technical-improvement cycle.

## Completed improvements

### IMP-TECH-01 — Reuse partials for shared head asset declarations

- **Status:** COMPLETED — implemented and verified.
- **Result:** Consolidated four font preloads across seven pages and shared favicon/application metadata across twelve pages into two reusable HTML partials using `{{base}}`. Preserved page-specific metadata, declaration order, and the reduced offline configuration.
- **Verification:** `npm run check:assets` passed for 13 pages, `npm run check:links` passed (11 external links skipped), and `npm run build:dist` completed successfully. Baseline comparisons confirmed byte-identical rendered HTML, production HTML, and `dist/sw.js`, with no unresolved directives. Accessibility, functional browser tests, and Lighthouse were not run.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-02 — Consolidate same-page scroll-to-top orchestration

- **Status:** COMPLETED — implemented and verified.
- **Result:** `initSmoothTop` in `ui-core.js` is the sole owner of same-page top-link scrolling, focus, and an explicit URL policy (home: fragment cleared via `replaceState`, query kept; other pages: `#top` pushed). The duplicate handler in `home.js` and ScrollSpy's `#top` click path were removed; service prefill, drawer closure, and active states remain with their modules.
- **Verification:** New `nav-top-link-same-page-and-cross-page` Playwright scenario and both existing navigation scenarios passed; the scenario failed against the pre-change baseline, which pushed a redundant history entry. A no-reduced-motion probe at 390 px and 1280 px matched the baseline URL, active state, and drawer state; Prettier and `node --check` passed. Tests used locally cached Playwright 1.60 and Chromium; the full `qa:functional` suite was not run.
- **Impact:** Medium
- **Effort:** Medium

### IMP-TECH-03 — Centralize header height publication and cache updates

- **Status:** COMPLETED — implemented and verified.
- **Result:** `utils.syncHeaderCssVar()` now accepts an optional measured height and publishes it to `--header-h`, the cache, and the cached viewport width; the no-argument path keeps the 74 px fallback. `initHeaderShrink` measures the header and publishes through this single call before dispatching an unchanged `header:sync`.
- **Verification:** `node --check` passed for both modules. A browser check on the dev server confirmed matching live height, `--header-h`, `getHeaderH()`, and `header:sync` payloads at top (80 px), shrunk (67 px), expanded, and 375 px viewport (75 px) states, with unchanged utility exports and no console errors; Prettier was not run because dependencies were not installed in the worktree.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-04 — Share source-page discovery between build and sitemap

- **Status:** COMPLETED — implemented and verified.
- **Result:** `scripts/utils/html-discovery.js` (CommonJS) now owns recursive source-HTML traversal, entry ordering, case-insensitive `.html` matching, and shared top-level exclusions. `build-dist.js` and `generate-sitemap.mjs` both use it; the sitemap keeps its explicit `build/`, status-page, prefix, normalization, and sorting rules.
- **Verification:** `node --check` passed for all three files. Pre- and post-change runs of `build-dist.js`, `generate-sitemap.mjs`, and `generate-sw.js` produced a byte-identical 706-file `dist/` (13 HTML documents, 10 sitemap URLs, unchanged `sw.js` cache version), and a probe confirmed identical old/new discovery lists and order on the source tree and an edge-case fixture. Full `npm run build:dist` and Prettier were not run during this task because dependencies were unavailable; the Service Worker comparison used source CSS/JS as stand-ins for minified bundles.
- **Impact:** Medium
- **Effort:** Small

## Completion summary

**4 of 4 improvements completed.** Shared head declarations, same-page scroll-to-top handling, header-height publication, and source-HTML discovery were consolidated within their approved scopes. No improvement items remain open in this report.

The checks and limitations above are historical implementation records. No additional verification was performed solely to close this document.

## Original analysis limitations

The initial review on 2026-11-08 covered source HTML and partials, runtime modules, CSS, build configuration, source discovery, Service Worker generation, and related documentation and QA consumers. `npm run check:assets` passed for 13 rendered HTML documents. No production build, browser suite, deployment check, or performance measurement was run **during that initial analysis**; subsequent implementation checks are recorded separately under each improvement.

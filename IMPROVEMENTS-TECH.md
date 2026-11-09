# SolidCraft — Technical Improvements

**Analysis date:** 2026-11-08
**Project type:** Static, multi-page demonstrational construction-services website using HTML, modular CSS, JavaScript ES modules, PostCSS, esbuild, and Netlify hosting.
**Analysis mode:** Evidence-based technical improvement review
**Focus:** Project-wide technical implementation

## Improvement overview

SolidCraft separates browser features into ES modules, composes CSS through PostCSS, and renders shared header/footer partials before delivery. Production bundles, the sitemap, and the Service Worker manifest have explicit generation ownership. The opportunities below concern repeated source declarations and responsibilities shared between existing modules; they require no framework, dependency, or directory restructuring.

No active `PLAN.md`, previous `IMPROVEMENTS-TECH.md`, or other improvement report was present. The changelog and archived audit were consulted to exclude completed work. These proposals are candidates for separate approval, not approved implementation tasks. Existing Polish content, DOM/ARIA and `data-*` contracts, navigation, themes, storage, forms, SEO, and PWA behavior must be preserved.

## Proposed improvements

### IMP-TECH-01 — Reuse partials for shared head asset declarations

- **Status:** COMPLETED — implemented and verified.
- **Result:** Consolidated four font preloads across seven pages and shared favicon/application metadata across twelve pages into two reusable HTML partials using `{{base}}`. Preserved page-specific metadata, declaration order, and the reduced offline configuration.
- **Verification:** `npm run check:assets` passed for 13 pages, `npm run check:links` passed (11 external links skipped), and `npm run build:dist` completed successfully. Baseline comparisons confirmed byte-identical rendered HTML, production HTML, and `dist/sw.js`, with no unresolved directives. Accessibility, functional browser tests, and Lighthouse were not run.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-02 — Consolidate same-page scroll-to-top orchestration

- **Status:** COMPLETED — implemented and verified.
- **Result:** `initSmoothTop` in `ui-core.js` is the sole owner of same-page top-link scrolling, focus, and an explicit URL policy (home: fragment cleared via `replaceState`, query kept; other pages: `#top` pushed). The duplicate handler in `home.js` and ScrollSpy's `#top` click path were removed; service prefill, drawer closure, and active states remain with their modules.
- **Verification:** New `nav-top-link-same-page-and-cross-page` Playwright scenario and both existing navigation scenarios passed; the scenario failed against the pre-change baseline, which pushed a redundant history entry. A no-reduced-motion probe at 390 px and 1280 px matched the baseline URL, active state, and drawer state; Prettier and `node --check` passed. Run with locally cached Playwright 1.60 and Chromium, as project dependencies are not installed; the full `qa:functional` suite was not run.
- **Impact:** Medium
- **Effort:** Medium

### IMP-TECH-03 — Centralize header height publication and cache updates

- **Status:** COMPLETED — implemented and verified.
- **Result:** `utils.syncHeaderCssVar()` now accepts an optional measured height and publishes it to `--header-h`, the cache, and the cached viewport width; the no-argument path keeps the 74 px fallback. `initHeaderShrink` measures the header and publishes through this single call before dispatching an unchanged `header:sync`.
- **Verification:** `node --check` passed for both modules. A browser check on the dev server confirmed matching live height, `--header-h`, `getHeaderH()`, and `header:sync` payloads at top (80 px), shrunk (67 px), expanded, and 375 px viewport (75 px) states, with unchanged utility exports and no console errors; Prettier was not run because dependencies are not installed in the worktree.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-04 — Share source-page discovery between build and sitemap

- **Affected area:** Canonical HTML input discovery for generated production documents.
- **Evidence:** `scripts/build-dist.js:11-19`; `scripts/build-dist.js:63-86`; `scripts/build-dist.js:123-130`; `scripts/generate-sitemap.mjs:11-59`; `scripts/generate-sitemap.mjs:94-97`.
- **Current implementation:** Production staging and sitemap generation independently traverse source HTML and maintain overlapping top-level directory exclusions. Sitemap discovery additionally excludes `build/` and the three non-indexable status pages. Both generators discover their inputs from source rather than from a shared discovery function.
- **Proposed improvement:** Extract the common source-HTML traversal and shared exclusions into one utility, retaining explicit consumer-specific filtering.
- **Expected engineering value:** Changes to common source-discovery rules have one owner, while the distinction between deployable documents and indexable pages remains visible.
- **Implementation scope:** Add one utility under `scripts/utils/` and adapt only the two generators. Preserve their current path normalization, sorting, top-level exclusion semantics, and sitemap-only exclusions. Leave QA collectors, npm commands, CI, rendering, asset copying, and Service Worker generation unchanged.
- **Acceptance criteria:** Both generators use the shared discovery implementation. The current tree still yields 13 deployable HTML documents and 10 sitemap URLs, with `/` representing `index.html`; sitemap status-page and `build/` exclusions remain explicit. Generated HTML, sitemap URL ordering, and public paths match the pre-change baseline.
- **Impact:** Medium
- **Effort:** Small

## Selection summary

Four proposals met the evidence and scope criteria. Additional candidates did not justify expanding into broader rewrites or UI, Quality, or Workflow work. The selected changes address concrete ownership and duplication in current implementation and can be considered independently; IMP-TECH-02 and IMP-TECH-03 share `nav.js` but have no implementation dependency. Together they form a bounded backlog for focused development, without a completion-time guarantee.

## Analysis limitations

Inspection covered canonical HTML/partials, runtime modules, CSS structure, build configuration, source discovery, Service Worker generation, and relevant documentation and QA consumers. `npm run check:assets` passed for 13 rendered HTML documents. No production build, browser suite, deployment check, or performance measurement was run; runtime equivalence and generated-output acceptance criteria remain to be verified during authorized implementation. Historical audit results were treated as context, not checks performed in this review.

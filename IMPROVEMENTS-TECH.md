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

- **Affected area:** UI navigation, home helpers, and ScrollSpy click handling.
- **Evidence:** `js/modules/ui-core.js:18-101`; `js/modules/home.js:26-100`; `js/modules/nav.js:265-268`; `js/modules/nav.js:412-442`; `js/script.js:50-71`; `partials/header.html:37`.
- **Current implementation:** UI core and home helpers both register delegated top-link listeners and repeat focus-target selection and scrolling logic. ScrollSpy separately handles the home navigation's `#top` link through its section mapping. Home helpers subsequently remove the fragment while retaining the query string.
- **Proposed improvement:** Give same-page top-link activation one orchestration path for scrolling, focus, and URL handling, with the existing home-page URL policy made explicit.
- **Expected engineering value:** Changes to one interaction no longer require tracing overlapping handlers and their `defaultPrevented` and registration-order relationships across three modules.
- **Implementation scope:** Limit changes to the top-link paths in `ui-core.js`, `home.js`, and `nav.js`, plus entry-point wiring if needed. Keep service prefill in home helpers and retain ScrollSpy's active-state and drawer responsibilities. Preserve the exposed `window.SC` initializer interface.
- **Acceptance criteria:** A same-page top activation performs one coordinated scroll/focus/URL action. Home links retain query parameters and clear the fragment; subpage top links retain their existing URL behavior, and cross-page home links still navigate normally. Keyboard activation, reduced-motion behavior, focus placement, drawer closure, and active navigation states match the pre-change baseline.
- **Impact:** Medium
- **Effort:** Medium

### IMP-TECH-03 — Centralize header height publication and cache updates

- **Affected area:** Header geometry utilities and header-shrink integration.
- **Evidence:** `js/modules/utils.js:5-58`; `js/modules/nav.js:279-284`; `js/modules/nav.js:462-542`; `js/script.js:43-44`; `css/modules/base.css:1-20`.
- **Current implementation:** Utilities own cached header-height reads, fallback resolution, a CSS-variable synchronization method, and resize invalidation. Header shrink separately measures the header, writes `--header-h`, refreshes the utility cache, and dispatches `header:sync`. Startup and live updates therefore publish related state through separate code paths.
- **Proposed improvement:** Make the existing utility module the owner of publishing header height to both the CSS variable and its cache; let header shrink retain control of when live measurements occur.
- **Expected engineering value:** The relationship between the published height and cached value becomes explicit in one module, reducing coordination when header sizing changes.
- **Implementation scope:** Adjust `utils.js` and the publication call in `initHeaderShrink`, retaining startup fallback semantics, observer/event scheduling, shrink thresholds, existing utility methods, and `header:sync`. Do not introduce another observer service or change CSS offsets.
- **Acceptance criteria:** Runtime writes to `--header-h` and corresponding cache updates pass through the utility API. Initial fallback, live shrink/expand measurements, resize and font-load updates, and event payloads retain their current behavior; ScrollSpy and CSS consumers receive the same heights as before.
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

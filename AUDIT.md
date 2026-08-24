# SolidCraft — Final Technical Front-End Audit

**Audit date:** 2026-08-24  
**Project type:** Static multi-page demonstrational construction-services website (HTML, CSS, JavaScript, PostCSS; Netlify build contract)  
**Audit mode:** Final repository and implementation review  
**Current readiness:** Needs Important Fixes

## 1. Executive assessment

SolidCraft has a coherent source-first architecture, a deterministic documented deployment pipeline, useful repository-specific validation, and browser-tested navigation, lightbox, and form behavior. The current Chromium regression suites passed, and representative enabled-JavaScript pages produced no runtime errors or horizontal overflow.

The repository is not ready for final release or portfolio handoff without important corrections. The principal risks are a confirmed no-JavaScript content-visibility failure, incomplete disclosure of the fictional/demo identity on indexed direct-entry routes, privacy and cookie text that does not match the implemented form and storage behavior, and a development/CI dependency graph with current critical and high advisories. The production build, deployed Netlify behavior, and production Service Worker were not exercised because the task allowed modifications only to this file.

## 2. Audit scope and verification

### Areas inspected

- All 13 maintained HTML documents, the shared header/footer partials, metadata, JSON-LD, forms, recovery pages, legal pages, and demonstrational-content disclosures.
- CSS entry point, all CSS modules, design tokens, responsive breakpoints, reveal behavior, theme states, focus styles, reduced-motion handling, and no-JavaScript rules.
- JavaScript entry points and all runtime modules: navigation, UI core, form validation/submission, lightbox, map consent, project notice, prefetch, icons, and home helpers.
- Build, image, partial-rendering, link/asset, sitemap, Service Worker, accessibility, and functional QA scripts.
- Netlify build/routing/header configuration, manifest, robots policy, Lighthouse configuration, CI workflow, package metadata, lockfile, and repository hygiene rules.
- Generated-image inventory, local fonts, project licensing, third-party attribution, and source-visible secret patterns.

### Verification performed

- `git status --short` — executed before the audit write; the worktree was clean.
- `npm run check:html` — passed for 13 HTML files; internal links, anchors, and local asset references passed. Sixty-three external-link checks were skipped by the script after network `TypeError` failures.
- `npm run format:check` — passed; all matched files used the configured Prettier style.
- `node --check` over all repository `.js` and `.mjs` source files — passed.
- `npm run qa:a11y` — passed in headless Chromium after the sandboxed launch was retried with browser execution permission: 12 pages scanned, zero serious or critical axe violations.
- `npm run qa:functional` — passed in headless Chromium: 9 of 9 navigation, submenu, lightbox, and contact-form scenarios.
- Additional Playwright review against the repository's partial-rendering static server — `/`, `/oferta/remonty.html`, `/doc/polityka-prywatnosci.html`, and `/404.html` produced no page/console errors and no horizontal overflow at 390×844 or 1440×1000.
- JavaScript-disabled Chromium review — confirmed 51 of 51 reveal elements hidden on `/`, 29 of 29 on `/oferta/remonty.html`, and 5 of 5 on `/doc/polityka-prywatnosci.html`.
- `npm audit --json` — completed against the current registry data and lockfile: 37 advisories (1 critical, 24 high, 9 moderate, 3 low), all in the development/tooling dependency graph.
- Targeted repository searches — no credential, private-key, API-key, or environment-secret value was detected.
- Image inventory comparison against `GALLERY_SIZES` — detected 12 generated gallery files outside the current naming/size contract, totaling 1,695,342 bytes.
- WOFF2 metadata inspection — all 12 local font files contain an upstream copyright record and OFL URL, but no embedded full license text was found.

### Verification limitations

- `npm run build:dist`, `npm run qa:lhci`, image generation, and other writing commands were not executed because they create or replace generated files, while this audit was permitted to modify only `AUDIT.md`.
- No live URL was supplied. Deployment status, Netlify headers/redirects, real Netlify Forms processing, production form retention, and the public canonical origin were not verified.
- The valid and failed form browser scenarios use the local functional harness; they do not prove a real submission to Netlify.
- Production Service Worker generation, installation, update, cache persistence, offline navigation, and installability were not exercised in a built deployment artifact.
- Browser execution was Chromium-only. Firefox, WebKit, physical devices, real assistive technologies, and formal screen-reader behavior were not tested.
- Lighthouse, field performance, bandwidth-sensitive loading, and production cache/compression behavior were not measured.
- The 63 external URLs reported by `check:links` were not verified because outbound checks failed in the execution environment.
- This review is not a legal-compliance assessment, accessibility certification, penetration test, or guarantee of production behavior.

## 3. Verified strengths

- Shared layout ownership is explicit and enforced: `partials/header.html` and `partials/footer.html` are rendered by one reusable parser that rejects missing partials, unknown variables, escaping includes, cycles, malformed layouts, and surviving directives.
- CSS and JavaScript have clear canonical sources. PostCSS composes focused CSS modules, while ES modules expose conditional initializers and use abortable listener lifecycles for reinitialization-sensitive behavior.
- The contact form preserves native constraints and Netlify attributes while providing linked field errors, `aria-invalid`, a live status region, anti-spam handling, timeout control, and retry-safe failure behavior. All four functional form scenarios passed.
- Responsive navigation and the service-gallery lightbox have keyboard-aware state synchronization and focus restoration. All five navigation/lightbox browser scenarios passed.
- The axe gate scans every primary/service/legal/recovery document variant in its configured scope and reported no serious or critical violations on 12 pages.
- Images use local AVIF/WebP/JPG variants with explicit dimensions, `srcset`, lazy loading outside the hero, and an eager high-priority hero path. Fonts are local `woff2` subsets with `font-display: swap`.
- The deployment contract has a single documented `dist/` producer, generated sitemap ownership, a derived Service Worker precache manifest and version fingerprint, root-scoped Netlify routing, and restrictive security headers.
- Service Worker runtime caching is same-origin and GET-only, rejects non-OK responses for persistence, clones network responses before cache writes, and limits cache deletion to keys owned by the `solidcraft-v` namespace.
- CI uses a lockfile-backed install, a read-only token, a bounded timeout, one named quality gate, and separate build, accessibility, and functional steps.
- The repository contains no runtime production dependency bundle, and the targeted source scan did not detect exposed credentials or private keys.

## 4. P0 — Critical risks

None detected.

## 5. P1 — Important issues worth fixing next

### [P1-01] Reveal styling removes core content when JavaScript is unavailable

- **Status:** Resolved
- **Classification:** Defect
- **Affected area:** Progressive enhancement, content visibility, runtime resilience
- **Evidence:** `css/modules/utilities.css:31-43`; `js/theme-init.js:1-4`; `index.html:2`
- **Current behavior:** The base `[data-reveal]` rule sets every reveal element to `opacity: 0`, and visibility returns only after JavaScript adds `.is-revealed`. There is no `.no-js` visibility fallback. JavaScript-disabled Chromium confirmed that all 51 reveal elements on the home page, all 29 on the representative service page, and all 5 on the privacy page remain visually hidden.
- **Impact:** A script-disabled user, or a user affected by a module-loading failure, loses large parts of the service content, legal-page navigation/footer, and contact interface even though the project is otherwise a static multi-page site with explicit `.no-js` behavior.
- **Recommended direction:** Make visible content the baseline and scope the hidden pre-reveal state to an established JavaScript-enhanced state, while retaining the existing reduced-motion behavior and reveal animation.
- **Verification criteria:** With JavaScript disabled, every maintained route renders all content and controls visibly; with JavaScript enabled, reveal animations still complete and no element remains hidden after it enters the viewport.

### [P1-02] Indexed direct-entry routes do not reliably disclose the fictional project identity

- **Classification:** Content integrity risk
- **Affected area:** Public content, service routes, demonstrational positioning
- **Evidence:** `index.html:1316-1360`; `oferta/remonty.html:10-19`; `partials/footer.html:29-32`; `partials/footer.html:92-103`
- **Current behavior:** The explicit project notice exists only on `index.html`, starts with `hidden`, and depends on JavaScript. The indexable service pages contain no equivalent notice. Their shared footer instead states that SolidCraft is a real renovation company, guarantees delivery, and publishes a sample address, NIP, and REGON without identifying those values as fictional in the same context.
- **Impact:** Visitors who enter through an indexed service route, or who browse with JavaScript unavailable, can reasonably interpret the fictional business identity, service promises, contact paths, and identifiers as belonging to an operating construction company.
- **Recommended direction:** Provide a persistent, non-JavaScript-dependent demonstrational disclosure through a shared source on every public entry route, and label or remove fictional business identifiers and real-company promises where they appear.
- **Verification criteria:** Every indexable route, including direct service-page entry and the JavaScript-disabled home page, visibly identifies SolidCraft as a fictional demonstrational project alongside or before actionable business claims and contact details.

### [P1-03] Privacy and cookie disclosures do not match the implemented data contract

- **Classification:** Content integrity risk
- **Affected area:** Contact form, privacy disclosure, browser storage, third-party processing
- **Evidence:** `index.html:1174-1283`; `doc/polityka-prywatnosci.html:273-297`; `doc/polityka-prywatnosci.html:460-493`; `doc/cookies.html:279-318`
- **Current behavior:** The active Netlify form collects a name, phone number, work description, and consent. The privacy policy lists an email address instead of the collected phone number and describes cookie identifiers and analytics cookies. The cookie policy describes `sessionStorage`, technical/functional/analytics cookies, and analytics providers, while the inspected frontend uses only three guarded `localStorage` keys (`theme`, `consent.maps`, and `project-banner-accepted`) and loads Google Maps only after a user action. No analytics implementation or `sessionStorage` use was detected.
- **Impact:** Users are not given an accurate repository-backed description of the personal data submitted by the live form or the browser-side storage and third-party mechanisms currently implemented. The documents can also mislead maintainers reviewing future form or consent changes.
- **Recommended direction:** Rewrite the technical facts in both documents around the exact current form fields, Netlify processing path, storage keys, map-consent behavior, and evidenced third parties; remove unsupported generic capabilities unless they are actually implemented.
- **Verification criteria:** A source-to-document comparison finds every collected field, storage key, and third-party request accurately described, with no references to unimplemented analytics, cookies, or `sessionStorage`.

### [P1-04] The locked development and CI toolchain has critical and high advisories

- **Classification:** Security exposure
- **Affected area:** Dependency graph, local development, build tooling, CI
- **Evidence:** `package.json:27-48`; `package-lock.json:2355-2380`; `package-lock.json:6476-6495`; `package-lock.json:7523-7546`; `package-lock.json:9937-9965`; `package-lock.json:11115-11128`
- **Current behavior:** `npm audit --json` reports 37 vulnerabilities: 1 critical, 24 high, 9 moderate, and 3 low. Directly declared affected tools include `@lhci/cli`, `live-server`, `postcss`, `sharp`, and `esbuild`; the critical `websocket-driver@0.7.4` path is brought in through `live-server`. These are development dependencies and are not shipped as a browser runtime bundle.
- **Impact:** Local development, image processing, CSS/build work, Lighthouse execution, and CI operate on a lockfile with known vulnerable tooling. The absence of production dependencies limits public-browser exposure but does not remove risk to developer and automation environments.
- **Recommended direction:** Re-resolve the current graph using the smallest compatible, evidence-backed direct upgrades or tool replacement where an abandoned dependency prevents remediation; avoid forced broad changes and re-run every affected build and QA contract.
- **Verification criteria:** A fresh lockfile-backed install reports no critical or high advisories in tools the repository executes, and `build:dist`, HTML checks, axe, functional QA, image processing, and Lighthouse still satisfy their existing contracts.

## 6. P2 — Minor refinements

### [P2-01] Service Worker lifecycle promises are not fully bound to lifecycle events

- **Classification:** Source-visible risk
- **Affected area:** Service Worker installation, activation, first-control behavior
- **Evidence:** `sw.js:61-88`
- **Current behavior:** The production worker awaits precache and cache cleanup through `event.waitUntil()`, but calls `self.skipWaiting()` and `self.clients.claim()` without including their returned promises in the corresponding lifecycle promises.
- **Impact:** The browser is not explicitly required to keep the install/activate event alive for those operations. Under lifecycle termination or timing pressure, an updated worker may not activate or claim existing clients as deterministically as the documented immediate-update behavior implies.
- **Recommended direction:** Make each install/activate lifecycle promise cover both its cache work and the related worker/client transition, preserving the existing cache namespace and generated-manifest architecture.
- **Verification criteria:** An automated Service Worker update test proves successful installation, activation, old-cache cleanup, and control of an already-open client before the lifecycle event is considered complete.

### [P2-02] The 404 document defines two competing page titles

- **Classification:** Defect
- **Affected area:** HTML validity, browser title, utility-page metadata
- **Evidence:** `404.html:10-11`
- **Current behavior:** The 404 page contains two consecutive `<title>` elements. Chromium selects the first (`SolidCraft — 404`), leaving the more descriptive second title unused.
- **Impact:** Browser and crawler title selection is ambiguous, and the document violates the single-title head contract used by the other maintained pages.
- **Recommended direction:** Retain one intentional title consistent with the 404 page's visible purpose and social metadata.
- **Verification criteria:** The rendered 404 document contains exactly one `<title>` element and exposes that value as `document.title`.

### [P2-03] Obsolete generated gallery variants are copied into every deployment artifact

- **Classification:** Maintenance risk
- **Affected area:** Image pipeline, repository size, deployment artifact hygiene
- **Evidence:** `scripts/images.js:28-33`; `scripts/images.js:174-197`; `scripts/build-dist.js:142-150`; `assets/img/gallery/paint-04-430x360.avif`; `assets/img/gallery/reno-01-1563x1152.jpg`; `assets/img/gallery/reno-05-480x360-.webp`; `assets/img/gallery/reno-06-768-576.jpg`
- **Current behavior:** Twelve tracked gallery files do not match the five configured gallery dimensions/naming forms. They total 1,695,342 bytes and are not referenced by maintained HTML. `images:clean` removes only currently expected names, so these obsolete variants survive cleanup; `build-dist.js` copies the entire generated image tree into `dist/`.
- **Impact:** Each source checkout and deployment artifact carries unused binary data, and the current clean/build workflow cannot converge the generated directory to the configured output set after naming changes.
- **Recommended direction:** Reconcile the generated tree with the canonical source/configuration and make the image pipeline remove or fail on obsolete outputs within its owned directories.
- **Verification criteria:** A clean image build produces only configured variants, a reference/inventory check reports no orphan outputs, and the deployment artifact excludes the twelve obsolete files.

### [P2-04] The font package lacks a self-contained human-readable licensing record

- **Classification:** Maintenance risk
- **Affected area:** Third-party licensing, font provenance, release/handoff
- **Evidence:** `assets/fonts/`; `README.md:256-259`; `README.md:514-517`; `LICENSE:176-204`; [Montserrat upstream license](https://github.com/google/fonts/blob/main/ofl/montserrat/OFL.txt); [Poppins upstream license](https://github.com/google/fonts/blob/main/ofl/poppins/OFL.txt)
- **Current behavior:** The repository distributes twelve Montserrat and Poppins `woff2` files and states that no separate font license files are present. Direct metadata inspection found an upstream copyright record and OFL URL in every binary, so an absent-notice violation is not established. However, no binary contained a full license text, and the repository has no human-readable OFL copy or provenance/version map; reviewers must leave the release package to determine the applicable terms.
- **Impact:** License review, artifact handoff, and future font replacement are needlessly fragile even though the binaries retain basic attribution metadata. The proprietary project license correctly excludes third-party materials but does not identify the exact font terms within the repository.
- **Recommended direction:** Record the exact upstream family/version provenance and include the corresponding human-readable OFL text or an equivalent reviewed third-party-notices file, without placing the fonts under the proprietary project license.
- **Verification criteria:** The repository and deployment artifact expose a correct, human-readable licensing record that maps both families to their distributed files and agrees with the embedded metadata.

## 7. Extra quality improvements

None detected.

## 8. Current readiness conclusion

**Status:** Needs Important Fixes

The source architecture and tested JavaScript interactions are strong enough to support focused remediation rather than redesign. Final release, public portfolio presentation, or handoff should wait until the no-JavaScript content failure, demonstrational identity, data disclosures, and vulnerable tooling graph are corrected. After those changes, the production build, Lighthouse, Service Worker/offline behavior, and deployment-specific contracts still require fresh verification within an allowed generated-output scope.

## 9. Senior rating

**Rating:** 7/10

The project earns a strong baseline for source ownership, modularity, deterministic tooling design, accessible interaction patterns, responsive media, and passing repository-specific browser checks. The rating is held below release-ready territory by four important current risks spanning progressive enhancement, public content integrity, privacy facts, and dependency security, plus four contained repository/runtime refinements and unverified production-build/deployment behavior.

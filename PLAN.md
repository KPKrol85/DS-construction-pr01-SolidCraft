# SolidCraft — Development Plan

- **Last reviewed:** 2026-11-25
- **Project type:** Polish-language, static multi-page portfolio demo for construction and renovation services
- **Plan status:** Active

## Planning principles

- Check off an item once its completion condition and required subtasks have been verified. Use [AGENTS.md](AGENTS.md) for plan and changelog maintenance.
- Maintain pages and shared markup in the HTML sources and `partials/`, styles in `css/`, and browser behavior in `js/` and the root `sw.js`. The npm build owns `dist/`, including the production bundles, sitemap, and Service Worker with its generated precache metadata. See the [tooling settings](docs/settings.md).
- Active work uses new identifiers following the previous plan's sequence. The final verification phase carries forward relevant items from the previous plan in Git (`39ca12c`).

## Current priorities

1. `PH14-02` — Refine the image pipeline and refresh PWA screenshots (complete).
2. `PH14-03` — Refresh Open Graph artwork (complete).
3. `PH9-02` — Revalidate the final candidate after both visual QA fixes are integrated into `main` (pending).
4. `PH9-03` — Complete final visual QA after `PH9-02` (open).
5. `PH14-01` — Verify the Netlify-hosted candidate.

## Phase 11 — Public contact and script fallback

**Goal:** Preserve usable navigation and form behavior during partial script failures and make the demo's contact purpose clear.

- [x] **PH11-01 — Keep navigation and content usable when the main script fails**

  - [x] Kept first-paint theme selection independent and enabled navigation, theme controls, and reveal effects after their respective handlers initialized.
  - [x] Verified keyboard navigation and content visibility on home, service, and legal routes at 390 px with the main script blocked and the theme script loaded.
  - **Completion condition:** Both fallback and enhanced navigation work, including keyboard access, and reveal still respects reduced motion. [Audit P1-01](AUDIT.md#p1-01-a-main-script-failure-disables-the-mobile-menu-and-hides-page-content).

- [x] **PH11-02 — Restore native contact form validation**

  - [x] Restored native validation until enhanced submit registration, preserving accessible field errors and the Netlify form contract.
  - [x] Verified that empty required fields or unchecked consent block POST and that valid submissions reach the form action with JavaScript disabled or the main script blocked.
  - **Verification:** All 16 contact-form scenarios passed in Chromium, including enhanced validation and submission. [Audit P1-02](AUDIT.md#p1-02-the-native-contact-form-can-submit-without-required-fields-or-consent).

- [x] **PH11-03 — Describe the contact journey as a demonstration**

  - [x] Identified the fictional SolidCraft brand and the real contact recipient, KP_Code Digital Studio, in the footer, form, consent, and both confirmations.
  - [x] Aligned the home and service CTAs, metadata, and visible and structured FAQ content with the demonstration scope. Preserved the hero composition and service preselection.
  - **Verification:** Passed 40 functional scenarios and 28 axe scans in Chromium. Verified direct contact entry with and without JavaScript, local submissions, FAQ parity, and responsive layout in both themes. [Audit P1-03](AUDIT.md#p1-03-the-demo-contact-journey-promises-an-actual-quotation-and-follow-up), [design decisions](docs/archive/improvements/IMPROVEMENTS-DESIGN-2026-11-15.md#owner-decisions-and-open-items).

- [x] **PH11-04 — Match public disclosures to form and map behavior**

  - [x] Documented every submitted form field, including the optional service, and aligned the contact purpose with `PH11-03`.
  - [x] Documented first activation, automatic iframe creation with saved consent, and reactivation after clearing consent and reloading.
  - **Verification:** Matched the disclosures to the form markup, serialization, and map module. The focused Chromium scenario passed with off-origin requests intercepted. [Audit P2-06](AUDIT.md#p2-06-public-data-disclosures-miss-two-implemented-behaviors).

## Phase 12 — Navigation, accessibility, and document rendering

**Goal:** Keep galleries and page content usable after history restoration and correct two contained readability defects.

- [x] **PH12-01 — Keep gallery and reveal behavior working after history restoration**

  - [x] Preserved gallery listeners and reveal observation on persisted `pagehide` events and retained cleanup on ordinary navigation.
  - **Depends on:** `PH11-01` for the scroll-reveal initialization contract.
  - **Verification:** Confirmed two Chromium history returns with `pageshow.persisted === true`. After each return, a previously hidden group revealed on scroll, and the gallery opened and advanced one image per arrow press. [Audit P2-02](AUDIT.md#p2-02-history-restoration-can-leave-the-gallery-and-reveal-handlers-inactive).

- [x] **PH12-02 — Improve the focused skip link's text contrast**

  - **Verification:** Chromium measured 8.72:1 in both light and dark themes, including system theme selection. Tab revealed the link above the header, Enter reached `#main`, and the next Tab continued within the main content. [Design review](docs/archive/improvements/IMPROVEMENTS-DESIGN-2026-11-15.md#owner-decisions-and-open-items).

- [x] **PH12-03 — Restore the legal documents' print typography**

  - **Verification:** Chromium print emulation measured 16 px body, paragraph, and list text at a 27.2 px line height (1.7) and 18.6667 px second-level headings on all three legal pages. The header, footer, and navigation were excluded from print. Screen typography and layout matched the baseline at 390 px and 1440 px in light, dark, and system modes. [Audit P2-07](AUDIT.md#p2-07-screen-typography-overrides-the-legal-page-print-rules).

## Phase 13 — Regression checks and production delivery

**Goal:** Make the contact timing test deterministic and correct the routing, manifest, and cache behavior used by the production build.

- [x] **PH13-01 — Make the early-submit regression independent of runner speed**

  - **Verification:** All early-submit assertions passed in Chromium after a measured 2,403.8 ms delay following form initialization, with `Date.now()` fixed throughout the delay. The valid-submission scenario passed in the next browser context. [Audit P2-03](AUDIT.md#p2-03-the-early-submit-regression-case-depends-on-test-runner-speed).

- [x] **PH13-02 — Refresh changed portfolio images at stable URLs**

  - [x] Applied network-first HTTP revalidation to runtime images and kept the cached-image fallback for transport failures.
  - [x] Added browser regression coverage and documented the cache policy in `docs/settings.md` and `README.md`.
  - **Verification:** The original worker served image A without an origin request. The corrected worker revalidated the fresh HTTP cache entry, served and stored image B at the same URL and cache version, and served B after a 404 and subsequent transport failure. All 11 Service Worker scenarios passed. The production build generated the corrected worker and a verified 40-URL precache manifest. [Audit P2-01](AUDIT.md#p2-01-runtime-cached-images-can-stay-stale-after-an-image-only-release).

- [x] **PH13-03 — Add the canonical redirects for the renovations page**

  - **Verification:** Confirmed 12 unique 301 rules covering both extensionless aliases for each of the six services, six existing HTML destinations, and the unchanged final 404 rule. Both renovations aliases match the canonical path in `oferta/remonty.html`. `git diff --check` passed. Hosted HTTP responses remain scheduled for `PH14-01`. [Audit P2-04](AUDIT.md#p2-04-the-renovations-page-lacks-the-service-route-alias-pair).

- [x] **PH13-04 — Align PWA shortcut dimensions with the icon files**

  - **Verification:** Sharp confirmed 64 × 64 pixels for each PNG, matching its filename and manifest declaration. All three files matched their original bytes. JSON, active reference, and formatting checks passed. Hosted installation and shortcut checks remain scheduled for `PH14-01`. [Audit P2-05](AUDIT.md#p2-05-three-pwa-shortcut-icons-declare-the-wrong-dimensions).

## Phase 14 — Final verification

**Goal:** Verify the corrected candidate in the production build and confirm behavior that requires the Netlify environment.

- [x] **PH14-02 — Refine the image pipeline and refresh PWA screenshots**

  - Inspected both new PNGs visually and verified their dimensions, lossless outputs, and manifest references. Confirmed a clean scoped dry run, byte identity of the existing OG PNGs, and the final production build with its generated Service Worker.

- [x] **PH14-03 — Refresh Open Graph artwork**

  - Verified decoded pixel equality with both masters, byte-identical copies in `dist/`, and HTTP 200 responses with `image/png`. Checked Open Graph, Twitter Card, and JSON-LD image references on all 11 consuming pages and confirmed zero pending writes or obsolete outputs in the scoped dry run.

- [ ] **PH9-02 — Confirm the pre-deploy gate passes against the corrected implementation**

  - Rerun the production build, pre-deploy gate, functional regression suite, and Service Worker suite after both `PH9-03` fixes are integrated into `main`.

  **Historical verification — 2026-11-26**

  - Verified locally on 2026-11-26 at `c36ef337d9a60ff5b7082b880f9d360faccc9583` using Windows 11 26H2 x64 (build 26300.10075), Node.js 22.23.5, npm 10.9.9, Playwright 1.58.2, and Chromium 145.0.7632.6. Reused lockfile-matched dependencies and existing Chromium binaries. The worktree was clean before and after verification.
  - `npm run build:dist` passed (exit 0) with 710 files, 13 fully rendered pages, three non-empty bundles referenced by every page, and 10 unique indexable canonical URLs in the sitemap. Verified both Open Graph PNGs (1200 × 630 and 1200 × 1200), Open Graph, Twitter, and JSON-LD image references on 11 pages, manifest screenshot PNGs (1280 × 720 wide and 720 × 1280 narrow), and three 64 × 64 shortcut PNGs. The artifact preserved 12 service 301 redirects, the final 404 rule, and byte-identical `_headers`. Obsolete image variants, image masters, and development tooling were absent.
  - Independently reproduced `solidcraft-v85614b4fc75b3de7` from the 40 unique, sorted application-shell URLs and their file digests. The worker matched the canonical runtime outside the generated block. Open Graph images and screenshots were outside the precache.
  - `npm run check:predeploy` passed (exit 0) with link and asset checks on 13 HTML pages and 28 axe scans with zero serious or critical violations. `npm run qa:functional` passed all 41 scenarios, and `npm run qa:sw` passed all 11 scenarios against the canonical worker and fixture manifests (both exit 0).
  - Browserslist reported 13-month-old `caniuse-lite` data. The link checker skipped 63 link occurrences across six distinct external `href` values after `fetch` raised `TypeError`. Manual visual QA and hosted Netlify verification were pending under `PH9-03` and `PH14-01`.

  **Historical verification — 2026-11-25**

  - Verified locally on 2026-11-25 at `f48c95dcacb93662cd99ba7e60cf42511110be92` using Windows 11 26H2 x64 (build 26300.10075), Node.js 22.23.5, npm 10.9.9, Playwright 1.58.2, and Chromium 145.0.7632.6. Reused lockfile-matched dependencies and Chromium. The worktree was clean before and after verification. CI uses Ubuntu 24.04 and Node.js 24. [CI workflow](.github/workflows/ci.yml).
  - `npm run build:dist` passed once (exit 0). The 718-file output contained 13 fully rendered pages, three non-empty minified bundles referenced by every page, and 10 unique indexable canonical URLs in the sitemap. Verified 40 precache URLs, independently reproduced `solidcraft-vd1164cb1b93b94fc`, and matched the worker runtime to the source outside the generated block. Confirmed three 64 × 64 shortcut PNGs with no obsolete copies, 12 service aliases and the final 404 rule, byte-identical `_headers`, and the exclusion of source imagery and development tooling.
  - `npm run check:predeploy` passed (exit 0) with link and asset checks on 13 pages and 28 axe scans with zero serious or critical violations. `npm run qa:functional` passed 41 scenarios and `npm run qa:sw` passed 11 scenarios (both exit 0).
  - Browserslist warned about stale data. The link checker skipped 63 external link occurrences after fetch errors. This record covers local verification. GitHub Actions execution and hosted Netlify checks are outside this result.

- [ ] **PH9-03 — Manual final visual QA pass**

  - Resolved the 320 px header clipping. Chromium 145.0.7632.6 verified the full menu icon and focus outline, pointer and keyboard operation in both header states, and fallback links on all four affected production routes in both themes. Header geometry and navigation passed checks at 390, 768, 1023, 1024, and 1440 px.
  - Resolved the legal print navigation overlay. Review of all six Chromium A4 PDFs confirmed that the legal text, typography, and links were preserved and that neither screen-only control appeared. Keyboard navigation passed on all three routes in both themes.
  - After `PH9-02`, inspect the final production build at representative mobile, tablet, and desktop widths in both themes, including the contact and confirmation states, galleries, and legal print layouts.
  - **Completion condition:** The corrected pages and interaction states have been checked visually and any regression introduced by this cycle has been resolved. [Audit verification scope](AUDIT.md#2-audit-scope-and-verification).

- [ ] **PH14-01 — Verify the Netlify-hosted candidate**
  - [ ] On an authorized Netlify deployment of the corrected revision, verify HTTP 301 responses and `Location` headers for both alias variants of all six services, unknown-route HTTP 404, and configured response headers.
  - [ ] Use synthetic data to confirm Netlify Forms receives both the native and enhanced submissions, including the optional service when selected, and presents the corresponding confirmation.
  - [ ] Confirm the consent-gated map loads under the hosted headers and the production Service Worker controls the site and serves the offline fallback. Check installation and shortcuts on a supported device.
  - **Depends on:** `PH9-02`, `PH9-03`, and access to the authorized hosted candidate and its form submissions.
  - **Completion condition:** The hosted routing, headers, form processing, consent-gated map, and PWA checks pass and are recorded against the candidate revision. [Audit readiness conclusion](AUDIT.md#8-current-readiness-conclusion), [Netlify configuration](netlify.toml).

## Verified foundation

These completed items from the earlier plan provide the baseline for the active work. Verification was recorded during the corresponding implementation or audit.

- [x] **PH1-03** — Make the deploy command produce the assets it publishes. [Workflow record](docs/archive/improvements/IMPROVEMENTS-WORKFLOW-2026-11-19.md).
- [x] **PH2-01** — Make the first-visit modal operable and reliably dismissible. [Quality record](docs/archive/improvements/IMPROVEMENTS-QUALITY-2026-11-11.md).
- [x] **PH4-02** — Stop discarding user input on the anti-spam timing branch. [Audit verification](AUDIT.md#verification-performed).
- [x] **PH5-02** — Complete the service-worker precache list and secure its runtime cache writes. [Audit verification](AUDIT.md#verification-performed).
- [x] **PH6-01** — Bind gallery activation to the anchor instead of the inner image. [Audit verification](AUDIT.md#3-verified-strengths).
- [x] **PH6-02** — Correct the lightbox's accessible structure. [Audit verification](AUDIT.md#3-verified-strengths).
- [x] **O-02** — Adopt `check:predeploy` as a gate in a CI workflow. [CI workflow](.github/workflows/ci.yml), [workflow record](docs/archive/improvements/IMPROVEMENTS-WORKFLOW-2026-11-19.md).
- [x] **O-03** — Derive the service-worker cache version and precache list during the build. [Service Worker generator](scripts/generate-sw.js), [changelog](docs/CHANGELOG.md#build-and-tooling).
- [x] **O-05** — Extend accessibility scanning beyond the four scanned pages. [Quality record](docs/archive/improvements/IMPROVEMENTS-QUALITY-2026-11-11.md), [audit verification](AUDIT.md#verification-performed).

## Optional future improvements

- [ ] **O-08 — Align CI environment documentation with the workflow**

  - Correct the runner named in `docs/settings.md` and the stale Node minimum in the workflow comment. Completion means both agree with `.github/workflows/ci.yml` and `package.json`. [Workflow observations](docs/archive/improvements/IMPROVEMENTS-WORKFLOW-2026-11-19.md#out-of-scope-observations).

- [ ] **O-09 — Recover the demo imagery provenance where evidence exists**
  - Correct the tooling guide's reference to the removed provenance record. If reliable records are available, restore `assets/img-src/PROVENANCE.md` as a new source-only record with the supported generation and usage details. Record missing evidence explicitly. [Design finding P-02](docs/archive/improvements/IMPROVEMENTS-DESIGN-2026-11-15.md#owner-decisions-and-open-items).

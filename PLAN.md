# SolidCraft — Development Plan

- **Last reviewed:** 2026-11-22
- **Project type:** Polish-language, static multi-page portfolio demo for construction and renovation services
- **Plan status:** Active

## Planning principles

- Check off an item once its completion condition and required subtasks have been verified. Use [AGENTS.md](AGENTS.md) for plan and changelog maintenance.
- Maintain pages and shared markup in the HTML sources and `partials/`, styles in `css/`, and browser behavior in `js/` and the root `sw.js`. The npm build owns `dist/`, including the production bundles, sitemap, and Service Worker with its generated precache metadata. See the [tooling settings](docs/settings.md).
- Active work uses new identifiers following the previous plan's sequence. The final verification phase carries forward relevant items from the previous plan in Git (`39ca12c`).

## Current priorities

1. `PH11-01` — Keep mobile navigation and page content available if the main script fails.
2. `PH11-02` — Enforce required fields and consent in the native form.
3. `PH11-03` — Make the contact journey consistent with the portfolio demo.

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

- [ ] **PH11-03 — Describe the contact journey as a demonstration**

  - [ ] Explain the demo purpose and the expected test input beside the form. Align the consent label, enhanced confirmation, and native confirmation in `thank-you.html` with that purpose.
  - [ ] Review the home and service-page entry points into the form. Keep the approved hero design and distinguish illustrative quote language from actual service commitments. Align visible copy, metadata, and FAQ structured data where they advertise a response time.
  - **Completion condition:** The contact purpose is clear on direct entry to `/#kontakt` and in both success states without relying on the first-visit notice. Any claim of follow-up or response time is supported by the operating workflow. [Audit P1-03](AUDIT.md#p1-03-the-demo-contact-journey-promises-an-actual-quotation-and-follow-up), [design decisions](docs/archive/improvements/IMPROVEMENTS-DESIGN-2026-11-15.md#owner-decisions-and-open-items).

- [ ] **PH11-04 — Match public disclosures to form and map behavior**
  - [ ] Update `polityka-prywatnosci.html` to include the optional service in the submitted data and use the agreed contact-purpose wording.
  - [ ] In the privacy and cookie notices, distinguish the first map activation from subsequent loads using stored consent. Compare the wording with fresh, saved, and cleared browser storage.
  - **Depends on:** `PH11-03` for the contact-purpose wording.
  - **Completion condition:** The disclosures describe the actual form payload and when the map iframe is created. [Audit P2-06](AUDIT.md#p2-06-public-data-disclosures-miss-two-implemented-behaviors).

## Phase 12 — Navigation, accessibility, and document rendering

**Goal:** Keep galleries and page content usable after history restoration and correct two contained readability defects.

- [ ] **PH12-01 — Keep gallery and reveal behavior working after history restoration**

  - [ ] Adjust the `pagehide` handling in `js/modules/lightbox.js` and `js/modules/ui-core.js` to preserve or restore listeners and observation for persisted pages without duplicate handlers.
  - **Depends on:** `PH11-01` for the scroll-reveal initialization contract.
  - **Completion condition:** After a real back/forward-cache restore confirmed by `pageshow.persisted`, a gallery trigger opens the dialog and a previously unrevealed group appears when scrolled into view. The audit reproduced the handler loss with a simulated transition. [Audit P2-02](AUDIT.md#p2-02-history-restoration-can-leave-the-gallery-and-reveal-handlers-inactive).

- [ ] **PH12-02 — Improve the focused skip link's text contrast**

  - Adjust the shared `.skip` styling in `css/modules/layout.css` using the theme tokens. The current white text on the shared amber background computes to 2.15:1.
  - **Completion condition:** Focused skip-link text measures at least 4.5:1 in light and dark themes, and keyboard activation still reaches the main content. [Design review](docs/archive/improvements/IMPROVEMENTS-DESIGN-2026-11-15.md#owner-decisions-and-open-items).

- [ ] **PH12-03 — Restore the legal documents' print typography**
  - Adjust the print cascade where `css/modules/utilities.css` and `css/modules/subpages.css` currently disagree.
  - **Completion condition:** Chromium print emulation shows 12 pt body text and 14 pt second-level headings on all three legal pages, with header and footer excluded and screen styles preserved. [Audit P2-07](AUDIT.md#p2-07-screen-typography-overrides-the-legal-page-print-rules).

## Phase 13 — Regression checks and production delivery

**Goal:** Make the contact timing test deterministic and correct the routing, manifest, and cache behavior used by the production build.

- [ ] **PH13-01 — Make the early-submit regression independent of runner speed**

  - Control the browser clock in the focused case in `scripts/functional/contact-form.mjs`. Keep the production two-second threshold.
  - **Completion condition:** The scenario passes even when setup takes more than two seconds of wall time and still checks zero POSTs, retained values and consent, and the expected retry message. [Audit P2-03](AUDIT.md#p2-03-the-early-submit-regression-case-depends-on-test-runner-speed).

- [ ] **PH13-02 — Refresh changed portfolio images at stable URLs**

  - [ ] Update the runtime image caching or asset versioning in the canonical worker or build sources. Keep an offline fallback for previously cached images.
  - [ ] Add focused coverage for an image-only replacement and document the resulting cache policy in `docs/settings.md`.
  - **Completion condition:** A returning visitor with the old image cached receives the replacement after an image-only update when online, and can still load a cached image offline. [Audit P2-01](AUDIT.md#p2-01-runtime-cached-images-can-stay-stale-after-an-image-only-release).

- [ ] **PH13-03 — Add the canonical redirects for the renovations page**

  - Add both extensionless aliases in `_redirects` alongside the other service routes.
  - **Completion condition:** The redirect table covers both alias forms for all six services and maps `/oferta/remonty` and `/oferta/remonty/` to `/oferta/remonty.html` with status 301. Verify the HTTP responses in `PH14-01`. [Audit P2-04](AUDIT.md#p2-04-the-renovations-page-lacks-the-service-route-alias-pair).

- [ ] **PH13-04 — Align PWA shortcut dimensions with the icon files**
  - Correct the entries in `manifest.webmanifest` or supply PNGs of the declared size.
  - **Completion condition:** The declared dimensions match the intrinsic PNG dimensions for Oferta, Dokumenty, and Kontakt. All three currently declare 96×96 and reference 64×64 assets. [Audit P2-05](AUDIT.md#p2-05-three-pwa-shortcut-icons-declare-the-wrong-dimensions).

## Phase 14 — Final verification

**Goal:** Verify the corrected candidate in the production build and confirm behavior that requires the Netlify environment.

- [ ] **PH9-02 — Confirm the pre-deploy gate passes against the corrected implementation**

  - After Phases 11–13, run the existing CI steps against the corrected candidate. Check the generated pages, minified entry points, sitemap, and Service Worker from one `npm run build:dist` run.
  - **Completion condition:** The build, `npm run check:predeploy`, `npm run qa:functional`, and `npm run qa:sw` pass for the same revision. [CI workflow](.github/workflows/ci.yml).

- [ ] **PH9-03 — Manual final visual QA pass**

  - After Phases 11–13, inspect the built home, service, and legal routes affected by the fixes at representative mobile, tablet, and desktop widths. Check both themes, the contact and confirmation states, the gallery, and the legal print layout.
  - **Completion condition:** The corrected pages and interaction states have been checked visually and any regression introduced by this cycle has been resolved. [Audit verification scope](AUDIT.md#2-audit-scope-and-verification).

- [ ] **PH14-01 — Verify the Netlify-hosted candidate**
  - [ ] On an authorized Netlify deployment of the corrected revision, verify the service aliases, unknown-route HTTP 404, and configured response headers.
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

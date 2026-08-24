# SolidCraft — Development Plan

**Last reviewed:** 2026-08-24
**Plan status:** Active — implementation complete, release closure open

Completed work is summarised in `CHANGELOG.md`; open findings, if any, are in `AUDIT.md`;
the detailed implementation record is in the Git history. Source-vs-generated ownership and
pipeline rules live in `settings.md`.

## Remaining work

- [ ] **PH9-02 — Confirm the pre-deploy gate passes against the corrected implementation**

  - [x] `npm run format:check`
  - [ ] `npm run check:html`
  - [ ] `npm run qa:a11y`, then review the reported violations
  - [ ] `npm run build` and `npm run build:dist`, and confirm `dist/` matches the current sources
  - Not re-run since the Phase 10 changes.

- [ ] **PH9-03 — Manual final visual QA pass**

  - [ ] home page and the six `oferta/` subpages, both themes, mobile/tablet/desktop
  - [ ] Phase 10 presentation work: responsive treatments, testimonials, contact section, diacritics
  - [ ] consolidated icons: footer, theme toggle, lightbox controls
  - No automated gate covers visual appearance.

- [ ] **PH9-04 — Close the release**
  - [ ] confirm the canonical documents agree on the final state
  - [ ] promote `CHANGELOG.md` `[Unreleased]` to a dated release heading
  - [ ] create the release tag for the version in `package.json` (`1.0.0`)
  - Depends on `PH9-02` and `PH9-03`.

## Phase 1 — Quality gates and build contracts

- [x] **PH1-01** — Serve correct MIME types from the accessibility gate's static server.
- [x] **PH1-02** — Repair the first-visit modal's legal-document links.
- [x] **PH1-03** — Make the deploy command produce the assets it publishes.
- [x] **PH1-04** — Add the missing repository hygiene controls. Tracked text files are normalised to LF; `git add --renormalize .` is a no-op.

## Phase 2 — Entry-path and navigation accessibility

- [x] **PH2-01** — Make the first-visit modal operable and reliably dismissible.
- [x] **PH2-02** — Define the navigation breakpoint once, at 1024 px.
- [x] **PH2-03** — Make one mechanism authoritative for the offer submenu state.

## Phase 3 — Contrast and visible feedback states

- [x] **PH3-01** — Bind button labels to a theme-stable on-brand foreground token.
- [x] **PH3-02** — Style the contact form's status and error states for the orange section background.

## Phase 4 — Contact form correctness

- [x] **PH4-01** — Let the submit handler own contact form validation.
- [x] **PH4-02** — Stop discarding user input on the anti-spam timing branch.
- [x] **PH4-03** — Tie the capture-phase trim listener to the module's abort signal.

## Phase 5 — Error, offline and cache contracts

- [x] **PH5-01** — Convert `404.html` and `offline.html` to root-relative references.
- [x] **PH5-02** — Complete the service-worker precache list and secure its runtime cache writes.

## Phase 6 — Gallery and lightbox interaction

- [x] **PH6-01** — Bind gallery activation to the anchor instead of the inner image.
- [x] **PH6-02** — Correct the lightbox's accessible structure.

## Phase 7 — Public content integrity

- [x] **PH7-01** — Align the published business identity with the project's demonstrational purpose.

## Phase 8 — Runtime and styling corrections

- [x] **PH8-01** — Correct the `.ft-contact-icon` width declaration.
- [x] **PH8-02** — Resolve the passive double-tap listener in the lightbox.
- [x] **PH8-03** — Register the ScrollSpy `scrollend` listener once.

## Phase 9 — Documentation sync and release closure

- [x] **PH9-01** — Synchronise the canonical documents with the corrected contracts.
- Remaining items `PH9-02`–`PH9-04` are listed under "Remaining work" above.

## Phase 10 — Presentation and interface-system refinements

- [x] **PH10-01** — Correct the development server launch and make the development Service Worker network-only.
- [x] **PH10-02** — Refine the responsive, testimonials and contact-section presentation, and add the Latin Extended font subsets.
- [x] **PH10-03** — Consolidate the interface icon system onto `js/modules/icons.js`.
- [x] **PH10-04** — Normalise repository formatting; `npm run format:check` passes.

## Optional improvements

- [x] **O-01** — Add functional browser tests on the existing Playwright dependency.
- [x] **O-02** — Adopt `check:predeploy` as a gate in a CI workflow. Making `CI / quality-gate` a _required_ check is a GitHub branch-protection setting, still to be enabled by the maintainer.
- [x] **O-03** — Derive the service-worker cache version and precache list during the build.
- [x] **O-04** — Consolidate the sitemap source of truth.
- [x] **O-05** — Extend accessibility scanning beyond the four scanned pages.
- [x] **O-06** — Remove the speculative `modules/*.css` 404s from the development rendering.
- [x] **O-07** — Fix the Service Worker runtime cache write-back.

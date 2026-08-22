# SolidCraft — Development Plan

**Last reviewed:** 2026-08-22
**Project type:** Static multi-page front-end website (HTML, CSS, vanilla ES modules) with a Node-based build and QA tooling layer; no backend in the repository
**Plan status:** Active

## Planning principles

- The plan reflects the current verified repository state; every item is backed by current source, configuration, or a re-verified `AUDIT.md` finding.
- Main items are checked only when all required subtasks are complete and the stated completion condition holds.
- Canonical sources are `css/style.css` + `css/modules/**`, `js/script.js` + `js/modules/**`, `js/theme-init.js`, `js/sw-register.js`, `partials/header.html` + `partials/footer.html`, the maintained HTML pages, and `assets/img-src/**`; `dist/css/style.min.css`, `dist/js/*.min.js`, the rendered HTML and `sitemap.xml` under `dist/`, and `assets/img/**` are generated and are never edited directly — the minified assets exist only under `dist/`, produced by the production build (`settings.md` — "Source vs Generated Assets").
- Significant completed changes are recorded separately in `CHANGELOG.md`; pending items stay only in this file.
- This plan is created from the current project state. No prior `PLAN.md` existed, so no completed planning history is reconstructed here.

## Current priorities

1. `PH9-02` — Run the pre-deploy gate end to end against the corrected implementation and confirm the produced `dist/` matches the current canonical sources.
2. `PH1-04` — Renormalise the working tree (`git add --renormalize .`) so `.gitattributes` takes effect for the already-tracked files. This is the single outstanding part of an otherwise complete task and is a Git operation run by the maintainer, not an npm script; `AUDIT.md` — `P2-02` records it as the reason that finding stays "Partially addressed".

## Phase 1 — Quality gates and build contracts

**Goal:** Make the project's own validation and deployment contracts trustworthy, so every later phase can be verified against them.

- [x] **PH1-01 — Serve correct MIME types from the accessibility gate's static server** — **Priority:** High
  - [x] replace the `application/octet-stream` fallback in `scripts/qa-a11y.mjs` with a type map covering at least `.css`, `.js`, `.mjs`, `.json`, `.svg`, `.woff2`, `.png`, `.jpg`, `.webp`, `.avif`, `.ico`
  - [x] align the equivalent branch in `scripts/check-links.mjs` so both harnesses share one convention
  - [x] re-baseline the axe violation list produced against the corrected rendering and record which violations are pre-existing
  - **Completion condition:** during `npm run qa:a11y` the scanned page has the project stylesheet applied and `window.SC` defined, and the reported violations are reviewed against that corrected baseline
  - **Source:** `AUDIT.md` — P1-07

- [x] **PH1-02 — Repair the first-visit modal's legal-document links** — **Priority:** High
  - [x] point the `Regulamin`, `Polityka prywatności` and `Cookies` links in the project modal at the documents in `doc/`, using the document-relative `doc/<file>.html` convention already used by the footer
  - [x] re-run the link checker and confirm no internal failures remain
  - **Completion condition:** `npm run check:links` reports no internal failures and all three modal links open the corresponding `doc/` page
  - **Source:** `AUDIT.md` — P1-01

- [x] **PH1-03 — Make the deploy command produce the assets it publishes** — **Priority:** High
  - [x] run the asset build (`build:css` + `build:js`) as part of the deploy path, or fail `scripts/build-dist.js` when a minified artefact is older than its canonical sources
  - [x] keep the existing `ensureRequiredFilesExist()` presence check as a second guard
  - [x] update `settings.md` — "Scripts" / "Deployment Notes" and the `README.md` maintenance sections to describe the new contract
  - **Completion condition:** a commit that edits a file under `css/modules/` or `js/modules/` and is deployed without a manual local build either produces regenerated minified output or fails the build
  - **Note:** the completion condition still holds, but the mechanics recorded in the subtasks were superseded later in the cycle, when the minified artefacts moved out of the source tree into `dist/`. `build:dist` now stages `dist/` before running the asset build, and the `ensureRequiredFilesExist()` presence check was dropped in favour of `scripts/verify-css-build.js` and `scripts/verify-js-build.js` validating the artefacts in `dist/`. See `AUDIT.md` — `P1-08` "Superseded detail" and `settings.md` — "Deployment Notes".
  - **Source:** `AUDIT.md` — P1-08

- [x] **PH1-04 — Add the missing repository hygiene controls** — **Priority:** Medium
  - [x] create `.gitignore` (new file) covering `node_modules/`, `dist/` and `.lighthouseci/`
  - [x] create `.gitattributes` (new file) normalising tracked text files to LF, then renormalise the working tree
  - [x] remove the two tracked duplicate gallery renditions whose filenames contain `" (1)"` from `assets/img/gallery/`
  - **Completion condition:** after a fresh `npm install` and `npm run build:dist`, `git status` is clean, `git diff --ignore-cr-at-eol` and `git diff` agree, and no tracked asset filename contains `" (1)"`
  - **Outstanding:** the files are in place — `.gitignore` consolidated, `.gitattributes` added with `* text=auto eol=lf` plus `binary` for `.avif`, `.ico`, `.jpg`, `.png`, `.webp` and `.woff2`, and both `" (1)"` renditions deleted from `assets/img/gallery/`. Renormalising the working tree so `.gitattributes` takes effect for already-tracked files (`git add --renormalize .`) is a Git operation performed separately by the maintainer and was not carried out here; the `git status`-clean part of the completion condition holds only once it has been.
  - **Source:** `AUDIT.md` — P2-02

## Phase 2 — Entry-path and navigation accessibility

**Goal:** Make the two blocking interaction paths a visitor cannot avoid — the first-visit modal and the header offer submenu — correct, keyboard-operable and truthful in their ARIA state.

- [x] **PH2-01 — Make the first-visit modal operable and reliably dismissible** — **Priority:** High
  - [x] move focus into the dialog on open and restore it to a sensible element on dismissal
  - [x] constrain Tab within the dialog and add an Escape dismissal path, reusing the focus pattern already implemented in `js/modules/lightbox.js` instead of introducing a second one
  - [x] apply the existing `body.has-project-modal` scroll-lock class, which no code currently sets
  - [x] wrap the `localStorage` read and write in `js/modules/project-banner.js` with the guarded helpers already used by `js/theme-init.js`, `js/modules/map-consent.js` and `js/modules/ui-core.js`, and set the hidden state before persisting
  - **Completion condition:** with the modal open, focus starts inside the dialog, Tab cycles only within it, Escape dismisses it, background scrolling is locked, focus returns after dismissal, and the modal is still dismissible when `localStorage` access throws
  - **Source:** `AUDIT.md` — P1-02, P2-12

- [x] **PH2-02 — Define the navigation breakpoint once** — **Priority:** Medium
  - [x] reconcile the `992px` / `991.98px` media queries in `js/modules/nav.js` with the `1024px` header breakpoint in `css/modules/layout.css`
  - [x] reference the single agreed value from both layers so the drawer UI and the drawer logic switch at the same width
  - **Completion condition:** the viewport width at which the header switches between drawer and inline navigation is identical in CSS and JavaScript, verified at the boundary and at 1000 px
  - **Source:** `AUDIT.md` — P2-01

- [x] **PH2-03 — Make one mechanism authoritative for the offer submenu state** — **Priority:** High
  - [x] select the `open` class on `#dd-oferta` as the authoritative visible-state mechanism
  - [x] drive the mobile drawer and desktop dropdown from that class, synchronising `aria-expanded` in `setDd()`
  - [x] open the rendered mobile submenu before moving focus to its first link
  - [x] retain all six service subpages in the header below the navigation breakpoint
  - **Depends on:** `PH2-02`
  - **Completion condition:** below the navigation breakpoint, activating "Oferta" reveals the six submenu links and focus lands on the first one; at every viewport `aria-expanded` on the trigger matches the submenu's rendered visibility

## Phase 3 — Contrast and visible feedback states

**Goal:** Bring the primary controls and the contact form's feedback text to WCAG AA against their real rendered backgrounds, in both themes.

- [x] **PH3-01 — Bind button labels to a theme-stable on-brand foreground token** — **Priority:** High
  - [x] add a dedicated on-brand foreground token in `css/modules/tokens.css` that does not invert with the theme
  - [x] bind `.btn` and `.project-modal__actions .btn` in `css/modules/components.css` to that token instead of `--fg` / `--bg`
  - [x] re-measure the affected controls in both themes: hero CTAs, contact submit, subpage CTAs, modal accept
  - **Completion condition:** in both themes every `.btn` label measures at least 4.5:1 against its rendered background
  - **Source:** `AUDIT.md` — P1-05

- [x] **PH3-02 — Style the contact form's status and error states for the orange section background** — **Priority:** Medium
  - [x] add explicit `.is-ok` and `.is-err` rules, which `showNote()` toggles but which have no CSS anywhere in `css/`
  - [x] choose status-note and field-error colours that clear 4.5:1 across the `--brand-grad` gradient rendered by `.cta`
  - [x] distinguish success from failure by more than hue alone
  - **Completion condition:** success and error states are visually distinct, and both the status note and the field errors measure at least 4.5:1 against the contact section's rendered background
  - **Note:** the states reachable today are the phone-format error, the send-failure error and the success confirmation; the remaining required-field error cases become reachable with `PH4-01`
  - **Source:** `AUDIT.md` — P2-03

## Phase 4 — Contact form correctness

**Goal:** Make the implemented and documented validation, accessible error messaging and anti-spam behaviour actually execute without destroying user input.

- [x] **PH4-01 — Let the submit handler own contact form validation** — **Priority:** High
  - [x] add `novalidate` to the contact form in `index.html`, keeping the native constraint attributes for semantics and the no-JavaScript fallback
  - [x] confirm the existing branch in `js/modules/forms.js` then runs for missing, too-short, too-long and unchecked-consent cases
  - [x] verify the Netlify Forms submission path (`name="contact"`, `netlify-honeypot`, `action="/thank-you.html"`) is unaffected
  - **Completion condition:** submitting the empty form suppresses the browser bubble, sets `aria-invalid="true"` on each invalid field, renders the matching `.form-error` text, and announces the summary in the `role="status"` region
  - **Source:** `AUDIT.md` — P1-04

- [x] **PH4-02 — Stop discarding user input on the anti-spam timing branch** — **Priority:** Medium
  - [x] keep the honeypot, content heuristic and 2000 ms timing checks
  - [x] remove the `form.reset()` call from the timing rejection path so entered values are preserved
  - [x] surface a short retry message in the existing status region instead of returning silently
  - **Completion condition:** a submission rejected by the timing heuristic preserves all entered values and produces a visible, announced message
  - **Source:** `AUDIT.md` — P2-04

- [x] **PH4-03 — Tie the capture-phase trim listener to the module's abort signal** — **Priority:** Low
  - [x] replace the four-argument `form.addEventListener("blur", handler, true, { signal })` call in `js/modules/forms.js` with a single options object carrying both `capture` and `signal`
  - **Completion condition:** every listener registered in `js/modules/forms.js` is bound to the module's `AbortController` signal
  - **Source:** `AUDIT.md` — P2-09

## Phase 5 — Error, offline and cache contracts

**Goal:** Make the recovery pages and the service worker work in the nested-URL and offline situations they exist for.

- [x] **PH5-01 — Convert `404.html` and `offline.html` to root-relative references** — **Priority:** High
  - [x] rewrite stylesheet, script, favicon and navigation references in both documents to root-relative paths, matching the convention already used for `/manifest.webmanifest` and the `sw.js` precache list
  - [x] re-run `npm run check:assets` and `npm run check:links`
  - **Completion condition:** requesting a non-existent nested path renders the styled 404 page with working recovery links, and an offline navigation to a subpage renders the styled offline page
  - **Source:** PH5-01 verification

- [x] **PH5-02 — Complete the service-worker precache list and secure its runtime cache writes** — **Priority:** Medium
  - [x] add `js/theme-init.min.js`, `js/sw-register.js` and the six `assets/fonts/*.woff2` files to the `ASSETS` list in `sw.js`
  - [x] bump `CACHE_VERSION` alongside the precache change
  - [x] pass the runtime cache writes in the fetch handler to `event.waitUntil` instead of leaving them as floating promises
  - **Depends on:** `PH5-01`
  - **Completion condition:** with the network disabled, a cached page renders with the stored theme, the enhanced (non-`no-js`) navigation and the project fonts
  - **Source:** PH5-02 verification

## Phase 6 — Gallery and lightbox interaction

**Goal:** Make each gallery item a single, correct tab stop and give the lightbox an accessible structure that matches its `aria-modal` contract.

- [x] **PH6-01 — Bind gallery activation to the anchor instead of the inner image** — **Priority:** High
  - [x] bind the lightbox click and Enter/Space handlers to `a.gallery-item` and prevent its default navigation
  - [x] stop promoting the inner `<img>` to a focusable control with `tabindex="0"` and `role="button"`
  - [x] keep the raw-image `href` as the no-JavaScript fallback
  - [x] confirm the corrected pattern across all six `oferta/` subpages
  - **Completion condition:** each gallery item is a single tab stop, Enter and Space open the lightbox without navigating, and with JavaScript disabled the link still opens the full-size image

- [x] **PH6-02 — Correct the lightbox's accessible structure** — **Priority:** Medium
  - [x] append `.lb-close`, `.lb-prev` and `.lb-next` inside `.lb-wrap` so the `aria-modal` dialog contains its own controls, keeping the current fixed positioning
  - [x] compose each thumbnail control's accessible name from its own `alt` text instead of overriding every one with `aria-label="Powiększ zdjęcie"`
  - [x] keep the existing focus trap and focus-restore behaviour intact
  - **Depends on:** `PH6-01`
  - **Completion condition:** all lightbox controls are descendants of the `aria-modal` dialog element and remain Tab-reachable, and each thumbnail control exposes a name derived from its own `alt`
  - **Source:** `AUDIT.md` — P2-06, P2-07

## Phase 7 — Public content integrity

**Goal:** Resolve the mismatch between the site's demonstrational purpose and the indexable business identity it publishes.

- [x] **PH7-01 — Align the published business identity with the project's demonstrational purpose** — **Priority:** High
  - **Decision (recorded in `README.md` — "Przegląd projektu" / "Project Overview"):** SolidCraft stays publicly indexable (`index, follow`, present in `sitemap.xml`) as a demonstrational portfolio project. The `noindex` path is rejected, so the identity claims are neutralised instead and the trust content carries visible sample-content disclosures; the previously blocking alternative is closed.
  - [x] remove the postal address, telephone, email and `sameAs` profile links from the `GeneralContractor` JSON-LD — the type itself was dropped, because `GeneralContractor` (a `LocalBusiness`) plus `openingHours` still asserts an operating local business once the contact fields are gone; the same block was duplicated on all 11 pages carrying it, and all were corrected so the completion condition holds site-wide
  - [x] mark the 4.9/5 rating claim, the client-logo section and the testimonial cards as illustrative sample content
  - [x] align the "Realizacje" navigation label with the heading of the section it opens
  - **Completion condition:** no structured data asserts a physical business location or contact identity for SolidCraft, unsupported trust claims are visibly marked as sample content, and the navigation label matches its target section
  - **Source:** `AUDIT.md` — P1-10

## Phase 8 — Runtime and styling corrections

**Goal:** Remove the contained code-level defects that produce latent traps, console warnings and redundant work at runtime.

- [x] **PH8-01 — Correct the `.ft-contact-icon` width declaration** — **Priority:** Low
  - [x] replace the `width: 3318px` declaration in `css/modules/layout.css` with a value consistent with its `18px` height and flex basis
  - **Completion condition:** `.ft-contact-icon` declares a width consistent with its height, and the footer renders unchanged
  - **Source:** `AUDIT.md` — P2-08

- [x] **PH8-02 — Resolve the passive double-tap listener in the lightbox** — **Priority:** Low
  - [x] either register the `touchend` listener as non-passive so its `preventDefault()` applies, or drop the call and accept the browser default
  - **Completion condition:** double-tapping the lightbox viewport produces the intended behaviour with no passive-listener warning in the console
  - **Source:** `AUDIT.md` — P2-10

- [x] **PH8-03 — Register the ScrollSpy `scrollend` listener once** — **Priority:** Low
  - [x] register the `scrollend` listener for the module's lifetime, or guard `scheduleComputeAfterScroll()` so at most one pending listener exists
  - **Completion condition:** at most one pending `scrollend` listener exists at any moment during continuous scrolling
  - **Source:** `AUDIT.md` — P2-11

## Phase 9 — Documentation sync and final verification

**Goal:** Bring the project's canonical documents back in line with the corrected implementation and confirm the pre-deploy gate passes end to end.

- [x] **PH9-01 — Synchronise the canonical documents with the corrected contracts** — **Priority:** Medium
  - [x] update `settings.md` where the pipeline contract changed (`PH1-03`, `PH1-04`)
  - [x] update the `README.md` accessibility, PWA, testing and maintenance sections where the described behaviour changed
  - [x] record the significant completed changes in `CHANGELOG.md` under `[Unreleased]`
  - [x] mark the resolved `AUDIT.md` findings as addressed rather than deleting the audit record
  - **Depends on:** `PH1-03`, `PH1-04`
  - **Completion condition:** no canonical document describes behaviour that the implementation no longer has
  - **Note:** ten findings — `P1-03`, `P1-04`, `P1-05`, `P1-06`, `P1-09`, `P2-01`, `P2-03`, `P2-04`, `P2-05`, `P2-09` — had been deleted from `AUDIT.md` as they were fixed instead of being marked resolved. They were restored verbatim from the original audit and each now carries a `Status: Addressed` line, so the audit again records all 22 findings. `P2-02` deliberately stays "Partially addressed": the working-tree renormalisation is still outstanding, as recorded under `PH1-04`.
  - **Source:** `README.md`, `settings.md`, `CHANGELOG.md`, `AUDIT.md`

- [ ] **PH9-02 — Confirm the pre-deploy gate passes against the corrected implementation** — **Priority:** Medium
  - [ ] run `npm run check:html`
  - [ ] run `npm run qa:a11y` against the corrected static server and review the remaining violations
  - [ ] run `npm run format:check`
  - [ ] run `npm run build` and `npm run build:dist` and confirm the produced `dist/` contains regenerated minified assets
  - **Depends on:** `PH1-01`, `PH1-02`, `PH1-03`
  - **Completion condition:** `npm run check:predeploy` completes without failures and the produced `dist/` build matches the current canonical sources
  - **Source:** `settings.md` — "QA / Validation", `AUDIT.md` — P1-01, P1-07

## Optional future improvements

- [x] **O-01 — Add functional browser tests on the existing Playwright dependency**
  - **Value:** regression coverage for the navigation drawer, the offer submenu, the lightbox and the contact-form submission paths, at no new dependency cost — `playwright` is already declared and already drives the `qa:a11y` harness
  - **Scope boundary:** explicitly non-blocking; the project ships without functional tests today
  - **Resolution:** a new `npm run qa:functional` runs `scripts/qa-functional.mjs`, a plain Node script built on the `playwright` package already declared for `qa:a11y`. It follows that gate's shape rather than introducing a test framework: an in-process static server on an ephemeral `127.0.0.1` port, headless Chromium, one `PASS`/`FAIL` line per scenario and a non-zero exit code on the first unmet condition. No dependency was added and `@playwright/test` was not introduced — the raw `chromium` API covers everything the nine scenarios need. The scenarios live in `scripts/functional/` (`harness.mjs` plus `navigation.mjs`, `lightbox.mjs`, `contact-form.mjs`), and `scripts/utils/static-server.mjs` serves the maintained sources through the shared `renderHtmlFile()` renderer, so a test drives the same document `npm run dev` and `build:dist` produce instead of a test-only copy of the markup. `scripts/qa-a11y.mjs` was not touched: it keeps its own equivalent server, because rewiring a passing gate that carries the `O-05` route contract and the `O-06` verification is not part of adding tests. Isolation is handled in the harness, not in production code — every scenario gets a fresh browser context with the first-visit modal pre-accepted through its own `project-banner-accepted` key, service workers blocked and reduced motion emulated — and the browser and server are closed in a `finally` path on both the passing and the failing route. Coverage: the mobile drawer (rendered state, `aria-expanded`, `aria-label`, `is-nav-open`, focus in on open and back to the control on close, all below the shared 1024 px breakpoint); the `Oferta` submenu (its `open` class as the authoritative state, `aria-expanded` agreeing with it, no navigation on open, the six service links present in order and each reached by Tab, Escape closing it and returning focus to the trigger while the drawer stays open); the lightbox on `/oferta/lazienki.html` (one anchor and no nested control per item, the raw-image `href` intact, Enter opening the dialog instead of following the anchor, Space opening it without scrolling the page, `role="dialog"`/`aria-modal` with close, previous and next as descendants and no stray control outside, ArrowRight/ArrowLeft and both controls changing the displayed item, Tab staying inside the dialog, Escape closing it and restoring focus to the originating anchor); and the contact form in four separate scenarios (empty submission, anti-spam rejection, successful POST, failed POST). The form's own 2000 ms anti-spam window is waited out with real elapsed time; the production timing logic is untouched. `check:predeploy` is unchanged — whether the functional suite becomes a required gate is `O-02`'s decision.
  - **Verification:** `npm run qa:functional` reports `PASS qa:functional (9 scenarios, 0 failures)` in roughly 26 s, identical across three consecutive runs. The contact-form POST is intercepted inside Playwright and answered locally: the success path asserts exactly one `POST` with `application/x-www-form-urlencoded` and a decoded body carrying `form-name=contact`, the entered name, the masked `533 537 091` phone, the UTF-8 message and `consent=yes`, then a reset form, the success message, `aria-busy="false"`, an enabled submit button and focus moved to the status region; the failure path returns HTTP 500 and asserts the error message with the entered values preserved and the busy state released. The validation and anti-spam scenarios assert that no `POST` is attempted at all. No real Netlify submission is possible: the form action is relative, so the request cannot leave `127.0.0.1` even unintercepted, and every scenario additionally fails if the page issues any off-origin request or raises any uncaught error — none did. The suite was confirmed to fail rather than pass vacuously: with `js/modules/nav.js` temporarily forced to report `aria-expanded="false"` on open, the drawer scenario failed with `the open drawer should report aria-expanded=true — expected "true", got "false"` and the run exited `1`; the file was then restored byte-identically (SHA-256 `1efd103b…8935d`, `git status` clean). `npm run qa:a11y` still reports `PASS qa:a11y (12 pages scanned, 0 serious/critical violations)`, so the new tooling disturbed neither `O-05` nor `O-06`.
  - **Deliberately out of scope:** no production behaviour was changed to make anything testable and no application defect was found, so nothing was fixed under this item. Fullscreen and touch-gesture handling, the desktop hover dropdown, the form's 10 s fetch-timeout branch and the honeypot/heuristic spam branches are not covered — none was needed to make the core paths reliable. CI wiring stays with `O-02`, the Service Worker precache 404s with `O-03` (service workers are blocked in the test contexts, so they never reach the run) and the sitemap with `O-04`.
  - **Source:** `README.md` — "Roadmap", `AUDIT.md` — section 7

- [ ] **O-02 — Adopt `check:predeploy` as a required gate in a CI workflow**
  - **Value:** the documented pre-deploy gate would run automatically instead of depending on a local run; the repository currently contains no CI configuration
  - **Scope boundary:** explicitly non-blocking; worth doing only after `PH1-01` and `PH1-02`, so the gate is meaningful and green
  - **Source:** `README.md` — "Roadmap"

- [ ] **O-03 — Derive the service-worker cache version and precache list during the build**
  - **Value:** removes the silent-staleness class where a forgotten manual `CACHE_VERSION` bump leaves returning visitors on old unhashed `style.min.css` / `script.min.js`
  - **Scope boundary:** explicitly non-blocking; the manual process is documented in `README.md` and currently consistent
  - **Source:** `README.md` — "Roadmap", `AUDIT.md` — section 7

- [x] **O-04 — Consolidate the sitemap source of truth**
  - **Value:** the tracked root `sitemap.xml` is copied into `dist/` and then overwritten by `build:sitemap`, so the file a maintainer edits never reaches production; removing or generating it in place eliminates the second source
  - **Scope boundary:** explicitly non-blocking; no incorrect sitemap is currently published
  - **Resolution:** the redundant state was deleted rather than re-plumbed. The hand-maintained root `sitemap.xml` — ten `<loc>` entries carrying September 2025 `lastmod` values — is gone, and `"sitemap.xml"` was removed from `OPTIONAL_FILES` in `scripts/build-dist.js`, so the staging step no longer copies a sitemap into `dist/` for the next step to overwrite. A three-line comment above `OPTIONAL_FILES` records why the entry is absent, so it is not restored as an apparent omission. `scripts/generate-sitemap.mjs` is untouched and is now the only sitemap producer in the repository: `SITE_URL` handling, HTML discovery, the excluded directories, the excluded `404.html` / `offline.html` / `thank-you.html`, the path-order sort, the duplicate elimination and the emitted XML are all exactly as they were. No replacement manual sitemap was introduced anywhere and no second generator exists; nothing in `dist/` is edited by hand. The published sitemap does not change as a result — the generated file was already the one that shipped — so this is a maintenance-surface fix, not a production-content fix.
  - **Verification:** the duplication was measured before the change rather than assumed. `node scripts/build-dist.js` alone left a `dist/sitemap.xml` byte-identical to the tracked root file (both SHA-256 `7e559dd5…6f515`), and the following `npm run build:sitemap` replaced it with generated output (`8e2f2b8e…27eed`), confirming that the tracked file was staged and then discarded inside one build. After the change, with no `sitemap.xml` present at the root, `npm run build:dist` completes end to end — `build:css` with `scripts/verify-css-build.js`, `build:js` with `scripts/verify-js-build.js`, then `OK: sitemap generated with 10 URL(s) -> dist/sitemap.xml` — so no step required the removed file. The produced `dist/sitemap.xml` is byte-identical to the pre-change generated output (`8e2f2b8e…27eed`), which is the direct evidence that generation semantics were preserved. It holds ten `<loc>` entries, ten of them unique, all on `https://construction-pr01-solidcraft.netlify.app`: `/`, the six `oferta/` pages and the three `doc/` pages. `404.html`, `offline.html` and `thank-you.html` are absent, and no `.claude`, `.codex`, `node_modules`, `dist`, `partials` or worktree path appears. `dist/robots.txt` still advertises `Sitemap: https://construction-pr01-solidcraft.netlify.app/sitemap.xml`, which the generated file serves at that path, and `_redirects` is unchanged — its `/*` → `/404.html` catch-all cannot shadow a real file in the publish directory.
  - **Deliberately out of scope:** `robots.txt`, `netlify.toml`, the publish directory, the public routes and the canonical HTML are unchanged. The generator's missing `lastmod` was not "fixed": the deleted file's dates never reached production, and adding `lastmod` would be a new sitemap feature rather than the consolidation this item asks for. `check:predeploy` is untouched, and no broad QA suite was run — the focused build proof above is the whole verification this item needs. The Service Worker precache 404s remain with `O-03` and CI wiring with `O-02`.
  - **Source:** `AUDIT.md` — section 7

- [x] **O-05 — Extend accessibility scanning beyond the four scanned pages**
  - **Value:** the remaining five `oferta/` subpages and two `doc/` pages are unscanned, and the subpages carry the gallery structure addressed by `PH6-01`
  - **Scope boundary:** explicitly non-blocking; valuable only after `PH1-01`, otherwise it scans more unstyled, script-less pages
  - **Resolution:** the seven unscanned routes were added to the existing `basePages` contract in `scripts/qa-a11y.mjs` — `/oferta/elektryka.html`, `/oferta/hydraulika.html`, `/oferta/kafelkowanie.html`, `/oferta/malowanie.html`, `/oferta/remonty.html`, `/doc/cookies.html` and `/doc/regulamin.html` — so all six maintained service pages and all three legal pages are covered alongside `/index.html` and `/404.html`, with `/offline.html` still the one optional route. The change is the array literal plus a three-line comment; `resolvePages()`, the static server, `renderHtmlFile()`, the MIME resolver, the Chromium + `axe-core` execution path, the `serious`/`critical` threshold and the `page | rule | impact | selectors` failure output are untouched, and no rule was excluded, ignored or downgraded.
  - **Verification:** `npm run qa:a11y` went from `PASS qa:a11y (5 pages scanned, 0 serious/critical violations)` to `PASS qa:a11y (12 pages scanned, 0 serious/critical violations)` — 11 required routes plus the optional `/offline.html`. Coverage was confirmed from the gate's own traffic rather than from the printed count: with its in-process static server wrapped by a preloaded tracer, the run performed exactly 12 navigations, in `basePages` order, one per intended route. Each of the 12 was then re-observed through a reproduction of the gate's server — same `resolveContentType()`, same `renderHtmlFile()`, same headless Chromium, same `waitUntil: "networkidle"`, same axe injection — and every route returned HTTP 200, rendered its shared header and footer with no surviving `@layout`/`@include` directive or `{{token}}`, applied `css/style.css` with its seven `@import`ed modules (`header` computes `position: fixed`, `body` computes `Poppins`), exposed `window.SC` with all ten modules, resolved its `[data-icon]` placeholders and logged no console error. `axe.run()` returned **zero violations at any impact** on all 12 routes, so the expanded pass is green on merit and nothing was suppressed to reach it. The required-route contract was re-checked behaviourally without touching a project file: running the gate against a throwaway directory missing one required route at a time failed all 11 times with `Required page not found: <route>` and exit `1` (for example `Error: Required page not found: /oferta/remonty.html`), while a tree with all 11 required routes present and `offline.html` absent raised no such error, so `/offline.html` remains optional.
  - **O-06 regression check:** zero speculative document-relative `modules/*.css` requests across the whole run; all 168 `/css/modules/*.css` requests returned 200, and `CSSImportRule.href` reads root-relatively (`/css/modules/tokens.css` and its six siblings) on every route. The correction holds on the seven newly covered pages.
  - **Deliberately out of scope:** the three production-only Service Worker precache 404s (`/css/style.min.css`, `/js/theme-init.min.js`, `/js/script.min.js`) are unchanged in cause and now appear once per scanned route — 15 across five routes before, 36 across twelve after; they remain reserved for `O-03`. `thank-you.html` is a maintained page but sits outside this item's stated `oferta/` + `doc/` scope and was not added. The `serious`/`critical` results in axe's `incomplete` set, which this gate does not evaluate, are unchanged in kind from the `P1-07` baseline: `aria-prohibited-attr` (serious) and `aria-valid-attr-value` (critical) on all 12 routes, `color-contrast` (serious) on `/index.html`, `/404.html`, the three `doc/` pages and `/offline.html`, and `link-in-text-block` (serious) on `/index.html`. The seven new routes introduced no new needs-review rule id.
  - **Source:** `README.md` — "Roadmap", `AUDIT.md` — section 7

- [x] **O-06 — Remove the speculative `modules/*.css` 404s from the development rendering**
  - **Value:** every page load under `npm run dev` and `npm run qa:a11y` logs seven 404s for document-relative `modules/*.css` requests; the browser's speculative preloader resolves the `@import` paths in `css/style.css` against the document instead of against the stylesheet, while the correctly resolved `css/modules/*.css` requests all return 200 — nothing is broken, but the console noise obscures real errors during development and QA runs
  - **Scope boundary:** explicitly non-blocking and development-only; `build:css` inlines every `@import` into `css/style.min.css` (enforced by `scripts/verify-css-build.js`) and `build:dist` rewrites the pages to the minified assets, so no deployed page issues these requests
  - **Corrected attribution:** the requests come from `axe-core`, not from a browser preload scanner, so they occur under `npm run qa:a11y` only. `axe.run()` preloads the CSSOM: for every `@import` it reads `CSSImportRule.href`, which returns the specifier exactly as authored (`./modules/tokens.css`), and re-fetches it with `XMLHttpRequest` — an XHR resolves against the _page_, so `/index.html` requested `/modules/*.css`, `/oferta/lazienki.html` requested `/oferta/modules/*.css` and `/doc/polityka-prywatnosci.html` requested `/doc/modules/*.css`, seven each. Measured against the gate's own static server, `npm run dev` issued no such request on any route, before or after the fix; the value statement above overstated the reach.
  - **Resolution:** `css/style.css` now addresses its modules root-relatively (`@import "/css/modules/tokens.css"`), so the authored specifier and the resolved URL are the same string and no consumer can re-resolve it to a different path. `postcss.config.js` gives `postcss-import` a four-line `resolve` that maps a leading `/` onto the project root and returns every other specifier untouched, so the plugin's own resolver still handles the rest. `css/style.css` remains the canonical entry point, `css/modules/**` keeps its source ownership, and no module was merged or moved. Verified: across the five `qa:a11y` routes the speculative 404s went from seven per page to zero, `npm run qa:a11y` still reports `PASS qa:a11y (5 pages scanned, 0 serious/critical violations)`, and under `npm run dev` `/index.html` and `/oferta/lazienki.html` load all seven modules from `/css/modules/*` with the tokens, layout, components, sections, utilities and subpages rules applied. Genuinely missing resources still 404 — `/css/modules/does-not-exist.css`, `/definitely/missing.png` and the old `/modules/tokens.css` and `/oferta/modules/tokens.css` paths all return 404; nothing is redirected or masked. `npm run build:css` passes `scripts/verify-css-build.js` and produces a `dist/css/style.min.css` byte-identical to the pre-change build (SHA-256 `75c3fd0d…92501`, 75,051 bytes), so the production CSS contract is unchanged.
  - **Source:** `PH1-01` re-baseline run

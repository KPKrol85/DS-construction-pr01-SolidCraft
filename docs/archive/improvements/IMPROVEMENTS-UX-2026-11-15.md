# SolidCraft — UX Improvements

**Analysis date:** 2026-11-15
**Project type:** Static, multi-page demonstrational construction website (HTML, modular CSS, JavaScript ES modules, Netlify Forms)
**Analysis mode:** Evidence-based UX improvement review
**Focus:** Project-wide UX

## Implementation closure

**Status:** COMPLETED — All five selected UX improvements were implemented and verified.
**Completion date:** 2026-11-15
**Archive note:** The UX improvement cycle is closed and ready for archival.

## Improvement overview

The original review identified five UX improvements covering contact-form continuity, validation feedback, gallery accessibility, navigation orientation, and message-length limits.

All five improvements were implemented within the existing architecture. Functional coverage increased from 16 to 34 scenarios without introducing new dependencies.

## Completed improvements

### IMP-UX-01 — Carry the chosen service visibly and consistently into the quote form

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added a static, optional service select to the Netlify contact form. Known URL parameters and service CTAs prefill the selection. Home image links preserve `#kontakt` and remain functional after BFCache restoration.
- **Verification:** `format:check`, `check:html`, `qa:functional` (22/22), `qa:a11y` (28 scans, 0 serious/critical), and `build:dist` passed. Built HTML, intercepted submissions, BFCache, and no-JS behavior were verified. Layout checks passed at 320–1440 px in both themes; deployed Netlify storage was not tested.
- **Impact:** High
- **Effort:** Medium

### IMP-UX-02 — Report every contact-form problem in one validation pass

- **Status:** COMPLETED — implemented and verified.
- **Result:** Implemented single-pass validation for name, phone, message, and consent. All detected errors appear together, with focus on the first invalid field. The Polish validation summary counts invalid fields and excludes the optional service.
- **Verification:** `format:check`, `build:js`, `qa:functional` (24/24), and `qa:a11y` (28 scans, 0 serious/critical) passed. Additional axe checks found no violations at 375 and 1280 px in both themes. Screen-reader output was not tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-03 — Show the image description and position in the gallery lightbox

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added authored image captions and gallery-position indicators to the lightbox. A single polite live region updates the accessible description during navigation. Captions clear on close without adding focusable elements.
- **Verification:** `format:check`, `build:js`, `build:css`, `qa:functional` (26/26), and `qa:a11y` (28 scans, 0 serious/critical) passed. Chromium checks confirmed focus behavior, swipe synchronization, and contrast of at least 9.0:1 for captions and 5.6:1 for counters. All 36 captions passed layout checks at 320–1920 px in both themes.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-04 — Indicate the current service page in the header navigation

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added `aria-current="page"` and visible active states to service navigation. The Oferta parent state now follows layout flags, and submenus initialize on service pages. Escape focus restoration no longer reopens the desktop submenu.
- **Verification:** `format:check`, `check:html`, `qa:functional` (30/30), `qa:a11y` (28 scans, 0 serious/critical), and `build:dist` passed. Regression tests covered 13 pages, keyboard navigation, ARIA states, focus, and ScrollSpy. Layout checks passed at 320, 390, and 1280 px in both themes.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-05 — Make the message length limit visible before input is cut off

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added a visible 1,000-character limit and remaining-character counter. Polite notifications distinguish reached limits from confirmed paste truncation. Native `maxlength`, validation, submission, anti-spam handling, and reset behavior remain intact.
- **Verification:** `format:check`, `check:html`, `qa:functional` (34/34), `qa:a11y` (28 scans, 0 serious/critical), and `build:dist` passed. Clipboard tests covered truncation, selections, newlines, emoji, unavailable data, and canceled pastes. Counter synchronization and responsive layouts passed checks at 320, 390, and 1280 px in both themes.
- **Impact:** Low
- **Effort:** Small

## Completion summary

**5 of 5 improvements completed.** Contact-form feedback, gallery accessibility, and service navigation were improved without changing the project's architecture.

The final functional suite passed 34/34 scenarios, and the accessibility gate passed 28 scans with no serious or critical violations. No additional tests were performed solely for archival closure.

## Remaining limitations and observations

- **Netlify Forms:** Production storage of the `usluga` field was not verified.
- **Accessibility:** Automated checks passed, but real screen-reader testing was not performed.
- **Browser coverage:** Functional verification used Chromium; other browser engines were not tested.
- **External links:** HTML checks skipped 11 external responses returning HTTP 403.
- **Hero CTA:** The `tel:` action labelled "Wyceń inwestycję" remains unchanged by owner decision under IMP-DESIGN-04.
- **Response-time wording:** The 24–48-hour visible message and 24-hour FAQ JSON-LD declaration remain inconsistent.

These observations are outside the completed UX improvement scope.

## Original analysis limitations

The initial review was based on static source inspection and archived project documentation. No browser tests or production builds were executed during that analysis.

Subsequent implementation checks are recorded under each completed improvement.

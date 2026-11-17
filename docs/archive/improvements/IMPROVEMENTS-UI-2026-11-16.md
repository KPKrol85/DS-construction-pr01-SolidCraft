# SolidCraft — UI Improvements

**Analysis date:** 2026-11-15
**Project type:** Static, multi-page demonstrational construction-services website using HTML with build-time partials, modular CSS, and JavaScript ES modules
**Analysis mode:** Evidence-based UI improvement review
**Focus:** Project-wide UI

## Implementation closure

**Status:** COMPLETED — All four selected UI improvements were implemented and verified.
**Completion date:** 2026-11-16
**Archive note:** The UI improvement cycle is closed and archived. Remaining limitations are listed under [Remaining limitations](#remaining-limitations).

## Improvement overview

The original review assessed the interface built on the Measured Craft direction and excluded outcomes and owner decisions already recorded in the completed design and UX reports.

It selected four bounded refinements: an explicit enlargement cue in service galleries, a shared reading column for legal pages, dark-theme contact-feedback colors, and consolidated responsive hero styles. All four were implemented within the existing architecture without new features, replacement imagery, dependencies, or changes to navigation and form behavior.

## Completed improvements

### IMP-UI-01 — Make the image-enlargement affordance explicit in service galleries

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added a permanent enlargement hint to all six service galleries. Applied a scoped `zoom-in` cursor on hover-capable devices without changing gallery or lightbox behavior. Added a focused functional regression test.
- **Verification:** `format:check`, `check:html`, `qa:functional` (35/35), `qa:a11y` (28 scans, 0 serious/critical), and `build:dist` passed. All six galleries passed responsive checks at 320–1440 px in both themes, with no overflow and contrast ratios of 5.31:1 (light) and 7.48:1 (dark). Keyboard, focus, captions, and no-JavaScript navigation remained intact; touch emulation passed, but physical devices were not tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-02 — Give legal-page headings, contents, and body one reading column

- **Status:** COMPLETED — implemented and verified.
- **Result:** Unified the legal-page layout using `--doc-column` (70ch) and `--doc-gutter`. Aligned headings, contents, and article text while preserving existing styling and print behavior.
- **Verification:** `format:check`, `build:css`, and `qa:a11y` (28 scans, 0 serious/critical) passed. All three documents passed layout, navigation, and focus checks across 320–1440 px, both themes, and simulated 200% zoom. Chromium print checks preserved page counts; pre-existing narrow-viewport overflow and print typography overrides remain unresolved.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-03 — Adapt contact-feedback surfaces to the active theme

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added dark values for the six existing feedback tokens to the explicit and system-dark theme branches, giving success and error states navy-tinted surfaces with light text and bright semantic borders. Light-theme values, feedback selectors, and form behavior remain unchanged.
- **Verification:** `format:check`, `build:css`, `qa:a11y` (28 scans, 0 serious/critical), and focused contact-form `qa:functional` (14/14) passed. Rendered contrast measured 11.91:1 for success and 11.75:1 for error notices and field errors in explicit and system-dark modes, while light mode, including under a dark system preference, kept its original colors at 7.29:1 and 7.60:1. Feedback wrapped without overflow at 320 px and updated live on theme switches without losing messages or `aria-invalid` state; the system-dark fallback was checked by removing `data-theme` in a JavaScript-enabled page.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-04 — Consolidate responsive hero presentation in its section stylesheet

- **Status:** COMPLETED — implemented and verified.
- **Result:** Moved the desktop hero height, centered image position, and `#oferta` top inset from `utilities.css` into the hero and service blocks of `sections.css`, placing the desktop hero block after the portrait and short-landscape blocks to keep its precedence. Removed the dead `clamp(560px, 68vh, 880px)` hero height and the duplicate higher-specificity image selector, leaving import order, breakpoints, and rendered output unchanged.
- **Verification:** `format:check`, `build:css`, and `qa:a11y` (28 scans, 0 serious/critical) passed. Before/after Playwright captures of 16 viewports from 390 to 2560 px, including 1024×540, 1440×500, 1920×540, desktop-width portrait, and 21:9+ ultra-wide, in both themes with and without reduced motion matched in all 3,648 computed values and pixel for pixel in 128 hero and `#oferta` screenshots. An 800-point computed-style sweep (320–3440 × 320–1920 px) and the minified production CSS also showed no differences; physical devices were not tested.
- **Impact:** Medium
- **Effort:** Small

## Completion summary

**4 of 4 improvements completed.** Gallery affordance, legal-page reading layout, and dark-theme contact feedback were improved, and responsive hero styles were consolidated with no rendered change.

Each implementation passed `format:check` and the accessibility gate (28 scans, 0 serious/critical), with further checks recorded under each improvement. Ordering reflects interface clarity and consistency first, then maintenance value; impact and effort are relative estimates, not measured user outcomes. No additional tests were performed solely for archival closure.

## Remaining limitations

- **Physical devices:** Gallery and hero changes were checked with emulation only; physical devices were not tested.
- **Legal pages:** Pre-existing narrow-viewport overflow and print typography overrides remain unresolved.
- **System-dark fallback:** The no-`data-theme` dark branch was checked by removing the attribute in a JavaScript-enabled page.

These items are outside the completed UI improvement scope.

## Original analysis limitations

The initial review was based on static source inspection and archived project documentation. No browser rendering, interaction tests, screenshots, production build, or contrast measurement was performed during that analysis, and archived verification was treated as historical evidence only.

Subsequent implementation checks are recorded under each completed improvement.

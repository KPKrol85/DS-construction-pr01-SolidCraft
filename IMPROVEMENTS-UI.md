# SolidCraft — UI Improvements

**Analysis date:** 2026-11-15
**Project type:** Static, multi-page demonstrational construction-services website using HTML with build-time partials, modular CSS, and JavaScript ES modules
**Analysis mode:** Evidence-based UI improvement review
**Focus:** Project-wide UI

## Improvement overview

The current interface implements the Measured Craft direction through semantic material tokens, editorial typography, an image-led service range, restrained motion, and shared closing treatments. The completed design and UX records were checked against current sources; their implemented outcomes and recorded owner decisions are not proposed again. No root `PLAN.md` or existing `IMPROVEMENTS-UI.md` was present.

Four improvements qualify: make existing gallery actions more explicit, align document reading columns, extend feedback colors to dark surfaces, and consolidate responsive presentation ownership. These are bounded refinements to the existing interface, without new features, replacement imagery, dependencies, or changes to established navigation and form behavior.

## Proposed improvements

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

## Selection summary

The proposals address existing, reusable presentation patterns: six galleries, three documents, contact-feedback states, and the home opening's responsive CSS. Ordering reflects interface clarity and consistency first, followed by maintenance value; it is not based on measured user outcomes. Impact and effort are relative estimates.

All four can be implemented independently. IMP-UI-01 and IMP-UI-02 touch separate areas of `subpages.css`; IMP-UI-03 and IMP-UI-04 have no functional dependency on them. Preserve each proposal's scope when scheduling work.

Four proposals met the evidence and scope requirements. No fifth item was added merely to revisit completed design/UX work, repeat known defects, or recommend a visual preference without sufficient evidence. Implementation remains subject to separate owner approval.

## Analysis limitations

- This review inspected canonical HTML and partials, all CSS modules, relevant runtime modules, package/build configuration, and current documentation and archived improvement/audit records. No browser rendering, interaction tests, screenshots, production build, or contrast measurement was performed during this analysis.
- Alignment, interaction-cue, and feedback recommendations follow source-visible presentation choices. They do not establish responsive failures, accessibility failures, user confusion, or measured usability gains. Their acceptance criteria require direct verification during implementation.
- Verification recorded in archived reports is historical evidence only. It was used to exclude completed work and preserve owner decisions, not as a current runtime pass.

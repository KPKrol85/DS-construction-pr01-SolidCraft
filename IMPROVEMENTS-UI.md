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

- **Affected area:** Contact-form status notices and inline field errors.
- **Evidence:** `css/modules/tokens.css:36-41` and `css/modules/tokens.css:132-167`; `css/modules/sections.css`, `.form .form-note.is-ok`, `.form .form-note.is-err`, and `.form .form-error`; `js/modules/forms.js`, `showNote()` and `setFieldError()`.
- **Current state:** Feedback already has semantic foreground, background, and border tokens, with distinct error and success border treatments. The token values use pale green and pink surfaces. Neither dark-theme branch overrides them, so those same pale feedback surfaces are used against the dark form and page grounds.
- **Proposed improvement:** Extend the existing feedback tokens with dark-surface variants and corresponding light text and semantic borders. Retain the current light-theme palette and the existing text and border distinctions between states.
- **Expected value:** Integrate validation and submission feedback with the navy dark-theme surfaces while preserving clear semantic emphasis.
- **Implementation scope:** The existing feedback tokens in `css/modules/tokens.css`, including explicit dark and system-dark fallback branches. Keep the current feedback selectors and JavaScript state transitions, live regions, validation timing, message text, submission handling, and focus management unchanged.
- **Acceptance criteria:** Explicit dark mode and the CSS system-dark fallback resolve to the intended dark feedback palette; light mode retains its current colors. Inline errors and status notices remain readable and distinguishable by text and border treatment, with actual text/background contrast measured at implementation time to at least 4.5:1. Messages wrap at 320 px, and changing theme while feedback is visible updates its presentation without clearing it.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-04 — Consolidate responsive hero presentation in its section stylesheet

- **Affected area:** Home hero sizing and image positioning, plus the following service section's top spacing.
- **Evidence:** `css/style.css:5-7`; `css/modules/sections.css:279-307` and `css/modules/sections.css:541-543`; `css/modules/utilities.css:114-125`.
- **Current state:** `sections.css` defines desktop and short-landscape hero sizing. The later-imported `utilities.css` sets another desktop minimum height and image position, and changes the service container's top padding. Determining the effective home opening therefore requires following component-specific rules across both modules.
- **Proposed improvement:** Move these home-section presentation overrides into the relevant hero and service blocks in `sections.css`, resolving redundant declarations while preserving the effective cascade and rendered result.
- **Expected value:** Make future hero and section-spacing adjustments easier to assess without relying on late utility overrides. This is a maintenance refinement, not a proposal to change the approved hero composition.
- **Implementation scope:** Only the relevant rules in `css/modules/sections.css` and `css/modules/utilities.css`. Keep stylesheet import order, breakpoints, short-landscape precedence, effective dimensions, photograph crops, scrim, Craft Spotlight, reduced-motion behavior, copy, and action destinations unchanged. Avoid a general utility cleanup.
- **Acceptance criteria:** `utilities.css` no longer owns these hero or service-spacing overrides, and their effective definitions are grouped with the sections they style. Before/after computed styles and screenshots match at 390, 760, 1023, 1024, 1440, and 1920 px, including a desktop-width viewport no taller than 540 px. Both themes and portrait/ultra-wide image treatments retain their current geometry and behavior.
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

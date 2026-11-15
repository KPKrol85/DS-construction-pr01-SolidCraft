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

- **Affected area:** The six service-page galleries, before opening the lightbox.
- **Evidence:** `oferta/lazienki.html:193-236` and `oferta/lazienki.html:283-347`; equivalent `.gallery-item` anchors in the other five `oferta/*.html` pages; `css/modules/subpages.css:27-41`, `css/modules/subpages.css:138-157`, and `css/modules/subpages.css:204-210`; `js/modules/lightbox.js`, `initOfertaLightbox()`.
- **Current state:** Each service page has a noninteractive opening photograph and six gallery image links. Both presentations use rounded 4:3 media frames. Gallery links gain border emphasis and image scaling on hover, but their markup contains no visible enlargement label. Authored captions and position indicators already appear inside the open lightbox.
- **Proposed improvement:** Add one concise Polish enlargement hint beside each gallery introduction and a consistent zoom cursor on its image links. Keep the hint in the existing utility typography so it explains the action without competing with the images or demonstrational disclaimer.
- **Expected value:** Distinguish the gallery's existing interactive role from the opening illustration, including on touch screens where hover styling is unavailable.
- **Implementation scope:** Gallery introductions in the six canonical service HTML files and gallery styles in `css/modules/subpages.css`. Preserve image sources, mosaic geometry, anchor targets, accessible names, `data-lb`, `data-lb-caption`, lightbox behavior, and the home service images' quote-form links. Add no extra controls or animation.
- **Acceptance criteria:** All six gallery introductions display the same enlargement hint without hover; gallery links use the zoom cursor on pointer devices; the hint wraps without overflow at 320, 390, 760, and 1440 px in both themes. Existing image-link focus states, keyboard activation, captions, gallery order, and no-JavaScript image navigation remain intact.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-02 — Give legal-page headings, contents, and body one reading column

- **Affected area:** Privacy policy, terms, and cookie documents.
- **Evidence:** `css/modules/subpages.css:259-285` and `css/modules/subpages.css:331-343`; `polityka-prywatnosci.html:153-190`; corresponding `.block-head`, `.doc-toc`, and `.doc-content.legal-doc` structures in `regulamin.html` and `cookies.html`.
- **Current state:** The document heading and table of contents each use a `70ch` maximum width, while the article uses `72ch` with an explicit smaller body font. The lead has another `70ch` cap, and the three blocks have separate padding rules. Their reading-column dimensions therefore depend on several independent declarations and font contexts.
- **Proposed improvement:** Define one document-scoped reading-column width and shared outer gutter for the heading, contents panel, and article. Retain the contents panel's internal list indentation and worked-surface treatment, while keeping the title and article on open ground.
- **Expected value:** Establish a steadier reading axis across long documents and give future typography adjustments one clear layout owner.
- **Implementation scope:** Document-specific selectors in `css/modules/subpages.css`; a scoped custom property is sufficient. Preserve the font pair, heading hierarchy, all Polish text, section IDs, contents links, return links, theme behavior, and existing print rules. Do not restructure document navigation.
- **Acceptance criteria:** All three documents use the same declared outer reading-column width and gutter; the title/lead and article text share a start edge, with contents-list indentation remaining intentional. Verify narrow and wide layouts at 320, 390, 760, and 1440 px and at 200% zoom, with no horizontal overflow or clipped focus outlines. Print-specific declarations remain unchanged, and print preview is compared with the baseline.
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

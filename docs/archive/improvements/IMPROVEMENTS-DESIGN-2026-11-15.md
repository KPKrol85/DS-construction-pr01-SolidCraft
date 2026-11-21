# SolidCraft — Design Improvements

**Analysis date:** 2026-11-11
**Completion date:** 2026-11-15
**Status:** COMPLETED — 9/9 improvements verified.
**Focus:** Project-wide visual design, usability, and accessibility.

## Overview

The review identified an overly generic visual language despite SolidCraft's established design tokens, typography, and accessibility foundations.

Three creative directions were evaluated: Measured Craft, Site Blueprint, and Turnkey Interiors. **Measured Craft** was selected and implemented using the existing architecture and dependencies.

Two prerequisites were identified:

- **P-01 — Hero legibility:** Confirmed contrast deficiency, resolved under IMP-DESIGN-04.
- **P-02 — Image provenance:** Demonstrational imagery was introduced, but generation records and usage-rights confirmation remain incomplete.

## Completed improvements

### IMP-DESIGN-01 — Establish the Measured Craft material and accent system

- **Status:** COMPLETED — implemented and verified.
- **Result:** Introduced mineral and navy surfaces, reserved amber for actions and states, removed decorative gradients and unnecessary hover effects, and aligned `theme-color` and PWA metadata across all 13 pages.
- **Verification:** Responsive and theme checks passed; text contrast reached at least 4.91:1 and focus-ring contrast improved to 3.5–3.8:1. Hero lead contrast remained insufficient at this stage (P-01).
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-02 — Build an editorial typography hierarchy from the existing font pair

- **Status:** COMPLETED — implemented and verified.
- **Result:** Established an editorial hierarchy using Montserrat and Poppins, aligned section headings, standardized labels, and resolved the undefined `--fs-h4` token without changing heading semantics.
- **Verification:** Responsive, theme, and 200% zoom checks passed without overflow or clipped text; Polish characters rendered correctly. P-01 remained unresolved at this stage.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-03 — Define and apply a coherent workmanship photography system

- **Status:** COMPLETED — implemented and verified.
- **Result:** Replaced 43 images with coherent demonstrational workmanship imagery, updated captions and alternative text, and reorganized gallery sources. Extended `scripts/images.js` with directory preservation, collision detection, and selective regeneration.
- **Verification:** Image generation checks passed; 540 gallery variants contained no embedded metadata, and all six galleries and lightboxes were inspected. Generation details and usage terms remained unrecorded (P-02), and final visual approval remained outstanding.
- **Impact:** High
- **Effort:** Large

### IMP-DESIGN-04 — Re-compose the home hero around a craft anchor with art-directed crops

- **Status:** COMPLETED — implemented and verified.
- **Result:** Preserved the full-width hero by owner decision, improving contrast, focus visibility, responsive image cropping, and ultra-wide rendering. Added a pointer-responsive Craft Spotlight without changing the original content or actions.
- **Verification:** Hero lead contrast reached at least 5.03:1, title contrast 3.28:1, and focus-ring contrast 6.7:1, closing P-01. `qa:sw` passed 9/9; mobile median Lighthouse LCP improved from 3248 to 2940 ms. The owner approved the design; a CTA remained 3 px below the fold at 844×390.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-05 — Present the service range as an editorial index instead of six equal cards

- **Status:** COMPLETED — implemented and verified.
- **Result:** Replaced six equal cards with a featured "Remonty kompleksowe" service and five numbered specialty rows. Updated JSON-LD ordering and, by owner decision, directed home service images to `#kontakt` instead of the lightbox.
- **Verification:** Functional regression tests passed 16/16, including the new image-link contract. Section height at 390×844 decreased from 2722 to 1448 px; responsive and 200% zoom checks found no overflow. The owner approved the result.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-06 — Give service pages an image-led opening and an editorial gallery rhythm

- **Status:** COMPLETED — implemented and verified.
- **Result:** Introduced image-led openings, numbered service-scope layouts, and editorial gallery mosaics across six service pages. Corrected responsive `sizes` for AVIF and WebP images while preserving gallery navigation.
- **Verification:** Chromium checks from 320 to 1920 px confirmed correct layout, focus, and lightbox behavior. On `lazienki.html`, the tested AVIF payload fell from 533 to 115 KB; gallery columns remained narrow at 320 px, and final visual approval was outstanding.
- **Impact:** Medium
- **Effort:** Medium

### IMP-DESIGN-07 — Compose one calm, decisive closing sequence

- **Status:** COMPLETED — implemented and verified.
- **Result:** Reorganized `#kontakt` around the form, simplified footer contact details and social links, and unified closing CTAs across service and status pages. Preserved the existing form markup.
- **Verification:** Responsive and theme checks passed with no overflow; focus contrast reached at least 3.22:1 and text contrast 4.91:1. At 1440 px, contact-section height fell from 1047 to 722 px; final visual approval remained outstanding.
- **Impact:** Medium
- **Effort:** Medium

### IMP-DESIGN-08 — Recast the demonstration proof sections as one honest, quiet proof band

- **Status:** COMPLETED — implemented and verified.
- **Result:** Simplified `#realizacje` into a monochrome logo strip and reorganized `#opinie` around one featured testimonial. Removed the redundant mid-page CTA and omitted the optional photography section by owner decision.
- **Verification:** Accessibility and responsive checks passed without changing semantics or navigation targets; disclaimer contrast reached at least 5.31:1. Functional tests passed 16/16 on rerun after a timing failure; final visual approval remained outstanding.
- **Impact:** Medium
- **Effort:** Small

### IMP-DESIGN-09 — Reserve motion for structure and state

- **Status:** COMPLETED — implemented and verified.
- **Result:** Reduced reveal animations from 194 to 46, removed unnecessary movement, and limited transitions to section-level content. Keyboard focus now reveals hidden groups immediately.
- **Verification:** Responsive, reduced-motion, and no-JavaScript checks passed. Every tested keyboard Tab stop remained visible, compared with 4–14 initially obscured stops per view; final visual approval remained outstanding.
- **Impact:** Medium
- **Effort:** Small

## Verification and completion

**9/9 selected improvements completed.**

Each improvement passed its recorded formatting, HTML validation, accessibility, functional regression, and production-build checks:

- `format:check`, `check:html`, and `build:dist` — passed.
- `qa:a11y` — 28 scans, zero serious/critical violations.
- `qa:functional` — 14/14 scenarios for IMP-DESIGN-01–04 and 16/16 for IMP-DESIGN-05–09.
- `qa:sw` — 9/9 scenarios under IMP-DESIGN-04.

All browser-based verification used Chromium. Lighthouse measurements were recorded only for IMP-DESIGN-04. No separate cross-page integration review or additional tests were performed solely for archival closure.

## Owner decisions and open items

**Resolved decisions:** Measured Craft was adopted; the full-width hero and its original wording were retained; "Remonty kompleksowe" became the featured service; the optional work-imagery section and redundant CTA were omitted; footer contact information was simplified.

**Unresolved or partially resolved:**

- **P-02 — Image provenance:** Generation tool, dates, and usage-rights confirmation (D4) were not recorded. The original photography brief and `assets/img-src/PROVENANCE.md` were removed in commit `06936bc`; no repository provenance record remains.
- **Social links:** Four footer links remain as muted icons; their final destinations or replacement with brand placeholders were not decided.
- **Response-time wording:** Visible content states 24–48 hours, while FAQ JSON-LD states up to 24 hours.
- **Visual approval:** Recorded for IMP-DESIGN-04 and IMP-DESIGN-05; outstanding for IMP-DESIGN-03 and IMP-DESIGN-06–09.
- **Skip-link contrast:** The original review identified approximately 2.1:1 contrast for `.skip`; this issue was outside the completed improvement scope.

## Historical limitations

The original review relied on source inspection and selected visual checks. It did not execute build, formatting, image-generation, or automated QA suites; these were verified during subsequent implementation tasks.

Initial contrast measurements were approximate, and some section-height measurements included `content-visibility` placeholders. Later implementation checks used rendered baselines.

All findings, verification results, owner decisions, and unresolved limitations reflect the recorded improvement cycle ending on 2026-11-15.

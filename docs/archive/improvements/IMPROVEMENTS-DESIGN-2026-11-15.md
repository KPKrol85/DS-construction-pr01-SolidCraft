# SolidCraft — Design Improvements

**Analysis date:** 2026-11-11
**Project type:** Static, multi-page demonstrational website for a renovation and finishing company (HTML with build-time partials, modular CSS via PostCSS, JavaScript ES modules, Netlify hosting)
**Analysis mode:** Evidence-based creative design review
**Focus:** Project-wide design

## Implementation closure

**Status:** COMPLETED — All nine selected design improvements were implemented and verified.
**Completion date:** 2026-11-15
**Archive note:** This design improvement cycle is closed and the record is prepared for archival. Open owner decisions and limitations are listed under [Owner decisions and open items](#owner-decisions-and-open-items).

## Improvement overview

The original review found a sound technical design foundation: a token-driven amber and navy palette, two maintained themes, a construction-specific logo, self-hosted Polish-capable fonts, and protected interaction and accessibility contracts. Its principal finding was that the visual language behaved like a generic service template: repeated centered card grids, unrelated imagery with little visible workmanship, amber on too many surfaces to signal action, an off-palette `theme-color`, uniform element-level motion, and a page that ended three times with repeated contact data.

Two prerequisites were recorded. **P-01** was a confirmed hero legibility defect, with the light-theme lead at about 2.1:1 in approximate canvas samples. **P-02** concerned photography provenance, rights, and the presentation of gallery images as recent work on a demonstrational site.

Of three creative directions (A — Measured Craft, B — Site Blueprint, C — Turnkey Interiors), the review recommended **Measured Craft**, and the cycle implemented it. The direction expresses workmanship as identity through mineral ground and navy ink, amber reserved for action and state, an editorial voice from the existing font pair, a coherent workmanship image set, one featured element per section, and section-level motion only, all within the existing architecture and without new fonts, frameworks, or animation libraries.

## Completed improvements

### IMP-DESIGN-01 — Establish the Measured Craft material and accent system

- **Status:** COMPLETED — implemented and verified.
- **Result:** Tokens now separate mineral (light) or navy (dark) open ground from a small set of worked surfaces, and the footer stands on a per-theme navy ground. Amber is reserved for primary actions, active states, focus, and a dimension-line section marker; gradient fills, button shimmer, and hover affordances on non-interactive elements were removed. `theme-color` and PWA metadata on all 13 maintained pages now use palette colors.
- **Verification:** `qa:a11y` (28 scans, 0 serious/critical), `check:html`, `qa:functional` (14/14), `build:dist`, and `format:check` passed, and representative pages were inspected at 390–1440 px in light, dark, and no-JS themes. Changed text pairings reach at least 4.91:1, the light focus ring rose from about 1.4:1 to 3.5–3.8:1, and the hero accent rose from about 1.0–2.2:1 to a median of 7.2:1 (light) and 3.7:1 (dark). P-01 remained open because the light hero lead still measured about 1.9–2.7:1.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-02 — Build an editorial typography hierarchy from the existing font pair

- **Status:** COMPLETED — implemented and verified.
- **Result:** Tokens define a Montserrat 700 display voice with titles up to 48 px, Poppins leads at 17–20 px on a 60ch measure, and one tracked uppercase Montserrat utility style for labels and bylines. Section heads and service content share one start edge, while the hero, closing CTAs, and status pages stay centered. Uppercase headings became sentence case in source and the undefined `--fs-h4` now resolves, with heading levels, IDs, and font assets unchanged.
- **Verification:** `format:check`, `build:dist`, `check:html`, `qa:a11y` (28 scans, 0 serious/critical), and `qa:functional` (14/14) passed. Inspection from 360 to 1440 px in all themes, including 200% zoom, found no overflow or clipped text and correct Polish diacritics. Hero contrast was unchanged from baseline, so P-01 remained open.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-03 — Define and apply a coherent workmanship photography system

- **Status:** COMPLETED — implemented and verified.
- **Result:** All 43 hero, home service, and gallery images were replaced according to the workmanship photography brief, with new `alt` and caption text, demonstrational gallery wording on all six service pages, and one provenance row per image in `assets/img-src/PROVENANCE.md`. Gallery masters moved to per-service directories, and `scripts/images.js` now preserves subdirectories, rejects colliding outputs, and supports scoped (`--only`) and forced (`--force`) regeneration.
- **Verification:** `images:build --dry-run` reported no pending or obsolete outputs, the 540 gallery variants carried no embedded metadata, and `check:html`, `qa:functional` (14/14), `qa:a11y` (28 scans, 0 serious/critical), `format:check`, and `build:dist` passed. Contact sheets, all six galleries in both themes, and every lightbox item were inspected. Generation details and terms remained "Not recorded" pending D4, final visual sign-off rests with the owner, and P-01 remained open.
- **Impact:** High
- **Effort:** Large

### IMP-DESIGN-04 — Re-compose the home hero around a craft anchor with art-directed crops

- **Status:** COMPLETED — implemented and verified.
- **Result:** At the owner's direction, the hero keeps its full-width composition, photograph, copy, and actions instead of the proposed split layout. It gains theme-independent light ink over a soft scrim, an amber focus ring with a dark halo, and a Craft Spotlight that follows fine pointers by transform only. Portrait viewports load a pipeline-generated 4:5 crop, and a CSS-only ultra-wide fill replaces the JavaScript blur sync.
- **Verification:** Pixel sampling from 390 to 1920 px in all themes measured the lead at ≥5.03:1, the title at ≥3.28:1, and the focus ring at ≥6.7:1, closing P-01 for the hero. `format:check`, `images:build --dry-run`, `build:dist`, `check:html`, `qa:a11y` (28 scans, 0 serious/critical), `qa:functional` (14/14), and `qa:sw` (9/9) passed, and median Lighthouse LCP improved from 3248 to 2940 ms on mobile. The owner approved the appearance; limitations are Chromium-only testing, a primary action 3 px below the fold at 844×390, and one extra 31 KB source on ultra-wide viewports.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-05 — Present the service range as an editorial index instead of six equal cards

- **Status:** COMPLETED — implemented and verified.
- **Result:** `#oferta` now opens with "Remonty kompleksowe" as a dominant feature, chosen by the owner, followed by five numbered specialty rows with 4:3 thumbnails. IDs, link targets, accessible names, and image assets are unchanged, and the home JSON-LD `ItemList` follows the display order. By owner decision, home service images link only to `#kontakt` instead of opening the lightbox, a contract covered by two new `qa:functional` scenarios.
- **Verification:** `format:check`, `check:html`, `qa:a11y` (28 scans, 0 serious/critical), `qa:functional` (16/16), and `build:dist` passed. The section shrank from 2,722 to 1,448 px at 390×844 and from 1,323 to 1,152 px at 1440, with no overflow from 320 to 1440 px or at 200% zoom in any theme. Only Chromium was tested; the owner approved the visual result, and the JSON-LD on the other 10 pages was later synchronized with the home list.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-06 — Give service pages an image-led opening and an editorial gallery rhythm

- **Status:** COMPLETED — implemented and verified.
- **Result:** All six service pages open with the title and lead beside the service photograph from 760 px, stacked on narrower screens. Scope items keep their IDs and order in a numbered 2×2 matrix, and each gallery keeps its six lightbox anchors in a lead-image mosaic. Responsive `sizes` now also cover AVIF and WebP sources, which previously defaulted to `100vw`.
- **Verification:** `format:check`, `check:html`, `qa:a11y` (28 scans, 0 serious/critical), `qa:functional` (16/16), and `build:dist` passed, and a scripted Chromium pass over all six pages from 320 to 1920 px found no overflow and correct gallery order, focus, and lightbox behavior. At 390×844 the first image now starts at 356–482 px instead of 1,315–1,545 px, and the AVIF payload on `lazienki.html` at 1440 px fell from 533 to 115 KB. Only Chromium was tested, gallery thirds narrow to about 90 px at 320 px, and final visual approval rests with the owner.
- **Impact:** Medium
- **Effort:** Medium

### IMP-DESIGN-07 — Compose one calm, decisive closing sequence

- **Status:** COMPLETED — implemented and verified.
- **Result:** From 1024 px, `#kontakt` sets the heading and labelled phone and e-mail facts beside a dominant form, stacking on narrower screens with form markup unchanged. By owner decision, the footer drops the "Kontakt i wycena" bar, keeps phone and e-mail as a compact reference, and reduces the four social links to muted icons. Service-page end CTAs and the 404, offline, and thank-you pages share one closing treatment, and no response-time fact was added because visible copy (24–48 h) and the FAQ JSON-LD (up to 24 hours) disagree.
- **Verification:** `format:check`, `check:html`, `qa:functional` (16/16), `qa:a11y` (28 scans, 0 serious/critical), and `build:dist` passed, and a scripted Chromium pass at 390–1440 px in all themes found no overflow, focus rings of at least 3.22:1, and text contrast of at least 4.91:1. At 1440 px, `#kontakt` fell from 1,047 to 722 px and the footer from 754 to 586 px. Only Chromium was tested, and final visual approval rests with the owner.
- **Impact:** Medium
- **Effort:** Medium

### IMP-DESIGN-08 — Recast the demonstration proof sections as one honest, quiet proof band

- **Status:** COMPLETED — implemented and verified.
- **Result:** `#realizacje` presents the six sample logos as an unboxed, optically balanced monochrome strip that stays legible in every theme, including no-JS system-dark. By owner decision, the mid-page "Formularz" CTA was removed and no photography slice was added. `#opinie` features one pull quote above three supporting quotes, with DOM order, IDs, ARIA relationships, semantics, and the rating unchanged.
- **Verification:** `format:check`, `check:html`, `qa:a11y` (28 scans, 0 serious/critical), `qa:functional` (16/16 on a standalone rerun after a load-related timing failure), and `build:dist` passed. Scripted Chromium checks from 320 to 1440 px in all themes found unchanged content and navigation targets, no interactive affordances in the band, no overflow, and disclaimer contrast of at least 5.31:1. The rendered band fell from 1,295 to 1,149 px at 1440 px and from 1,602 to 1,247 px at 390 px (the audit's 1,525 px included a `content-visibility` placeholder); only Chromium was tested, and final visual approval rests with the owner.
- **Impact:** Medium
- **Effort:** Small

### IMP-DESIGN-09 — Reserve motion for structure and state

- **Status:** COMPLETED — implemented and verified.
- **Result:** Reveals fell from 194 to 46, with none in the footer. Section heads and at most one content group fade up 10 px over 320 ms, while the hero, service openings, primary actions, contact form, and footer are static. Directional, stagger, and hover-lift motion was removed, and keyboard focus reveals a group instantly and permanently via `:focus-within` and a `focusin` handler.
- **Verification:** `format:check`, `check:html`, `qa:a11y` (28 scans, 0 serious/critical), `qa:functional` (16/16), and `build:dist` passed. Chromium checks of all seven pages at 390–1440 px in both themes found settled groups, no layout change, and immediate visibility with reduced motion and without JavaScript. Every Tab stop was visible in its first frame (`HEAD`: 4–14 obscured stops per view); only Chromium was tested, and owner visual approval is pending.
- **Impact:** Medium
- **Effort:** Small

## Completion summary

**9 of 9 improvements completed.** SolidCraft now follows the Measured Craft direction across its material and accent system, typography, demonstrational workmanship imagery, hero, service index, service pages, closing sequence, proof band, and motion. P-01 was closed for the hero under IMP-DESIGN-04; the P-01 notes in IMP-DESIGN-01 to IMP-DESIGN-03 record the state at their completion.

Two recorded owner decisions departed from the original proposals: the hero kept its full-width composition (IMP-DESIGN-04), and home service images no longer open the lightbox (IMP-DESIGN-05). The checks above are historical implementation records: all browser verification used Chromium only, Lighthouse was measured only for IMP-DESIGN-04, and no separate cross-page integration review is recorded. No additional verification was performed solely to close this document.

## Owner decisions and open items

The original review listed seven owner decisions. Their final state, as recorded in the implementation records and project history, is:

1. **Creative direction:** Resolved — Measured Craft was adopted and implemented across IMP-DESIGN-01 to IMP-DESIGN-09.
2. **Photography (P-02):** Partially resolved — IMP-DESIGN-03 replaced all 43 images with demonstrational illustrations and replaced the "Galeria realizacji" wording with demonstrational gallery copy. Photography-brief decision D4, covering the generation tool, dates, and confirmation that its terms permit this use, was not recorded. The photography brief and `assets/img-src/PROVENANCE.md` were later removed from the repository (commit `06936bc`, 2026-11-14), so the repository no longer holds an image provenance record. Open.
3. **Featured service:** Resolved — "Remonty kompleksowe" leads the home index by owner decision (IMP-DESIGN-05).
4. **Work imagery under `#realizacje`:** Resolved — the optional photography slice was not added (IMP-DESIGN-08).
5. **CTA hierarchy:** Resolved by owner decision — the mid-page "Formularz" CTA was removed (IMP-DESIGN-08), and the footer contact bar was replaced by a compact phone and e-mail reference (IMP-DESIGN-07).
6. **External destinations:** Partially resolved — the four footer social links were kept as muted icons by owner decision (IMP-DESIGN-07). Whether they remain KP_Code studio links or become brand placeholders is not recorded. Open.
7. **Hero wording:** Resolved — the hero copy was kept at the owner's direction (IMP-DESIGN-04); the `h1` remains "SolidCraft — firma remontowo-budowlana" with the promise as the secondary line.

Additional open items:

- **Response-time wording:** visible copy states 24–48 h while the FAQ JSON-LD states up to 24 hours; IMP-DESIGN-07 left this unresolved.
- **Visual approval:** owner approval is recorded for IMP-DESIGN-04 and IMP-DESIGN-05; the records for IMP-DESIGN-03 and IMP-DESIGN-06 to IMP-DESIGN-09 leave final visual approval with the owner.
- **Outside design scope:** the original review observed that the `.skip` link pairs white text with `var(--brand)` at about 2.1:1; no improvement in this cycle addressed it. The undefined `--fs-h4` reference observed at the same time was resolved under IMP-DESIGN-02.

## Original analysis limitations

The initial review on 2026-11-11 was based on source inspection of the project documentation, CSS modules, HTML pages and partials, manifest, image pipeline, and assets, and on direct visual inspection through the local dev server in the desktop app's built-in browser. Rendered coverage was limited to the home page at 1440, 768, and 390 px, `oferta/lazienki.html`, `polityka-prywatnosci.html`, and `404.html`; other pages, open interface states, 200% zoom, reduced motion, and other browsers were assessed from source only or not at all. No build, image generation, formatter, or test suite was run **during that initial analysis**; subsequent implementation checks are recorded separately under each improvement.

Contrast figures in the initial review were approximate canvas samples, not formal conformance measurements. Section heights were measured without forcing `content-visibility` rendering; IMP-DESIGN-08 established that the recorded proof-band height included such a placeholder, so implementation records compare against rendered baselines.

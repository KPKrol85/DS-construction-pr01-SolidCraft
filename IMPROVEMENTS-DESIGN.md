# SolidCraft — Design Improvements

**Analysis date:** 2026-11-11
**Project type:** Static, multi-page demonstrational website for a renovation and finishing company (HTML with build-time partials, modular CSS via PostCSS, JavaScript ES modules, Netlify hosting)
**Status:** Proposed — awaiting owner review; no implementation authorized
**Analysis mode:** Evidence-based creative design review
**Focus:** Project-wide design

## 1. Methodology and evidence

- **Documentation reviewed:** `README.md`, `AGENTS.md`, `docs/CHANGELOG.md`, `docs/settings.md`, `LICENSE.md`, `assets/fonts/README.md`, the archived audit `docs/archive/audits/AUDIT-2026-08-27.md`, and the archived improvement records `IMPROVEMENTS-TECH-2026-11-08.md` and `IMPROVEMENTS-QUALITY-2026-11-11.md`. No `CONTEXT-PROJECT.md`, `PLAN.md`, active audit or review, earlier design report, or UI/UX improvement report exists, so this is the first design review and no approved plan work overlaps it.
- **Source reviewed:** all CSS modules in `css/modules/`, `index.html`, the six `oferta/*.html` pages (structure, headings, scope cards, gallery captions), `partials/header.html`, `partials/footer.html`, `404.html`, `manifest.webmanifest`, the size configuration in `scripts/images.js`, logo and partner SVGs, and the hero, service, and gallery images in `assets/img-src/` and `assets/img/`.
- **Runtime and visual evidence:** the project's dependency-free dev server (`scripts/dev-server.mjs`) was run locally and the rendered pages were inspected directly in the desktop app's built-in browser. Direct visual inspection occurred; viewports, themes, and pages are listed in section 9.
- **Evidence labels:** `Source`, `Runtime`, `Visual`, `Historical`, `Design judgment`.
- **Key limitation:** contrast figures in this report are approximate canvas samples of the rendered hero, not formal conformance measurements. Not every page, state, or theme combination was rendered.

## 2. Executive design assessment

SolidCraft has a sound technical design foundation: a token-driven palette (amber `#f59e0b`, burnt orange `#c2410c`, navy ink `#0b1220`), fluid spacing and type tokens, two maintained themes, a construction-specific logo (crane mark with an amber crescent), self-hosted Polish-capable fonts, and well-protected interaction and accessibility contracts. Legal pages are proportionate and readable.

The principal creative limitation is that the visual language behaves like a generic service template. Almost every section repeats the same pattern: centered heading, narrow centered lead, an equal grid of bordered, shadowed, hover-lifting cards, and a centered amber pill. Imagery comes from unrelated visual sources: a styled show-home living room, product shots on white, a thumbs-up stock portrait, overhead power-line and solar-farm work, and a fantasy bathroom. Amber is applied to so many surfaces that it no longer signals action. The brand promise "Solidnie. Terminowo. Pod klucz." and the craft-oriented name are stated in copy but not expressed through material, image, or composition.

The project-specific opportunity lies in the subject itself. Tile joints, waterproofing corners, plaster skims, cable routing, and pipe connections form an honest, distinctive vocabulary of precise workmanship. The recommended direction, **Measured Craft**, builds the identity from that vocabulary. It uses calm material surfaces, a precise typographic utility voice, amber reserved as the "marking line" for action, and editorial composition with deliberate rhythm. All of this can be delivered within the existing HTML/CSS/ES-module architecture.

## 3. Current design identity

### Brand and first impression

- Source: `assets/img/logo/logo-light.svg` and `logo-dark.svg` pair a black or white crane mark with an amber crescent; the wordmark "SolidCraft" is set in Poppins 600 beside it (`partials/header.html`, `.brand-name`).
- Visual: a first visit at 1440×900 opens the project modal over the blurred hero. After dismissal, the hero is a full-bleed photograph of a finished, styled minimalist living room with centered heading, lead, and two pill actions.
- Source: the light-mode `theme-color` is `#0ea5e9` (sky blue) in every maintained page and in `manifest.webmanifest`; this hue does not appear in the palette.
- Design judgment: the logo speaks the language of construction, the hero speaks the language of an interior-design showroom, and the browser chrome introduces a third, unrelated hue. Without its name, the page would read as a generic home-services template.

### Typography and editorial hierarchy

- Source: Montserrat 600/700 for headings and Poppins 400/500/600 for text (`css/modules/base.css`, `tokens.css`), self-hosted with `latin-ext` subsets. Historical: licensing and Polish diacritic coverage were resolved and documented.
- Runtime: at 1440×900 the hero `h1` is 40 px (`--fs-8` maximum), section `h2` 24 px (`--fs-6`), and body and leads about 15.2 px. At 390×844 the values are 29.6 px and 20.7 px.
- Source: every `.block-head` is centered and `.block-head__lead` is capped at `32ch`. Visual: this produces three- to four-line centered, ragged leads under each heading.
- Source: "REMONTY I WYKOŃCZENIA" is hard-coded in uppercase in `index.html`, while the other section headings use sentence case. Buttons, form labels, and footer headings are uppercased in CSS.
- Design judgment: two geometric sans families with similar personalities and a compressed scale (h2 to body ≈1.6) sit inside very generous section padding (`--section-py-lg` up to 7rem). The result is ample space with little typographic event. The pair itself is sound; the weakness lies in how it is used.

### Composition and rhythm

- Runtime (1440×900): home sequence is hero (738 px) → services (1,326 px; six equal cards, 3×2) → logos (620 px; six equal tiles) → testimonials (905 px; four equal cards) → FAQ (1,089 px; stacked cards) → contact (999 px; single centered column) → footer (1,078 px).
- Visual: service pages open with a text-only header and four text cards (`repeat(auto-fit, minmax(280px, 1fr))`) that resolve as 3 + 1 at 1440 px, followed by a three-column 4:3 gallery, FAQ, and an amber CTA band.
- Design judgment: the rhythm is consistent but monotone. After the hero, no section is dominant, no section is intentionally quiet, and no composition varies the centered-grid template.

### Color and material language

- Source: the same card treatment (`--radius-3`, 1 px border, surface fill, shadow, hover lift) is applied to service cards, logo tiles, testimonials, FAQ items, subpage scope cards, gallery items, the contact list, the form, the legal document, the TOC, the modal, and the status card. The CSS modules contain 24 `box-shadow: var(--shadow…)` declarations.
- Source: non-interactive elements carry interaction affordances. Testimonial cards and subpage scope cards (`.hover-card`) lift on hover; `.partners__item` sets `cursor: pointer` although the tiles contain no links.
- Source: `--brand-grad` serves as the contact-section background, the primary-button hover fill, the hero accent text fill, and the status-page card. `.btn::before` adds a shimmer sweep on hover.
- Visual: the contact band is the most saturated surface on the home page. On `404.html` the amber primary button sits on the amber gradient card.
- Design judgment: content, controls, and overlays share one floating-card material, and amber marks too many things to signal action.

### Light and dark editions

- Source: dark tokens shift to navy (`--bg #0b1220`, `--card #0f172a`), while the footer keeps a fixed neutral `#0f1115` in both themes.
- Visual: the dark edition is carefully executed at the component level, but the hero keeps the same bright daylight interior. White-background product images (paintbrush, fittings, sketch overlay) also read as glaring white rectangles on the navy page.
- Design judgment: dark mode is a token inversion rather than an edition with its own image and surface intent.

### Imagery and visual storytelling

- Visual: the hero shows a finished minimalist living room with no visible work or craft. The home service images are a dark luxury bathroom, a paintbrush macro on white, a decorative patterned floor, a stock electrician giving a thumbs-up, plumbing fittings on white, and a pink sketch overlay of an interior.
- Visual and Source: the `oferta/lazienki.html` gallery mixes plausible bathrooms with a copper bathtub under a rock waterfall. The `oferta/elektryka.html` gallery shows overhead power-line work from a bucket truck and solar installations, while the page's scope cards cover installations, circuits, lighting, and measurements. Gallery images carry a small amber corner glyph (for example `bathr-02`, `elec-03`).
- Source: gallery leads read "Kilka ujęć z ostatnich prac — więcej na życzenie." and present the images as completed work. The repository holds no provenance or licensing record for photographs, unlike `assets/fonts/README.md`, and `LICENSE.md` excludes third-party photographs from the project license.
- Design judgment: imagery is the weakest design layer. It has no shared subject, light, grade, or crop logic, and it undercuts both the craft message and the honest demonstrational framing the project maintains elsewhere.

### Components and interface expression

- Source and Visual: the home page shows four amber primary pills ("Wyceń inwestycję" as a `tel:` link, "Zamów wycenę", "Formularz", and the form submit), a translucent ghost button in the hero, and six service images that link to `#kontakt`.
- Source: the header is a translucent, blurred bar with centered navigation and an amber active underline. Testimonials use an amber quote mark and a rating pill labeled "Przykładowa ocena".
- Design judgment: the components are well built but expressively undifferentiated; primary actions repeat often enough to lose priority.

### Motion

- Source: 51 `[data-reveal]` elements on the home page (46 in the page, 5 in the footer partial) and 24 on each sampled service page. Variants are up (40), down (3, alternating on logo tiles), left (2), and right (1), with staggered delays up to 600 ms. Buttons add a hover shimmer and cards lift by 2–4 px.
- Historical: no-JS visibility and reduced-motion behavior are implemented and protected by the accessibility gate, which requires fully opaque reveal elements before scanning.
- Design judgment: motion is applied uniformly at element level, so it adds activity rather than hierarchy.

### Responsive art direction

- Runtime (390×844): the home page is 7,964 px (9.4 viewports). Services take 2,738 px as six stacked 389 px cards, and the footer takes 1,336 px.
- Source and Runtime: the hero ships only 16:9 sources (`HERO_SIZES` in `scripts/images.js`, no media-specific `<source>`) with `sizes="100vw"`. At 390×844 and at 768×1024 the browser selected `hero-800-450.avif`, while the cover crop renders the image about 1,050 and 1,275 CSS px wide respectively. Visual: the mobile crop shows mainly a wall and a television.
- Runtime (390×844): on `oferta/lazienki.html` the first image starts at 1,325 px, after about 1.6 viewports of text.
- Design judgment: mobile collapses the desktop grid rather than presenting a composed sequence.

### Closing composition

- Source and Visual: the contact section is a full-bleed gradient band with rounded top corners, a centered heading, a contact card (phone, email), and a form card in one column at every width. The footer adds brand copy, navigation, documents, consent-gated map and address, a social bar, a second contact bar ("Kontakt i wycena") that repeats phone and email, and the copyright line. Service pages end with an amber CTA band followed by the same footer.
- Design judgment: the page ends three times, and two of those endings repeat the same contact data. The saturated band also competes with the form it frames.

### Supporting-page consistency

- Visual: `polityka-prywatnosci.html` presents a 70ch document with a TOC panel and reads cleanly at 1440 px. `404.html` uses the amber gradient card with an amber button.
- Design judgment: legal pages only need to inherit the material and type system. Status pages should share the closing treatment.

## 4. Design prerequisites

| Prerequisite                                                   | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Follow-up boundary                                                                                                                                                                      |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P-01 — Hero text legibility over the photograph in both themes | Runtime (1440×900, approximate canvas sampling of the rendered image behind each text box with the computed overlay alpha, text-shadow excluded): light theme lead ≈2.1:1, accent line ≈1.1–2.2:1 across the amber-to-orange gradient; dark theme title ≈3.9:1, lead ≈4.2:1, accent ≈1.1–2.2:1. Source: `.hero::before` overlay `--overlay-a` 0.3 (light) / 0.5 (dark) at ≥760 px; `.hero__lead` is near-white in the light theme; `.hero__accent` uses `background-clip: text`. axe-core does not resolve contrast against background imagery, which is consistent with the passing `qa:a11y` gate. | Treat as a confirmed contrast defect, resolved through the audit/UI track or as the first slice of IMP-DESIGN-04. Final hero approval requires contrast measured against actual pixels. |
| P-02 — Photography provenance, rights, and representation      | Source: no provenance or licensing record for any photograph; `LICENSE.md` excludes third-party photographs. Gallery leads describe images as recent work on a demonstrational site. Visual: corner glyphs on gallery images.                                                                                                                                                                                                                                                                                                                                                                        | Owner decision on source, rights, and labeling before images are promoted to larger crops, replaced, or reused under `#realizacje`. No design implementation depends on guessing this.  |

## 5. Creative design directions

| Dimension              | A — Measured Craft                                                                                                          | B — Site Blueprint                                                                                                     | C — Turnkey Interiors                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Philosophy             | Workmanship as identity: precise detail, honest materials, calm confidence.                                                 | The renovation as an engineered process from measurement to handover.                                                  | The finished result: calm, aspirational spaces "pod klucz".                                                                        |
| Typography             | Montserrat display at larger scale; tracked Montserrat utility voice for indices, labels, and specifications; Poppins text. | Technical annotation voice dominates: dimension-style labels, step numbers, monospaced feel.                           | Light, airy display with large whitespace; minimal labels.                                                                         |
| Color / material       | Mineral-neutral ground, navy ink, hairline rules; amber reserved as the marking line for action and state.                  | Navy field with grid lines and drawing marks; amber as markup color.                                                   | Pale warm neutrals; amber nearly absent.                                                                                           |
| Composition            | Editorial rhythm: one featured element per section, asymmetric text/media splits, open ground instead of cards.             | Numbered process stages, diagram-like layouts, before/after pairings.                                                  | Large image-led panels, sparse text, gallery-first pages.                                                                          |
| Imagery                | Hands, tools, and materials at work plus finished details at close and medium distance; consistent daylight grade.          | Plans, measurements, before/after sequences, site progress.                                                            | Wide photographs of finished rooms.                                                                                                |
| Motion                 | Section-level entrances; state motion only.                                                                                 | Progressive drawing and stepping effects.                                                                              | Slow fades and image transitions.                                                                                                  |
| Mobile                 | Image-first portrait crops, compact indices, short sections.                                                                | Vertical process timeline.                                                                                             | Full-height image panels.                                                                                                          |
| Advantages             | Fits all six services, including electrical and plumbing; credible; distinctive; low architectural impact.                  | Strong "Terminowo" story; very distinctive.                                                                            | Closest to the current hero; immediately polished.                                                                                 |
| Trade-offs             | Depends on a disciplined photography set.                                                                                   | Requires real process and before/after material and invites unverifiable claims on a demo; motifs can become gimmicky. | Drifts toward an interior-design studio; weak for installation trades; relies on finished-room photography of unverifiable origin. |
| Technical implications | Token and component rules, moderate markup changes, new crops via the existing image pipeline.                              | New diagram components, more markup and SVG, heavier motion.                                                           | Larger image payloads, hero and gallery restructuring.                                                                             |

## 6. Recommended direction

**Recommended: A — Measured Craft.**

- **Rationale:** it expresses the existing name and promise ("Solid", "Craft", "Solidnie", "Pod klucz") through evidence of workmanship. It is the only direction that serves all six services equally, and it stays credible on a demonstrational site because it does not depend on before/after or completed-project claims.
- **Strengths preserved:** the amber/navy palette and logo, the Montserrat/Poppins pair, both themes, the token architecture, the shared partials, the section IDs and navigation contracts, and every interaction and accessibility contract.
- **Primary design objective:** replace template sameness with a recognizable material, typographic, and photographic system, and let composition give each section a clear role.
- **Intentional boundaries:** no new fonts, frameworks, or animation libraries; no new features or workflows; no fabricated content; no change to form, lightbox, navigation, consent, PWA, or storage behavior; legal pages inherit the system without bespoke treatment.
- **Guiding hierarchy:** craft anchor → service index → work and proof → one quote action.

## 7. Prioritized design improvements

Priorities express design value and dependency, not defect severity. P1 items establish the direction or unlock dependent work; P2 items extend it. These proposals do not authorize implementation, and acceptance criteria describe future verification only.

### IMP-DESIGN-01 — Establish the Measured Craft material and accent system

- **Status:** COMPLETED — implemented and verified.
- **Result:** Tokens now separate open ground (mineral `#f6f5f1` in light, navy in dark) from worked surfaces, which are limited to disclosures, the form, the TOC, the dropdown, dialogs, and media frames, and the footer stands on a per-theme navy ink ground. Amber is reserved for primary actions, active and expanded states, focus, and a dimension-line section marker; gradient fills, button shimmer, hover lift, and pointer cursors on non-interactive elements were removed, and the hero promise line now takes the title ink. `theme-color` in all 13 maintained pages, `manifest.webmanifest`, and the tile and mask-icon metadata now use palette colors.
- **Verification:** `npm run qa:a11y` (28 scans, 0 serious/critical), `check:html`, `qa:functional` (14/14), `build:dist`, and `format:check` passed, with `qa:a11y` and `build:css` rerun after the focus-ring correction, and representative home, service, privacy, and 404 views were inspected across 1440, 768, and 390 px and light, dark, and no-JS system themes, including dropdown, drawer, FAQ, modal, hover, and focus states. Changed text pairings measure at least 4.91:1, `--on-brand` reaches 8.72:1 on amber and 7.18:1 on hover, the light marker reaches at least 3.22:1, and the light `--ring`, now the opaque marker amber, rose from about 1.4:1 to 3.5–3.8:1 on light surfaces and from 2.5:1 to 4.5:1 in the footer, while dark and system-dark rings stay at 3.2–4.0:1. The hero accent rose from about 1.0–2.2:1 to a median of 7.2:1 (light) and 3.7:1 (dark) against actual pixels, while P-01 remains open because the hero lead measures about 1.9–2.7:1 (light) and 3.3–3.9:1 (dark).
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-02 — Build an editorial typography hierarchy from the existing font pair

- **Status:** COMPLETED — implemented and verified.
- **Result:** Tokens now define a Montserrat 700 display voice (hero and page titles up to 48 px, section titles 40 px, card titles 22 px), Poppins 400 leads at 17–20 px on a shared 60ch measure, and one tracked uppercase Montserrat 600 utility style for form labels, footer headings, scope labels, and testimonial bylines; the undefined `--fs-h4` reference now resolves through `--fs-h3`. Section heads, the section marker, service cards, and service-page heads, scope items, and galleries share one start edge, while the hero, closing CTAs, and status pages stay centered. The two uppercase headings are sentence case in source, and heading levels, IDs, font files, preloads, and subsets are unchanged.
- **Verification:** `format:check`, `build:dist`, `check:html`, `qa:a11y` (28 scans, 0 serious/critical), and `qa:functional` (14/14) passed. Representative home, service, legal, and 404 views were inspected from 360 to 1440 px in light, dark, and system-dark themes, including a 720 px viewport equivalent to 200% zoom, with no horizontal overflow or clipped text, "remontowo-budowlana" unbroken from 360 px, Polish diacritics rendered from the local `latin-ext` faces, and keyboard focus visible. Approximate pixel sampling shows hero contrast unchanged from baseline (light lead median 2.19 → 2.18:1, dark 3.96 → 3.91:1), so P-01 remains open.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-03 — Define and apply a coherent workmanship photography system

- **Status:** COMPLETED — implemented and verified.
- **Result:** All 43 hero, home service, and gallery images follow `docs/archive/design/design-photography-brief.md`, with its `alt` and caption text, the demonstrational gallery heading and lead on all six service pages, one provenance row per image in `assets/img-src/PROVENANCE.md`, and an off-white light-theme hero title over a deeper scrim. The 36 gallery masters moved to per-service `gallery/<category>/` directories with `tiling` naming, their 540 variants replaced the flat outputs, and each page's third item now offers its own 2048 px WebP. `scripts/images.js` preserves source subdirectories, rejects colliding outputs before writing, and adds `--only` and `--force` for scoped and forced regeneration.
- **Verification:** `images:build --dry-run` reported 0 obsolete outputs and 0 pending writes, the 540 gallery variants matched their sizes and formats without EXIF, XMP, or ICC data, and `check:html`, `qa:functional` (14/14), `qa:a11y` (28 scans, 0 serious/critical), `format:check`, and `build:dist` passed. Per-service contact sheets, all six galleries at 1440 px in both themes, `lazienki.html` at 390 px, and a lightbox pass through every item were inspected, after the home stage was checked at 1440, 768, and 390 px with the light hero title sampled at a 3.2:1 minimum. Generation details and terms remain "Not recorded" pending D4, final visual sign-off rests with the owner, and P-01 stays open for the hero lead and focus ring.
- **Impact:** High
- **Effort:** Large

### IMP-DESIGN-04 — Re-compose the home hero around a craft anchor with art-directed crops

- **Status:** COMPLETED — implemented and verified.
- **Result:** At the owner's direction, the hero keeps its full-width composition, photograph, copy, and actions instead of the proposed split layout. It now has theme-independent light ink over a soft wash and an elliptical text-field scrim, a page-ground secondary chip without a backdrop filter, an amber focus ring with a dark halo, and a masked soft-light Craft Spotlight that rests on the tiler's hands and follows hover-capable fine pointers by transform only. `scripts/images.js` derives a 4:5 portrait crop (`HERO_PORTRAIT_CROP`) from the same master for portrait viewports, `sizes` and both preloads follow the cover-fitted frame, and a CSS-only ultra-wide fill replaces the JavaScript blur sync.
- **Verification:** Pixel sampling from 390 to 1920 px, at 844×390, and at 200% zoom in light, dark, system, and no-JS themes measured the lead at ≥5.03:1 and the title at ≥3.61:1, or ≥5.10:1 and ≥3.28:1 with the pointer over the copy (before: light lead about 3.0:1, no-JS copy 1.0–2.4:1), with the focus ring at ≥6.7:1 against its halo, closing P-01 for the hero. `format:check`, `images:build --dry-run`, `build:dist`, `check:html`, `qa:a11y` (28 scans, 0 serious/critical), `qa:functional` (14/14), and `qa:sw` (9/9) passed, portrait viewports load the 4:5 crop at full density in one request with the primary action above the fold at 390×844, pointer movement caused no layout and at most 0.7 ms of paint, and interleaved Lighthouse median LCP moved from 3248 to 2940 ms on mobile and from 649 to 640 ms on desktop. The owner approved the appearance, with these limitations: only Chromium was tested, the primary action's lower edge sits 3 px below the fold at 844×390, ultra-wide viewports fetch one extra 31 KB blur source, and the existing no-JS header overlap stays out of scope.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-05 — Present the service range as an editorial index instead of six equal cards

- **Status:** COMPLETED — implemented and verified.
- **Result:** `#oferta` now opens with "Remonty kompleksowe" as a dominant feature, first in DOM order by owner decision, followed by the five specialties as a numbered list of compact rows with 4:3 thumbnails; the feature sits beside the rows from 992 px and above them below that. IDs, label and description pairs, link targets, accessible names, and `srcset` assets are unchanged, `sizes` follow the rendered widths, and the home JSON-LD `ItemList` lists all six services in DOM order. By owner decision, home service images now link only to `#kontakt` and no longer open the lightbox, and two `qa:functional` scenarios cover this contract.
- **Verification:** `format:check`, `check:html`, `qa:a11y` (28 scans, 0 serious/critical), `qa:functional` (16/16; the new scenarios fail against the previous markup), and `build:dist` passed. Section height fell from 2,722 to 1,448 px (1.72 viewports) at 390×844 and from 1,323 to 1,152 px at 1440, with no overflow from 320 to 1440 px, at 200% zoom, or in light, dark, system-dark, and no-JS views, and prefetch with its Save-Data and 2G guards, reveal settling, and the gallery lightbox were rechecked. Only Chromium was tested, the specialty column runs up to 125 px longer than the feature at 992–1099 px, other pages keep the previous four-item JSON-LD copy, and final visual approval rests with the owner.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-06 — Give service pages an image-led opening and an editorial gallery rhythm

- **Status:** Proposed
- **Priority:** P2
- **Affected area:** header and gallery sections of the six `oferta/*.html` pages; `css/modules/subpages.css`.
- **Evidence:** Visual: text-only header and 3 + 1 scope cards at 1440 px on `oferta/lazienki.html`. Runtime: the first image starts at 1,325 px at 390 px. Source: all six pages share the same structure (four scope cards, six gallery items, four FAQ items, end CTA).
- **Current state:** service pages open without imagery, and galleries use an equal three-column grid.
- **Design judgment:** the pages that should show the work most clearly show it last.
- **Proposed improvement:** open each page with its anchor image (from the same image family as its home index entry, for continuity) next to the `h1` and lead. Present the four scope items as a numbered 2×2 matrix or list in the utility voice, matching the four-item content. Structure the gallery as one lead image plus a supporting grid, following the IMP-DESIGN-03 crop rules.
- **Expected value:** continuity from home page to service page, immediate visual proof of the service, and a gallery with editorial emphasis.
- **Implementation scope:** one shared template applied to all six pages. Preserve section IDs and `tabindex="-1"` landing behavior, scope-item IDs (for example `#hydroizolacja`), the lightbox contract (`.gallery-item`, `data-lb`, `data-lb-caption`, the `href` to the 2048 px JPG, single tab stop), the FAQ `details` markup, and the `?usluga=` CTA links.
- **Dependencies:** IMP-DESIGN-01, IMP-DESIGN-02, IMP-DESIGN-03 (per-service galleries), IMP-DESIGN-05.
- **Acceptance criteria:** on all six pages at 390×844, the first image is visible in the first viewport. At 768, 1024, and 1440 px the scope items form a complete grid with no orphan, and each gallery opens with one lead image. Every image still opens the lightbox, the `npm run qa:functional` lightbox scenarios pass, and both themes are verified.
- **Impact:** Medium
- **Effort:** Medium

### IMP-DESIGN-07 — Compose one calm, decisive closing sequence

- **Status:** Proposed
- **Priority:** P2
- **Affected area:** `#kontakt` presentation (`.cta--contact`, `.cta-wrap`, `.contact-list`, `.form` surface); the service-page end CTA (`.page-sub .cta`); `partials/footer.html` presentation (`.ft-contact-bar`, `.ft-social-bar`); status pages (`.page-status`).
- **Evidence:** Source: `.cta-wrap` is single-column at every width on a gradient background, and `.ft-contact-bar` repeats the phone and email. Runtime: contact 999 px and footer 1,078 px at 1440; footer 1,336 px at 390. Visual: the 404 card is amber on amber.
- **Current state:** the page ends three times, the contact data is repeated, and the closing band is the loudest surface on the page.
- **Design judgment:** the closing should concentrate attention on one action and then recede.
- **Proposed improvement:** at desktop, use a two-column closing. Contact facts (phone, email, response time as utility facts) sit on one side and the form on a worked surface on the other, on the IMP-DESIGN-01 ground rather than the gradient. The footer becomes a quiet reference layer instead of a second call to action. The service-page end CTA and the status pages adopt the same closing language.
- **Expected value:** one clear final action, less repetition, and a finished, confident end to every page.
- **Implementation scope:** form markup, Netlify attributes, honeypot, validation, ARIA, status regions, `action`, and the `#kontakt` anchor stay unchanged, as do map consent behavior and form DOM order. The footer keeps its single partial source. Which repeated footer elements are removed is an owner decision.
- **Dependencies:** IMP-DESIGN-01, IMP-DESIGN-02; owner decisions on footer contact repetition and social destinations.
- **Acceptance criteria:** at 1024 and 1440 px, the contact facts and form sit side by side with the form dominant, and at 390 px the order is heading → facts → form. Contact data appears once as the action layer and at most once as a footer reference. The contact-form `qa:functional` scenarios and `qa:a11y` in both themes pass. Status pages show their primary action with verified contrast against its surface.
- **Impact:** Medium
- **Effort:** Medium

### IMP-DESIGN-08 — Recast the demonstration proof sections as one honest, quiet proof band

- **Status:** Proposed
- **Priority:** P2
- **Affected area:** `#realizacje` (`.partners`) and `#opinie` (`.testimonials`) in `index.html` and `sections.css`.
- **Evidence:** Source: six SVG logos in bordered, shadowed, lifting tiles with `cursor: pointer` and no links; a mid-page "Formularz" CTA; four equal testimonial cards with hover lift; demo disclaimers `#partners-desc` and `#opinie-note`. Runtime: 620 px plus 905 px at 1440. Visual: the logos sit small inside large tiles.
- **Current state:** two separate, card-heavy sections of sample content carry as much visual weight as the services.
- **Design judgment:** sample proof should be quiet and clearly labeled, and should not be visually inflated.
- **Proposed improvement:** present the logos as an unboxed monochrome strip with consistent optical size, and the testimonials as one featured pull quote with supporting quotes in the editorial type voice. Keep the disclaimers adjacent and legible, and review the mid-page "Formularz" CTA within the overall CTA hierarchy. As an optional slice, if the owner approves and IMP-DESIGN-03 assets exist, add honestly labeled work imagery under the `#realizacje` anchor.
- **Expected value:** calmer mid-page pacing, no false affordances, and proof content presented with integrity.
- **Implementation scope:** preserve the `#realizacje` and `#opinie` IDs and navigation labels unless the owner changes them, the `role="status"` rating, list semantics, `figure`/`blockquote`/`cite`, and the disclaimer text. No new quotes, ratings, or logos.
- **Dependencies:** IMP-DESIGN-01, IMP-DESIGN-02; the optional slice depends on P-02 and IMP-DESIGN-03.
- **Acceptance criteria:** logos render without tiles or hover affordances at one shared optical height, and no non-interactive element exposes a pointer cursor. One quote is visually primary, and disclaimers stay visible next to their content in both themes. The combined band is shorter than the current 1,525 px at 1440, and `qa:a11y` passes in both themes.
- **Impact:** Medium
- **Effort:** Small

### IMP-DESIGN-09 — Reserve motion for structure and state

- **Status:** Proposed
- **Priority:** P2
- **Affected area:** `[data-reveal]` usage in maintained pages and `partials/footer.html`; reveal, hover-card, and `.btn::before` rules in `utilities.css`, `components.css`, and `sections.css`.
- **Evidence:** Source: 51 reveal elements on the home page with up, down, left, right, and scale variants and delays up to 600 ms; 24 per sampled service page; hover shimmer and card lifts. Historical: the no-JS reveal fix and the QUALITY-01 gate precondition of fully opaque reveal elements.
- **Current state:** nearly every element animates individually and from varying directions.
- **Design judgment:** uniform element-level motion competes with the calm, precise character of the recommended direction.
- **Proposed improvement:** use section-level entrances (heading plus one content group) with one direction and a short distance. Remove alternating directions and the decorative shimmer, and keep state motion only: hover, focus, pressed, disclosure, dialog, and lightbox.
- **Expected value:** motion that clarifies structure and state and reinforces the direction's restraint.
- **Implementation scope:** keep the `[data-reveal]` mechanism and its initializer contract, `.no-js` visibility, `prefers-reduced-motion` behavior, and compatibility with the `qa:a11y` reveal-settle precondition.
- **Dependencies:** best applied after IMP-DESIGN-04 to IMP-DESIGN-08 settle their compositions; otherwise none.
- **Acceptance criteria:** reveals are applied at section or group level only, no elements enter from opposing directions, and no decorative hover sweep remains. With reduced motion and without JavaScript, all content is immediately visible, and `npm run qa:a11y` passes.
- **Impact:** Medium
- **Effort:** Small

## 8. Suggested implementation sequence and dependencies

1. **Owner decisions:** approve the direction and settle the section 10 decisions, especially P-02.
2. **Prerequisite:** resolve P-01 hero legibility, either as an interim contrast fix or as the first slice of IMP-DESIGN-04.
3. **Foundation:** IMP-DESIGN-02 (type), then IMP-DESIGN-01 (material and accent). Both edit `tokens.css`, so sequence or coordinate them as separate, reviewable slices.
4. **Asset stream, independent of code:** the IMP-DESIGN-03 brief and asset audit can run in parallel with step 3. Sourcing is separately authorized, and outputs are regenerated with `npm run images:build`.
5. **Dependent compositions:** IMP-DESIGN-05 (services index; may start with current images, with final review after assets) → IMP-DESIGN-04 (hero; needs the hero asset) → IMP-DESIGN-06 (one service page per slice) → IMP-DESIGN-08 (proof band; optional slice after assets) → IMP-DESIGN-07 (closing; independent of assets).
6. **Refinement:** IMP-DESIGN-09 once compositions are stable.
7. **Integration review:** cross-page review of home, all six service pages, legal pages, and status pages at 390, 768, 1024, and 1440 px plus a short landscape viewport, in light, dark, and system themes, at 200% zoom, with reduced motion and without JavaScript.

**Recommended verification per slice:** `npm run qa:a11y` (both themes, settled reveals), `npm run qa:functional` where navigation, lightbox, modal, map, or form markup is touched, `npm run check:html` for anchors and assets, `npm run build:dist` before release review, and a before/after `npm run qa:lighthouse` for hero and image changes. Add manual contrast measurement for text over images and for any new surface pairing, a keyboard pass, and an image-crop review on approved assets.

## 9. Verification performed and limitations

- **Source inspection:** the documentation, CSS modules, HTML pages, partials, manifest, image pipeline configuration, and image and SVG assets listed in section 1.
- **Commands executed:** `git status --short` (clean before and after), read-only file listing and searches, and `node scripts/dev-server.mjs` with `DEV_SERVER_NO_OPEN=1` on `127.0.0.1:15500`, stopped after the review. No build, image generation, formatter, test suite, or dependency installation was run.
- **Rendered pages and viewports:** `/` at 1440×900 in light and dark, at 768×1024 in light, and at 390×844 in light; the first-visit modal at 1440×900 in light; `/oferta/lazienki.html` at 1440×900 in dark (visual) and at 390×844 in light (geometry only); `/polityka-prywatnosci.html` and `/404.html` at 1440×900 in light.
- **Runtime checks:** computed font families and sizes, loaded font faces, section heights, selected hero image candidates, and approximate hero contrast by canvas sampling with the computed overlay alpha (text-shadow excluded).
- **Inspection aids:** reveal classes were forced through the console so content could be inspected without scrolling animations. The `theme` and `project-banner-accepted` storage keys were set for inspection and removed afterward.
- **Not verified:** the other five service pages, `regulamin.html`, `cookies.html`, `thank-you.html`, and `offline.html` in rendered form (source only); the system theme without a stored preference; dark theme on tablet and mobile; open states of the navigation drawer, dropdown, lightbox, form validation, and map; 200% zoom; reduced-motion rendering; other browsers and physical devices. Contrast values are estimates, not conformance measurements.
- **Observed outside design scope, not proposed here:** the `.skip` link pairs white text with `var(--brand)` (`#f59e0b`), about 2.1:1 computed from token values, although the system defines dark `--on-brand` ink for amber. `base.css` sets `h3 { font-size: var(--fs-h4) }` while `tokens.css` defines no `--fs-h4`; current `h3` uses override it, so there is no visible effect today. Both belong to the audit or UI track.

## 10. Owner decisions required

1. **Creative direction:** approve, adjust, or reject Measured Craft (section 6).
2. **Photography (P-02):** decide the source, rights, provenance record, and labeling of all photographs, and whether "Galeria realizacji — Kilka ujęć z ostatnich prac" remains accurate wording on a demonstrational site.
3. **Featured service:** confirm which service leads the home index (IMP-DESIGN-05).
4. **Work imagery under `#realizacje`:** decide whether the section, currently labeled "Klienci" in navigation and showing sample logos, should also present labeled work imagery (IMP-DESIGN-08 optional slice).
5. **CTA hierarchy:** decide whether the mid-page "Formularz" CTA and the repeated footer contact bar remain (IMP-DESIGN-07, IMP-DESIGN-08).
6. **External destinations:** decide whether the footer social links, which currently point to KP_Code accounts, are presented as studio links or replaced by brand placeholders.
7. **Hero wording:** decide whether the `h1` keeps "SolidCraft — firma remontowo-budowlana" with the promise as a secondary line, or leads with the promise (IMP-DESIGN-04).

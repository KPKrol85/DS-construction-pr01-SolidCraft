# SolidCraft — UX Improvements

**Analysis date:** 2026-11-15
**Project type:** Static, multi-page demonstrational website for a renovation company (HTML with build-time partials, modular CSS, vanilla JavaScript ES modules, Netlify hosting with Netlify Forms)
**Analysis mode:** Evidence-based UX improvement review
**Focus:** Project-wide UX

## Improvement overview

SolidCraft supports one primary journey: a visitor browses the home service index or one of six service pages, reviews the gallery and FAQ, and requests a quote through the single contact form in `index.html#kontakt`. Secondary journeys are header and footer navigation, the gallery lightbox, theme switching, the consent-gated map, and the status pages. These interactions are technically sound: keyboard and focus handling, ARIA state synchronization, and storage fallbacks are implemented and covered by `qa:functional`.

The main opportunities lie in continuity and feedback rather than in broken behavior. The service a visitor came from is carried into the form invisibly and inconsistently. Validation reveals problems in two separate rounds. The lightbox discards 36 authored image descriptions and gives no position. The header never shows which service page is open. The message field truncates input silently at its limit.

No `PLAN.md`, `CONTEXT-PROJECT.md`, active audit, or previous `IMPROVEMENTS-UX.md` exists. The archived design, quality, and tech improvement records (`docs/archive/improvements/`) and `docs/CHANGELOG.md` were checked to avoid recycling completed or rejected work.

## Proposed improvements

### IMP-UX-01 — Carry the chosen service visibly and consistently into the quote form

- **Status:** COMPLETED — implemented and verified.
- **Result:** The quote form in `index.html` now has a labelled, optional native `select[name="usluga"]` with an empty default and the six services, styled like the other fields and present in the static and built markup. `prefillService()` selects only known `?usluga=` values and still removes the query while keeping `#kontakt`, both quote CTAs on every service page pass their service, and the home index image links set it on activation while keeping `href="#kontakt"`. Home listeners now stay attached when the page is restored from the back/forward cache.
- **Verification:** `format:check`, `check:html`, `qa:functional` (22/22, with six new and five extended scenarios), `qa:a11y` (28 scans, 0 serious/critical), and `build:dist` passed, and `dist/index.html` contains exactly one `usluga` field inside the Netlify form. Intercepted POSTs carried the prefilled or chosen service, unsupported values added no option, and a back/forward-cache probe with production-like caching plus a no-JS check confirmed image-link selection after restore and manual use without scripts. The form was inspected at 320–1440 px in light and dark themes; storage of the field by deployed Netlify Forms was not verified.
- **Impact:** High
- **Effort:** Medium

### IMP-UX-02 — Report every contact-form problem in one validation pass

- **Status:** COMPLETED — implemented and verified.
- **Result:** The submit handler in `js/modules/forms.js` now validates name, phone (required and format), message, and consent in one pass, sets every field error before focusing the first invalid field, and discards custom errors from earlier attempts before reading each field. The fixed summary was replaced by a count-based Polish message such as "Popraw 2 pola formularza.", and the optional service select is not counted.
- **Verification:** `format:check`, `build:js`, `qa:functional` (24/24, with two new and one updated `contact-form` scenarios that fail against the previous handler), and `qa:a11y` (28 scans, 0 serious/critical) passed. An additional axe scan of the form's error state found no violations in light and dark themes at 375 and 1280 px; screen-reader output was not tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-03 — Show the image description and position in the gallery lightbox

- **Status:** COMPLETED — implemented and verified.
- **Result:** The lightbox in `js/modules/lightbox.js` now shows the active image's authored `data-lb-caption` and its "n z 6" position below the image, updated through `applyImage()` on every navigation path and cleared on close. The block is a single polite, atomic live region that also serves as the dialog's accessible description, adds no tab stop, and is not rendered while the dialog is closed. Styling in `css/modules/components.css` fits the caption into the existing 86vh composition with the same scrim-based contrast in both themes.
- **Verification:** `format:check`, `build:js`, `build:css`, `qa:functional` (26/26, with two new `lightbox` scenarios that fail against the previous implementation), and `qa:a11y` (28 scans, 0 serious/critical) passed. A focused probe of the open dialog found no axe violations, confirmed the Chromium accessibility-tree description, swipe synchronization, and unchanged focus during navigation, and measured caption and counter contrast of at least 9.0:1 and 5.6:1 over the scrim, which axe reports only as needing review. Layout checks of all 36 captions at nine viewports from 320 to 1920 px in both themes found no clipping, overlap, or horizontal overflow; real screen-reader output was not tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-04 — Indicate the current service page in the header navigation

- **Affected journey:** Orientation and wayfinding on the six `oferta/` pages, on desktop and in the mobile drawer.
- **Evidence:** `partials/header.html:36-66`; `oferta/lazienki.html:174` (each service page passes only `base`, `home`, and an empty `active-home` to `@layout`; `remonty.html:180`); `js/modules/nav.js:260`, `js/modules/nav.js:316-324`; `css/modules/layout.css:236-241`.
- **Current experience:** The header marks only the home link with `aria-current="page"`, through the `active-home` layout token. On a service page, neither the "Oferta" trigger nor the matching submenu item carries a current-page state. ScrollSpy applies `.is-active` only to same-page `#` links, which are not present on service pages. Visitors who reach a service page from search or a shared link see no indication in the navigation of where they are within the offer.
- **Proposed improvement:** Mark the open service page in the header: `aria-current="page"` and a visible current style on its submenu item, and the existing `.is-active` underline on the "Oferta" trigger.
- **Expected user value:** Visitors can see where they are within the offer and which sibling services remain to explore. Screen-reader users hear the current page announced in the submenu.
- **Implementation scope:** Add a per-page layout token for the active service to the six service pages and render it in `partials/header.html` through the existing `{{#if}}` support of `scripts/utils/partials.js`. The renderer rejects undefined tokens, so every page using the header must declare the new token. Add a current-item style in `css/modules/layout.css` for desktop and the mobile drawer. Keep the `aria-expanded`, `aria-haspopup`, and `aria-controls` contracts, submenu open and close behavior, ScrollSpy on the home page, and link targets.
- **Acceptance criteria:** On `oferta/kafelkowanie.html`, only the "Kafelkowanie" submenu link has `aria-current="page"` and a visible current style when the submenu is open on desktop and in the mobile drawer. The "Oferta" trigger shows the active underline, and no other header link is marked current. Home-page ScrollSpy states are unchanged. `check:html`, `qa:a11y`, and the `navigation` scenarios in `qa:functional` pass.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-05 — Make the message length limit visible before input is cut off

- **Affected journey:** Writing the "Opis prac" description in the contact form.
- **Evidence:** `index.html:1145-1161` (`maxlength="1000"` on `#f-msg`, placeholder "Krótko opisz zakres prac..."); `js/modules/forms.js:195-199`.
- **Current experience:** The textarea enforces `maxlength="1000"`, so the browser stops typing and truncates pasted text at 1,000 characters without notice. The "Opis może mieć maksymalnie 1000 znaków." message in `forms.js` handles `validity.tooLong`, which typing and pasting under `maxlength` do not produce, so in practice the limit is never communicated. A visitor who pastes a longer scope description can send it without realizing the end was dropped.
- **Proposed improvement:** Show the limit and the remaining character count for "Opis prac", with a calm notice when the limit is reached or a paste was truncated.
- **Expected user value:** Visitors can plan the length of their description and know when text was cut, rather than unknowingly sending an incomplete request.
- **Implementation scope:** Add a counter element linked to `#f-msg` through `aria-describedby`, alongside the existing error id, in `index.html`, and update it from the form's existing `input` handling in `js/modules/forms.js`. Announcements must stay polite and must not fire on every keystroke. Keep `maxlength`, the `msg` field name, existing error messages and clearing, and the form layout.
- **Acceptance criteria:** The field shows the 1,000-character limit and an updating remaining count while typing. Pasting 1,200 characters leaves 1,000 in the field and displays a visible notice that the text was shortened. Screen readers receive the limit through the field description and the truncation notice once, not per keystroke. The `contact-form` scenarios in `qa:functional` and `qa:a11y` pass.
- **Impact:** Low
- **Effort:** Small

## Selection summary

The set targets the site's one conversion journey (IMP-UX-01, IMP-UX-02, IMP-UX-05) and its two most used supporting interactions, the service-page galleries (IMP-UX-03) and navigation orientation (IMP-UX-04). Each proposal improves an existing, working behavior without new routes, dependencies, or backend capability.

IMP-UX-01, IMP-UX-02, and IMP-UX-05 all modify `js/modules/forms.js` or the contact form markup in `index.html`. They are independent in objective but should be implemented sequentially, in that order, to avoid conflicting edits. IMP-UX-03 and IMP-UX-04 are fully independent of the others and of each other. All five are Small or Medium and can each be verified with focused `qa:functional` scenarios, which makes the set a reasonable candidate backlog for focused development work.

## Analysis limitations

- The review was static: canonical sources, partials, functional test scenarios, and archived records were inspected, but no browser session, build, or test command was run, so all described behavior is source-derived.
- Netlify Forms registers fields from the deployed static HTML according to Netlify's documentation. The runtime-created `usluga` input may therefore not be stored with submissions today. This was not verified; if confirmed it is a defect for an audit, and IMP-UX-01's acceptance criteria require the field in the static markup.
- The hero action "Wyceń inwestycję" is a `tel:` link whose label does not state that it starts a call. It was not proposed because IMP-DESIGN-04 records the owner's decision to keep the hero actions.
- The response-time wording conflict (24–48 h visible copy versus 24 hours in FAQ JSON-LD) remains an open owner decision from the design cycle and was not proposed as a UX change.

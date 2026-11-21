# SolidCraft — Final Technical Front-End Audit

**Audit date:** 2026-11-21

**Project type:** Polish-language, static multi-page portfolio demonstration for a construction and renovation business

**Audit mode:** Final repository and implementation review

**Current readiness:** Needs important fixes

## 1. Executive assessment

SolidCraft has clear ownership of shared markup, styles, behavior, and generated assets. Its 13 maintained pages rendered in the local source harness. Automated accessibility checks and Service Worker scenarios passed within their configured scopes. Most functional scenarios passed, and the early-submit behavior passed with a controlled clock after the existing timing test failed during setup.

The main readiness issues concern the contact journey and recovery from a partial script failure. The mobile menu and some page content become unavailable when the theme script loads but the main script fails. The native form can send a request with required fields and consent missing, and the public copy promises a quotation workflow that the demo scope does not substantiate. These issues should be addressed before final public presentation. The repository configures Netlify for hosting and form handling, with published behavior outside the verified scope.

## 2. Audit scope and verification

### Areas inspected

- Home, six service pages, three legal pages, and three recovery or confirmation pages. Reviewed shared layout partials, headings, document landmarks, navigation targets, metadata, structured data, and the placement of demo disclosures.
- CSS modules, design tokens, responsive layout, theme, focus and reduced-motion rules, no-JavaScript behavior, and legal-page print rules. Reviewed responsive image and font declarations, representative media, the image pipeline, and asset attribution.
- Browser entry points and feature modules for navigation, reveal, lightbox, form validation and submission, storage, theme, project notice, consent-gated map, icons, and prefetch.
- Build and dev-server configuration, HTML discovery and partial rendering, static checks, browser QA, package metadata and lockfile, CI, Netlify routing and headers, sitemap and robots policy, manifest, and Service Worker generation and runtime.
- README, tooling documentation, project and font licenses, and relevant archived audit and improvement records. Historical results were used as leads for current checks.

### Verification performed

- Git reported a clean worktree at `04989eb` before writing the report. The checkout contained neither a tracked production bundle nor a local `dist/` directory.
- `npm run check:assets` and the internal-link and anchor portion of `scripts/check-links.mjs` passed across all 13 rendered pages. The link checker ran with an inline loopback-only Fetch wrapper and skipped 63 external link occurrences.
- `node --check` passed for all 40 tracked JavaScript and MJS files. Read-only metadata inspection found one title, one canonical, and one `h1` in each of the 13 page sources. The 11 JSON-LD blocks parsed as JSON. A targeted search for common credential and private-key signatures found no matches in the inspected text files.
- PostCSS and both esbuild bundles compiled in memory with the repository configuration and production build options. CSS contained no remaining `@import`, and the compilation APIs returned zero warnings. Browserslist emitted an out-of-date data notice. Installed top-level tooling versions matched the lockfile.
- `node scripts/images.js build --dry-run` scanned 51 source images and reported zero missing and zero obsolete outputs across the five pipeline-owned directories. Sharp validated the intrinsic dimensions of manifest raster assets and found three shortcut discrepancies. The redirect-table check found all configured destinations present and identified the missing service aliases below.
- `npm run qa:a11y` passed 28 Chromium scans across 13 routes in light and dark themes, including the first-visit modal open and dismissed. No serious or critical axe violations were reported.
- `npm run qa:functional` passed 34 of 35 Chromium scenarios covering navigation, lightbox, service selection, form handling, the notice, and map consent. One early-submit scenario stopped before submission because its setup exceeded the time budget. The focused retry (`npm run qa:functional -- --only=holds-a-submission`) stopped at the same assertion. A separate controlled-clock Chromium check showed the retry message, retained the populated values and consent, and issued zero POSTs.
- `npm run qa:sw` passed nine scenarios using the script's VM and local browser fixtures, covering lifecycle, navigation and asset caching, offline fallback, non-OK responses, and POST bypass. A separate read-only VM check exercised the current worker's cache-first path with an image replacement at the same URL.
- Additional Chromium checks used local rendered sources. All 13 routes were checked at 320 × 780 in light mode, 390 × 844 in dark mode, and 1440 × 900 in light mode, with no document-wide horizontal overflow, uncaught page errors, or failing same-origin responses recorded in those samples. Focused checks covered disabled JavaScript, a blocked main module, a locally intercepted native form POST, print media, and a simulated persisted history transition. The three browser suites used the already installed Chromium after the default sandbox browser lookup failed.

### Verification limitations

- The full production build and Lighthouse were not run because the build removes and recreates `dist/`, and Lighthouse also writes reports. Build order, staging, rewrites, sitemap generation and production worker generation were inspected statically. In-memory compilation and the worker fixtures provide component-level verification.
- No live URL was supplied. Published redirects, HTTP 404 handling, headers, Netlify Forms processing or retention, Google Maps rendering, public-origin reachability, and PWA installation on a device were not checked. Form and map browser scenarios used local responses or intercepted requests. Dependency advisory status was not refreshed against the registry.
- Runtime sampling used Chromium. A real back/forward cache restore did not occur in the local browser harness. The simulated lifecycle check exercised the handlers only. Firefox, WebKit, physical devices, assistive technologies, comprehensive contrast and visual review, physical print output, and field performance were outside the checks performed.

## 3. Verified strengths

- Shared markup has one source and one renderer used by the build, dev server, and HTML checks. Link and asset validation expands the real partials before checking the maintained page set. `scripts/build-dist.js:85-100`, `scripts/utils/partials.js`, `scripts/check-links.mjs:13-37`, `scripts/check-html-assets.mjs`.
- With JavaScript fully disabled, the sampled home, service, and legal routes exposed their marked reveal content and mobile navigation. With the app initialized, regression scenarios verified drawer and submenu keyboard behavior, current service indication, and gallery focus restoration. `css/modules/layout.css:186-195`, `css/modules/utilities.css:1-26`, `scripts/functional/navigation.mjs`, `scripts/functional/lightbox.mjs`.
- The contact form's JavaScript path has explicit labels, linked errors, field validity states, an announced status, and a bounded request. Functional checks passed for multiple errors in one attempt, corrected input, selected-service submission, success, and retry after a failed response. `index.html:1125-1226`, `js/modules/forms.js:305-375`, `scripts/functional/contact-form.mjs`.
- Consistent source ownership extends to delivery. CI separates build, pre-deploy, functional, and worker checks. The worker generator derives its shell from staged files, and the worker limits request handling to same-origin GETs and cleanup to its own cache namespace. `.github/workflows/ci.yml:55-69`, `scripts/generate-sw.js:36-56`, `sw.js:76-104`.
- The site uses local font subsets with swap behavior and a font provenance and license record. The home hero has art-directed sources, and the gallery has local responsive variants. The image dry run found the current generated inventory consistent with the pipeline's output plan. `css/modules/tokens.css:181-191`, `assets/fonts/README.md:1-12`, `assets/fonts/OFL-1.1.txt`, `index.html` (hero picture), `oferta/remonty.html` (gallery).
- Recovery and confirmation pages carry `noindex` and are excluded from the sitemap source set. The demo uses page and list structured data, and the sampled public gallery, logos, and testimonials are identified as illustrative. `404.html:16`, `offline.html:16`, `thank-you.html:16`, `scripts/generate-sitemap.mjs:11-14`, `index.html:775-784`, `index.html:880-889`, `oferta/remonty.html:297-308`.

## 4. P0 — Critical risks

None detected.

## 5. P1 — Important issues worth fixing next

### [P1-01] A main-script failure disables the mobile menu and hides page content

- **Classification:** Defect
- **Affected area:** Progressive enhancement, mobile navigation, content visibility
- **Evidence:** `index.html:30-35`, `index.html:1281-1284`, `js/theme-init.js:1-5`, `js/script.js:48-58`, `css/modules/layout.css:166-195`, `css/modules/utilities.css:1-26`
- **Current behavior:** The early theme script switches the document from `no-js` to `js` before the main script initializes the drawer and reveal observer. Blocking only the main script at 390 px left a visible toggle above a hidden drawer on the home, service and legal samples. On the home page at `#oferta`, clicking the toggle left the drawer closed and the section heading stayed at opacity zero. With both scripts loaded, the drawer opened and the heading reached opacity one.
- **Impact:** A failed main script can remove mobile navigation and leave offer or gallery content visually inaccessible, even though the HTML and CSS arrived successfully.
- **Recommended direction:** Keep early theme selection independent of navigation and reveal readiness. Apply each enhanced state only once its interaction has initialized.
- **Verification criteria:** At mobile width, block the main script alone and confirm that the navigation links are usable and the offer and service gallery content remain visible. Recheck the enhanced states with both scripts loaded.

### [P1-02] The native contact form can submit without required fields or consent

- **Classification:** Defect
- **Affected area:** Form validation, consent handling, progressive enhancement
- **Evidence:** `index.html:1103-1113`, `index.html:1137-1183`, `index.html:1202-1228`, `js/modules/forms.js:305-348`
- **Current behavior:** Static markup sets `novalidate` even though the enhanced validator is registered by JavaScript. With JavaScript disabled, submitting the untouched form issued a local POST to `/thank-you.html` with empty name and phone fields and no consent field.
- **Impact:** The browser bypasses the required-field and consent checks when the main script is unavailable. Acceptance by Netlify remains unverified.
- **Recommended direction:** Retain native validation until the enhanced submit path is installed. Keep the linked custom messages for the enhanced path.
- **Verification criteria:** With JavaScript disabled or its main module blocked, an empty form or unchecked consent prevents any POST, and valid input can follow the native submit path. Recheck enhanced validation and submission.

### [P1-03] The demo contact journey promises an actual quotation and follow-up

- **Classification:** Content integrity risk
- **Affected area:** Home contact section, confirmation states, public demo disclosure
- **Evidence:** `index.html:1070-1077`, `index.html:1137-1227`, `index.html:1236-1265`, `js/modules/forms.js:343-359`, `thank-you.html:56-62`, `regulamin.html:354-364`
- **Current behavior:** The home contact section offers a free quote and requests a name, phone number, and work description. Both the JavaScript success message and the standalone confirmation promise follow-up. The separate project notice and terms identify the feature as demonstrational and its submissions as test submissions.
- **Impact:** A visitor who lands directly at the form, dismisses the notice, or cannot load it can reasonably treat the form as a real quote request and enter personal data for that purpose.
- **Recommended direction:** State the demo purpose beside the form before submission, explain what input is expected, and align both confirmation states with the scope of the demonstration.
- **Verification criteria:** The contact section and both success states communicate a consistent purpose without relying on the first-visit notice. Any claim about actual follow-up is supported by the intended operating workflow.

## 6. P2 — Minor refinements

### [P2-01] Runtime-cached images can stay stale after an image-only release

- **Classification:** Defect
- **Affected area:** Service Worker cache invalidation, portfolio imagery
- **Evidence:** `scripts/generate-sw.js:36-56`, `scripts/generate-sw.js:121-175`, `sw.js:25-34`, `sw.js:76-91`, `sw.js:137-154`
- **Current behavior:** The cache version fingerprints precached files. Gallery and hero imagery are outside that set, and the runtime cache returns matching static assets before trying the network. In a local VM fixture, replacing a previously cached gallery response at the same URL still returned the old bytes and produced no new origin read.
- **Impact:** A repeat visitor can continue to see the previous project photo when image bytes change at a stable path and the precache inputs remain unchanged.
- **Recommended direction:** Revalidate mutable runtime images or version their URLs when their contents change.
- **Verification criteria:** With the old image already cached, a new visit after an image-only update gets the replacement online and can still load a cached image offline.

### [P2-02] History restoration can leave the gallery and reveal handlers inactive

- **Classification:** Source-visible risk
- **Affected area:** Browser history, service galleries, scroll reveal
- **Evidence:** `js/modules/lightbox.js:244-260`, `js/modules/lightbox.js:393-395`, `js/modules/ui-core.js:144-184`, `js/script.js:76-81`, `js/modules/home.js:64-75`
- **Current behavior:** The gallery aborts its listeners and the reveal module disconnects its observer on every `pagehide`. Neither restores those handlers on `pageshow`. A simulated persisted transition stopped a previously functioning gallery trigger from opening the dialog and allowed the original link action. Chromium did not restore a real cached page in this harness.
- **Impact:** On a browser that restores the existing document from its back/forward cache, the gallery may fall back to standalone image navigation and groups that have yet to reveal may stay hidden while scrolling.
- **Recommended direction:** Preserve the handlers and observer during persisted transitions, or restore them when a persisted page returns.
- **Verification criteria:** After a real history return with `pageshow.persisted === true`, gallery activation opens the dialog and previously unrevealed groups appear on scroll.

### [P2-03] The early-submit regression case depends on test-runner speed

- **Classification:** Maintenance risk
- **Affected area:** Functional QA, CI quality gate
- **Evidence:** `scripts/functional/contact-form.mjs:884-912`, `scripts/functional/harness.mjs` (anti-spam timing constants), `.github/workflows/ci.yml:65-66`
- **Current behavior:** The case starts timing before navigation and requires the page and all fields to be ready in under 1,800 ms. It failed before clicking Submit in both the full run and the focused retry, at 3,543 ms and 9,815 ms of setup respectively. The controlled-clock check passed against the same application code.
- **Impact:** A slow runner can fail the functional gate without exercising the behavior the case covers.
- **Recommended direction:** Control elapsed time in the scenario while leaving the production threshold intact.
- **Verification criteria:** The test passes even when navigation or field entry takes longer than two seconds of wall time, and still asserts no POST, preserved values, and a retry message inside the application window.

### [P2-04] The renovations page lacks the service route alias pair

- **Classification:** Contract mismatch
- **Affected area:** Netlify redirects, service route consistency
- **Evidence:** `_redirects:27-45`, `oferta/remonty.html:17-20`, `README.md:129-134`
- **Current behavior:** The redirect table defines 301 rules for both extensionless variants on the other five service pages. It defines neither variant for `/oferta/remonty.html`, which the current navigation and canonical URL use.
- **Impact:** The repository defines no equivalent canonical redirect for shared or manually entered renovations URLs without the extension. The actual response depends on the hosting configuration.
- **Recommended direction:** Add equivalent aliases for the renovations page and verify that the service table covers all six routes.
- **Verification criteria:** Both `/oferta/remonty` and `/oferta/remonty/` redirect to the canonical service document with the same status as the other configured service aliases.

### [P2-05] Three PWA shortcut icons declare the wrong dimensions

- **Classification:** Contract mismatch
- **Affected area:** Web manifest, installable shortcut metadata
- **Evidence:** `manifest.webmanifest:44-84`, `assets/img/shortcuts/offer-96.png`, `assets/img/shortcuts/legal-96.png`, `assets/img/shortcuts/contact-96.png`
- **Current behavior:** The three shortcut entries declare `96x96`, but Sharp reported `64x64` pixels for each referenced PNG. The checked application PNG icons and screenshots matched their declarations.
- **Impact:** Manifest consumers lack accurate dimensions when selecting artwork for Oferta, Dokumenty, and Kontakt shortcuts. Installed shortcut rendering was unverified.
- **Recommended direction:** Align each shortcut declaration with its file or supply an image at the declared size.
- **Verification criteria:** An intrinsic-dimensions check matches every size declaration for the three shortcut PNGs.

### [P2-06] Public data disclosures miss two implemented behaviors

- **Classification:** Documentation mismatch
- **Affected area:** Privacy and cookie notices
- **Evidence:** `polityka-prywatnosci.html:256-276`, `index.html:1125-1135`, `js/modules/forms.js:59-61`, `cookies.html:379-385`, `cookies.html:456-462`, `js/modules/map-consent.js:26-36`
- **Current behavior:** The privacy page's field list omits the selected service, which is serialized with the form. The cookie page says the map iframe is created only after clicking the button, while the initializer also creates it automatically when it finds saved consent. The functional suite exercised both behaviors.
- **Impact:** Visitors cannot determine from the disclosures that their service choice is included in the request or that a previously saved choice can trigger a map embed on a later page load.
- **Recommended direction:** Describe the full form payload at the user-data level and distinguish first-time map consent from reuse of saved consent.
- **Verification criteria:** The privacy field list includes the optional service. The cookie text agrees with observed map behavior for fresh, accepted, and cleared browser storage.

### [P2-07] Screen typography overrides the legal-page print rules

- **Classification:** Defect
- **Affected area:** Print layout, legal-document readability
- **Evidence:** `css/style.css:5-7`, `css/modules/utilities.css:116-156`, `css/modules/subpages.css:359-385`
- **Current behavior:** The screen stylesheet loads after the print declarations in the utilities module, and the document heading selector is more specific than the print heading selector. Under Chromium print emulation, the terms body computed to 15.2 px and its level-two headings to 20 px, while the print rules specify 12 pt and 14 pt respectively.
- **Impact:** The legal pages' printed text hierarchy depends on screen tokens instead of the intended print settings.
- **Recommended direction:** Make the legal-document print typography win the cascade for its existing selectors.
- **Verification criteria:** Print emulation on all three legal pages shows the intended body and heading sizes with navigation and footer still excluded.

## 7. Extra quality improvements

None detected.

## 8. Current readiness conclusion

**Status:** Needs important fixes

Resolve the partial-script fallback, native contact consent validation, and demo contact copy before presenting the site as a finished public portfolio project. The static site structure and the routes exercised locally provide a usable basis for those targeted corrections. Published routing, headers, form processing, and install behavior still require deployment verification.

## 9. Senior rating

**Rating:** 7/10

Shared source ownership, a complete local asset inventory, and focused accessibility, functional, and worker checks support the static demo's design. The contact and script-fallback defects affect important public interactions. The timing-sensitive regression case and the unverified production integration also limit release confidence.

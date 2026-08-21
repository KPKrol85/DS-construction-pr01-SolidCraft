# Changelog

All significant changes to this project are documented in this file.

## [Unreleased]

### Fixed

- Aligned the JavaScript navigation state with the 1024 px header breakpoint so drawer and inline navigation switch together.

### Added

- Added the initial project implementation as a dedicated repository, covering the home page, six service subpages in `oferta/`, three legal document pages in `doc/`, and the `thank-you.html`, `404.html`, and `offline.html` pages.
- Added a modular front-end source architecture with ES modules in `js/modules/` (navigation, UI core, forms, lightbox, map consent, prefetch, project banner) and CSS modules composed through `@import` in `css/style.css`.
- Added a contact form with client-side validation, `aria-invalid` error state handling, honeypot and heuristic anti-spam checks, a submit timeout, and a live status message region.
- Added a gallery and service lightbox with keyboard support for Enter/Space activation, Escape, arrow navigation, focus trap, and focus restore to the triggering element.
- Added a light/dark theme toggle with pre-render theme resolution in `js/theme-init.js` that reads the stored preference and falls back to `prefers-color-scheme`.
- Added consent-gated map embedding that injects the iframe only after user acceptance and persists the decision under the `consent.maps` key in `localStorage`.
- Added a dismissible project notice banner whose accepted state is persisted in `localStorage`.
- Added a service worker with a versioned cache name, network-first HTML handling with an `offline.html` fallback, cache-first static asset handling, and deletion of outdated caches on activation.
- Added `manifest.webmanifest` and favicon assets providing PWA install metadata.
- Added SEO metadata across pages, including canonical links, Open Graph and Twitter Card tags, JSON-LD structured data, `robots.txt`, and `sitemap.xml`.

### Changed

- **Breaking:** Replaced the MIT license with the proprietary KP_Code Proprietary Project License v1.0 and set the `license` field in `package.json` to `SEE LICENSE IN LICENSE`. Reuse, redistribution, and public deployment now require prior written permission from the copyright owner.

### Fixed

- Made the first-visit project modal keyboard-operable and reliably dismissible. It previously only flipped the `hidden` attribute: focus stayed on `<body>` while a full-viewport `role="dialog"` with `aria-modal="true"` covered the page, its accept button was the last of 54 focusable elements, Escape did nothing, the background kept scrolling because the existing `body.has-project-modal` rule was never applied by any code, and an unguarded `localStorage` write could throw before the dialog was hidden and lock the page behind the overlay. `js/modules/project-banner.js` now moves focus to `.project-modal__content` on open, applies the scroll-lock class, keeps `hidden` and `aria-hidden` synchronised, cycles Tab and Shift+Tab over the dialog's own controls resolved from the DOM, dismisses on Escape through the same routine as the accept button, restores focus to the element focused before the dialog opened, removes every listener it registered while open, and wraps both `localStorage` calls in the guarded form used elsewhere in the project, writing the flag only after the dialog is already hidden. `index.html` and the stylesheet are unchanged.
- Fixed the three legal-document links in the first-visit project modal on the home page. They pointed at `regulamin.html`, `polityka-prywatnosci.html` and `cookies.html`, which resolve against the site root where no such files exist, and returned HTTP 404. They now point at `doc/regulamin.html`, `doc/polityka-prywatnosci.html` and `doc/cookies.html`, matching the convention already used by the footer of the same page, and `npm run check:links` reports no internal failures.

### Build and Tooling

- Added a production asset pipeline that builds `css/style.min.css` with PostCSS and bundles `js/script.min.js` and `js/theme-init.min.js` with esbuild, each followed by a build verification script (`scripts/verify-css-build.js`, `scripts/verify-js-build.js`).
- Added the `dist/` deployment build (`scripts/build-dist.js`) that copies runtime files, rewrites references to minified assets, and generates the sitemap for the configured site URL.
- Added Netlify deployment configuration: `netlify.toml` with the `npm run build:dist` command and `dist` publish directory, `_redirects` for canonical paths and the 404 fallback, and `_headers` with security headers including a Content-Security-Policy.
- Added a `sharp`-based image pipeline (`scripts/images.js`) that generates responsive AVIF, WebP, and JPG variants from `assets/img-src/`.
- Added a local development workflow based on `live-server` with separate CSS and JS watch tasks, and Prettier formatting scripts.
- Made the deploy command regenerate the assets it publishes. `build:dist` is now `npm run build && node scripts/build-dist.js && npm run build:sitemap`, so the Netlify build command runs the PostCSS and esbuild steps with their verification scripts before `dist/` is assembled; previously it copied whichever `css/style.min.css`, `js/script.min.js` and `js/theme-init.min.js` happened to be committed, and a commit touching `css/modules/**` or `js/modules/**` without a local `npm run build` deployed stale assets silently. `ensureRequiredFilesExist()` in `scripts/build-dist.js` is unchanged and now checks freshly built artefacts. `qa:lhci` dropped its leading `npm run build`, which `build:dist` now performs, leaving its expanded chain identical.
- Completed the repository hygiene controls. The `.gitignore` no longer carries a duplicated "Test and report output" section — a single block now lists `/test-results/`, `/playwright-report/` and `/.lighthouseci/`. A new `.gitattributes` declares one line-ending convention for tracked text files (`* text=auto eol=lf`) and marks the binary asset extensions present in the project (`.avif`, `.ico`, `.jpg`, `.png`, `.webp`, `.woff2`) as `binary` so normalisation can never rewrite them; previously no such file existed, line endings depended on whichever tool last wrote a file, and real changes were buried in whole-file line-ending diffs. The two duplicate gallery renditions `assets/img/gallery/elec-01-2048x1536 (1).avif` and `assets/img/gallery/tilling-04-768x576 (1).avif` were removed — no page, stylesheet, script or manifest referenced them and both had non-suffixed counterparts — so they no longer ship to `dist/`. The `.gitattributes` rules apply to files already tracked only after the working tree is renormalised, which is a separate Git operation.

### Testing

- Added an accessibility QA script (`scripts/qa-a11y.mjs`) running axe-core through Playwright.
- Added internal link and HTML asset reference checkers (`scripts/check-links.mjs`, `scripts/check-html-assets.mjs`) combined into a `check:predeploy` gate together with the accessibility run.
- Added a Lighthouse CI configuration (`lighthouserc.json`) with defined quality thresholds.
- Corrected the response content types served by the QA static servers in `scripts/qa-a11y.mjs` and `scripts/check-links.mjs`, which previously returned `application/octet-stream` for every non-HTML file and caused the accessibility gate to scan a page with the stylesheet unapplied and the module script blocked by strict MIME checking. Both harnesses now resolve content types through a shared extension map in `scripts/utils/mime-types.mjs`, with `charset=utf-8` for text-based types and `application/octet-stream` kept only as the fallback for unknown extensions.

### Documentation

- Added a bilingual (Polish and English) `LICENSE` file with a prevailing-language clause and filled project, repository, and copyright fields.
- Updated the license sections of `README.md` to reference the `LICENSE` file and state the non-open-source status and the licensing contact address.
- Added bilingual (Polish and English) `README.md` documentation covering the technology stack, project structure, development and build workflows, deployment, accessibility, SEO, and maintenance rules, together with `settings.md` describing pipeline and operational rules.

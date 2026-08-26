# Changelog

All significant changes to this project are documented in this file.
Detailed implementation history lives in the Git history, not here.

## [Unreleased]

### Added

- Initial project implementation: the home page, six service subpages in `oferta/`, three legal pages in `doc/`, plus `thank-you.html`, `404.html` and `offline.html`.
- Modular front-end architecture — ES modules in `js/modules/` and CSS modules composed through `@import` in `css/style.css`.
- Contact form with client-side validation, `aria-invalid` error states, honeypot and heuristic anti-spam checks, a submit timeout and a live status region.
- Gallery and service lightbox with full keyboard support, focus trap and focus restore.
- Light/dark theme toggle with pre-render theme resolution in `js/theme-init.js`.
- Consent-gated map embedding that loads the iframe only after explicit acceptance.
- Dismissible project notice banner with persisted state.
- Service worker with versioned caches, network-first HTML with an `offline.html` fallback, and cache-first static assets.
- `manifest.webmanifest` and favicon assets providing PWA install metadata.
- SEO metadata across pages: canonical links, Open Graph and Twitter Card tags, JSON-LD, `robots.txt` and a sitemap.

### Changed

- **Breaking:** Replaced the MIT license with the KP_Code Proprietary Project License v1.0; `package.json` now declares `SEE LICENSE IN LICENSE`.
- Replaced the hand-duplicated site header and footer with build-time shared partials in `partials/`.
- Consolidated every interface icon onto the shared SVG registry in `js/modules/icons.js` — footer, contact, theme-toggle and lightbox icons all resolve from thirteen `[data-icon]` keys, the legacy `assets/img/icons/` files are gone, and the phone/e-mail icons above the home page contact form were dropped.
- Refined the home page contact section and quote form onto theme tokens, scoped so the `oferta/` pages render unchanged.
- Refined the testimonials section layout, rating summary and card behaviour in both themes.
- Refined responsive presentation details: the ghost-button backdrop, the footer map button colours, and hero title and lead widths across breakpoints.
- Cleaned up the stylesheets — obsolete comments and stray whitespace removed, with no rendering change.

### Fixed

- Kept `[data-reveal]` content visible without JavaScript while preserving reveal animations on JavaScript-enhanced pages.
- Fixed the rendering of Polish diacritics by adding the six `latin-ext` font subsets with a per-face `unicode-range`.
- Fixed the first-visit modal's three legal-document links, which returned HTTP 404.
- Made the first-visit modal keyboard-operable and reliably dismissible, with focus management, Escape handling, a focus trap and a scroll lock.
- Guarded `project-banner.js` storage access, so the modal still appears and dismisses when `localStorage` is unavailable.
- Let the contact-form submit handler own validation through `novalidate`, so the accessible error layer actually runs.
- Gave contact-form status and field-error feedback high-contrast surfaces against the orange contact section.
- Preserved contact-form input and consent when the anti-spam timing check rejects a fast submission, with a retry message.
- Bound the contact form's capture-phase trim listener to its abort signal, so reinitialisation tears it down.
- Fixed two contact-form presentation defects: a stray space before the privacy note's full stop, and required fields painted with the error border before any input.
- Aligned the JavaScript navigation state with the 1024 px header breakpoint.
- Made the offer submenu's `open` class authoritative across the mobile drawer and desktop dropdown, keeping `aria-expanded` truthful.
- Bound button labels to a theme-stable on-brand foreground token, restoring WCAG AA contrast in both themes.
- Made `404.html` and `offline.html` URL-depth independent by resolving their references from the site root.
- Removed the duplicate `<title>` element from `404.html`, so the document exposes exactly one title: `404 — Strona nie została znaleziona | SolidCraft`.
- Made each service-gallery anchor the sole lightbox trigger, removing the nested tab stop.
- Gave the lightbox an accessible structure matching its `aria-modal` contract, and kept each thumbnail's descriptive `alt`.
- Resolved the conflict between the lightbox's passive double-tap listener and its `preventDefault()` call.
- Stopped ScrollSpy from accumulating `scrollend` listeners during a scroll gesture.
- Corrected the `.ft-contact-icon` width declaration.
- Completed the service-worker precache contract and tied runtime cache writes to the fetch event's lifetime.
- Fixed the service-worker runtime cache write-back, so successful same-origin responses are actually stored.
- Made the development Service Worker network-only, so a local edit is never shadowed by a cached copy.
- Bound the Service Worker lifecycle promises to their events: `install` now stays alive until both the precache and `self.skipWaiting()` have settled, and `activate` until both the old-cache cleanup and `self.clients.claim()` have settled. The `solidcraft-v` cache namespace, its cleanup filtering and the fetch strategy are unchanged, and a focused lifecycle gate (`npm run qa:sw`) now covers the contract.
- Removed the seven speculative `modules/*.css` 404s from the development and accessibility-QA rendering.
- Aligned the published business identity with the project's demonstrational purpose: the fictitious `GeneralContractor` JSON-LD was removed from all 11 pages that carried it, and sample content is now marked as such.
- Aligned the privacy and cookie disclosures in `doc/` with the implemented data contract: the contact form is described by its actual `name`, `phone`, `msg` and `consent` fields on the Netlify Forms path instead of an e-mail address, the three `localStorage` keys (`theme`, `consent.maps`, `project-banner-accepted`) are documented individually, unsupported analytics and `sessionStorage` claims were removed, and Google Maps is described as user-triggered external content whose provider may then apply its own storage mechanisms.

### Build and Tooling

- Added a production asset pipeline: PostCSS for CSS and esbuild for JS, each followed by a build-verification script.
- Added the `dist/` deployment build (`scripts/build-dist.js`) and Netlify configuration — `netlify.toml`, `_redirects`, and `_headers` with a Content-Security-Policy.
- Made the deploy command regenerate the assets it publishes, and moved the minified output out of the source tree into `dist/`.
- Added a `sharp`-based responsive image pipeline (`scripts/images.js`) producing AVIF, WebP and JPG variants.
- Added the local development workflow with CSS/JS watch tasks and Prettier scripts.
- Made `npm run dev` render the shared partials through `scripts/dev-server.mjs`.
- Moved the Service Worker cache version and precache list from hand maintenance into the production build (`npm run build:sw`).
- Consolidated the sitemap onto a single generated source of truth.
- Stopped the local `.claude/` and `.codex/` worktree directories from being discovered as production content.
- Completed the repository hygiene controls: consolidated `.gitignore`, added `.gitattributes` normalising tracked text files to LF, and removed two duplicate gallery renditions.
- Standardised the npm package identity as `ds-construction-pr01-solidcraft`.
- Added a GitHub Actions CI workflow (`CI / quality-gate`) running `check:predeploy` and `qa:functional` on `main` and pull requests.
- Normalised repository formatting; `npm run format:check` now passes across the repository.
- Cleared the development and CI toolchain of its critical and high advisories: compatible lockfile re-resolution plus a controlled `sharp` 0.35 upgrade, `live-server` replaced by a dependency-free native Node development server (`scripts/dev-server.mjs`), and `@lhci/cli` replaced by direct Lighthouse 13 tooling (`scripts/qa-lighthouse.mjs` with `lighthouse.config.json`) that keeps the three audited URLs and all four category thresholds unchanged; Lighthouse report output no longer reaches `dist/`, the sitemap, the Service Worker precache or the HTML checks. The Node baseline is now `>=22.19.0`, `npm audit` reports 0 critical, 0 high, 1 moderate and 1 low, and the build, HTML, accessibility, functional, image and Lighthouse contracts all pass.

### Testing

- Added an accessibility QA script (`scripts/qa-a11y.mjs`) running axe-core through Playwright.
- Added internal link and HTML asset reference checkers, combined with the accessibility run into the `check:predeploy` gate.
- Added a Lighthouse quality gate with defined category thresholds (`lighthouse.config.json`).
- Corrected the content types served by the QA static servers, which had made the accessibility gate scan an unstyled, script-less page.
- Extended `qa:a11y` coverage to every maintained service and legal page — 12 routes.
- Added a functional browser suite (`scripts/qa-functional.mjs`, nine scenarios) on the Playwright dependency already declared.

### Documentation

- Added bilingual (Polish and English) `README.md` documentation covering the stack, structure, workflows, deployment, accessibility, SEO and maintenance, together with `settings.md` for pipeline and tooling rules.
- Added a bilingual `LICENSE` with a prevailing-language clause, and updated the README license sections to match.
- Synchronised the canonical documents with the implementation they describe.
- Simplified the active documentation set: `AUDIT.md` now records only open findings and current readiness, `PLAN.md` only the current plan state, and `CHANGELOG.md` only short outcome notes — detailed implementation history stays in Git.

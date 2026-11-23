# Changelog

All significant changes to SolidCraft are documented in this file.

## Entry policy

A change is significant when a future maintainer or the project owner would reasonably need to know that one of the following changed:

- user-visible behavior, including meaningful UI, UX, or public content changes;
- accessibility behavior or accessibility contracts;
- build behavior, build guards, or npm scripts;
- test infrastructure or verification tooling;
- the dependency set;
- deployment or hosting workflow;
- PWA, service-worker, cache, or offline behavior;
- architecture, sources of truth, or important project maintenance contracts.

Judge by impact, not by file count. A small visual change is recorded when it affects behavior, accessibility, or a shared component contract. Editing a file alone does not justify an entry.

Not recorded: improvement-report status updates and archiving, commit-only or tracking-document changes, temporary verification probes, minor internal documentation corrections, and isolated cosmetic adjustments without broader impact.

For each implementation task, determine `Changelog: yes` or `Changelog: no`. Add entries only when authorized within the approved task scope.

## [Unreleased]

### Added

- Created the home page, six service pages, three legal pages, and supporting status pages.
- Established modular JavaScript ES modules and composed CSS architecture.
- Implemented a contact form with accessible validation, anti-spam protection, and submission feedback.
- Added keyboard-accessible gallery and lightbox interactions with focus management.
- Introduced light/dark theme switching with pre-render theme resolution.
- Added consent-gated Google Maps embedding.
- Added a dismissible project notice with persisted dismissal state.
- Implemented a Service Worker with versioned caching and offline fallback.
- Added PWA installation metadata and favicon assets.
- Established cross-page SEO metadata, structured data, robots rules, and sitemap support.

### Changed

- Replaced the MIT license with the KP_Code Proprietary Project License v1.0 and aligned `package.json` (**breaking**).
- Replaced duplicated header and footer markup with build-time shared partials.
- Consolidated interface icons into a shared SVG registry and removed legacy assets and redundant contact icons.
- Aligned the home contact section and quote form with shared theme tokens.
- Clarified that the contact form reaches KP_Code Digital Studio and identified SolidCraft's construction offers and quotation timelines as illustrative.
- Refined testimonial layouts, rating summaries, and card presentation across themes.
- Refined responsive hero typography, ghost buttons, and footer map controls.
- Moved legal pages to the project root, updated active references, and preserved legacy URLs through 301 redirects.
- Consolidated shared font preloads and favicon/application metadata into reusable HTML partials.
- Consolidated same-page scroll-to-top handling into a single owner, eliminating redundant history entries and preserving native modified clicks on home-page top links.
- Centralized header-height publication to `--header-h` and its cache in the shared utility module.
- Established the Measured Craft material and accent system, reserving amber for actions, states, focus, and section markers and aligning theme and PWA colors with the palette.
- Established an editorial typography hierarchy with display, text, and utility voices from the existing font pair, start-aligned section heads, and a shared reading measure for leads.
- Replaced the home hero and service-card photography with approved workmanship images, moved service image variants to `assets/img/services/`, updated their descriptions, and gave the light-theme hero an off-white title and light secondary action over a deeper scrim.
- Replaced the 36 service-gallery photographs with approved workmanship illustrations in per-service `assets/img/gallery/` directories, updated their descriptions and demonstrational gallery wording, and added scoped forced regeneration and output-collision checks to the image pipeline.
- Refined the home hero with improved text and focus contrast, a motion-aware Craft Spotlight, and pipeline-generated portrait imagery with optimized preloads.
- Recomposed the home service range as an editorial index led by turnkey renovations, with numbered specialty rows, structured data in display order, and service images that link to the quote form instead of opening the lightbox.
- Recomposed the six service pages with an image-led opening, a numbered scope matrix, and a lead-image gallery whose responsive sources now request images sized to their rendered widths.
- Recomposed the closing sequence with contact facts beside a dominant quote form, a quieter footer that replaces the separate contact bar with a compact reference, and matching service-page and status-page closings.
- Recast the home sample logos and testimonials as one quiet proof band with an optically balanced monochrome logo strip legible in every theme, a featured pull quote above three supporting quotes, and no mid-page form link.
- Reserved entrance motion for section heads and single content groups with one short upward fade, keeping the hero, service-page openings, primary actions, contact form, and footer static and revealing a group as soon as it receives keyboard focus.
- Replaced the runtime-created hidden service field with a visible, optional service select in the static quote-form markup, prefilled from both quote CTAs on every service page and from the home service-index image links.
- Reported every invalid contact-form field, including the phone format, in a single validation pass with a summary that counts the fields to correct.
- Extended the service-gallery lightbox with each image's authored caption and gallery position, announced politely to assistive technology without moving focus.
- Marked the current service in header navigation and restored service-page submenu interactions and desktop Escape focus restoration.
- Exposed the contact message length limit with a remaining-character count and accessible feedback for reached limits and truncated pastes.
- Made image enlargement explicit in the six service galleries with a permanent hint under each introduction and a zoom cursor on hover-capable pointers.
- Aligned the legal-page heading, contents, and article to one shared reading column and gutter, letting the print rule give the article the full page width.
- Adapted contact-form status notices and field errors to the dark theme with navy-tinted surfaces, light text, and semantic borders, keeping the light-theme palette unchanged.

### Fixed

- Restored native contact-form validation for required fields and consent whenever the enhanced submit handler is unavailable.
- Restored keyboard-accessible mobile navigation and visible page content when the main script fails.
- Preserved reveal content without JavaScript while retaining progressive animations.
- Restored Polish diacritics through six `latin-ext` font subsets.
- Corrected broken legal-document links in the first-visit modal.
- Made the first-visit modal keyboard-operable with focus management, Escape dismissal, and scroll locking.
- Protected project notice dismissal when `localStorage` is unavailable.
- Enabled accessible contact-form validation through `novalidate`.
- Improved contrast for contact-form status and field-error feedback.
- Preserved contact-form input and consent after anti-spam timing rejections.
- Bound the contact-form trim listener to its abort signal for reliable reinitialization.
- Prevented premature error styling on required contact-form fields.
- Aligned navigation behavior with the 1024 px header breakpoint.
- Synchronized offer submenu state and `aria-expanded` across mobile and desktop navigation.
- Restored WCAG AA contrast for button labels in both themes.
- Resolved `404.html` and `offline.html` asset paths independently of URL depth.
- Removed the duplicate `<title>` element from `404.html`.
- Corrected lightbox focus order and modal semantics while preserving descriptive thumbnail text.
- Resolved conflicting passive double-tap handling in the lightbox.
- Prevented ScrollSpy from accumulating `scrollend` listeners.
- Completed Service Worker precache handling and restored runtime caching of successful same-origin responses.
- Made the development Service Worker network-only to prevent stale local content.
- Preserved Service Worker `install` and `activate` event lifetimes throughout asynchronous lifecycle operations.
- Eliminated invalid CSS module requests during development and accessibility QA.
- Removed fictitious `GeneralContractor` structured data and identified sample business content as demonstrational.
- Synchronized the structured-data service list on service, legal, and 404 pages with the six-service home index.
- Corrected privacy and cookie disclosures to reflect actual form fields, storage keys, and consent-gated maps.
- Corrected canonical, social, structured-data, and robots sitemap URLs to the current production domain.

### Build and Tooling

- Removed the superseded `watch:css` and `watch:js` commands from the local workflow.
- Added an optional `DEV_SERVER_PORT` override for parallel development previews with strict validation and no fallback on port conflicts.
- Extended Prettier formatting and validation to `.mjs` tooling scripts.
- Made `npm run build` recreate the complete deployment artifact in `dist/` and retained `build:dist` as a backward-compatible alias.
- Added PostCSS and esbuild production pipelines with asset verification.
- Introduced `dist/` deployment builds and Netlify configuration with redirects, security headers, and CSP.
- Made deployment regenerate bundled assets and publish minified output from `dist/`.
- Added responsive AVIF, WebP, and JPG image generation through `sharp`.
- Established local CSS/JS watch tasks and formatting workflows.
- Enabled shared partial rendering through `npm run dev`.
- Automated Service Worker versioning and precache generation during production builds.
- Centralized sitemap generation.
- Excluded `.claude/` and `.codex/` worktrees from production content discovery.
- Consolidated source-HTML discovery for production staging and sitemap generation into a shared utility.
- Standardized Git ignore rules and LF normalization through `.gitattributes`.
- Standardized the npm package identity as `ds-construction-pr01-solidcraft`.
- Added GitHub Actions CI checks for predeployment and functional verification.
- Added the `qa:sw` Service Worker lifecycle and fetch-strategy suite to GitHub Actions CI as a separate step.
- Upgraded `sharp` to 0.35 and replaced legacy development and Lighthouse tooling, eliminating critical and high dependency advisories.
- Raised the Node.js baseline to `>=22.19.0`.
- Excluded Lighthouse reports from production deployment artifacts.
- Enforced canonical responsive image generation and removed 60 obsolete outputs totaling approximately 4.57 MB.

### Testing

- Added Playwright and axe-core accessibility scanning.
- Added internal-link and HTML asset checks to the `check:predeploy` gate.
- Introduced Lighthouse quality thresholds.
- Corrected QA server content types to ensure CSS and JavaScript load during accessibility scans.
- Extended accessibility coverage to 12 maintained routes.
- Made accessibility scans deterministic across 13 routes in both themes and both home-page modal states, failing on unsettled reveal content or unexpected theme and modal state.
- Added nine functional browser scenarios using Playwright.
- Added `qa:sw` verification for Service Worker lifecycle behavior.
- Extended `qa:sw` with regression tests for Service Worker fetch strategies, offline fallbacks under simulated network loss, runtime-cache filtering, and non-GET bypass.
- Added functional regression scenarios for the first-visit project modal covering focus trapping, Escape and accept-button dismissal, persisted acceptance, and unavailable `localStorage`.
- Added a functional regression scenario for the consent-gated map embed covering pre-consent request absence, iframe insertion, persisted consent, and unavailable `localStorage`, with Google requests aborted locally.
- Scoped `check:links` and `check:assets` to the shared source-HTML discovery used by `build:dist`, excluding agent worktree copies from local validation.
- Added functional regression scenarios for the home service index covering entry order, quote and service-page link targets, keyboard order, and the absence of home lightbox triggers.

### Documentation

- Added bilingual README documentation and technical development settings.
- Published a bilingual proprietary license with a prevailing-language clause.
- Simplified active audit, plan, and changelog records to emphasize current state and verified outcomes.
- Documented SIL Open Font License 1.1 terms and licensing evidence for twelve bundled Montserrat and Poppins fonts.
- Relocated project-maintenance documentation under `docs/` and archived the completed technical audit.

# Pipeline & Tooling Settings

## Purpose

This file is the canonical source of truth for the Solidcraft build/development pipeline and tooling behavior.

## Tooling Overview

- Runtime baseline: Node.js `>=18`.
- Local dev server: `live-server`.
- CSS pipeline: PostCSS (`postcss-import`, `postcss-preset-env`, `autoprefixer`, `cssnano`) via `postcss-cli`.
- JS pipeline: `esbuild` (bundle + minify, target `es2018`, format `iife`).
- Image pipeline: `sharp` via `scripts/images.js`.
- Formatting: `prettier`.

## Scripts

- `start`: alias for `dev`.
- `dev`: serves project locally on port `15500`, opens `index.html`.
- `build:css`: builds `css/style.min.css` and verifies no `@import` remains.
- `build:js`: builds `js/script.min.js` and verifies no `import`/`export` remains.
- `build`: runs `build:css` and `build:js`.
- `build:sitemap`: scans real HTML pages and generates `dist/sitemap.xml`.
- `watch:css`: watches `css/style.css` and rebuilds `css/style.min.css`.
- `watch:js`: watches `js/script.js` and rebuilds `js/script.min.js`.
- `build:dist`: runs `build` to regenerate the minified assets, then creates `dist/`, copies runtime files, rewrites HTML references to minified assets, and finally runs `build:sitemap` to generate `dist/sitemap.xml`.
- `images:build`: generates production images from `assets/img-src` into `assets/img`.
- `images:clean`: removes generated image outputs.
- `check:links`: validates broken internal/external links and missing anchors across all HTML files.
- `check:assets`: validates local asset references in HTML (`img/src`, `script/src`, `link[href]`, `source/srcset`, `img/srcset`).
- `check:html`: runs `check:links` and `check:assets`.
- `qa:a11y`: runs axe-based accessibility scans in a headless browser on key pages.
- `check:predeploy`: runs `check:html` and `qa:a11y` as the local pre-deploy gate.
- `format`: applies Prettier writes.
- `format:check`: validates formatting without writes.

## Source vs Generated Assets

- Source assets (editable):
  - `css/style.css`
  - `js/script.js`
  - `js/theme-init.js`
  - `assets/img-src/**`
- Generated assets (pipeline outputs):
  - `css/style.min.css`
  - `js/script.min.js`
  - `js/theme-init.min.js`
  - `assets/img/**` (from `images:build`)
- Rule: modify non-minified/source files; regenerate minified and derived artifacts via scripts.

## QA / Validation

- CSS validation is embedded in `build:css` through `scripts/verify-css-build.js`.
- JS validation is embedded in `build:js` through `scripts/verify-js-build.js`.
- `build:dist` regenerates the minified assets through `build` before assembling `dist/`, and still fails if a required production asset is missing at that point (`css/style.min.css`, `js/script.min.js`, `js/theme-init.min.js`).
- `format:check` is the formatting gate.
- A11y validation: `npm run qa:a11y` fails on `serious`/`critical` axe impacts, while `minor`/`moderate` are reported only.
- Run local pre-deploy regressions with `npm run check:predeploy`.

## Deployment Notes

- Deployment artifact is `dist/`, produced by `npm run build:dist`.
- The asset build is part of the deploy build: `build:dist` runs `npm run build` first, so `css/style.min.css`, `js/script.min.js` and `js/theme-init.min.js` are regenerated from the current sources on every deploy instead of being published as committed.
- Sitemap generation is part of deploy build (`npm run build:dist`) via `npm run build:sitemap`.
- `build:sitemap` requires `SITE_URL` (for example: `SITE_URL=https://example.com npm run build:sitemap`) and exits non-zero if missing.
- `build:sitemap` includes real `.html` pages discovered from source and excludes non-indexable pages by default: `404.html`, `offline.html`, `thank-you.html`.
- `build:dist` copies all HTML files plus required runtime assets and selected optional files (`_headers`, `_redirects`, `netlify.toml`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `sw.js`, `js/sw-register.js`, `assets/`).
- During `dist` build, HTML references are rewritten from source assets to minified assets.

## Logging Hygiene (tooling scripts)

- Tooling scripts use `scripts/utils/logger.js`.
- Default output is concise (summary/errors).
- Verbose logs are opt-in via `--verbose` or `VERBOSE=1`.

## Single Source of Truth

Pipeline/tooling documentation lives only in `settings.md`. Keep pipeline notes out of separate docs to avoid drift.

# Solid Craft

## PL

### Przegląd projektu

Solid Craft to statyczny serwis WWW firmy remontowo-budowlanej, zbudowany jako projekt wielostronicowy w oparciu o HTML, CSS i JavaScript. Repozytorium zawiera stronę główną, podstrony ofertowe, strony dokumentów (regulamin, polityka prywatności, cookies), stronę potwierdzenia formularza oraz strony błędów/offline.

### Kluczowe funkcje

- Wielostronicowa struktura z nawigacją do sekcji strony głównej i podstron usług.
- Formularz kontaktowy z walidacją po stronie klienta, ochroną antyspamową (honeypot + heurystyki) i komunikatami statusu.
- Lightbox galerii/oferty z obsługą klawiatury (Enter/Spacja, Escape, strzałki, trap focus).
- Przełącznik motywu (light/dark) z inicjalizacją motywu przed renderem i zapisem preferencji.
- Ładowanie mapy po zgodzie użytkownika z utrwaleniem decyzji w `localStorage`.
- Rejestracja Service Workera, cache statycznych zasobów i strona `offline.html`.

### Stack technologiczny

**Runtime (frontend)**

- HTML5
- CSS3 (moduły CSS scalane przez `@import`)
- JavaScript (ES modules w źródłach)

**Tooling i build**

- Node.js `>=18`
- PostCSS (`postcss-import`, `postcss-preset-env`, `autoprefixer`, `cssnano`)
- esbuild (bundling i minifikacja JS do IIFE)
- sharp (pipeline obrazów)
- live-server (lokalny serwer developerski)
- Prettier (formatowanie)
- Playwright + axe-core (skrypty QA dostępności)
- Lighthouse CI (`@lhci/cli`)

### Struktura projektu

```text
pr-01-solidcraft/
├─ index.html
├─ oferta/*.html
├─ doc/*.html
├─ 404.html
├─ offline.html
├─ thank-you.html
├─ css/
│  ├─ style.css
│  ├─ style.min.css
│  └─ modules/*.css
├─ js/
│  ├─ script.js
│  ├─ theme-init.js
│  ├─ *.min.js
│  └─ modules/*.js
├─ assets/
│  ├─ img/
│  └─ img-src/
├─ scripts/
│  ├─ build-dist.js
│  ├─ generate-sitemap.mjs
│  ├─ qa-a11y.mjs
│  ├─ check-links.mjs
│  ├─ check-html-assets.mjs
│  └─ images.js
├─ sw.js
├─ manifest.webmanifest
├─ robots.txt
├─ sitemap.xml
├─ netlify.toml
└─ package.json
```

### Instalacja i konfiguracja

```bash
npm install
```

Wymagania:

- Node.js w wersji `>=18`

### Development lokalny

```bash
npm run dev
```

Aplikacja startuje lokalnie przez `live-server` na porcie `15500`.

Dostępne workflow developerskie:

```bash
npm run watch:css
npm run watch:js
npm run check:html
npm run qa:a11y
```

### Build produkcyjny

Budowa assetów produkcyjnych:

```bash
npm run build
```

Budowa artefaktu wdrożeniowego `dist/` (kopiowanie plików runtime, podmiana odwołań na minifikowane assety, generacja sitemap):

```bash
npm run build:dist
```

### Deployment

Repozytorium zawiera konfigurację Netlify:

- `netlify.toml` ustawia komendę build: `npm run build:dist`
- katalog publikacji: `dist`

### Dostępność

W projekcie zaimplementowano m.in.:

- skip link do głównej treści,
- atrybuty ARIA w nawigacji, formularzu i komponentach interaktywnych,
- obsługę klawiatury w lightboxie,
- skrypt QA oparty o axe-core uruchamiany przez Playwright (`npm run qa:a11y`).

### SEO

Wdrożone elementy SEO obejmują:

- `title`, `meta description`, `canonical`, `robots`,
- Open Graph i Twitter Card,
- dane strukturalne JSON-LD (`GeneralContractor`, `WebSite`, `CollectionPage`, `FAQPage`),
- `robots.txt`, `sitemap.xml` oraz generator sitemap dla buildu `dist`.

### Wydajność

W kodzie występują jawne mechanizmy wspierające wydajność:

- pipeline minifikacji CSS/JS,
- preload kluczowego obrazu hero i fontów,
- responsywne obrazy (`srcset`, AVIF/WebP/JPG),
- `loading="lazy"` dla osadzanej mapy,
- skrypt `prefetch` dla podstron oferty,
- konfiguracja Lighthouse CI z progami jakości.

### Utrzymanie projektu

- Edytuj pliki źródłowe (`css/style.css`, `js/script.js`, `js/theme-init.js`, `assets/img-src/**`), a następnie regeneruj artefakty minifikowane/skompilowane.
- Logika frontendu jest podzielona na moduły w `js/modules/` (nawigacja, UI core, formularze, lightbox, map consent, prefetch).
- Skrypty kontroli jakości i buildu znajdują się w `scripts/`.
- Zasady pipeline i operacyjne informacje utrzymaniowe są opisane w `settings.md`.

### Roadmap

- Rozszerzenie testów automatycznych o scenariusze funkcjonalne (np. formularz, lightbox, nawigacja) z wykorzystaniem istniejącego zaplecza Playwright.
- Integracja `check:predeploy` jako obowiązkowej bramki w workflow CI.
- Rozszerzenie pokrycia `qa:a11y` o wszystkie podstrony oferty i dokumentów.
- Uporządkowanie i automatyzacja wersjonowania cache Service Workera w procesie build.

### Licencja

Projekt jest oznaczony jako `MIT` w `package.json`.

## EN

### Project Overview

Solid Craft is a static website for a construction and renovation company, implemented as a multi-page frontend project using HTML, CSS, and JavaScript. The repository includes a home page, service subpages, legal pages (terms, privacy policy, cookies), a form confirmation page, and error/offline pages.

### Key Features

- Multi-page structure with navigation to home-page sections and service subpages.
- Contact form with client-side validation, anti-spam protection (honeypot + heuristics), and status messaging.
- Gallery/service lightbox with keyboard support (Enter/Space, Escape, arrow keys, focus trap).
- Light/dark theme toggle with pre-render theme initialization and persisted preference.
- Consent-gated map loading with decision persistence in `localStorage`.
- Service Worker registration, static asset caching, and an `offline.html` fallback page.

### Tech Stack

**Runtime (frontend)**

- HTML5
- CSS3 (CSS modules composed via `@import`)
- JavaScript (ES modules in source files)

**Tooling and build**

- Node.js `>=18`
- PostCSS (`postcss-import`, `postcss-preset-env`, `autoprefixer`, `cssnano`)
- esbuild (JS bundling and minification to IIFE)
- sharp (image pipeline)
- live-server (local development server)
- Prettier (formatting)
- Playwright + axe-core (accessibility QA scripts)
- Lighthouse CI (`@lhci/cli`)

### Project Structure

```text
pr-01-solidcraft/
├─ index.html
├─ oferta/*.html
├─ doc/*.html
├─ 404.html
├─ offline.html
├─ thank-you.html
├─ css/
│  ├─ style.css
│  ├─ style.min.css
│  └─ modules/*.css
├─ js/
│  ├─ script.js
│  ├─ theme-init.js
│  ├─ *.min.js
│  └─ modules/*.js
├─ assets/
│  ├─ img/
│  └─ img-src/
├─ scripts/
│  ├─ build-dist.js
│  ├─ generate-sitemap.mjs
│  ├─ qa-a11y.mjs
│  ├─ check-links.mjs
│  ├─ check-html-assets.mjs
│  └─ images.js
├─ sw.js
├─ manifest.webmanifest
├─ robots.txt
├─ sitemap.xml
├─ netlify.toml
└─ package.json
```

### Setup and Installation

```bash
npm install
```

Requirements:

- Node.js `>=18`

### Local Development

```bash
npm run dev
```

The app runs locally via `live-server` on port `15500`.

Available development workflows:

```bash
npm run watch:css
npm run watch:js
npm run check:html
npm run qa:a11y
```

### Production Build

Build production assets:

```bash
npm run build
```

Build the deployable `dist/` artifact (copy runtime files, rewrite references to minified assets, generate sitemap):

```bash
npm run build:dist
```

### Deployment

The repository includes Netlify deployment configuration:

- `netlify.toml` build command: `npm run build:dist`
- publish directory: `dist`

### Accessibility

Implemented accessibility-related elements include:

- skip link to main content,
- ARIA attributes in navigation, form, and interactive components,
- keyboard support in the lightbox,
- axe-core based QA script executed through Playwright (`npm run qa:a11y`).

### SEO

Implemented SEO elements include:

- `title`, `meta description`, `canonical`, `robots`,
- Open Graph and Twitter Card metadata,
- JSON-LD structured data (`GeneralContractor`, `WebSite`, `CollectionPage`, `FAQPage`),
- `robots.txt`, `sitemap.xml`, and sitemap generation for the `dist` build.

### Performance

The codebase includes explicit performance-related mechanisms:

- CSS/JS minification pipeline,
- preload for the hero image and fonts,
- responsive images (`srcset`, AVIF/WebP/JPG),
- `loading="lazy"` for the embedded map,
- `prefetch` script for service subpages,
- Lighthouse CI configuration with quality thresholds.

### Project Maintenance

- Edit source files (`css/style.css`, `js/script.js`, `js/theme-init.js`, `assets/img-src/**`), then regenerate minified/compiled artifacts.
- Frontend logic is split into modules in `js/modules/` (navigation, UI core, forms, lightbox, map consent, prefetch).
- Quality-control and build scripts are located in `scripts/`.
- Pipeline and maintenance operational rules are documented in `settings.md`.

### Roadmap

- Extend automated tests with functional scenarios (e.g., form, lightbox, navigation) using the existing Playwright setup.
- Integrate `check:predeploy` as a required gate in CI workflows.
- Expand `qa:a11y` coverage to all service and legal subpages.
- Improve and automate Service Worker cache versioning in the build process.

### License

The project is declared as `MIT` in `package.json`.

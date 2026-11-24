# SolidCraft

## PL

### Przegląd projektu

SolidCraft to statyczny, wielostronicowy serwis WWW firmy remontowo-budowlanej, zbudowany w oparciu o HTML, CSS i JavaScript, bez frameworka frontendowego. Repozytorium zawiera stronę główną, sześć podstron usług w `oferta/`, trzy strony dokumentów w katalogu głównym (`regulamin.html`, `polityka-prywatnosci.html`, `cookies.html`) oraz strony `thank-you.html`, `404.html` i `offline.html`. Językiem interfejsu jest polski (`lang="pl"`).

Serwis ma charakter demonstracyjny i jest tak oznaczony w treści: modal na pierwszej wizycie wskazuje KP_Code Digital Studio jako autora przykładowej realizacji, a sekcje z logotypami klientów i opiniami są opisane jako przykładowe. Repozytorium nie zawiera backendu ani bazy danych; warstwa serwerowa ogranicza się do konfiguracji hostingu statycznego.

Współdzielony nagłówek i stopka mają jedno źródło w `partials/` i są rozwijane do pełnych dokumentów HTML na etapie buildu — w przeglądarce nie zachodzi żadne składanie stron.

### Wersja online

Adres skonfigurowany jako `homepage` w `package.json` oraz jako adres kanoniczny stron: <https://ds-construction-pr01-solidcraft.netlify.app/>

### Kluczowe funkcje

- Wielostronicowa nawigacja ze wspólnym nagłówkiem z `partials/header.html`: rozwijane podmenu oferty, wersja mobilna (`aria-expanded`, obsługa klawiatury) i podświetlanie aktywnej sekcji (scroll spy).
- Formularz kontaktowy z `novalidate` i własną warstwą walidacji: maska i weryfikacja polskiego numeru telefonu, komunikaty błędów powiązane przez `aria-describedby`, `aria-invalid` oraz obszar statusu `role="status"`.
- Ochrona antyspamowa formularza: ukryte pole honeypot (`bot-field`), odrzucenie zgłoszeń wysłanych w mniej niż 2 sekundy z zachowaniem wpisanych danych, heurystyka treści i limit czasu wysyłki 10 s.
- Lightbox dla kart oferty i galerii realizacji: `role="dialog"`, `aria-modal`, obsługa Enter/Spacji, Escape, strzałek, pułapka fokusa i przywrócenie fokusa do elementu wywołującego.
- Przełącznik motywu jasny/ciemny z rozstrzygnięciem motywu przed renderem (`js/theme-init.js`) i zapisem preferencji w `localStorage`.
- Modal informacyjny o demonstracyjnym charakterze serwisu: pułapka fokusa, obsługa Escape, blokada przewijania i praca również przy niedostępnym `localStorage`.
- Mapa Google osadzana dopiero po zgodzie użytkownika, z zapamiętaniem decyzji w `localStorage`.
- Wspólny rejestr ikon SVG (`js/modules/icons.js`) — 13 kluczy `[data-icon]` podstawianych w czasie działania, bez plików ikon w `assets/`.
- Rejestracja Service Workera, precache powłoki aplikacji i strona zastępcza `offline.html`.
- Prefetch podstron oferty przy najechaniu lub fokusie, wyłączany przy `Save-Data` i wolnych połączeniach.

### Stack technologiczny

**Runtime (frontend)**

- HTML5 z buildowym rendererem partiali (`@layout`, `@include`, `{{token}}`, `{{#if}}`)
- CSS3 — moduły w `css/modules/` scalane przez `@import` w `css/style.css`
- JavaScript (ES modules) — `js/script.js` i moduły w `js/modules/`

**Tooling i build**

- Node.js `>=22.19.0` (pole `engines`)
- PostCSS z `postcss-cli` (`postcss-import`, `postcss-preset-env` stage 3, `autoprefixer`, `cssnano`)
- esbuild (bundling i minifikacja JS, target `es2018`, format `iife`)
- sharp (generowanie wariantów obrazów)
- natywny serwer deweloperski Node.js (`scripts/dev-server.mjs`, bez zależności zewnętrznych)
- Prettier (formatowanie)
- Playwright + axe-core (QA dostępności i funkcjonalne testy przeglądarkowe)
- Lighthouse (`lighthouse` + `chrome-launcher`, uruchamiany przez `scripts/qa-lighthouse.mjs`)
- cross-env (przekazanie `SITE_URL` do generatora sitemapy)
- GitHub Actions (jeden workflow `CI`)

### Architektura

- Każda utrzymywana strona jest osobnym dokumentem HTML z własnymi metadanymi i danymi strukturalnymi. Wspólny nagłówek i stopka są dołączane dyrektywami `<!-- @layout … -->` i `<!-- @include partials/… -->`, a renderer `scripts/utils/partials.js` rozwija je przy buildzie, w serwerze developerskim i w skryptach kontrolnych.
- Renderer jest bramką jakości: przerywa pracę przy brakującym partialu, nieopisanej zmiennej `{{…}}`, zdublowanym lub niepoprawnym `@layout`, `@include` wychodzącym poza `partials/`, cyklu dołączeń oraz przy dyrektywie lub tokenie pozostałym po renderowaniu.
- CSS jest podzielony na moduły (`tokens`, `base`, `layout`, `components`, `sections`, `utilities`, `subpages`) scalane przez `@import`; build PostCSS rozwija je do jednego pliku `dist/css/style.min.css`.
- JavaScript jest podzielony na moduły ES (`nav`, `ui-core`, `icons`, `forms`, `lightbox`, `map-consent`, `prefetch`, `home`, `project-banner`, `utils`). `js/script.js` eksponuje je w przestrzeni `window.SC` i uruchamia inicjalizatory warunkowo, na podstawie obecności selektorów na stronie.
- `js/theme-init.js` jest ładowany synchronicznie w `<head>`, aby ustawić motyw przed pierwszym renderem; `js/sw-register.js` rejestruje Service Workera w zakresie `/`.
- Drzewo źródłowe nie zawiera artefaktów produkcyjnych: minifikowany CSS i JS powstają wyłącznie w `dist/`, a `.gitignore` blokuje `/css/*.min.css` i `/js/*.min.js`.
- `sw.js` w katalogu głównym jest źródłem logiki runtime; blok między znacznikami `build:sw-manifest` (wersja cache i lista precache) jest własnością buildu.

### Struktura projektu

```text
DS-construction-pr01-SolidCraft/
├── index.html                   # strona główna
├── 404.html, offline.html, thank-you.html
├── regulamin.html, polityka-prywatnosci.html, cookies.html   # strony dokumentów
├── oferta/                      # 6 podstron usług
├── partials/                    # wspólne fragmenty layoutu (źródło nagłówka i stopki)
├── css/                         # style.css i moduły w css/modules/
├── js/                          # script.js, theme-init.js, sw-register.js i moduły w js/modules/
├── assets/                      # fonts/, img-src/ (obrazy źródłowe), img/ (warianty z sharp)
├── scripts/                     # build, serwer deweloperski, walidacja i QA
├── .github/workflows/           # workflow CI
├── docs/                        # settings.md, CHANGELOG.md, archive/
├── dist/                        # wynik buildu, nietrackowany w Git
├── sw.js, manifest.webmanifest, robots.txt
├── _headers, _redirects, netlify.toml
├── lighthouse.config.json, postcss.config.js
├── LICENSE.md
└── package.json
```

### Instalacja

```bash
npm install
```

Wymagania: Node.js w wersji `>=22.19.0`. Wszystkie zależności są zależnościami deweloperskimi — runtime strony nie korzysta z pakietów npm.

### Development lokalny

```bash
npm run dev
```

Serwer deweloperski działa pod adresem `http://127.0.0.1:15500/`, renderuje partiale przy każdym żądaniu HTML i automatycznie odświeża stronę po zapisie pliku. Serwer HTTP jest konieczny — strony korzystają z modułów ES, Service Workera i manifestu wskazywanego ścieżką bezwzględną, więc otwarcie pliku przez `file://` nie odwzoruje zachowania produkcyjnego.

### Dostępne skrypty

Pełną listę skryptów npm wraz z opcjami — build, pipeline obrazów, walidację, QA i formatowanie — opisuje [`docs/settings.md`](docs/settings.md). Podstawowe komendy są podane w sekcjach instalacji, developmentu, buildu i walidacji.

### Build produkcyjny

```bash
npm run build
```

Komenda odtwarza od zera katalog `dist/` — artefakt wdrożenia z wyrenderowanymi stronami, zminifikowanym CSS i JS, `sitemap.xml` oraz produkcyjnym `sw.js`. `npm run build:dist` pozostaje zgodnym wstecznie aliasem tej komendy. Kolejność kroków i ich kontrole opisuje [`docs/settings.md`](docs/settings.md).

### Testy i walidacja

```bash
npm run check:predeploy
```

Lokalna bramka przed wdrożeniem sprawdza linki i odwołania do zasobów w renderowanych stronach oraz uruchamia skan dostępności axe-core. Repozytorium zawiera ponadto funkcjonalne testy przeglądarkowe w Playwright, testy Service Workera i audyt Lighthouse z progami w `lighthouse.config.json`. Zakres poszczególnych bramek i sposób ich uruchamiania opisuje [`docs/settings.md`](docs/settings.md).

### Wdrożenie

Ręczne wdrożenie produkcyjne po pomyślnym buildzie:

```bash
npm run build
netlify deploy --prod --dir=dist
```

Repozytorium zawiera konfigurację wdrożenia na Netlify:

- `netlify.toml` — komenda build `npm run build:dist`, katalog publikacji `dist`.
- `_redirects` — przekierowania 301 dla adresów bez rozszerzenia `.html` i ze slashem końcowym oraz reguła 404 na `/404.html`.
- `_headers` — nagłówki `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` i `X-Robots-Tag`.
- Formularz kontaktowy jest przygotowany pod Netlify Forms (atrybuty `netlify`, `netlify-honeypot="bot-field"` oraz ukryte pole `form-name`). Repozytorium nie zawiera własnej implementacji obsługi zgłoszeń.

Ciągła integracja: workflow GitHub Actions `CI` (status `CI / quality-gate`) buduje projekt i uruchamia bramki QA dla zmian na `main` oraz pull requestów do `main`. Workflow niczego nie wdraża — wdrożenie pozostaje po stronie Netlify; kontrakt workflow opisuje [`docs/settings.md`](docs/settings.md).

### Dostępność

Zaimplementowane mechanizmy obejmują:

- semantyczne sekcje z `aria-labelledby` i `aria-describedby` oraz link „Pomiń do treści” prowadzący do `#main`,
- synchronizację stanu ARIA w nawigacji (`aria-expanded`, `aria-haspopup`, `aria-controls`, `aria-current`) i w przełączniku motywu (`aria-pressed`),
- obsługę klawiatury, pułapkę fokusa i przywracanie fokusa w lightboxie oraz w modalu informacyjnym,
- komunikaty błędów formularza powiązane z polami, ustawianie `aria-invalid` i obszar statusu `role="status"` z `aria-live="polite"`,
- reakcję na `prefers-reduced-motion` w CSS oraz w skryptach animacji i przewijania,
- ikony SVG wstawiane z `aria-hidden="true"` i `focusable="false"`,
- bramki QA: skan axe-core (`npm run qa:a11y`) i funkcjonalne testy ścieżek klawiaturowych (`npm run qa:functional`); ich zakres opisuje [`docs/settings.md`](docs/settings.md).

Dokumentacja nie zawiera potwierdzenia zgodności z konkretnym poziomem WCAG — opisane są wyłącznie zaimplementowane mechanizmy.

### SEO

- `title`, `meta description`, `canonical` i `meta robots` na stronach; `noindex` dla `404.html`, `offline.html` oraz `thank-you.html` (`noindex, follow`).
- Metadane Open Graph i Twitter Card wraz z obrazami w `assets/img/og/`.
- Dane strukturalne JSON-LD: `WebSite`, `CollectionPage`, `ItemList` i `FAQPage`. Znaczniki opisujące fikcyjny podmiot gospodarczy zostały usunięte, zgodnie z demonstracyjnym charakterem serwisu.
- `robots.txt` z odwołaniem do `/sitemap.xml`; sam plik sitemapy nie jest utrzymywany w repozytorium — powstaje jako `dist/sitemap.xml` podczas `build`.

### PWA i obsługa offline

- `manifest.webmanifest` definiuje `id`, `start_url` i `scope` `/`, tryb `standalone`, kolory motywu, ikony (w tym `maskable`), trzy skróty aplikacji oraz zrzuty ekranu dla widoku wąskiego i szerokiego.
- `js/sw-register.js` rejestruje `/sw.js` w zakresie `/` po zdarzeniu `load`.
- W drzewie źródłowym `CACHE_VERSION` ma wartość `"dev"`, a lista precache jest pusta — taki worker instaluje się czysto i działa w trybie network-only, więc lokalne zmiany nie są przesłaniane przez cache.
- W buildzie produkcyjnym `dist/sw.js` otrzymuje wyliczoną listę precache i wersję cache. Dokumenty HTML korzystają ze strategii network-first z fallbackiem na `/offline.html`. Strategia cache-first obejmuje zasoby statyczne z listy precache oraz zasoby takie jak style, skrypty i fonty. Przy aktywacji worker usuwa wyłącznie nieaktualne cache z prefiksem `solidcraft-v`.
- Obrazy spoza precache korzystają ze strategii network-first z rewalidacją cache HTTP (`cache: "no-cache"`). Udana odpowiedź aktualizuje Cache Storage pod tym samym URL-em. Błędy HTTP są przekazywane do klienta i zachowują zapisany obraz, z którego worker korzysta po awarii połączenia.

Manifest i Service Worker są wskazywane ścieżkami bezwzględnymi, więc działają przy serwowaniu serwisu z katalogu głównego domeny. Testy Service Workera (`npm run qa:sw`) i ich zakres opisuje [`docs/settings.md`](docs/settings.md). Repozytorium nie zawiera weryfikacji instalowalności PWA ani testów offline zbudowanego serwisu.

### Wydajność

- Minifikacja CSS (`cssnano`) i JS (`esbuild`) oraz podmiana odwołań na assety minifikowane w buildzie `dist/`.
- Preload obrazu hero (`srcset` AVIF) z `fetchpriority="high"` oraz preload plików `woff2`; fonty są hostowane lokalnie w podziale na podzbiory `latin` i `latin-ext` z `unicode-range` i `font-display: swap`.
- Responsywne obrazy generowane przez `scripts/images.js` w formatach AVIF, WebP i JPG, w zdefiniowanych rozmiarach dla hero, oferty i galerii.
- Ikony interfejsu wstawiane z jednego rejestru SVG zamiast osobnych plików graficznych.
- Prefetch podstron oferty przy `mouseenter`/`focus` z opóźnieniem 120 ms, pomijany przy `saveData` i połączeniach 2G.
- Mapa ładowana dopiero po zgodzie użytkownika, w `iframe` z `loading="lazy"`.
- Precache powłoki aplikacji i runtime cache w Service Workerze.
- Progi jakości zdefiniowane w `lighthouse.config.json`.

Repozytorium nie zawiera zapisanych wyników pomiarów wydajności.

### Dane i trwałość stanu

- Treści serwisu są zapisane bezpośrednio w plikach HTML i w `partials/`; nie ma zewnętrznego źródła danych ani API.
- W `localStorage` przechowywane są wyłącznie preferencje interfejsu: `theme` (motyw), `consent.maps` (zgoda na osadzenie mapy) i `project-banner-accepted` (akceptacja informacji o projekcie). Dostęp do storage jest zabezpieczony — brak dostępu nie blokuje działania interfejsu.
- Parametr adresu `?usluga=` wstępnie wybiera usługę w widocznym, opcjonalnym polu „Usługa” formularza kontaktowego (wartość można zmienić lub wyczyścić), po czym jest usuwany z adresu przez `history.replaceState`.
- Dane formularza są wysyłane metodą POST na adres z atrybutu `action` (`/thank-you.html`) i obsługiwane przez Netlify Forms. Projekt nie posiada kont użytkowników, bazy danych ani synchronizacji między urządzeniami.

### Utrzymanie projektu

- Pliki źródłowe do edycji: `partials/header.html`, `partials/footer.html`, `css/style.css` i `css/modules/**`, `js/script.js`, `js/theme-init.js`, `js/sw-register.js`, `js/modules/**`, `assets/img-src/**` oraz logika runtime w `sw.js`.
- Wspólna warstwa layoutu ma jedno źródło — edytuj partial, nie wyrenderowaną kopię w `dist/`.
- Nie edytuj ręcznie: zawartości `dist/` (w tym `dist/sitemap.xml` i `dist/sw.js`), bloku między znacznikami `build:sw-manifest` w `sw.js` oraz `assets/img/**`.
- Po zmianie plików źródłowych uruchom `npm run build`, a po zmianie obrazów źródłowych `npm run images:build`. Obraz podmieniony pod tą samą nazwą wymaga ponownego kodowania: `npm run images:build -- --only=<grupa> --force`.
- Nazwy `CI` i `quality-gate` są częścią kontraktu — zmiana którejkolwiek odłącza wymagany status check w ustawieniach ochrony gałęzi.
- Skrypty, build, pipeline obrazów, QA i CI są opisane w [`docs/settings.md`](docs/settings.md), który pozostaje jedynym źródłem prawdy dla tej warstwy; historia zmian jest prowadzona w [`docs/CHANGELOG.md`](docs/CHANGELOG.md).

### Licencja

Projekt jest objęty licencją **Własnościowa Licencja Projektu KP_CODE (wersja 1.0)** — pełna treść znajduje się w pliku [`LICENSE.md`](LICENSE.md). Pole `license` w `package.json` ma wartość `SEE LICENSE IN LICENSE.md`.

Projekt nie jest oprogramowaniem open source. Wykorzystanie komercyjne, redystrybucja, publiczne wdrożenie oraz wykorzystanie projektu jako szablonu wymagają uprzedniej, pisemnej zgody właściciela praw: **kontakt@kp-code.pl**.

### Atrybucje

- Geometria ikon w `js/modules/icons.js` pochodzi z Font Awesome Free 7.3.1 (Fonticons, Inc.), zgodnie z notą w nagłówku pliku: <https://fontawesome.com>.
- Kroje Montserrat i Poppins są hostowane lokalnie w `assets/fonts/` jako pliki `woff2` i podlegają licencji SIL Open Font License 1.1. Zapis proweniencji znajduje się w [`assets/fonts/README.md`](assets/fonts/README.md), a pełny tekst licencji w [`assets/fonts/OFL-1.1.txt`](assets/fonts/OFL-1.1.txt).

## EN

### Project Overview

SolidCraft is a static, multi-page website for a construction and renovation company, built with HTML, CSS, and JavaScript, without a frontend framework. The repository contains the home page, six service subpages in `oferta/`, three legal pages at the repository root (`regulamin.html`, `polityka-prywatnosci.html`, `cookies.html`), and the `thank-you.html`, `404.html`, and `offline.html` pages. The interface language is Polish (`lang="pl"`).

The site is demonstrational and labeled as such in its content: a first-visit modal credits KP_Code Digital Studio as the author of this sample implementation, and the client-logo and testimonial sections are marked as examples. The repository contains no backend and no database; the server-side layer is limited to static hosting configuration.

The shared header and footer have a single source in `partials/` and are expanded into complete HTML documents at build time — no page composition happens in the browser.

### Live Version

The address configured as `homepage` in `package.json` and as the canonical URL of the pages: <https://ds-construction-pr01-solidcraft.netlify.app/>

### Key Features

- Multi-page navigation with a shared header from `partials/header.html`: offer dropdown, a mobile variant (`aria-expanded`, keyboard support), and active-section highlighting (scroll spy).
- Contact form with `novalidate` and its own validation layer: Polish phone number masking and validation, error messages linked through `aria-describedby`, `aria-invalid`, and a `role="status"` message area.
- Form anti-spam protection: hidden honeypot field (`bot-field`), rejection of submissions sent in under 2 seconds while preserving the entered data, content heuristics, and a 10 s submission timeout.
- Lightbox for offer cards and the project gallery: `role="dialog"`, `aria-modal`, Enter/Space activation, Escape, arrow navigation, focus trap, and focus restore to the triggering element.
- Light/dark theme toggle with pre-render theme resolution (`js/theme-init.js`) and preference persistence in `localStorage`.
- Informational modal about the demonstrational nature of the site: focus trap, Escape handling, scroll lock, and correct behavior when `localStorage` is unavailable.
- Google map embedded only after user consent, with the decision persisted in `localStorage`.
- Shared SVG icon registry (`js/modules/icons.js`) — 13 `[data-icon]` keys resolved at runtime, with no icon files in `assets/`.
- Service Worker registration, app-shell precaching, and an `offline.html` fallback page.
- Prefetch of service subpages on hover or focus, disabled for `Save-Data` and slow connections.

### Tech Stack

**Runtime (frontend)**

- HTML5 with a build-time partial renderer (`@layout`, `@include`, `{{token}}`, `{{#if}}`)
- CSS3 — modules in `css/modules/` composed via `@import` in `css/style.css`
- JavaScript (ES modules) — `js/script.js` and modules in `js/modules/`

**Tooling and build**

- Node.js `>=22.19.0` (`engines` field)
- PostCSS with `postcss-cli` (`postcss-import`, `postcss-preset-env` stage 3, `autoprefixer`, `cssnano`)
- esbuild (JS bundling and minification, target `es2018`, format `iife`)
- sharp (image variant generation)
- native Node.js development server (`scripts/dev-server.mjs`, dependency-free)
- Prettier (formatting)
- Playwright + axe-core (accessibility QA and functional browser tests)
- Lighthouse (`lighthouse` + `chrome-launcher`, run through `scripts/qa-lighthouse.mjs`)
- cross-env (passing `SITE_URL` to the sitemap generator)
- GitHub Actions (a single `CI` workflow)

### Architecture

- Every maintained page is a separate HTML document with its own metadata and structured data. The shared header and footer are pulled in with `<!-- @layout … -->` and `<!-- @include partials/… -->` directives, and the `scripts/utils/partials.js` renderer expands them during the build, in the development server, and in the checking scripts.
- The renderer is itself a gate: it stops on a missing partial, an undeclared `{{…}}` variable, a duplicated or malformed `@layout`, an `@include` escaping `partials/`, an include cycle, and on any directive or token surviving rendering.
- CSS is split into modules (`tokens`, `base`, `layout`, `components`, `sections`, `utilities`, `subpages`) composed via `@import`; the PostCSS build inlines them into a single `dist/css/style.min.css`.
- JavaScript is split into ES modules (`nav`, `ui-core`, `icons`, `forms`, `lightbox`, `map-consent`, `prefetch`, `home`, `project-banner`, `utils`). `js/script.js` exposes them under `window.SC` and runs initializers conditionally, based on the presence of selectors on the page.
- `js/theme-init.js` is loaded synchronously in `<head>` to set the theme before the first render; `js/sw-register.js` registers the Service Worker with scope `/`.
- The source tree holds no production artifacts: minified CSS and JS are produced only under `dist/`, and `.gitignore` blocks `/css/*.min.css` and `/js/*.min.js`.
- The root `sw.js` is the source of the runtime logic; the block between the `build:sw-manifest` markers (cache version and precache list) is owned by the build.

### Project Structure

```text
DS-construction-pr01-SolidCraft/
├── index.html                   # home page
├── 404.html, offline.html, thank-you.html
├── regulamin.html, polityka-prywatnosci.html, cookies.html   # legal pages
├── oferta/                      # 6 service subpages
├── partials/                    # shared layout fragments (header and footer source)
├── css/                         # style.css and modules in css/modules/
├── js/                          # script.js, theme-init.js, sw-register.js and modules in js/modules/
├── assets/                      # fonts/, img-src/ (source images), img/ (sharp variants)
├── scripts/                     # build, development server, validation and QA
├── .github/workflows/           # CI workflow
├── docs/                        # settings.md, CHANGELOG.md, archive/
├── dist/                        # build output, not tracked in Git
├── sw.js, manifest.webmanifest, robots.txt
├── _headers, _redirects, netlify.toml
├── lighthouse.config.json, postcss.config.js
├── LICENSE.md
└── package.json
```

### Installation

```bash
npm install
```

Requirements: Node.js `>=22.19.0`. All dependencies are development dependencies — the site runtime does not use npm packages.

### Local Development

```bash
npm run dev
```

The development server runs at `http://127.0.0.1:15500/`, renders partials on every HTML request, and reloads the page automatically when a file is saved. An HTTP server is required — the pages rely on ES modules, a Service Worker, and a manifest referenced by an absolute path, so opening files over `file://` will not reproduce production behavior.

### Available Scripts

The full list of npm scripts and their options — build, image pipeline, validation, QA, and formatting — is documented in [`docs/settings.md`](docs/settings.md). The essential commands are shown in the installation, development, build, and validation sections.

### Production Build

```bash
npm run build
```

The command recreates `dist/` from scratch — the deployment artifact with the rendered pages, minified CSS and JS, `sitemap.xml`, and the production `sw.js`. `npm run build:dist` remains a backward-compatible alias for this command. The step order and its checks are documented in [`docs/settings.md`](docs/settings.md).

### Testing and Validation

```bash
npm run check:predeploy
```

The local pre-deploy gate checks links and asset references in the rendered pages and runs the axe-core accessibility scan. The repository also contains Playwright functional browser tests, Service Worker tests, and a Lighthouse audit with thresholds in `lighthouse.config.json`. The scope of each gate and how to run it are documented in [`docs/settings.md`](docs/settings.md).

### Deployment

Manual production deployment after a successful build:

```bash
npm run build
netlify deploy --prod --dir=dist
```

The repository includes Netlify deployment configuration:

- `netlify.toml` — build command `npm run build:dist`, publish directory `dist`.
- `_redirects` — 301 redirects for extensionless and trailing-slash paths, plus a 404 rule pointing to `/404.html`.
- `_headers` — `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and `X-Robots-Tag` headers.
- The contact form is marked up for Netlify Forms (`netlify`, `netlify-honeypot="bot-field"` attributes and a hidden `form-name` field). The repository contains no custom submission handling implementation.

Continuous integration: the `CI` GitHub Actions workflow (status `CI / quality-gate`) builds the project and runs the QA gates for changes to `main` and for pull requests targeting `main`. The workflow deploys nothing — deployment stays with Netlify; the workflow contract is documented in [`docs/settings.md`](docs/settings.md).

### Accessibility

Implemented mechanisms include:

- semantic sections with `aria-labelledby` and `aria-describedby`, and a skip link to `#main`,
- ARIA state synchronization in navigation (`aria-expanded`, `aria-haspopup`, `aria-controls`, `aria-current`) and in the theme toggle (`aria-pressed`),
- keyboard support, a focus trap, and focus restore in the lightbox and in the informational modal,
- form error messages linked to their fields, `aria-invalid` handling, and a `role="status"` region with `aria-live="polite"`,
- `prefers-reduced-motion` handling in CSS and in the animation and scrolling scripts,
- SVG icons injected with `aria-hidden="true"` and `focusable="false"`,
- QA gates: the axe-core scan (`npm run qa:a11y`) and functional keyboard-path tests (`npm run qa:functional`); their scope is documented in [`docs/settings.md`](docs/settings.md).

This documentation makes no claim of conformance with a specific WCAG level — only the implemented mechanisms are described.

### SEO

- `title`, `meta description`, `canonical`, and `meta robots` across pages; `noindex` for `404.html`, `offline.html`, and `thank-you.html` (`noindex, follow`).
- Open Graph and Twitter Card metadata with images in `assets/img/og/`.
- JSON-LD structured data: `WebSite`, `CollectionPage`, `ItemList`, and `FAQPage`. Markup describing a fictitious business entity was removed, in line with the demonstrational nature of the site.
- `robots.txt` points to `/sitemap.xml`; the sitemap file itself is not maintained in the repository — it is produced as `dist/sitemap.xml` during `build`.

### PWA and Offline Support

- `manifest.webmanifest` defines `id`, `start_url` and `scope` `/`, `standalone` display, theme colors, icons (including `maskable`), three app shortcuts, and screenshots for narrow and wide form factors.
- `js/sw-register.js` registers `/sw.js` with scope `/` after the `load` event.
- In the source tree `CACHE_VERSION` is `"dev"` and the precache list is empty — such a worker installs cleanly and runs network-only, so local edits are never shadowed by a cached copy.
- In the production build, `dist/sw.js` receives the derived precache list and cache version. HTML documents use network-first with an `/offline.html` fallback. Cache-first covers precached static assets and assets such as styles, scripts, and fonts. On activation, the worker deletes only superseded caches with the `solidcraft-v` prefix.
- Images outside the precache use network-first with HTTP cache revalidation (`cache: "no-cache"`). Successful responses update Cache Storage at the same URL. HTTP errors pass through to the client and preserve the cached image, which the worker serves if the network request fails.

The manifest and Service Worker are referenced by absolute paths, so they work when the site is served from the domain root. The Service Worker tests (`npm run qa:sw`) and their scope are documented in [`docs/settings.md`](docs/settings.md). The repository contains no PWA installability verification and no offline tests of the built site.

### Performance

- CSS minification (`cssnano`) and JS minification (`esbuild`), with references rewritten to minified assets in the `dist/` build.
- Hero image preload (AVIF `srcset`) with `fetchpriority="high"` and `woff2` preloads; fonts are self-hosted, split into `latin` and `latin-ext` subsets with `unicode-range` and `font-display: swap`.
- Responsive images generated by `scripts/images.js` in AVIF, WebP, and JPG formats, at defined sizes for hero, offer, and gallery images.
- Interface icons injected from a single SVG registry instead of separate image files.
- Prefetch of service subpages on `mouseenter`/`focus` with a 120 ms delay, skipped for `saveData` and 2G connections.
- The map is loaded only after user consent, in an `iframe` with `loading="lazy"`.
- App-shell precaching and runtime caching in the Service Worker.
- Quality thresholds defined in `lighthouse.config.json`.

The repository contains no recorded performance measurement results.

### Data and State Persistence

- Site content is stored directly in the HTML files and in `partials/`; there is no external data source or API.
- `localStorage` holds interface preferences only: `theme` (theme), `consent.maps` (map embed consent), and `project-banner-accepted` (project notice acceptance). Storage access is guarded — an unavailable store does not block the interface.
- The `?usluga=` URL parameter preselects the service in the visible, optional "Usługa" field of the contact form (the value can be changed or cleared) and is then removed from the address via `history.replaceState`.
- Form data is sent via POST to the address in the `action` attribute (`/thank-you.html`) and handled by Netlify Forms. The project has no user accounts, database, or cross-device synchronization.

### Project Maintenance

- Editable source files: `partials/header.html`, `partials/footer.html`, `css/style.css` and `css/modules/**`, `js/script.js`, `js/theme-init.js`, `js/sw-register.js`, `js/modules/**`, `assets/img-src/**`, and the runtime logic in `sw.js`.
- The shared layout has one source — edit the partial, not the rendered copy in `dist/`.
- Do not edit by hand: anything under `dist/` (including `dist/sitemap.xml` and `dist/sw.js`), the block between the `build:sw-manifest` markers in `sw.js`, and `assets/img/**`.
- After changing source files run `npm run build`; after changing source images run `npm run images:build`. An image replaced under the same name must be re-encoded: `npm run images:build -- --only=<group> --force`.
- The `CI` and `quality-gate` names are part of the contract — renaming either detaches the required status check in branch-protection settings.
- Scripts, the build, the image pipeline, QA, and CI are documented in [`docs/settings.md`](docs/settings.md), which remains the single source of truth for that layer; the change history is kept in [`docs/CHANGELOG.md`](docs/CHANGELOG.md).

### License

The project is covered by the **KP_CODE Proprietary Project License (version 1.0)** — the full text is available in the [`LICENSE.md`](LICENSE.md) file. The `license` field in `package.json` is set to `SEE LICENSE IN LICENSE.md`.

The project is not open-source software. Commercial use, redistribution, public deployment, and use of the project as a template require prior written permission from the copyright owner: **kontakt@kp-code.pl**.

### Attributions

- The icon geometry in `js/modules/icons.js` comes from Font Awesome Free 7.3.1 (Fonticons, Inc.), as stated in the file header: <https://fontawesome.com>.
- The Montserrat and Poppins typefaces are self-hosted as `woff2` files in `assets/fonts/` and are licensed under the SIL Open Font License 1.1. The provenance record is in [`assets/fonts/README.md`](assets/fonts/README.md) and the full license text in [`assets/fonts/OFL-1.1.txt`](assets/fonts/OFL-1.1.txt).

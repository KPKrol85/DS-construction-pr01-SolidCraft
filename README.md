# SolidCraft

## PL

### Przegląd projektu

SolidCraft to statyczny, wielostronicowy serwis WWW firmy remontowo-budowlanej, zbudowany w oparciu o HTML, CSS i JavaScript, bez frameworka frontendowego. Repozytorium zawiera stronę główną, sześć podstron usług w `oferta/`, trzy strony dokumentów w `doc/` (regulamin, polityka prywatności, cookies) oraz strony `thank-you.html`, `404.html` i `offline.html`. Językiem interfejsu jest polski (`lang="pl"`).

Serwis ma charakter demonstracyjny — informuje o tym modal startowy na stronie głównej, wskazujący KP_Code Digital Studio jako autora przykładowej realizacji dla branży budowlanej. Repozytorium nie zawiera backendu ani bazy danych; warstwa serwerowa ogranicza się do konfiguracji hostingu statycznego.

**Decyzja projektowa — indeksowanie i treści budujące zaufanie.** Serwis pozostaje publicznie indeksowalny (`index, follow`, obecność w `sitemap.xml`) jako projekt portfolio; wariant `noindex` został rozpatrzony i odrzucony. Ponieważ SolidCraft nie jest rzeczywiście działającą firmą remontowo-budowlaną, konsekwencją tej decyzji jest wymóg, aby publiczne treści budujące zaufanie — ocena, logotypy klientów i opinie — były wprost oznaczone na stronie jako materiał przykładowy i nigdy nie były prezentowane jako zweryfikowane fakty. Dane strukturalne nie mogą przypisywać marce SolidCraft adresu pocztowego, numeru telefonu, adresu e-mail ani profili społecznościowych rzeczywistego przedsiębiorstwa. Oznaczenia te muszą być widoczne w samej treści sekcji — modal startowy jest zamykany na stałe i nie może być jedynym nośnikiem tej informacji.

### Wersja online

Adres skonfigurowany jako `homepage` w `package.json` oraz jako adres kanoniczny stron: <https://construction-pr01-solidcraft.netlify.app/>

### Kluczowe funkcje

- Wielostronicowa nawigacja z rozwijanym menu oferty, wersją mobilną (`aria-expanded`, obsługa klawiatury) i podświetlaniem aktywnej sekcji (scroll spy).
- Formularz kontaktowy z walidacją po stronie klienta, maską i weryfikacją polskiego numeru telefonu, komunikatami błędów powiązanymi przez `aria-describedby` oraz obszarem statusu `role="status"`.
- Ochrona antyspamowa formularza: ukryte pole honeypot (`bot-field`), odrzucenie zgłoszeń wysłanych w mniej niż 2 sekundy oraz heurystyka treści; wysyłka przez `fetch` z limitem czasu 10 s.
- Lightbox dla kart oferty i galerii realizacji: `role="dialog"`, `aria-modal`, obsługa Enter/Spacji, Escape, strzałek, pułapka fokusa i przywrócenie fokusa do elementu wywołującego.
- Przełącznik motywu jasny/ciemny z rozstrzygnięciem motywu przed renderem (`js/theme-init.js`) i zapisem preferencji w `localStorage`.
- Mapa Google osadzana dopiero po zgodzie użytkownika, z zapamiętaniem decyzji w `localStorage`.
- Modal informacyjny o demonstracyjnym charakterze serwisu, zamykany trwale po akceptacji.
- Rejestracja Service Workera, cache zasobów statycznych i strona zastępcza `offline.html`.
- Prefetch podstron oferty przy najechaniu lub fokusie, wyłączany przy `Save-Data` i wolnych połączeniach.

### Stack technologiczny

**Runtime (frontend)**

- HTML5
- CSS3 — moduły w `css/modules/` scalane przez `@import` w `css/style.css`
- JavaScript (ES modules) — `js/script.js` i moduły w `js/modules/`

**Tooling i build**

- Node.js `>=18` (pole `engines`)
- PostCSS z `postcss-cli` (`postcss-import`, `postcss-preset-env` stage 3, `autoprefixer`, `cssnano`)
- esbuild (bundling i minifikacja JS, target `es2018`, format `iife`)
- sharp (generowanie wariantów obrazów)
- live-server (lokalny serwer developerski)
- Prettier (formatowanie)
- Playwright + axe-core (skrypt QA dostępności)
- Lighthouse CI (`@lhci/cli`)
- cross-env (przekazanie `SITE_URL` do generatora sitemapy)

### Architektura

- Warstwa prezentacji to statyczne pliki HTML — każda podstrona jest osobnym dokumentem z własnymi metadanymi i danymi strukturalnymi.
- CSS jest podzielony na moduły (`tokens`, `base`, `layout`, `components`, `sections`, `utilities`, `subpages`) scalane przez `@import` w `css/style.css`; build PostCSS rozwija importy do jednego pliku produkcyjnego `dist/css/style.min.css`.
- JavaScript jest podzielony na moduły ES (`nav`, `ui-core`, `icons`, `forms`, `lightbox`, `map-consent`, `prefetch`, `home`, `project-banner`, `utils`). `js/script.js` eksponuje je w przestrzeni `window.SC` i uruchamia inicjalizatory warunkowo, na podstawie obecności selektorów na stronie.
- Ikony SVG mają jedno źródło — rejestr w `js/modules/icons.js`. Utrzymywany HTML deklaruje wyłącznie stabilne klucze `[data-icon]`, a `initIcons()` wstawia geometrię z rejestru; kolor jest dziedziczony przez `currentColor`, więc CSS odpowiada tylko za rozmiar i interakcję.
- `js/theme-init.js` jest ładowany synchronicznie w `<head>`, aby ustawić motyw przed pierwszym renderem; `js/sw-register.js` rejestruje Service Workera w zakresie `/`.
- Build produkcyjny nie modyfikuje plików źródłowych — `scripts/build-dist.js` tworzy katalog `dist/` i dopiero w kopiach HTML podmienia odwołania na assety minifikowane, a PostCSS i esbuild zapisują pliki minifikowane wyłącznie do `dist/`. Drzewo źródłowe nie zawiera artefaktów `.min.css` ani `.min.js`.
- Wspólny nagłówek i stopka mają jedno źródło — `partials/header.html` i `partials/footer.html`. Strony osadzają je dyrektywą `<!-- @include partials/... -->`, a `scripts/utils/partials.js` rozwija je w czasie builda. Wygenerowany HTML zawiera pełny nagłówek i stopkę, więc przeglądarka nie potrzebuje `fetch()` ani JavaScriptu, aby je otrzymać.
- Skrypty narzędziowe w `scripts/` korzystają ze wspólnego loggera (`scripts/utils/logger.js`) z trybem `--verbose`.

### Wspólne partiale layoutu

Każda z 13 utrzymywanych stron deklaruje swój kontekst jedną dyrektywą tuż pod `<body>` i osadza partiale:

```html
<body class="page-sub">
  <!-- @layout base="../" home="../index.html" active-home="" -->
  <!-- @include partials/header.html -->
  ...
  <!-- @include partials/footer.html -->
</body>
```

- `base` — przedrostek odwołań liczonych od katalogu głównego (`assets/`, `oferta/`, `doc/`).
- `home` — przedrostek kotwic strony głównej; strona główna zostawia go pustym, więc zachowuje czyste `#kotwice` wymagane przez scroll-spy i menu rozwijane.
- `active-home` — niepuste wyłącznie w `index.html`, gdzie steruje `aria-current="page"`.

Wartości dla poszczególnych grup stron: `index.html` → `base=""`, `home=""`, `active-home="true"`; `thank-you.html` → `base=""`, `home="index.html"`; `oferta/` i `doc/` → `base="../"`, `home="../index.html"`; `404.html` i `offline.html` → `base="/"`, `home="/"` (te dokumenty mogą być serwowane spod dowolnej ścieżki).

W partialach dostępne są `{{nazwa}}` oraz `{{#if nazwa}}...{{/if}}`. Nierozpoznana zmienna, brakujący partial lub token pozostały po renderowaniu przerywają build błędem — `dist/` nigdy nie otrzyma strony bez nagłówka lub stopki. Katalog `partials/` jest wykluczony z `dist/`, sitemapy i Prettiera (zawiera składnię szablonu).

### Struktura projektu

```text
DS-construction-pr01-SolidCraft/
├── index.html
├── 404.html
├── offline.html
├── thank-you.html
├── oferta/                    # 6 podstron usług
├── doc/                       # regulamin, polityka prywatności, cookies
├── partials/                  # wspólny layout (jedyne źródło)
│   ├── header.html
│   └── footer.html
├── css/
│   ├── style.css              # źródło (@import modułów)
│   └── modules/
├── js/
│   ├── script.js              # źródło (ES modules)
│   ├── theme-init.js
│   ├── sw-register.js
│   └── modules/
├── assets/
│   ├── fonts/
│   ├── img-src/               # obrazy źródłowe
│   └── img/                   # warianty generowane przez sharp
├── scripts/
│   ├── build-dist.js
│   ├── dev-server.js
│   ├── images.js
│   ├── check-links.mjs
│   ├── check-html-assets.mjs
│   ├── generate-sitemap.mjs
│   ├── qa-a11y.mjs
│   ├── verify-css-build.js
│   ├── verify-js-build.js
│   └── utils/
│       ├── logger.js
│       ├── mime-types.mjs
│       └── partials.js        # renderer partiali (build i dev)
├── sw.js
├── manifest.webmanifest
├── robots.txt
├── sitemap.xml
├── _headers
├── _redirects
├── netlify.toml
├── lighthouserc.json
├── postcss.config.js
├── settings.md
├── CHANGELOG.md
├── LICENSE
├── package.json
└── dist/                      # wyjście produkcyjne (generowane, poza Git)
    ├── css/style.min.css      # artefakt generowany
    └── js/
        ├── script.min.js      # artefakt generowany
        └── theme-init.min.js  # artefakt generowany
```

### Instalacja

```bash
npm install
```

Wymagania: Node.js w wersji `>=18`. Wszystkie zależności są zależnościami deweloperskimi — runtime strony nie korzysta z pakietów npm.

### Development lokalny

```bash
npm run dev
```

`scripts/dev-server.js` uruchamia `live-server` na porcie `15500` i otwiera `index.html`. Żądania HTML obsługuje middleware, który rozwija partiale przy każdym żądaniu — zmiana w `partials/header.html` lub `partials/footer.html` jest widoczna po odświeżeniu strony i trafia od razu do wszystkich 13 stron. Przeładowanie na żywo (`live-reload`) działa bez zmian. Serwer HTTP jest konieczny — strony korzystają z modułów ES, Service Workera i manifestu wskazywanego ścieżką bezwzględną, więc otwarcie pliku przez `file://` nie odwzoruje zachowania produkcyjnego.

Development lokalny korzysta wyłącznie ze źródeł nieminifikowanych (`css/style.css` z modułami i `js/script.js` jako moduły ES) — build produkcyjny nie jest do niego potrzebny.

Przebudowa assetów produkcyjnych w tle (zapis do `dist/`):

```bash
npm run watch:css
npm run watch:js
```

### Dostępne skrypty

- `npm run dev` — lokalny serwer `live-server` z renderowaniem partiali (`scripts/dev-server.js`, port `15500`); `npm start` jest aliasem.
- `npm run build:css` — PostCSS buduje `dist/css/style.min.css`, następnie `scripts/verify-css-build.js` sprawdza brak pozostałych `@import`.
- `npm run build:js` — esbuild buduje `dist/js/theme-init.min.js` i `dist/js/script.min.js`, następnie `scripts/verify-js-build.js` sprawdza brak składni `import`/`export` w obu plikach.
- `npm run build` — `build:css` i `build:js`; obydwa zapisują wyłącznie do `dist/`.
- `npm run build:dist` — składa katalog `dist/`, uruchamia `build` i `build:sitemap`.
- `npm run build:sitemap` — generuje `dist/sitemap.xml` dla adresu przekazanego w `SITE_URL`.
- `npm run images:build` / `npm run images:clean` — generowanie i czyszczenie obrazów w `assets/img/`.
- `npm run check:links` — walidacja linków wewnętrznych, zewnętrznych i kotwic w plikach HTML.
- `npm run check:assets` — walidacja lokalnych odwołań do zasobów w HTML.
- `npm run check:html` — `check:links` i `check:assets`.
- `npm run qa:a11y` — skan axe-core w przeglądarce headless.
- `npm run check:predeploy` — `check:html` i `qa:a11y` jako lokalna bramka przed wdrożeniem.
- `npm run qa:lhci` — `build:dist` (który sam uruchamia `build`) i `lhci autorun` z konfiguracją `lighthouserc.json`.
- `npm run format` / `npm run format:check` — Prettier w trybie zapisu i weryfikacji.

### Build produkcyjny

```bash
npm run build:dist
```

`npm run build:dist` wykonuje kolejno trzy kroki. Najpierw `scripts/build-dist.js` usuwa i odtwarza katalog `dist/`, renderuje wszystkie pliki HTML wraz z partialami z `partials/`, kopiuje katalog `assets/` (z pominięciem `assets/img-src/`) oraz pliki opcjonalne (`_headers`, `_redirects`, `netlify.toml`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `sw.js`, `js/sw-register.js`), a w kopiach HTML podmienia odwołania `css/style.css`, `js/script.js` i `js/theme-init.js` na warianty minifikowane. Następnie `npm run build` generuje z bieżących źródeł `dist/css/style.min.css`, `dist/js/theme-init.min.js` i `dist/js/script.min.js`, a skrypty weryfikacyjne kończą build błędem, gdy któregoś z tych artefaktów brakuje. Na końcu `build:sitemap` zapisuje `dist/sitemap.xml`. Kolejność jest wiążąca: czyszczenie `dist/` poprzedza generowanie assetów produkcyjnych, więc żaden krok nie kasuje wcześniej zbudowanych plików.

`build:sitemap` wymaga zmiennej `SITE_URL` i kończy się kodem różnym od zera, gdy jej nie ustawiono. Skrypt `build:dist` w `package.json` przekazuje `SITE_URL=https://construction-pr01-solidcraft.netlify.app` przez `cross-env`. Z sitemapy wykluczone są `404.html`, `offline.html` i `thank-you.html`.

### Testy i walidacja

Repozytorium nie zawiera zestawu testów jednostkowych ani funkcjonalnych. Skonfigurowane są następujące mechanizmy kontroli:

- `scripts/check-links.mjs` i `scripts/check-html-assets.mjs` — statyczna walidacja linków i odwołań do zasobów w HTML.
- `scripts/qa-a11y.mjs` — axe-core uruchamiany przez Playwright na lokalnym serwerze statycznym; skanowane są `/index.html`, `/404.html`, wszystkie sześć podstron oferty (`/oferta/elektryka.html`, `/oferta/hydraulika.html`, `/oferta/kafelkowanie.html`, `/oferta/lazienki.html`, `/oferta/malowanie.html`, `/oferta/remonty.html`), wszystkie trzy strony dokumentów (`/doc/cookies.html`, `/doc/polityka-prywatnosci.html`, `/doc/regulamin.html`) oraz `/offline.html`, jeśli plik istnieje — łącznie 12 tras. Jedenaście tras wymaganych: brak którejkolwiek przerywa bieg komunikatem `Required page not found`. Skrypt kończy się błędem przy naruszeniach o wadze `serious` lub `critical`.
- `scripts/verify-css-build.js` i `scripts/verify-js-build.js` — weryfikacja artefaktów wbudowana w komendy build.
- `lighthouserc.json` — Lighthouse CI na katalogu `dist` dla `/`, `/oferta/remonty.html` i `/doc/polityka-prywatnosci.html`, z progami: performance `0.6`, accessibility `0.85`, SEO `0.85`, best practices `0.75`.

Powyższe komendy są skonfigurowane w repozytorium; ich wykonanie nie było elementem przygotowania tej dokumentacji.

### Wdrożenie

Repozytorium zawiera konfigurację wdrożenia na Netlify:

- `netlify.toml` — komenda build `npm run build:dist`, katalog publikacji `dist`. Ponieważ `build:dist` uruchamia `npm run build`, wdrożenie regeneruje assety minifikowane z bieżących źródeł i nie publikuje wersji zapisanych w repozytorium.
- `_redirects` — przekierowania 301 dla adresów bez rozszerzenia `.html` i ze slashem końcowym oraz reguła 404 na `/404.html`.
- `_headers` — nagłówki `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` i `X-Robots-Tag`.
- Formularz kontaktowy jest przygotowany pod Netlify Forms (atrybuty `netlify`, `netlify-honeypot="bot-field"` oraz ukryte pole `form-name`). Repozytorium nie zawiera własnej implementacji obsługi zgłoszeń.

Repozytorium nie zawiera konfiguracji CI/CD (np. GitHub Actions).

### Dostępność

Zaimplementowane mechanizmy obejmują:

- semantyczne sekcje z `aria-labelledby` i `aria-describedby` oraz link „Pomiń do treści” prowadzący do `#main`,
- synchronizację stanu ARIA w nawigacji (`aria-expanded`, `aria-haspopup`, `aria-controls`, `aria-current`) i w przełączniku motywu (`aria-pressed`),
- obsługę klawiatury i pułapkę fokusa w lightboxie oraz przywracanie fokusa po zamknięciu; wszystkie przyciski lightboxa (zamknij, poprzednie, następne) są elementami potomnymi kontenera `aria-modal`, a nazwę dostępną każdej miniatury tworzy jej własny `alt`,
- te same mechanizmy w modalu startowym: przeniesienie fokusa do okna, cykl Tab wyłącznie w jego obrębie, zamykanie klawiszem Escape, blokada przewijania tła i przywrócenie fokusa po zamknięciu,
- pojedynczy punkt zatrzymania Tab na każdej pozycji galerii — aktywacja Enter/Spacją otwiera lightbox zamiast nawigować do pliku obrazu,
- komunikaty błędów formularza powiązane z polami, ustawianie `aria-invalid` i obszar statusu `role="status"` z `aria-live="polite"`; walidację prowadzi wyłącznie skrypt (`novalidate`), więc komunikaty pojawiają się także dla pól pustych i braku zgody,
- reakcję na `prefers-reduced-motion` w CSS oraz w skryptach animacji i przewijania,
- skrypt QA `npm run qa:a11y` oparty o axe-core.

Dokumentacja nie zawiera potwierdzenia zgodności z konkretnym poziomem WCAG — opisane są wyłącznie zaimplementowane mechanizmy.

### SEO

- `title`, `meta description`, `canonical` i `meta robots` na stronach; `noindex` dla `404.html`, `offline.html` oraz `thank-you.html` (`noindex, follow`).
- Metadane Open Graph i Twitter Card wraz z obrazami w `assets/img/og/`.
- Dane strukturalne JSON-LD: `WebSite`, `CollectionPage` i `FAQPage`. Serwis celowo nie publikuje typu `GeneralContractor` ani innego typu `LocalBusiness` — SolidCraft jest fikcyjną marką demonstracyjną i nie ma adresu, telefonu, e-maila ani profili społecznościowych rzeczywistej firmy (patrz „Przegląd projektu" — decyzja projektowa).
- `robots.txt` z odwołaniem do sitemapy oraz `sitemap.xml` w repozytorium; wersja wdrożeniowa jest generowana do `dist/sitemap.xml` podczas `build:dist`.

### PWA i obsługa offline

- `manifest.webmanifest` definiuje `id`, `start_url` i `scope` `/`, tryb `standalone`, kolory motywu, ikony (w tym `maskable`), trzy skróty aplikacji oraz zrzuty ekranu dla widoku wąskiego i szerokiego.
- `js/sw-register.js` rejestruje `/sw.js` w zakresie `/` po zdarzeniu `load`.
- `sw.js` używa wersjonowanej nazwy cache (`solidcraft-v1.3`), precache’uje wszystkie 13 stron HTML, manifest, `css/style.min.css`, `js/theme-init.min.js`, `js/script.min.js`, `js/sw-register.js`, sześć plików `woff2` i favikony, obsługuje dokumenty HTML strategią network-first z fallbackiem na `/offline.html`, a zasoby statyczne strategią cache-first; zapisy do cache w obsłudze `fetch` są przekazywane do `event.waitUntil`, a nieaktualne cache tego samego prefiksu są usuwane przy aktywacji.

Manifest i Service Worker są wskazywane ścieżkami bezwzględnymi, więc działają przy serwowaniu serwisu z katalogu głównego domeny. Repozytorium nie zawiera weryfikacji instalowalności ani testów działania offline.

### Wydajność

- Minifikacja CSS (`cssnano`) i JS (`esbuild`) oraz podmiana odwołań na assety minifikowane w buildzie `dist/`.
- Preload obrazu hero (`srcset` AVIF) z `fetchpriority="high"` oraz preload czterech plików `woff2`; fonty są hostowane lokalnie z `font-display: swap`.
- Responsywne obrazy generowane przez `scripts/images.js` w formatach AVIF, WebP i JPG, w zdefiniowanych rozmiarach dla hero, oferty i galerii.
- Prefetch podstron oferty przy `mouseenter`/`focus` z opóźnieniem 120 ms, pomijany przy `saveData` i połączeniach 2G.
- Mapa ładowana dopiero po zgodzie użytkownika, w `iframe` z `loading="lazy"`.
- Cache zasobów statycznych w Service Workerze.
- Progi jakości zdefiniowane w `lighthouserc.json`.

Repozytorium nie zawiera zapisanych wyników pomiarów wydajności.

### Dane i trwałość stanu

- Treści serwisu są zapisane bezpośrednio w plikach HTML; nie ma zewnętrznego źródła danych ani API.
- W `localStorage` przechowywane są wyłącznie preferencje interfejsu: `theme` (motyw), `consent.maps` (zgoda na osadzenie mapy) i `project-banner-accepted` (akceptacja informacji o projekcie).
- Parametr adresu `?usluga=` jest przepisywany do ukrytego pola formularza kontaktowego, po czym usuwany z adresu przez `history.replaceState`.
- Dane formularza są wysyłane metodą POST na adres z atrybutu `action` (`/thank-you.html`) i obsługiwane przez Netlify Forms. Projekt nie posiada kont użytkowników, bazy danych ani synchronizacji między urządzeniami.

### Utrzymanie projektu

- Pliki źródłowe do edycji: `css/style.css` i `css/modules/**`, `js/script.js`, `js/theme-init.js`, `js/sw-register.js`, `js/modules/**`, `partials/header.html` i `partials/footer.html`, `assets/img-src/**` oraz utrzymywane strony HTML.
- Artefakty generowane, których nie należy edytować ręcznie: `dist/css/style.min.css`, `dist/js/script.min.js`, `dist/js/theme-init.min.js`, strony HTML i `sitemap.xml` w `dist/`, `assets/img/**` oraz cały katalog `dist/`. Katalog `dist/` jest w całości generowany, nie jest utrzymywany ręcznie i pozostaje poza kontrolą wersji.
- Wspólny nagłówek i stopkę zmienia się w `partials/`, nigdy w wyrenderowanej kopii — jedna zmiana obejmuje wszystkie 13 stron.
- Higiena repozytorium: `.gitignore` trzyma poza Gitem `node_modules/`, `/dist/`, artefakty `*.min.css`/`*.min.js`, katalogi raportów oraz lokalne katalogi agentów (`.claude/`, `.codex/`); `.gitattributes` normalizuje pliki tekstowe do LF i oznacza jako `binary` rozszerzenia binarne obecne w projekcie. Renormalizacja już śledzonych plików (`git add --renormalize .`) to osobna operacja Gita wykonywana przez opiekuna projektu i nie jest częścią żadnego skryptu npm.
- Zmiany w źródłach CSS/JS nie wymagają żadnego kroku buildu w developmencie — `npm run dev` serwuje pliki źródłowe. Artefakty minifikowane powstają dopiero w `dist/` podczas `npm run build:dist` (lokalnie i na wdrożeniu).
- Po zmianie obrazów źródłowych należy uruchomić `npm run images:build` — ten krok pozostaje ręczny i nie jest częścią ścieżki wdrożenia.
- Lista precache’owanych zasobów i wartość `CACHE_VERSION` w `sw.js` są utrzymywane ręcznie — po zmianie zasobów wchodzących do cache należy podnieść wersję.
- Zasady pipeline’u i narzędzi są opisane w `settings.md`, który pozostaje jedynym źródłem prawdy dla tej warstwy; historia zmian jest prowadzona w `CHANGELOG.md`.

### Roadmap

Na podstawie otwartych punktów odnotowanych w repozytorium:

- rozszerzenie testów automatycznych o scenariusze funkcjonalne (formularz, lightbox, nawigacja) z wykorzystaniem obecnego zaplecza Playwright,
- włączenie `check:predeploy` jako obowiązkowej bramki w workflow CI,
- automatyzacja wersjonowania cache Service Workera w procesie build,
- ujednolicenie źródła sitemapy — śledzony `sitemap.xml` w katalogu głównym jest kopiowany do `dist/`, a następnie nadpisywany przez `build:sitemap`.

### Licencja

Projekt jest objęty licencją **Własnościowa Licencja Projektu KP_CODE (wersja 1.0)** — pełna treść znajduje się w pliku [`LICENSE`](LICENSE). Pole `license` w `package.json` ma wartość `SEE LICENSE IN LICENSE`.

Projekt nie jest oprogramowaniem open source. Wykorzystanie komercyjne, redystrybucja, publiczne wdrożenie oraz wykorzystanie projektu jako szablonu wymagają uprzedniej, pisemnej zgody właściciela praw: **kontakt@kp-code.pl**.

## EN

### Project Overview

SolidCraft is a static, multi-page website for a construction and renovation company, built with HTML, CSS, and JavaScript, without a frontend framework. The repository contains the home page, six service subpages in `oferta/`, three legal pages in `doc/` (terms, privacy policy, cookies), and the `thank-you.html`, `404.html`, and `offline.html` pages. The interface language is Polish (`lang="pl"`).

The site is demonstrational — a startup modal on the home page states this and credits KP_Code Digital Studio as the author of this sample implementation for the construction sector. The repository contains no backend and no database; the server-side layer is limited to static hosting configuration.

**Project decision — indexing and trust content.** The site stays publicly indexable (`index, follow`, present in `sitemap.xml`) as a portfolio project; the `noindex` alternative was considered and rejected. Because SolidCraft is not a real operating construction company, that decision carries a requirement: the public trust content — the rating, the client logos and the testimonials — must be explicitly marked on the page as sample material and must never be presented as verified fact. Structured data must not attribute a postal address, telephone number, email address or social profile of a real business to the SolidCraft brand. These disclosures must be visible in the section content itself — the startup modal is dismissed permanently and cannot be the only carrier of this information.

### Live Version

The address configured as `homepage` in `package.json` and as the canonical URL of the pages: <https://construction-pr01-solidcraft.netlify.app/>

### Key Features

- Multi-page navigation with an offer dropdown, a mobile variant (`aria-expanded`, keyboard support), and active-section highlighting (scroll spy).
- Contact form with client-side validation, Polish phone number masking and validation, error messages linked through `aria-describedby`, and a `role="status"` message area.
- Form anti-spam protection: hidden honeypot field (`bot-field`), rejection of submissions sent in under 2 seconds, and content heuristics; submission via `fetch` with a 10 s timeout.
- Lightbox for offer cards and the project gallery: `role="dialog"`, `aria-modal`, Enter/Space activation, Escape, arrow navigation, focus trap, and focus restore to the triggering element.
- Light/dark theme toggle with pre-render theme resolution (`js/theme-init.js`) and preference persistence in `localStorage`.
- Google map embedded only after user consent, with the decision persisted in `localStorage`.
- Informational modal about the demonstrational nature of the site, permanently dismissed after acceptance.
- Service Worker registration, static asset caching, and an `offline.html` fallback page.
- Prefetch of service subpages on hover or focus, disabled for `Save-Data` and slow connections.

### Tech Stack

**Runtime (frontend)**

- HTML5
- CSS3 — modules in `css/modules/` composed via `@import` in `css/style.css`
- JavaScript (ES modules) — `js/script.js` and modules in `js/modules/`

**Tooling and build**

- Node.js `>=18` (`engines` field)
- PostCSS with `postcss-cli` (`postcss-import`, `postcss-preset-env` stage 3, `autoprefixer`, `cssnano`)
- esbuild (JS bundling and minification, target `es2018`, format `iife`)
- sharp (image variant generation)
- live-server (local development server)
- Prettier (formatting)
- Playwright + axe-core (accessibility QA script)
- Lighthouse CI (`@lhci/cli`)
- cross-env (passing `SITE_URL` to the sitemap generator)

### Architecture

- The presentation layer consists of static HTML files — each subpage is a separate document with its own metadata and structured data.
- CSS is split into modules (`tokens`, `base`, `layout`, `components`, `sections`, `utilities`, `subpages`) composed via `@import` in `css/style.css`; the PostCSS build inlines those imports into a single production file, `dist/css/style.min.css`.
- JavaScript is split into ES modules (`nav`, `ui-core`, `icons`, `forms`, `lightbox`, `map-consent`, `prefetch`, `home`, `project-banner`, `utils`). `js/script.js` exposes them under `window.SC` and runs initializers conditionally, based on the presence of selectors on the page.
- SVG icons have a single source — the registry in `js/modules/icons.js`. Maintained HTML declares only stable `[data-icon]` keys, and `initIcons()` injects the geometry from the registry; colour is inherited through `currentColor`, so CSS owns only size and interaction.
- `js/theme-init.js` is loaded synchronously in `<head>` to set the theme before the first render; `js/sw-register.js` registers the Service Worker with scope `/`.
- The production build does not modify the source files — `scripts/build-dist.js` creates the `dist/` directory and rewrites references to minified assets only in the HTML copies, while PostCSS and esbuild write their minified output exclusively into `dist/`. The source tree holds no `.min.css` or `.min.js` artifacts.
- The shared header and footer have a single source each — `partials/header.html` and `partials/footer.html`. Pages embed them with a `<!-- @include partials/... -->` directive, and `scripts/utils/partials.js` expands them at build time. The generated HTML already contains the complete header and footer, so the browser needs no `fetch()` and no JavaScript to obtain them.
- Tooling scripts in `scripts/` share a logger (`scripts/utils/logger.js`) with a `--verbose` mode.

### Shared Layout Partials

Each of the 13 maintained pages declares its context with one directive right below `<body>` and embeds the partials:

```html
<body class="page-sub">
  <!-- @layout base="../" home="../index.html" active-home="" -->
  <!-- @include partials/header.html -->
  ...
  <!-- @include partials/footer.html -->
</body>
```

- `base` — prefix for references resolved from the project root (`assets/`, `oferta/`, `doc/`).
- `home` — prefix for homepage anchors; the homepage leaves it empty so it keeps the bare `#anchors` its scroll-spy and dropdown scripts depend on.
- `active-home` — non-empty only in `index.html`, where it drives `aria-current="page"`.

Values per page group: `index.html` → `base=""`, `home=""`, `active-home="true"`; `thank-you.html` → `base=""`, `home="index.html"`; `oferta/` and `doc/` → `base="../"`, `home="../index.html"`; `404.html` and `offline.html` → `base="/"`, `home="/"` (those documents can be served from any path).

Partials support `{{name}}` and `{{#if name}}...{{/if}}`. An undeclared variable, a missing partial, or any token left after rendering fails the build — `dist/` never receives a page without its header or footer. The `partials/` directory is excluded from `dist/`, from the sitemap, and from Prettier (it holds template syntax).

### Project Structure

```text
DS-construction-pr01-SolidCraft/
├── index.html
├── 404.html
├── offline.html
├── thank-you.html
├── oferta/                    # 6 service subpages
├── doc/                       # terms, privacy policy, cookies
├── partials/                  # shared layout (single source of truth)
│   ├── header.html
│   └── footer.html
├── css/
│   ├── style.css              # source (module @imports)
│   └── modules/
├── js/
│   ├── script.js              # source (ES modules)
│   ├── theme-init.js
│   ├── sw-register.js
│   └── modules/
├── assets/
│   ├── fonts/
│   ├── img-src/               # source images
│   └── img/                   # variants generated by sharp
├── scripts/
│   ├── build-dist.js
│   ├── dev-server.js
│   ├── images.js
│   ├── check-links.mjs
│   ├── check-html-assets.mjs
│   ├── generate-sitemap.mjs
│   ├── qa-a11y.mjs
│   ├── verify-css-build.js
│   ├── verify-js-build.js
│   └── utils/
│       ├── logger.js
│       ├── mime-types.mjs
│       └── partials.js        # partial renderer (build and dev)
├── sw.js
├── manifest.webmanifest
├── robots.txt
├── sitemap.xml
├── _headers
├── _redirects
├── netlify.toml
├── lighthouserc.json
├── postcss.config.js
├── settings.md
├── CHANGELOG.md
├── LICENSE
├── package.json
└── dist/                      # production output (generated, not in Git)
    ├── css/style.min.css      # generated artifact
    └── js/
        ├── script.min.js      # generated artifact
        └── theme-init.min.js  # generated artifact
```

### Installation

```bash
npm install
```

Requirements: Node.js `>=18`. All dependencies are development dependencies — the site runtime does not use npm packages.

### Local Development

```bash
npm run dev
```

`scripts/dev-server.js` starts `live-server` on port `15500` and opens `index.html`. HTML requests go through a middleware that expands the partials per request — editing `partials/header.html` or `partials/footer.html` shows up on a plain refresh and reaches all 13 pages at once. Live reload keeps working as before. An HTTP server is required — the pages rely on ES modules, a Service Worker, and a manifest referenced by an absolute path, so opening files over `file://` will not reproduce production behavior.

Local development uses the non-minified sources only (`css/style.css` with its modules and `js/script.js` as ES modules) — it never needs a production build.

Rebuilding the production assets in the background (written into `dist/`):

```bash
npm run watch:css
npm run watch:js
```

### Available Scripts

- `npm run dev` — local `live-server` with partial rendering (`scripts/dev-server.js`, port `15500`); `npm start` is an alias.
- `npm run build:css` — PostCSS builds `dist/css/style.min.css`, then `scripts/verify-css-build.js` checks that no `@import` remains.
- `npm run build:js` — esbuild builds `dist/js/theme-init.min.js` and `dist/js/script.min.js`, then `scripts/verify-js-build.js` checks that no `import`/`export` syntax remains in either file.
- `npm run build` — runs `build:css` and `build:js`; both write into `dist/` only.
- `npm run build:dist` — assembles the `dist/` directory, then runs `build` and `build:sitemap`.
- `npm run build:sitemap` — generates `dist/sitemap.xml` for the address passed in `SITE_URL`.
- `npm run images:build` / `npm run images:clean` — generate and clean images in `assets/img/`.
- `npm run check:links` — validates internal links, external links, and anchors across HTML files.
- `npm run check:assets` — validates local asset references in HTML.
- `npm run check:html` — runs `check:links` and `check:assets`.
- `npm run qa:a11y` — axe-core scan in a headless browser.
- `npm run check:predeploy` — runs `check:html` and `qa:a11y` as the local pre-deploy gate.
- `npm run qa:lhci` — runs `build:dist` (which itself runs `build`) and `lhci autorun` with the `lighthouserc.json` configuration.
- `npm run format` / `npm run format:check` — Prettier in write and verify modes.

### Production Build

```bash
npm run build:dist
```

`npm run build:dist` runs three steps in order. First `scripts/build-dist.js` removes and recreates the `dist/` directory, renders every HTML file with its `partials/` header and footer expanded, copies the `assets/` directory (excluding `assets/img-src/`), and the optional files (`_headers`, `_redirects`, `netlify.toml`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `sw.js`, `js/sw-register.js`), and rewrites `css/style.css`, `js/script.js`, and `js/theme-init.js` references to their minified variants in the HTML copies. Then `npm run build` generates `dist/css/style.min.css`, `dist/js/theme-init.min.js`, and `dist/js/script.min.js` from the current sources, and the verification scripts fail the build when one of those artifacts is missing. Finally `build:sitemap` writes `dist/sitemap.xml`. The order is binding: `dist/` is cleaned before the production assets are generated, so no step deletes previously built files.

`build:sitemap` requires the `SITE_URL` variable and exits non-zero when it is not set. The `build:dist` script in `package.json` passes `SITE_URL=https://construction-pr01-solidcraft.netlify.app` through `cross-env`. `404.html`, `offline.html`, and `thank-you.html` are excluded from the sitemap.

### Testing and Validation

The repository contains no unit or functional test suite. The following checks are configured:

- `scripts/check-links.mjs` and `scripts/check-html-assets.mjs` — static validation of links and asset references in HTML.
- `scripts/qa-a11y.mjs` — axe-core executed through Playwright against a local static server; the scanned routes are `/index.html`, `/404.html`, all six service subpages (`/oferta/elektryka.html`, `/oferta/hydraulika.html`, `/oferta/kafelkowanie.html`, `/oferta/lazienki.html`, `/oferta/malowanie.html`, `/oferta/remonty.html`), all three document pages (`/doc/cookies.html`, `/doc/polityka-prywatnosci.html`, `/doc/regulamin.html`), and `/offline.html` when the file exists — 12 routes in total. Eleven of them are required: a missing one aborts the run with `Required page not found`. The script fails on `serious` or `critical` violations.
- `scripts/verify-css-build.js` and `scripts/verify-js-build.js` — artifact verification embedded in the build commands.
- `lighthouserc.json` — Lighthouse CI over the `dist` directory for `/`, `/oferta/remonty.html`, and `/doc/polityka-prywatnosci.html`, with thresholds: performance `0.6`, accessibility `0.85`, SEO `0.85`, best practices `0.75`.

These commands are configured in the repository; running them was not part of preparing this documentation.

### Deployment

The repository includes Netlify deployment configuration:

- `netlify.toml` — build command `npm run build:dist`, publish directory `dist`. Because `build:dist` runs `npm run build`, the deploy regenerates the minified assets from the current sources instead of publishing the versions committed to the repository.
- `_redirects` — 301 redirects for extensionless and trailing-slash paths, plus a 404 rule pointing to `/404.html`.
- `_headers` — `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and `X-Robots-Tag` headers.
- The contact form is marked up for Netlify Forms (`netlify`, `netlify-honeypot="bot-field"` attributes and a hidden `form-name` field). The repository contains no custom submission handling implementation.

The repository contains no CI/CD configuration (for example GitHub Actions).

### Accessibility

Implemented mechanisms include:

- semantic sections with `aria-labelledby` and `aria-describedby`, and a skip link to `#main`,
- ARIA state synchronization in navigation (`aria-expanded`, `aria-haspopup`, `aria-controls`, `aria-current`) and in the theme toggle (`aria-pressed`),
- keyboard support and a focus trap in the lightbox, with focus restore on close; the close, previous and next buttons are descendants of the `aria-modal` container, and each thumbnail control takes its accessible name from its own `alt`,
- the same mechanisms in the first-visit modal: focus moved into the dialog, Tab cycling only within it, Escape dismissal, a background scroll lock, and focus restore on close,
- one tab stop per gallery item — Enter/Space activation opens the lightbox instead of navigating to the image file,
- form error messages linked to their fields, `aria-invalid` handling, and a `role="status"` region with `aria-live="polite"`; validation is owned entirely by the script (`novalidate`), so the messages also cover empty fields and missing consent,
- `prefers-reduced-motion` handling in CSS and in the animation and scrolling scripts,
- the `npm run qa:a11y` QA script based on axe-core.

This documentation makes no claim of conformance with a specific WCAG level — only the implemented mechanisms are described.

### SEO

- `title`, `meta description`, `canonical`, and `meta robots` across pages; `noindex` for `404.html`, `offline.html`, and `thank-you.html` (`noindex, follow`).
- Open Graph and Twitter Card metadata with images in `assets/img/og/`.
- JSON-LD structured data: `WebSite`, `CollectionPage`, and `FAQPage`. The site deliberately publishes no `GeneralContractor` or other `LocalBusiness` type — SolidCraft is a fictitious demo brand with no real address, telephone, email or social profiles (see "Project Overview" — project decision).
- `robots.txt` referencing the sitemap and a `sitemap.xml` in the repository; the deployment version is generated into `dist/sitemap.xml` during `build:dist`.

### PWA and Offline Support

- `manifest.webmanifest` defines `id`, `start_url` and `scope` `/`, `standalone` display, theme colors, icons (including `maskable`), three app shortcuts, and screenshots for narrow and wide form factors.
- `js/sw-register.js` registers `/sw.js` with scope `/` after the `load` event.
- `sw.js` uses a versioned cache name (`solidcraft-v1.3`), precaches all 13 HTML pages, the manifest, `css/style.min.css`, `js/theme-init.min.js`, `js/script.min.js`, `js/sw-register.js`, the six `woff2` files and the favicons, serves HTML documents network-first with an `/offline.html` fallback and static assets cache-first, hands the fetch handler's cache writes to `event.waitUntil`, and deletes outdated caches of the same prefix on activation.

The manifest and Service Worker are referenced by absolute paths, so they work when the site is served from the domain root. The repository contains no installability verification or offline behavior tests.

### Performance

- CSS minification (`cssnano`) and JS minification (`esbuild`), with references rewritten to minified assets in the `dist/` build.
- Hero image preload (AVIF `srcset`) with `fetchpriority="high"` and preload of four `woff2` files; fonts are self-hosted with `font-display: swap`.
- Responsive images generated by `scripts/images.js` in AVIF, WebP, and JPG formats, at defined sizes for hero, offer, and gallery images.
- Prefetch of service subpages on `mouseenter`/`focus` with a 120 ms delay, skipped for `saveData` and 2G connections.
- The map is loaded only after user consent, in an `iframe` with `loading="lazy"`.
- Static asset caching in the Service Worker.
- Quality thresholds defined in `lighthouserc.json`.

The repository contains no recorded performance measurement results.

### Data and State Persistence

- Site content is stored directly in the HTML files; there is no external data source or API.
- `localStorage` holds interface preferences only: `theme` (theme), `consent.maps` (map embed consent), and `project-banner-accepted` (project notice acceptance).
- The `?usluga=` URL parameter is copied into a hidden field of the contact form and then removed from the address via `history.replaceState`.
- Form data is sent via POST to the address in the `action` attribute (`/thank-you.html`) and handled by Netlify Forms. The project has no user accounts, database, or cross-device synchronization.

### Project Maintenance

- Editable source files: `css/style.css` and `css/modules/**`, `js/script.js`, `js/theme-init.js`, `js/sw-register.js`, `js/modules/**`, `partials/header.html` and `partials/footer.html`, `assets/img-src/**`, and the maintained HTML pages.
- Generated artifacts that must not be edited manually: `dist/css/style.min.css`, `dist/js/script.min.js`, `dist/js/theme-init.min.js`, the HTML pages and `sitemap.xml` inside `dist/`, `assets/img/**`, and the whole `dist/` directory. `dist/` is generated in full, is never maintained by hand, and stays out of version control.
- Change the shared header and footer in `partials/`, never in a rendered copy — one edit reaches all 13 pages.
- Repository hygiene: `.gitignore` keeps `node_modules/`, `/dist/`, the `*.min.css` / `*.min.js` artifacts, the report directories and the local agent directories (`.claude/`, `.codex/`) out of Git; `.gitattributes` normalises text files to LF and marks the binary extensions present in the project as `binary`. Renormalising already-tracked files (`git add --renormalize .`) is a separate Git operation performed by the maintainer and is not part of any npm script.
- Changing CSS/JS sources requires no build step during development — `npm run dev` serves the source files. The minified artifacts are produced in `dist/` by `npm run build:dist` only, locally and on deploy alike.
- After changing source images run `npm run images:build` — that step stays manual and is not part of the deploy path.
- The precache list and the `CACHE_VERSION` value in `sw.js` are maintained manually — bump the version after changing the cached assets.
- Pipeline and tooling rules are documented in `settings.md`, which remains the single source of truth for that layer; the change history is kept in `CHANGELOG.md`.

### Roadmap

Based on the open items recorded in the repository:

- extend automated testing with functional scenarios (form, lightbox, navigation) using the existing Playwright setup,
- adopt `check:predeploy` as a required gate in a CI workflow,
- automate Service Worker cache versioning in the build process,
- consolidate the sitemap source of truth — the tracked root `sitemap.xml` is copied into `dist/` and then overwritten by `build:sitemap`.

### License

The project is covered by the **KP_CODE Proprietary Project License (version 1.0)** — the full text is available in the [`LICENSE`](LICENSE) file. The `license` field in `package.json` is set to `SEE LICENSE IN LICENSE`.

The project is not open-source software. Commercial use, redistribution, public deployment, and use of the project as a template require prior written permission from the copyright owner: **kontakt@kp-code.pl**.

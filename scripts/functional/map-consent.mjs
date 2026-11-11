/* Consent-gated Google Maps embed scenario.

   The shared footer renders a placeholder with a "Załaduj mapę" button, and
   js/modules/map-consent.js inserts the Google iframe only after that click or
   when `consent.maps` is already stored as "true". The scenario asserts the
   contract at the request level, not only in the DOM: nothing is requested
   from Google before consent, the iframe built after consent matches the
   footer's data-map-src, the stored decision restores it on reload, and the
   click still loads the map when localStorage throws.

   No request reaches Google. Every context intercepts all off-origin requests
   before its first navigation and aborts them in the browser. The first
   context keeps the harness guard fully strict and reads the embed URL from
   the rendered footer; only the contexts that consent pass that exact URL to
   `allowedOffOriginUrls`, so any other off-origin request still fails. */

import {
  AssertionError,
  DESKTOP_VIEWPORT,
  assert,
  assertDeepEqual,
  assertEqual,
  openPage,
  withPage,
} from "./harness.mjs";

/* A footer page without the first-visit modal, so storage failures cannot
   bring up a dialog over the map. */
const ROUTE = "/cookies.html";
const MAP = ".ft-map";
const PLACEHOLDER = `${MAP} .map-placeholder`;
const LOAD_BUTTON_NAME = "Załaduj mapę";
const CONSENT_STORAGE_KEY = "consent.maps";
const EMBED_URL_PREFIX = "https://www.google.com/maps/embed?";
const BLOCKED_BY_CLIENT = "net::ERR_BLOCKED_BY_CLIENT";

/* A premature lazy iframe only issues its request once it is near the
   viewport, so the pre-consent check watches the scrolled-in map area for this
   long and fails as soon as any off-origin request appears. */
const PRE_CONSENT_OBSERVATION_MS = 1000;
const EMBED_REQUEST_TIMEOUT_MS = 5000;

const BEFORE_CONSENT = "before consent";
const AFTER_CONSENT = "after consent";
const AFTER_RELOAD = "after reload";

const pageOptions = (baseURL, allowedOffOriginUrls = []) => ({
  baseURL,
  viewport: DESKTOP_VIEWPORT,
  allowedOffOriginUrls,
});

const isOffOrigin = (url, origin) =>
  /^https?:$/.test(url.protocol) && url.origin !== origin;

/* Installed before the context's first navigation: every off-origin request,
   the embed included, is aborted in the browser and logged with the phase the
   scenario was in when it was attempted. */
async function interceptOffOriginRequests(context, baseURL) {
  const origin = new URL(baseURL).origin;
  const log = { phase: BEFORE_CONSENT, attempts: [] };

  await context.route(
    (url) => isOffOrigin(url, origin),
    (route) => {
      log.attempts.push({ phase: log.phase, url: route.request().url() });
      return route.abort("blockedbyclient");
    },
  );

  return log;
}

const attemptsIn = (log, phase) =>
  log.attempts
    .filter((attempt) => attempt.phase === phase)
    .map((attempt) => attempt.url);

/* Resolves with the failure text of the next aborted embed request. Started
   before the action that triggers it, and marked as handled so an earlier
   assertion failure cannot leave an unhandled rejection behind. */
function waitForAbortedEmbed(page, mapSrc, context) {
  const aborted = page
    .waitForEvent("requestfailed", {
      predicate: (request) => request.url() === mapSrc,
      timeout: EMBED_REQUEST_TIMEOUT_MS,
    })
    .then(
      (request) => request.failure()?.errorText ?? null,
      () => {
        throw new AssertionError(
          `${context} — the embed request was not attempted within ${EMBED_REQUEST_TIMEOUT_MS} ms`,
        );
      },
    );
  aborted.catch(() => {});
  return aborted;
}

async function readConsent(page) {
  return page.evaluate((key) => {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return `threw ${error.name}`;
    }
  }, CONSENT_STORAGE_KEY);
}

function loadButton(page) {
  return page.locator(MAP).getByRole("button", { name: LOAD_BUTTON_NAME });
}

async function assertGateClosed(page, context) {
  assertEqual(
    await page.locator(`${MAP} iframe`).count(),
    0,
    `${context} — the map area should hold no iframe`,
  );
  assert(
    await page.locator(PLACEHOLDER).isVisible(),
    `${context} — the map placeholder should be visible`,
  );
  assert(
    await loadButton(page).isVisible(),
    `${context} — the "${LOAD_BUTTON_NAME}" button should be visible`,
  );
}

async function assertMapLoaded(page, context) {
  const state = await page.locator(MAP).evaluate((map) => {
    const iframes = map.querySelectorAll("iframe");
    return {
      count: iframes.length,
      expectedSrc: map.getAttribute("data-map-src"),
      src: iframes[0]?.getAttribute("src") ?? null,
      title: iframes[0]?.getAttribute("title") ?? "",
      loading: iframes[0]?.getAttribute("loading") ?? null,
      placeholder: Boolean(map.querySelector(".map-placeholder")),
    };
  });

  assertEqual(
    state.count,
    1,
    `${context} — the map area should hold exactly one iframe`,
  );
  assertEqual(
    state.src,
    state.expectedSrc,
    `${context} — the iframe src should equal the container's data-map-src`,
  );
  assert(
    state.title.trim().length > 0,
    `${context} — the iframe should carry a non-empty title`,
  );
  assertEqual(
    state.loading,
    "lazy",
    `${context} — the iframe should be lazy-loaded`,
  );
  assertEqual(
    state.placeholder,
    false,
    `${context} — the placeholder should be removed`,
  );
}

/* Brings the embed into view, so lazy loading cannot hide its request, and
   requires exactly one locally aborted attempt for it in the given phase. */
async function assertEmbedRequestAborted(
  page,
  { log, mapSrc, request, phase, context = phase },
) {
  await page.locator(`${MAP} iframe`).scrollIntoViewIfNeeded();

  assertEqual(
    await request,
    BLOCKED_BY_CLIENT,
    `${context} — the embed request should be aborted locally`,
  );
  assertDeepEqual(
    attemptsIn(log, phase),
    [mapSrc],
    `${context} — the embed should be the only off-origin request`,
  );
}

/* Runs before any page script. A stored consent is written underneath the
   failure first, so the map can only stay closed on load if the module's read
   is actually refused. */
function makeStorageUnavailable({ key, mode }) {
  const refuse = () => {
    throw new DOMException("Storage is unavailable.", "SecurityError");
  };

  try {
    window.localStorage.setItem(key, "true");
  } catch {
    /* about:blank has no accessible storage; the real page writes it. */
  }

  if (mode === "access-denied") {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: refuse,
    });
  } else {
    for (const method of ["getItem", "setItem", "removeItem", "clear"]) {
      Storage.prototype[method] = refuse;
    }
  }
}

const STORAGE_FAILURE_MODES = ["access-denied", "operations-throw"];

const mapConsentScenarios = [
  {
    name: "map-consent-gates-the-embed-and-honours-stored-consent",
    async run({ browser, baseURL }) {
      /* Before consent, with the harness guard fully strict. */
      const mapSrc = await withPage(
        browser,
        pageOptions(baseURL),
        async ({ context, page }) => {
          const log = await interceptOffOriginRequests(context, baseURL);
          await openPage(page, ROUTE);

          const src = await page.locator(MAP).getAttribute("data-map-src");
          assert(
            src?.startsWith(EMBED_URL_PREFIX),
            `data-map-src should be a Google Maps embed URL, got ${JSON.stringify(src)}`,
          );
          assertEqual(
            await readConsent(page),
            null,
            `a new visitor should start without a stored ${CONSENT_STORAGE_KEY}`,
          );
          await assertGateClosed(page, BEFORE_CONSENT);

          await page.locator(MAP).scrollIntoViewIfNeeded();
          const premature = await page
            .waitForEvent("request", {
              predicate: (request) =>
                isOffOrigin(new URL(request.url()), new URL(baseURL).origin),
              timeout: PRE_CONSENT_OBSERVATION_MS,
            })
            .then(
              (request) => request.url(),
              (error) => {
                if (error?.name === "TimeoutError") return null;
                throw error;
              },
            );
          assertEqual(
            premature,
            null,
            `${BEFORE_CONSENT} — no off-origin request should be issued with the map area in view`,
          );
          assertDeepEqual(
            attemptsIn(log, BEFORE_CONSENT),
            [],
            `${BEFORE_CONSENT} — no off-origin request should be attempted`,
          );
          await assertGateClosed(page, `${BEFORE_CONSENT}, map area in view`);

          return src;
        },
      );

      /* Explicit consent, then a reload that must restore the map unaided. */
      await withPage(
        browser,
        pageOptions(baseURL, [mapSrc]),
        async ({ context, page }) => {
          const log = await interceptOffOriginRequests(context, baseURL);
          await openPage(page, ROUTE);
          await assertGateClosed(page, "before the click");

          log.phase = AFTER_CONSENT;
          const consented = waitForAbortedEmbed(page, mapSrc, AFTER_CONSENT);
          await loadButton(page).click();

          await assertMapLoaded(page, AFTER_CONSENT);
          assertEqual(
            await readConsent(page),
            "true",
            `${AFTER_CONSENT} — the click should store ${CONSENT_STORAGE_KEY}`,
          );
          await assertEmbedRequestAborted(page, {
            log,
            mapSrc,
            request: consented,
            phase: AFTER_CONSENT,
          });

          log.phase = AFTER_RELOAD;
          const restored = waitForAbortedEmbed(page, mapSrc, AFTER_RELOAD);
          const response = await page.reload({ waitUntil: "load" });
          assertEqual(response?.status(), 200, `${ROUTE} should be reloaded`);
          await page.waitForFunction(() => Boolean(window.SC), null, {
            timeout: 5000,
          });

          await assertMapLoaded(page, AFTER_RELOAD);
          await assertEmbedRequestAborted(page, {
            log,
            mapSrc,
            request: restored,
            phase: AFTER_RELOAD,
          });
          assertDeepEqual(
            attemptsIn(log, BEFORE_CONSENT),
            [],
            "before the click — no off-origin request should be attempted",
          );
        },
      );

      /* Unavailable storage: the click alone must still load the map. */
      for (const mode of STORAGE_FAILURE_MODES) {
        await withPage(
          browser,
          pageOptions(baseURL, [mapSrc]),
          async ({ context, page }) => {
            const log = await interceptOffOriginRequests(context, baseURL);
            await page.addInitScript(makeStorageUnavailable, {
              key: CONSENT_STORAGE_KEY,
              mode,
            });
            await openPage(page, ROUTE);

            assertEqual(
              await readConsent(page),
              "threw SecurityError",
              `${mode} — storage should be unavailable to the page`,
            );
            await assertGateClosed(page, `${mode}, before the click`);

            log.phase = AFTER_CONSENT;
            const consented = waitForAbortedEmbed(
              page,
              mapSrc,
              `${mode}, ${AFTER_CONSENT}`,
            );
            await loadButton(page).click();

            await assertMapLoaded(page, `${mode}, ${AFTER_CONSENT}`);
            await assertEmbedRequestAborted(page, {
              log,
              mapSrc,
              request: consented,
              phase: AFTER_CONSENT,
              context: `${mode}, ${AFTER_CONSENT}`,
            });
            assertDeepEqual(
              attemptsIn(log, BEFORE_CONSENT),
              [],
              `${mode}, before the click — no off-origin request should be attempted`,
            );
          },
        );
      }
    },
  },
];

export { mapConsentScenarios };

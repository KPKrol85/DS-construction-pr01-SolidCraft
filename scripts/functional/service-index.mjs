/* Home service-index scenarios.

   The #oferta index leads with the turnkey entry and lists the five
   specialties after it. Every entry carries two links: the image asks for a
   quote (#kontakt) and the title opens the service page. Home images are plain
   links, not lightbox triggers; the gallery lightbox is covered by
   lightbox.mjs on a service page. */

import {
  DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
  assert,
  assertDeepEqual,
  assertEqual,
  openPage,
  withPage,
} from "./harness.mjs";

const HOME_PAGE = "/index.html";

/* A home image that opens a lightbox never navigates; fail fast instead of
   waiting out the default timeout. */
const NAVIGATION_WAIT = { timeout: 5000 };

const ENTRIES = [
  ["oferta-kompleksowe", "Remonty kompleksowe", "oferta/remonty.html"],
  ["oferta-lazienki", "Łazienki", "oferta/lazienki.html"],
  ["oferta-malowanie", "Malowanie i gładzie", "oferta/malowanie.html"],
  ["oferta-kafelkowanie", "Kafelkowanie", "oferta/kafelkowanie.html"],
  ["oferta-elektryka", "Elektryka", "oferta/elektryka.html"],
  ["oferta-hydraulika", "Hydraulika", "oferta/hydraulika.html"],
];

const quoteLink = (id) => `#${id} > a[href="#kontakt"]`;
const titleLink = (id) => `#${id} h3 a`;

async function assertNoLightbox(page, context) {
  const state = await page.evaluate(() => ({
    dialogs: document.querySelectorAll(".lb-wrap").length,
    scrollLocked: document.documentElement.classList.contains("lb-no-scroll"),
  }));
  assertEqual(state.dialogs, 0, `${context} — no lightbox should exist`);
  assert(!state.scrollLocked, `${context} — the page should not be locked`);
}

const serviceIndexScenarios = [
  {
    name: "home-service-index-order-and-link-contract",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ page }) => {
          await openPage(page, HOME_PAGE);

          const entries = await page.evaluate(() =>
            [
              ...document.querySelectorAll("#oferta article[id^='oferta-']"),
            ].map((article) => {
              const quote = article.querySelector(":scope > a");
              const heading = document.getElementById(
                article.getAttribute("aria-labelledby"),
              );
              const desc = document.getElementById(
                article.getAttribute("aria-describedby"),
              );
              return {
                id: article.id,
                quoteHref: quote?.getAttribute("href"),
                quoteLabel: quote?.getAttribute("aria-label"),
                titleHref: heading?.querySelector("a")?.getAttribute("href"),
                labelledByOwnHeading:
                  heading?.tagName === "H3" && article.contains(heading),
                describedByOwnText: Boolean(desc && article.contains(desc)),
                extraControls: article.querySelectorAll(
                  '[tabindex], [role="button"]',
                ).length,
              };
            }),
          );

          assertDeepEqual(
            entries.map((entry) => entry.id),
            ENTRIES.map(([id]) => id),
            "the index should list the featured entry first, then the five specialties",
          );

          for (const [id, name, href] of ENTRIES) {
            const entry = entries.find((item) => item.id === id);
            assertEqual(entry.quoteHref, "#kontakt", `${id} image link target`);
            assertEqual(
              entry.quoteLabel,
              `Zamów wycenę — ${name}`,
              `${id} image link name`,
            );
            assertEqual(entry.titleHref, href, `${id} title link target`);
            assert(
              entry.labelledByOwnHeading && entry.describedByOwnText,
              `${id} should be labelled and described by its own heading and text`,
            );
            assertEqual(
              entry.extraControls,
              0,
              `${id} should expose only its two links as controls`,
            );
          }

          await assertNoLightbox(page, "on the home page");

          /* Keyboard order follows DOM order: image, then title, per entry. */
          const expectedOrder = ENTRIES.flatMap(([, , href]) => [
            "#kontakt",
            href,
          ]);
          await page.locator(quoteLink(ENTRIES[0][0])).focus();
          const actualOrder = [
            await page.evaluate(() =>
              document.activeElement.getAttribute("href"),
            ),
          ];
          for (let i = 1; i < expectedOrder.length; i += 1) {
            await page.keyboard.press("Tab");
            actualOrder.push(
              await page.evaluate(() =>
                document.activeElement.getAttribute("href"),
              ),
            );
          }
          assertDeepEqual(
            actualOrder,
            expectedOrder,
            "Tab should move through each entry's image and title links in DOM order",
          );
        },
      );
    },
  },

  {
    name: "home-service-index-image-requests-quote-and-title-opens-page",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: MOBILE_VIEWPORT },
        async ({ page }) => {
          await openPage(page, HOME_PAGE);

          await page.locator(`${quoteLink("oferta-kompleksowe")} img`).click();
          await page.waitForURL("**/index.html#kontakt", NAVIGATION_WAIT);
          await assertNoLightbox(page, "after clicking the featured image");

          await openPage(page, HOME_PAGE);
          await page.locator(quoteLink("oferta-hydraulika")).focus();
          await page.keyboard.press("Enter");
          await page.waitForURL("**/index.html#kontakt", NAVIGATION_WAIT);
          await assertNoLightbox(page, "after Enter on a specialty image link");

          await openPage(page, HOME_PAGE);
          const [response] = await Promise.all([
            page.waitForNavigation({
              url: "**/oferta/lazienki.html",
              ...NAVIGATION_WAIT,
            }),
            page.locator(titleLink("oferta-lazienki")).click(),
          ]);
          assertEqual(
            response?.status(),
            200,
            "the title link should load its service page",
          );
        },
      );
    },
  },
];

export { serviceIndexScenarios };

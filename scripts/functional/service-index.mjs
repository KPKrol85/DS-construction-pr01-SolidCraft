/* Home service-index and service contact entry scenarios.

   The #oferta index leads with the turnkey entry and lists the five
   specialties after it. The image links to #kontakt and the title opens the
   service page. The gallery lightbox is covered by lightbox.mjs on a service
   page.

   Every service-specific contact entry point — each home image link and both
   contact CTAs of each service page — lands on #kontakt with that service
   selected in the form's static select[name="usluga"]. */

import {
  AssertionError,
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

/* Service page, its service value, and its two contact CTAs: the upper one in
   the content and the closing one in the end band. */
const SERVICE_PAGES = [
  ["/oferta/remonty.html", "Remonty kompleksowe"],
  ["/oferta/lazienki.html", "Łazienki"],
  ["/oferta/malowanie.html", "Malowanie i gładzie"],
  ["/oferta/kafelkowanie.html", "Kafelkowanie"],
  ["/oferta/elektryka.html", "Elektryka"],
  ["/oferta/hydraulika.html", "Hydraulika"],
];
const UPPER_CONTACT_CTA = "main section:not(.cta) .block-cta a";
const CLOSING_CONTACT_CTA = "main section.cta .block-cta a";

const SERVICE_FIELD = '#kontakt form select[name="usluga"]';

const contactLink = (id) => `#${id} > a[href="#kontakt"]`;
const titleLink = (id) => `#${id} h3 a`;

async function readServiceField(page) {
  return page.evaluate(
    (selector) => document.querySelector(selector)?.value ?? null,
    SERVICE_FIELD,
  );
}

/* Waits for a contact landing to settle: the home page has loaded and
   prefillService() has dropped the query while keeping #kontakt. */
async function waitForContactLanding(page, context) {
  await page.waitForURL(
    (url) => url.pathname.endsWith("/index.html"),
    NAVIGATION_WAIT,
  );
  try {
    await page.waitForFunction(
      () => location.search === "" && location.hash === "#kontakt",
      null,
      NAVIGATION_WAIT,
    );
  } catch {
    throw new AssertionError(
      `${context} — expected index.html#kontakt without a query, found ${page.url()}`,
    );
  }
}

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
          const heroPhone = page
            .locator(".hero__cta")
            .getByRole("link", { name: "Zadzwoń do autora", exact: true });
          assertEqual(
            await heroPhone.getAttribute("href"),
            "tel:+48533537091",
            "the hero phone CTA should call the project author",
          );
          const homeContact = page
            .locator("#oferta .block-cta")
            .getByRole("link", { name: "Kontakt z autorem", exact: true });
          assertEqual(
            await homeContact.getAttribute("href"),
            "#kontakt",
            "the service-index CTA should open author contact",
          );

          const entries = await page.evaluate(() =>
            [
              ...document.querySelectorAll("#oferta article[id^='oferta-']"),
            ].map((article) => {
              const contact = article.querySelector(":scope > a");
              const heading = document.getElementById(
                article.getAttribute("aria-labelledby"),
              );
              const desc = document.getElementById(
                article.getAttribute("aria-describedby"),
              );
              return {
                id: article.id,
                contactHref: contact?.getAttribute("href"),
                contactLabel: contact?.getAttribute("aria-label"),
                contactService: contact?.dataset.usluga,
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

          const serviceOptions = await page.evaluate(
            (selector) =>
              [...(document.querySelector(selector)?.options || [])].map(
                (option) => option.value,
              ),
            SERVICE_FIELD,
          );

          for (const [id, name, href] of ENTRIES) {
            const entry = entries.find((item) => item.id === id);
            assertEqual(
              entry.contactHref,
              "#kontakt",
              `${id} image link target`,
            );
            assertEqual(
              entry.contactLabel,
              `Kontakt z autorem — ${name}`,
              `${id} image link name`,
            );
            assertEqual(
              entry.contactService,
              name,
              `${id} image link service value`,
            );
            assert(
              serviceOptions.includes(name),
              `the form's service field should offer "${name}"`,
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
          await page.locator(contactLink(ENTRIES[0][0])).focus();
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
    name: "home-service-index-image-opens-contact-and-title-opens-page",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: MOBILE_VIEWPORT },
        async ({ page }) => {
          await openPage(page, HOME_PAGE);

          await page
            .locator(`${contactLink("oferta-kompleksowe")} img`)
            .click();
          await page.waitForURL("**/index.html#kontakt", NAVIGATION_WAIT);
          await assertNoLightbox(page, "after clicking the featured image");
          assertEqual(
            await readServiceField(page),
            "Remonty kompleksowe",
            "clicking the featured image should select its service",
          );
          assert(
            await page.locator(SERVICE_FIELD).isVisible(),
            "the selected service should be visible in the form",
          );

          await openPage(page, HOME_PAGE);
          await page.locator(contactLink("oferta-hydraulika")).focus();
          await page.keyboard.press("Enter");
          await page.waitForURL("**/index.html#kontakt", NAVIGATION_WAIT);
          await assertNoLightbox(page, "after Enter on a specialty image link");
          assertEqual(
            await readServiceField(page),
            "Hydraulika",
            "Enter on a specialty image link should select its service",
          );

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

  {
    name: "home-service-index-image-links-select-every-service",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ page }) => {
          await openPage(page, HOME_PAGE);
          assertEqual(
            await readServiceField(page),
            "",
            "the service field should start with no service selected",
          );

          /* One page, every link in turn: each activation replaces the
             previous choice, including one made manually in the form. */
          for (const [id, name] of ENTRIES) {
            await page.locator(SERVICE_FIELD).selectOption("");
            await page.locator(contactLink(id)).click();
            await page.waitForURL("**/index.html#kontakt", NAVIGATION_WAIT);
            assertEqual(
              await readServiceField(page),
              name,
              `clicking the ${id} image link should select its service`,
            );
          }

          await page.locator(SERVICE_FIELD).selectOption("Elektryka");
          await page.locator(contactLink("oferta-lazienki")).focus();
          await page.keyboard.press("Enter");
          assertEqual(
            await readServiceField(page),
            "Łazienki",
            "Enter on an image link should replace a manual choice",
          );

          const fields = await page.evaluate(
            () => document.querySelectorAll('[name="usluga"]').length,
          );
          assertEqual(
            fields,
            1,
            "image links should never add a second usluga field",
          );
          assertEqual(
            new URL(page.url()).hash,
            "#kontakt",
            "image links should keep plain #kontakt navigation",
          );
        },
      );
    },
  },

  {
    name: "service-pages-pass-their-service-from-both-contact-ctas",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ page }) => {
          for (const [route, name] of SERVICE_PAGES) {
            for (const [label, selector] of [
              ["upper", UPPER_CONTACT_CTA],
              ["closing", CLOSING_CONTACT_CTA],
            ]) {
              const context = `${route} ${label} contact CTA`;
              await openPage(page, route);

              const cta = page.locator(selector);
              assertEqual(
                await cta.count(),
                1,
                `${context} — exactly one should exist`,
              );
              assertEqual(
                (await cta.textContent()).trim(),
                "Kontakt z autorem",
                `${context} — visible label`,
              );
              const target = await cta.evaluate((link) => {
                const url = new URL(link.href);
                return {
                  path: url.pathname,
                  hash: url.hash,
                  service: url.searchParams.get("usluga"),
                };
              });
              assertDeepEqual(
                target,
                { path: "/index.html", hash: "#kontakt", service: name },
                `${context} — target`,
              );

              await cta.click();
              await waitForContactLanding(page, context);
              assertEqual(
                await readServiceField(page),
                name,
                `${context} — the form should arrive with the service selected`,
              );
            }
          }
        },
      );
    },
  },
];

export { serviceIndexScenarios };

/* Navigation scenarios — the responsive drawer, the Oferta submenu and the
   current service page. Rendered state, ARIA state and keyboard reachability
   must agree on both sides of the shared 1024 px navigation breakpoint. */

import {
  DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
  NAVIGATION_BREAKPOINT,
  assert,
  assertDeepEqual,
  assertEqual,
  assertFocusOn,
  assertFocusWithin,
  hasClass,
  openPage,
  withPage,
} from "./harness.mjs";

const SERVICE_LINKS = [
  "oferta/lazienki.html",
  "oferta/malowanie.html",
  "oferta/kafelkowanie.html",
  "oferta/elektryka.html",
  "oferta/hydraulika.html",
  "oferta/remonty.html",
];

const NON_SERVICE_PAGES = [
  "/index.html",
  "/404.html",
  "/offline.html",
  "/cookies.html",
  "/polityka-prywatnosci.html",
  "/regulamin.html",
  "/thank-you.html",
];

const CURRENT_SERVICE = '#dd-oferta a[aria-current="page"]';
const REPRESENTATIVE_SERVICE = "/oferta/kafelkowanie.html";

async function assertBelowBreakpoint(page) {
  const isMobileLayout = await page.evaluate(
    (breakpoint) => !window.matchMedia(`(min-width: ${breakpoint}px)`).matches,
    NAVIGATION_BREAKPOINT,
  );
  assert(
    isMobileLayout,
    `viewport should sit below the ${NAVIGATION_BREAKPOINT} px navigation breakpoint`,
  );
}

async function assertCurrentService(page, route) {
  const current = page.locator(CURRENT_SERVICE);
  assertEqual(
    await page.locator('.site-header a[aria-current="page"]').count(),
    1,
    `${route} should have exactly one current-page header link`,
  );
  assertEqual(
    await current.count(),
    1,
    `${route} should mark exactly one submenu destination as current`,
  );
  assertEqual(
    await current.evaluate((link) => new URL(link.href).pathname),
    route,
    `${route} should mark its own service destination`,
  );
  assert(
    await hasClass(page, "#dd-oferta-trigger", "is-active"),
    `${route} should mark the Oferta category as active`,
  );
  assertEqual(
    await page.locator("#dd-oferta-trigger").getAttribute("aria-current"),
    null,
    "the category trigger should not claim to be a current page",
  );
}

async function assertServiceStyle(page, context) {
  assert(
    await page.locator(CURRENT_SERVICE).isVisible(),
    `${context} — the current service should be visible in the open submenu`,
  );
  const style = await page.evaluate((selector) => {
    const current = document.querySelector(selector);
    const other = document.querySelector(
      "#dd-oferta a:not([aria-current]):not(:focus):not(:hover)",
    );
    const read = (node) => {
      const computed = getComputedStyle(node);
      return {
        background: computed.backgroundColor,
        weight: Number(computed.fontWeight),
        shadow: computed.boxShadow,
      };
    };
    const bounds = current.getBoundingClientRect();
    return {
      current: read(current),
      other: read(other),
      underlineWidth: parseFloat(
        getComputedStyle(
          document.querySelector("#dd-oferta-trigger"),
          "::after",
        ).width,
      ),
      inViewport:
        bounds.left >= 0 &&
        bounds.right <= innerWidth &&
        bounds.top >= 0 &&
        bounds.bottom <= innerHeight,
    };
  }, CURRENT_SERVICE);

  assert(
    style.current.background !== style.other.background,
    `${context} — the current service should have a distinct background`,
  );
  assert(
    style.current.weight > style.other.weight,
    `${context} — the current service should have a stronger text weight`,
  );
  assert(
    style.current.shadow !== "none" &&
      style.current.shadow !== style.other.shadow,
    `${context} — a visible marker should distinguish the current service`,
  );
  assert(
    style.underlineWidth > 0,
    `${context} — the active Oferta category should retain its underline`,
  );
  assert(
    style.inViewport,
    `${context} — the current service should fit on screen`,
  );
}

async function assertServiceSubmenuState(page, open, context) {
  assertEqual(
    await hasClass(page, "#dd-oferta", "open"),
    open,
    `${context} — the submenu open class should match its state`,
  );
  assertEqual(
    await page.locator("#dd-oferta").isVisible(),
    open,
    `${context} — submenu visibility should match its state`,
  );
  assertEqual(
    await page.locator("#dd-oferta-trigger").getAttribute("aria-expanded"),
    String(open),
    `${context} — aria-expanded should match submenu visibility`,
  );
}

async function tabThroughServiceLinks(page) {
  for (const [index, href] of SERVICE_LINKS.entries()) {
    if (index > 0) await page.keyboard.press("Tab");
    await assertFocusOn(
      page,
      `#dd-oferta a[href="../${href}"]`,
      `keyboard navigation should reach ${href}`,
    );
  }
}

const navigationScenarios = [
  {
    name: "nav-drawer-open-and-close",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: MOBILE_VIEWPORT },
        async ({ page }) => {
          await openPage(page, "/index.html");
          await assertBelowBreakpoint(page);

          const toggle = page.locator(".nav-toggle");
          const menu = page.locator("#navMenu");

          assert(
            await toggle.isVisible(),
            "the menu button should be the drawer's control below the breakpoint",
          );
          assert(!(await menu.isVisible()), "the drawer should start closed");
          assert(
            !(await hasClass(page, "#navMenu", "open")),
            "the drawer should start without its open state class",
          );
          assertEqual(
            await toggle.getAttribute("aria-expanded"),
            "false",
            "the closed drawer should report aria-expanded=false",
          );

          await toggle.click();

          assert(
            await menu.isVisible(),
            "activating the menu button should open the drawer",
          );
          assert(
            await hasClass(page, "#navMenu", "open"),
            "the open drawer should carry its open state class",
          );
          assertEqual(
            await toggle.getAttribute("aria-expanded"),
            "true",
            "the open drawer should report aria-expanded=true",
          );
          assertEqual(
            await toggle.getAttribute("aria-label"),
            "Zamknij menu",
            "the menu button label should describe the close action while open",
          );
          assert(
            await hasClass(page, "html", "is-nav-open"),
            "the document should carry the open-navigation state class",
          );
          await assertFocusWithin(
            page,
            "#navMenu",
            "opening the drawer should move focus into it",
          );

          await toggle.click();

          assert(
            !(await menu.isVisible()),
            "activating the menu button again should close the drawer",
          );
          assert(
            !(await hasClass(page, "#navMenu", "open")),
            "the closed drawer should drop its open state class",
          );
          assertEqual(
            await toggle.getAttribute("aria-expanded"),
            "false",
            "the closed drawer should report aria-expanded=false again",
          );
          assertEqual(
            await toggle.getAttribute("aria-label"),
            "Otwórz menu",
            "the menu button label should describe the open action once closed",
          );
          assert(
            !(await hasClass(page, "html", "is-nav-open")),
            "closing the drawer should clear the open-navigation state class",
          );
          await assertFocusOn(
            page,
            ".nav-toggle",
            "closing the drawer should restore focus to its control",
          );
        },
      );
    },
  },

  {
    name: "nav-oferta-submenu-in-drawer",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: MOBILE_VIEWPORT },
        async ({ page }) => {
          await openPage(page, "/index.html");
          await assertBelowBreakpoint(page);

          const urlBeforeSubmenu = page.url();
          const trigger = page.locator("#dd-oferta-trigger");
          const submenu = page.locator("#dd-oferta");

          await page.locator(".nav-toggle").click();

          assert(
            !(await submenu.isVisible()),
            "the Oferta submenu should start closed inside the drawer",
          );
          assertEqual(
            await trigger.getAttribute("aria-expanded"),
            "false",
            "the closed submenu should report aria-expanded=false",
          );

          await trigger.click();

          assert(
            await hasClass(page, "#dd-oferta", "open"),
            "the submenu's open class is its authoritative state",
          );
          assert(
            await submenu.isVisible(),
            "the open submenu should be rendered",
          );
          assertEqual(
            await trigger.getAttribute("aria-expanded"),
            "true",
            "aria-expanded should match the rendered submenu state",
          );
          assertEqual(
            page.url(),
            urlBeforeSubmenu,
            "opening the submenu should not navigate away from the page",
          );

          const links = submenu.locator("a");
          assertEqual(
            await links.count(),
            SERVICE_LINKS.length,
            "the mobile submenu should list every service page",
          );
          assertDeepEqual(
            await links.evaluateAll((nodes) =>
              nodes.map((node) => node.getAttribute("href")),
            ),
            SERVICE_LINKS,
            "the submenu should link to the six maintained service pages",
          );

          /* Reachability is checked the way a keyboard visitor experiences it:
             opening the submenu focuses its first item, and Tab must walk the
             remaining five without leaving the list. */
          await assertFocusOn(
            page,
            `#dd-oferta a[href="${SERVICE_LINKS[0]}"]`,
            "opening the submenu should focus its first service link",
          );

          for (const href of SERVICE_LINKS.slice(1)) {
            await page.keyboard.press("Tab");
            await assertFocusOn(
              page,
              `#dd-oferta a[href="${href}"]`,
              `Tab should reach the ${href} link`,
            );
          }

          await page.keyboard.press("Escape");

          assert(
            !(await hasClass(page, "#dd-oferta", "open")),
            "Escape inside the submenu should close it",
          );
          assert(
            !(await submenu.isVisible()),
            "the closed submenu should no longer be rendered",
          );
          assertEqual(
            await trigger.getAttribute("aria-expanded"),
            "false",
            "aria-expanded should follow the submenu back to closed",
          );
          await assertFocusOn(
            page,
            "#dd-oferta-trigger",
            "closing the submenu should restore focus to its trigger",
          );
          assert(
            await hasClass(page, "#navMenu", "open"),
            "closing the submenu should leave the drawer itself open",
          );
        },
      );
    },
  },

  {
    name: "nav-top-link-same-page-and-cross-page",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: MOBILE_VIEWPORT },
        async ({ page }) => {
          const homeRoute = "/index.html?ref=qa";
          await openPage(page, homeRoute);
          const homeURL = new URL(homeRoute, baseURL).href;

          /* Records each scroll, focus and history call made by the top-link
             path, so a single activation can be shown to act exactly once. */
          await page.evaluate(() => {
            const calls = { scroll: 0, push: 0, replace: 0, focus: 0 };
            window.__topCalls = calls;
            const wrap = (obj, key, counter) => {
              const original = obj[key];
              obj[key] = function (...args) {
                calls[counter] += 1;
                return original.apply(this, args);
              };
            };
            wrap(window, "scrollTo", "scroll");
            wrap(history, "pushState", "push");
            wrap(history, "replaceState", "replace");
            wrap(HTMLElement.prototype, "focus", "focus");
          });
          const resetCalls = () =>
            page.evaluate(() => {
              Object.keys(window.__topCalls).forEach((key) => {
                window.__topCalls[key] = 0;
              });
            });
          const readCalls = () =>
            page.evaluate(() => ({ ...window.__topCalls }));
          const scrollAway = async () => {
            await page.evaluate(() => {
              document.querySelector("#kontakt").scrollIntoView();
            });
            await page.waitForFunction(() => window.scrollY > 0);
          };

          /* Drawer "Strona główna" link: one coordinated action. */
          await scrollAway();
          const historyLength = await page.evaluate(() => history.length);
          await page.locator(".nav-toggle").click();
          await resetCalls();
          await page.locator("#navMenu a.scroll-top").click();

          const drawerCalls = await readCalls();
          assertEqual(drawerCalls.scroll, 1, "one scroll per top activation");
          assertEqual(
            drawerCalls.push,
            0,
            "no history entry is pushed on home",
          );
          assertEqual(drawerCalls.replace, 1, "one URL replacement on home");
          assertEqual(
            await page.evaluate(() => window.scrollY),
            0,
            "the page should be scrolled to the top",
          );
          assertEqual(page.url(), homeURL, "home keeps the query, drops #top");
          assertEqual(
            await page.evaluate(() => history.length),
            historyLength,
            "the activation should not add a history entry",
          );
          assert(
            !(await hasClass(page, "#navMenu", "open")),
            "activating the top link should close the drawer",
          );
          assertEqual(
            await page.locator(".nav-toggle").getAttribute("aria-expanded"),
            "false",
            "the drawer control should report aria-expanded=false",
          );
          await assertFocusOn(page, "#main", "focus should move to main");
          assertEqual(
            await page.locator("#main").getAttribute("tabindex"),
            "-1",
            "main should be temporarily focusable",
          );
          await page.waitForFunction(
            () => !document.querySelector("#main").hasAttribute("tabindex"),
            null,
            { timeout: 2000 },
          );
          await page.waitForFunction(
            () =>
              document
                .querySelector("#navMenu a.scroll-top")
                .getAttribute("aria-current") === "true",
            null,
            { timeout: 2000 },
          );

          /* Keyboard activation of the header brand link. */
          await scrollAway();
          await resetCalls();
          await page.locator(".site-header a.brand").focus();
          await page.keyboard.press("Enter");
          const keyCalls = await readCalls();
          assertEqual(keyCalls.scroll, 1, "Enter should scroll once");
          assertEqual(keyCalls.replace, 1, "Enter should update the URL once");
          assertEqual(
            await page.evaluate(() => window.scrollY),
            0,
            "Enter should reach the top",
          );
          assertEqual(page.url(), homeURL, "Enter keeps the home URL policy");
          await assertFocusOn(page, "#main", "Enter should focus main");

          /* Modified clicks keep native behaviour. */
          const modifiedPrevented = await page.evaluate(() => {
            const link = document.querySelector("#footer a.brand-footer");
            let prevented = null;
            const probe = (e) => {
              prevented = e.defaultPrevented;
              e.preventDefault();
            };
            window.addEventListener("click", probe, { once: true });
            link.dispatchEvent(
              new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                button: 0,
                ctrlKey: true,
              }),
            );
            return prevented;
          });
          assertEqual(
            modifiedPrevented,
            false,
            "a modified click should not be intercepted",
          );

          /* Subpage top links still navigate to the home page natively. */
          await openPage(page, "/oferta/lazienki.html");
          await page.locator(".nav-toggle").click();
          await Promise.all([
            page.waitForURL("**/index.html#top"),
            page.locator("#navMenu a.scroll-top").click(),
          ]);
          assertEqual(
            new URL(page.url()).pathname,
            "/index.html",
            "the subpage home link should load the home page",
          );
        },
      );
    },
  },

  {
    name: "nav-current-service-on-all-shared-header-pages",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ page }) => {
          for (const href of SERVICE_LINKS) {
            const route = `/${href}`;
            await openPage(page, route);
            await assertCurrentService(page, route);
            await assertServiceSubmenuState(page, false, route);
          }

          for (const route of NON_SERVICE_PAGES) {
            await openPage(page, route);
            assertEqual(
              await page.locator(CURRENT_SERVICE).count(),
              0,
              `${route} should not mark any service as the current page`,
            );
            assert(
              !(await hasClass(page, "#dd-oferta-trigger", "is-active")),
              `${route} should not statically activate the Oferta category`,
            );
          }
        },
      );
    },
  },

  {
    name: "nav-service-submenu-desktop-current-style-and-keyboard",
    async run({ browser, baseURL }) {
      for (const theme of ["light", "dark"]) {
        await withPage(
          browser,
          { baseURL, viewport: DESKTOP_VIEWPORT },
          async ({ context, page }) => {
            await context.addInitScript((value) => {
              localStorage.setItem("theme", value);
            }, theme);
            await openPage(page, REPRESENTATIVE_SERVICE);
            const initialURL = page.url();
            const trigger = page.locator("#dd-oferta-trigger");
            await assertCurrentService(page, REPRESENTATIVE_SERVICE);
            await assertServiceSubmenuState(page, false, `${theme} initial`);
            assertEqual(
              await trigger.getAttribute("aria-haspopup"),
              "true",
              "the trigger should retain its submenu semantics",
            );
            assertEqual(
              await trigger.getAttribute("aria-controls"),
              "dd-oferta",
              "the trigger should retain its submenu relationship",
            );

            await trigger.hover();
            await assertServiceSubmenuState(page, true, `${theme} hover`);
            await assertServiceStyle(page, `${theme} desktop`);
            await page.mouse.move(0, 200);
            await assertServiceSubmenuState(
              page,
              false,
              `${theme} pointer leave`,
            );

            await trigger.focus();
            await assertServiceSubmenuState(
              page,
              true,
              `${theme} keyboard focus`,
            );
            await page.keyboard.press("Tab");
            await tabThroughServiceLinks(page);
            await page.keyboard.press("Escape");
            await assertServiceSubmenuState(page, false, `${theme} Escape`);
            await assertFocusOn(
              page,
              "#dd-oferta-trigger",
              "desktop Escape should restore focus to the submenu trigger",
            );
            await assertCurrentService(page, REPRESENTATIVE_SERVICE);
            assertEqual(
              page.url(),
              initialURL,
              "opening and closing the service submenu should not navigate",
            );
          },
        );
      }
    },
  },

  {
    name: "nav-service-submenu-mobile-current-style-and-keyboard",
    async run({ browser, baseURL }) {
      for (const theme of ["light", "dark"]) {
        await withPage(
          browser,
          { baseURL, viewport: MOBILE_VIEWPORT },
          async ({ context, page }) => {
            await context.addInitScript((value) => {
              localStorage.setItem("theme", value);
            }, theme);
            await openPage(page, REPRESENTATIVE_SERVICE);
            await assertBelowBreakpoint(page);
            const initialURL = page.url();
            const trigger = page.locator("#dd-oferta-trigger");
            const toggle = page.locator(".nav-toggle");
            await assertCurrentService(page, REPRESENTATIVE_SERVICE);
            await toggle.click();
            await assertServiceSubmenuState(page, false, `${theme} initial`);

            for (const key of ["Enter", "Space"]) {
              await trigger.focus();
              await page.keyboard.press(key);
              await assertServiceSubmenuState(page, true, `${theme} ${key}`);
              await assertServiceStyle(page, `${theme} mobile ${key}`);
              await tabThroughServiceLinks(page);
              await page.keyboard.press("Escape");
              await assertServiceSubmenuState(page, false, `${theme} Escape`);
              await assertFocusOn(
                page,
                "#dd-oferta-trigger",
                "mobile Escape should restore focus to the submenu trigger",
              );
              assert(
                await hasClass(page, "#navMenu", "open"),
                "submenu Escape should leave the mobile drawer open",
              );
              await assertCurrentService(page, REPRESENTATIVE_SERVICE);
            }

            await trigger.click();
            await assertServiceSubmenuState(page, true, `${theme} click`);
            await toggle.click();
            await assertServiceSubmenuState(
              page,
              false,
              `${theme} drawer close`,
            );
            assertEqual(
              await toggle.getAttribute("aria-expanded"),
              "false",
              "closing the drawer should clear its expanded state",
            );
            await assertFocusOn(
              page,
              ".nav-toggle",
              "closing the service-page drawer should restore focus to its control",
            );
            await assertCurrentService(page, REPRESENTATIVE_SERVICE);
            assertEqual(
              page.url(),
              initialURL,
              "service submenu controls should preserve the current URL",
            );
          },
        );
      }
    },
  },

  {
    name: "nav-home-scrollspy-oferta-and-contact",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ page }) => {
          await openPage(page, "/index.html");
          await page.locator("#dd-oferta-trigger").focus();
          await assertServiceSubmenuState(page, true, "home keyboard focus");
          await page.keyboard.press("Tab");
          await assertFocusOn(
            page,
            `#dd-oferta a[href="${SERVICE_LINKS[0]}"]`,
            "Tab should enter the home-page service submenu",
          );
          await page.keyboard.press("Escape");
          await assertServiceSubmenuState(page, false, "home Escape");
          await assertFocusOn(
            page,
            "#dd-oferta-trigger",
            "home Escape should restore focus without reopening the submenu",
          );
          await page.evaluate(() => document.fonts.ready);
          for (const id of ["oferta", "kontakt"]) {
            const section = page.locator(`#${id}`);
            await section.scrollIntoViewIfNeeded();
            /* Let content-visibility resolve before scrolling into the
               section, away from its moving boundary and the header offset. */
            await section.evaluate(async (node) => {
              await new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(resolve)),
              );
              const bounds = node.getBoundingClientRect();
              window.scrollTo({
                top:
                  scrollY +
                  bounds.top +
                  Math.min(bounds.height / 4, innerHeight / 4),
                behavior: "instant",
              });
            });
            await page.waitForFunction(
              (sectionId) => {
                const active = document.querySelector(
                  `#navMenu > li > a[href="#${sectionId}"]`,
                );
                return (
                  active?.classList.contains("is-active") &&
                  active.getAttribute("aria-current") === "true"
                );
              },
              id,
              { timeout: 2000 },
            );
            assertEqual(
              await hasClass(page, "#dd-oferta-trigger", "is-active"),
              id === "oferta",
              `home ScrollSpy should track the ${id} section`,
            );
            assertEqual(
              await page.locator(CURRENT_SERVICE).count(),
              0,
              "home ScrollSpy should not mark any service page as current",
            );
          }
        },
      );
    },
  },
];

export { navigationScenarios };

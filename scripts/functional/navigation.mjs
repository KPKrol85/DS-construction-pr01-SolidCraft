/* Navigation scenarios — the responsive drawer and the Oferta submenu.

   Both run below the 1024 px navigation breakpoint that js/modules/nav.js and
   css/modules/layout.css share, because that is the only viewport where the
   drawer and the mobile submenu exist. The assertions target the interaction
   contract — rendered state, ARIA state and keyboard reachability agreeing
   with each other — not the markup, which the static checks already cover. */

import {
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
];

export { navigationScenarios };

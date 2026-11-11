/* First-visit project modal scenarios.

   Every other scenario starts as a returning visitor, with the modal
   pre-accepted by the harness. These run as first-time visitors instead
   (`preAcceptProjectBanner: false`), each in its own browser context, so one
   scenario's dismissal can never hide the modal from the next.

   They assert the contract js/modules/project-banner.js owns: focus moves into
   the dialog and stays there under real Tab and Shift+Tab input, Escape and
   the accept button each close it with its visibility, ARIA state and scroll
   lock in agreement, the acceptance survives a reload, and none of that depends
   on localStorage being usable. */

import {
  DESKTOP_VIEWPORT,
  PROJECT_BANNER_STORAGE_KEY,
  assert,
  assertEqual,
  assertFocusOn,
  assertFocusWithin,
  hasClass,
  openPage,
  withPage,
} from "./harness.mjs";

const HOME_PAGE = "/index.html";
const BANNER = "#projectBanner";
const ACCEPT_BUTTON = "#projectBannerAccept";
const MODAL_BODY_CLASS = "has-project-modal";

/* Every keyboard-reachable control, in document order — the generic tab
   order, deliberately not a copy of the module's own focusable query. */
const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const firstVisit = (baseURL) => ({
  baseURL,
  viewport: DESKTOP_VIEWPORT,
  preAcceptProjectBanner: false,
});

async function bodyOverflowY(page) {
  return page.evaluate(() => getComputedStyle(document.body).overflowY);
}

async function readAcceptance(page) {
  return page.evaluate(
    (key) => window.localStorage.getItem(key),
    PROJECT_BANNER_STORAGE_KEY,
  );
}

/* The modal's control count, and the 1-based position of the focused element
   among those controls — 0 when focus is on anything else. */
async function readModalFocus(page) {
  return page.evaluate(
    ({ banner, tabbable }) => {
      const controls = [
        ...document.querySelector(banner).querySelectorAll(tabbable),
      ];
      return {
        count: controls.length,
        position: controls.indexOf(document.activeElement) + 1,
      };
    },
    { banner: BANNER, tabbable: TABBABLE },
  );
}

async function assertBannerOpen(page, context) {
  const banner = page.locator(BANNER);

  assert(
    await banner.isVisible(),
    `${context} — the project modal should be visible`,
  );
  assertEqual(
    await banner.getAttribute("aria-hidden"),
    "false",
    `${context} — the open modal should be exposed to assistive technology`,
  );
  assert(
    await hasClass(page, "body", MODAL_BODY_CLASS),
    `${context} — the open modal should add ${MODAL_BODY_CLASS} to the body`,
  );
  assertEqual(
    await bodyOverflowY(page),
    "hidden",
    `${context} — the open modal should lock page scrolling`,
  );
}

async function assertBannerDismissed(page, context) {
  const banner = page.locator(BANNER);

  assert(
    !(await banner.isVisible()),
    `${context} — the project modal should not be visible`,
  );
  assert(
    await banner.evaluate((el) => el.hasAttribute("hidden")),
    `${context} — the dismissed modal should carry the hidden attribute`,
  );
  assertEqual(
    await banner.getAttribute("aria-hidden"),
    "true",
    `${context} — the dismissed modal should be hidden from assistive technology`,
  );
  assert(
    !(await hasClass(page, "body", MODAL_BODY_CLASS)),
    `${context} — dismissal should remove ${MODAL_BODY_CLASS} from the body`,
  );
  assert(
    (await bodyOverflowY(page)) !== "hidden",
    `${context} — dismissal should release the scroll lock`,
  );
}

async function pressAndExpectControl(page, key, position, context) {
  await page.keyboard.press(key);
  await assertFocusWithin(
    page,
    BANNER,
    `${context} should keep focus inside the modal`,
  );
  assertEqual(
    (await readModalFocus(page)).position,
    position,
    `${context} should focus modal control ${position}`,
  );
}

async function openAsFirstVisitor(page) {
  await openPage(page, HOME_PAGE);

  assertEqual(
    await readAcceptance(page),
    null,
    "a first visit should start without a stored acceptance",
  );
  await assertBannerOpen(page, "on a first visit");
  await assertFocusWithin(
    page,
    BANNER,
    "opening the modal should move focus into it",
  );
}

async function assertAcceptancePersists(page, context) {
  assertEqual(
    await readAcceptance(page),
    "true",
    `${context} should store ${PROJECT_BANNER_STORAGE_KEY}`,
  );

  await openPage(page, HOME_PAGE);
  await assertBannerDismissed(page, `after a reload following ${context}`);
}

/* Runs before any page script, theme-init.js included. A real acceptance is
   written underneath the failure first, so the modal can only open if every
   read the page makes is actually refused. */
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

/* Both shapes of unavailable storage: the property itself throwing, as when
   site data is blocked, and every operation throwing on a reachable object. */
const STORAGE_FAILURE_MODES = ["access-denied", "operations-throw"];

const DISMISSALS = [
  {
    name: "Escape",
    dismiss: (page) => page.keyboard.press("Escape"),
  },
  {
    name: "the accept button",
    dismiss: (page) => page.locator(ACCEPT_BUTTON).click(),
  },
];

const projectBannerScenarios = [
  {
    name: "project-banner-first-visit-traps-focus-and-escape-persists",
    async run({ browser, baseURL }) {
      await withPage(browser, firstVisit(baseURL), async ({ page }) => {
        await openAsFirstVisitor(page);

        const { count } = await readModalFocus(page);
        assert(
          count >= 2,
          `the modal should expose at least two controls to cycle through, found ${count}`,
        );

        /* Forward through every control, then wrap from the last to the first. */
        for (let position = 1; position <= count; position += 1) {
          await pressAndExpectControl(
            page,
            "Tab",
            position,
            `Tab step ${position}`,
          );
        }
        await assertFocusOn(
          page,
          ACCEPT_BUTTON,
          "the accept button should be the modal's last control",
        );
        await pressAndExpectControl(
          page,
          "Tab",
          1,
          "Tab from the last control",
        );

        /* Backward: wrap from the first to the last, step back to the first
           and wrap again, then cross the forward boundary once more. */
        await pressAndExpectControl(
          page,
          "Shift+Tab",
          count,
          "Shift+Tab from the first control",
        );
        for (let position = count - 1; position >= 1; position -= 1) {
          await pressAndExpectControl(
            page,
            "Shift+Tab",
            position,
            `Shift+Tab towards control ${position}`,
          );
        }
        await pressAndExpectControl(
          page,
          "Shift+Tab",
          count,
          "a second Shift+Tab from the first control",
        );
        await pressAndExpectControl(
          page,
          "Tab",
          1,
          "a second Tab from the last control",
        );

        await page.keyboard.press("Escape");

        await assertBannerDismissed(page, "after Escape");
        await assertAcceptancePersists(page, "Escape");
      });
    },
  },

  {
    name: "project-banner-accept-button-dismisses-and-persists",
    async run({ browser, baseURL }) {
      await withPage(browser, firstVisit(baseURL), async ({ page }) => {
        await openAsFirstVisitor(page);

        await page.locator(ACCEPT_BUTTON).click();

        await assertBannerDismissed(page, "after the accept button");
        await assertAcceptancePersists(page, "the accept button");
      });
    },
  },

  {
    name: "project-banner-dismisses-with-unavailable-storage",
    async run({ browser, baseURL }) {
      for (const mode of STORAGE_FAILURE_MODES) {
        for (const { name, dismiss } of DISMISSALS) {
          const context = `${mode}, ${name}`;

          await withPage(browser, firstVisit(baseURL), async ({ page }) => {
            await page.addInitScript(makeStorageUnavailable, {
              key: PROJECT_BANNER_STORAGE_KEY,
              mode,
            });
            await openPage(page, HOME_PAGE);

            assertEqual(
              await page.evaluate(() => {
                try {
                  window.localStorage.getItem("probe");
                  return "readable";
                } catch (error) {
                  return error.name;
                }
              }),
              "SecurityError",
              `${context} — storage should be unavailable to the page`,
            );
            await assertBannerOpen(page, `${context} — on a first visit`);
            await assertFocusWithin(
              page,
              BANNER,
              `${context} — opening the modal should move focus into it`,
            );

            await dismiss(page);

            await assertBannerDismissed(page, `${context} — after dismissal`);
          });
        }
      }
    },
  },
];

export { projectBannerScenarios };

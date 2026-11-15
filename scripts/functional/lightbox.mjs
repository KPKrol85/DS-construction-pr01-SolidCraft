/* Service-gallery lightbox scenarios.

   oferta/lazienki.html is the representative gallery page the accessibility
   gate has scanned since before O-05, and all six service pages share the
   generated gallery structure, so one page covers the contract.

   The scenarios assert what PH6-01/PH6-02 established: one tab stop per item,
   keyboard activation that opens the dialog instead of following the anchor to
   the raw JPEG, and a dialog that owns its own controls and focus. IMP-UX-03
   adds the active item's authored data-lb-caption and its "n z 6" position,
   kept in step with every navigation path and announced without moving
   focus. */

import {
  DESKTOP_VIEWPORT,
  assert,
  assertEqual,
  assertFocusOn,
  assertFocusWithin,
  assertIncludes,
  hasClass,
  openPage,
  withPage,
} from "./harness.mjs";

const GALLERY_PAGE = "/oferta/lazienki.html";
const GALLERY_ITEM = ".gallery a.gallery-item";
const DIALOG = ".lb-wrap";
const INFO = `${DIALOG} .lb-info`;
const ITEM_COUNT = 6;
const NARROW_VIEWPORT = { width: 320, height: 568 };

const itemSelector = (n) =>
  `${GALLERY_ITEM}[href$="bathr-0${n}-2048x1536.jpg"]`;

async function currentLightboxImage(page) {
  return page.locator(`${DIALOG} img`).first().getAttribute("src");
}

async function authoredCaption(page, n) {
  const caption = await page
    .locator(itemSelector(n))
    .getAttribute("data-lb-caption");
  assert(caption?.trim(), `gallery item ${n} should carry an authored caption`);
  return caption.trim();
}

/* What the dialog shows for the active item; display: none leaves no client
   rects, so `rendered` is false while the dialog is closed. */
async function readLightboxInfo(page) {
  return page.evaluate((selector) => {
    const info = document.querySelector(selector);
    return {
      rendered: Boolean(info && info.getClientRects().length > 0),
      counter: info?.querySelector(".lb-counter")?.textContent ?? null,
      caption: info?.querySelector(".lb-caption")?.textContent ?? null,
    };
  }, INFO);
}

async function assertLightboxInfo(page, n, context) {
  const info = await readLightboxInfo(page);
  assert(info.rendered, `${context} — the caption block should be visible`);
  assertEqual(
    info.counter,
    `${n} z ${ITEM_COUNT}`,
    `${context} — the counter should show the item's gallery position`,
  );
  assertEqual(
    info.caption,
    await authoredCaption(page, n),
    `${context} — the caption should be the item's authored data-lb-caption`,
  );
  assertIncludes(
    await currentLightboxImage(page),
    `bathr-0${n}`,
    `${context} — the caption and counter should describe the displayed image`,
  );
}

async function assertDialogOpen(page, context) {
  assert(
    await hasClass(page, DIALOG, "is-open"),
    `${context} — the lightbox dialog should be open`,
  );
  assertEqual(
    await page.locator(DIALOG).getAttribute("aria-hidden"),
    "false",
    `${context} — the open dialog should not be hidden from assistive technology`,
  );
  assert(
    await hasClass(page, "html", "lb-no-scroll"),
    `${context} — the open dialog should lock page scrolling`,
  );
}

async function assertDialogClosed(page, context) {
  assert(
    !(await hasClass(page, DIALOG, "is-open")),
    `${context} — the lightbox dialog should be closed`,
  );
  assertEqual(
    await page.locator(DIALOG).getAttribute("aria-hidden"),
    "true",
    `${context} — the closed dialog should be hidden from assistive technology`,
  );
  assert(
    !(await hasClass(page, "html", "lb-no-scroll")),
    `${context} — closing the dialog should release the scroll lock`,
  );
}

const lightboxScenarios = [
  {
    name: "lightbox-gallery-item-is-one-tab-stop",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ page }) => {
          await openPage(page, GALLERY_PAGE);

          const items = page.locator(GALLERY_ITEM);
          assertEqual(
            await items.count(),
            ITEM_COUNT,
            "the gallery should expose one anchor per item",
          );

          const structure = await page.evaluate((selector) => {
            const anchors = [...document.querySelectorAll(selector)];
            return {
              rawImageHrefs: anchors.filter((a) =>
                (a.getAttribute("href") || "").endsWith(".jpg"),
              ).length,
              nestedFocusables: anchors.reduce(
                (total, anchor) =>
                  total +
                  anchor.querySelectorAll(
                    'a, button, input, select, textarea, [tabindex], [role="button"]',
                  ).length,
                0,
              ),
            };
          }, GALLERY_ITEM);

          assertEqual(
            structure.rawImageHrefs,
            ITEM_COUNT,
            "every item should keep its raw-image href as the no-JavaScript fallback",
          );
          assertEqual(
            structure.nestedFocusables,
            0,
            "an item's image must not add a second control inside the anchor",
          );

          await page.locator(itemSelector(1)).focus();
          await assertFocusOn(
            page,
            itemSelector(1),
            "the first gallery anchor should be focusable",
          );

          await page.keyboard.press("Tab");
          await assertFocusOn(
            page,
            itemSelector(2),
            "Tab should move straight to the next item, so each item is a single tab stop",
          );
        },
      );
    },
  },

  {
    name: "lightbox-enter-opens-dialog-and-escape-restores-focus",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ page }) => {
          await openPage(page, GALLERY_PAGE);

          const pageUrl = page.url();
          const opener = page.locator(itemSelector(1));

          await opener.focus();
          await page.keyboard.press("Enter");

          await assertDialogOpen(page, "after Enter on a gallery anchor");
          assertEqual(
            page.url(),
            pageUrl,
            "Enter should open the lightbox instead of following the anchor to the raw image",
          );

          const dialog = page.locator(DIALOG);
          assertEqual(
            await dialog.getAttribute("role"),
            "dialog",
            "the lightbox should expose a dialog role",
          );
          assertEqual(
            await dialog.getAttribute("aria-modal"),
            "true",
            "the lightbox should expose a modal dialog",
          );

          const controls = await page.evaluate((selector) => {
            const scope = document.querySelector(selector);
            const owned = (control) =>
              document.querySelectorAll(`${selector} ${control}`).length;
            return {
              close: owned(".lb-btn.lb-close"),
              prev: owned(".lb-btn.lb-prev"),
              next: owned(".lb-btn.lb-next"),
              strayControls: [...document.querySelectorAll(".lb-btn")].filter(
                (button) => !scope?.contains(button),
              ).length,
            };
          }, DIALOG);

          assertEqual(
            controls.close,
            1,
            "the close control should be a descendant of the dialog",
          );
          assertEqual(
            controls.prev,
            1,
            "the previous control should be a descendant of the dialog",
          );
          assertEqual(
            controls.next,
            1,
            "the next control should be a descendant of the dialog",
          );
          assertEqual(
            controls.strayControls,
            0,
            "no lightbox control should live outside the dialog it operates",
          );

          await assertFocusOn(
            page,
            `${DIALOG} .lb-close`,
            "opening the dialog should move focus into it",
          );
          assertIncludes(
            await currentLightboxImage(page),
            "bathr-01",
            "the dialog should display the item that opened it",
          );

          await page.keyboard.press("Escape");

          await assertDialogClosed(page, "after Escape");
          await assertFocusOn(
            page,
            itemSelector(1),
            "closing the dialog should restore focus to the originating gallery anchor",
          );
        },
      );
    },
  },

  {
    name: "lightbox-space-opens-and-arrows-change-item",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ page }) => {
          await openPage(page, GALLERY_PAGE);

          await page.locator(itemSelector(2)).focus();
          const scrollBeforeSpace = await page.evaluate(() => window.scrollY);

          await page.keyboard.press("Space");

          await assertDialogOpen(page, "after Space on a gallery anchor");
          assertEqual(
            await page.evaluate(() => window.scrollY),
            scrollBeforeSpace,
            "Space should activate the item rather than scroll the page",
          );
          assertIncludes(
            await currentLightboxImage(page),
            "bathr-02",
            "the dialog should display the item that opened it",
          );

          await page.keyboard.press("ArrowRight");
          assertIncludes(
            await currentLightboxImage(page),
            "bathr-03",
            "ArrowRight should advance to the next item",
          );

          await page.locator(`${DIALOG} .lb-next`).click();
          assertIncludes(
            await currentLightboxImage(page),
            "bathr-04",
            "the next control should advance to the next item",
          );

          await page.locator(`${DIALOG} .lb-prev`).click();
          assertIncludes(
            await currentLightboxImage(page),
            "bathr-03",
            "the previous control should step back one item",
          );

          await page.keyboard.press("ArrowLeft");
          assertIncludes(
            await currentLightboxImage(page),
            "bathr-02",
            "ArrowLeft should step back one item",
          );

          for (let step = 0; step < 4; step += 1) {
            await page.keyboard.press("Tab");
            await assertFocusWithin(
              page,
              DIALOG,
              `Tab step ${step + 1} should keep focus inside the open dialog`,
            );
          }

          await page.keyboard.press("Escape");

          await assertDialogClosed(page, "after Escape");
          await assertFocusOn(
            page,
            itemSelector(2),
            "closing the dialog should restore focus to the originating gallery anchor",
          );
        },
      );
    },
  },

  {
    name: "lightbox-caption-and-position-follow-navigation",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ page }) => {
          await openPage(page, GALLERY_PAGE);

          const contract = await page.evaluate(
            ({ dialogSelector, infoSelector }) => {
              const dialog = document.querySelector(dialogSelector);
              const info = document.querySelector(infoSelector);
              const describedBy = dialog?.getAttribute("aria-describedby");
              return {
                infos: document.querySelectorAll(".lb-info").length,
                insideDialog: Boolean(dialog && info && dialog.contains(info)),
                live: info?.getAttribute("aria-live") ?? null,
                atomic: info?.getAttribute("aria-atomic") ?? null,
                describesDialog: Boolean(
                  describedBy && document.getElementById(describedBy) === info,
                ),
                focusable:
                  (info?.hasAttribute("tabindex") ? 1 : 0) +
                  (info?.querySelectorAll(
                    'a, button, input, select, textarea, [tabindex], [role="button"]',
                  ).length ?? 0),
              };
            },
            { dialogSelector: DIALOG, infoSelector: INFO },
          );

          assertEqual(
            contract.infos,
            1,
            "the page should hold exactly one caption block",
          );
          assert(
            contract.insideDialog,
            "the caption and counter should live inside the dialog",
          );
          assertEqual(
            contract.live,
            "polite",
            "caption and position changes should be announced politely",
          );
          assertEqual(
            contract.atomic,
            "true",
            "each change should announce the position and caption together",
          );
          assert(
            contract.describesDialog,
            "the caption block should be the dialog's accessible description",
          );
          assertEqual(
            contract.focusable,
            0,
            "the caption block must not add a tab stop to the dialog",
          );

          const closed = await readLightboxInfo(page);
          assert(
            !closed.rendered && !closed.counter && !closed.caption,
            "the caption block should be empty and not rendered before the dialog opens",
          );

          await page.locator(itemSelector(3)).focus();
          await page.keyboard.press("Enter");

          await assertDialogOpen(page, "after Enter on the third gallery item");
          await assertLightboxInfo(page, 3, "after opening the third item");

          await page.keyboard.press("ArrowRight");
          await assertLightboxInfo(page, 4, "after ArrowRight");
          await assertFocusOn(
            page,
            `${DIALOG} .lb-close`,
            "ArrowRight should update the caption without moving focus",
          );

          await page.locator(`${DIALOG} .lb-next`).click();
          await assertLightboxInfo(page, 5, "after the next control");
          await assertFocusOn(
            page,
            `${DIALOG} .lb-next`,
            "the next control should keep focus while the caption updates",
          );

          await page.locator(`${DIALOG} .lb-prev`).click();
          await assertLightboxInfo(page, 4, "after the previous control");
          await assertFocusOn(
            page,
            `${DIALOG} .lb-prev`,
            "the previous control should keep focus while the caption updates",
          );

          for (let step = 0; step < 4; step += 1) {
            await page.keyboard.press("ArrowLeft");
          }
          await assertLightboxInfo(
            page,
            ITEM_COUNT,
            "after ArrowLeft wraps past the first item",
          );

          await page.keyboard.press("Escape");

          await assertDialogClosed(page, "after Escape");
          const reclosed = await readLightboxInfo(page);
          assert(
            !reclosed.rendered && !reclosed.counter && !reclosed.caption,
            "closing the dialog should clear and hide the caption block",
          );
          await assertFocusOn(
            page,
            itemSelector(3),
            "closing the dialog should restore focus to the originating gallery anchor",
          );
        },
      );
    },
  },

  {
    name: "lightbox-caption-fits-narrow-viewport",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: NARROW_VIEWPORT },
        async ({ page }) => {
          await openPage(page, GALLERY_PAGE);

          /* The first lazienki caption is the longest of the 36. */
          await page.locator(itemSelector(1)).click();
          await assertDialogOpen(
            page,
            "after opening the first item at 320 px",
          );
          await page.waitForFunction(
            (selector) => {
              const img = document.querySelector(selector);
              return Boolean(img?.complete && img.naturalWidth > 0);
            },
            `${DIALOG} img`,
            { timeout: 5000 },
          );
          await assertLightboxInfo(page, 1, "at 320 px");

          const layout = await page.evaluate(
            ({ dialogSelector, infoSelector }) => {
              const box = (el) => el.getBoundingClientRect();
              const info = document.querySelector(infoSelector);
              const image = box(
                document.querySelector(`${dialogSelector} img`),
              );
              const text = box(info);
              return {
                width: window.innerWidth,
                height: window.innerHeight,
                text: {
                  left: text.left,
                  right: text.right,
                  top: text.top,
                  bottom: text.bottom,
                },
                imageBottom: image.bottom,
                infoOverflows: info.scrollWidth > info.clientWidth,
                pageOverflows:
                  document.documentElement.scrollWidth > window.innerWidth,
              };
            },
            { dialogSelector: DIALOG, infoSelector: INFO },
          );

          assert(
            layout.text.left >= 0 &&
              layout.text.right <= layout.width &&
              layout.text.top >= 0 &&
              layout.text.bottom <= layout.height,
            `the caption block should stay inside the 320 px viewport — got ${JSON.stringify(layout.text)}`,
          );
          assert(
            layout.text.top >= layout.imageBottom,
            "the caption block should sit below the image instead of covering it",
          );
          assert(
            !layout.infoOverflows && !layout.pageOverflows,
            "a long caption should wrap without horizontal overflow",
          );
        },
      );
    },
  },
];

export { lightboxScenarios };

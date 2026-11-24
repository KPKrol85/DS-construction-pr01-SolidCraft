/* Contact-form scenarios — native fallback, enhanced validation, anti-spam
   timing, submission outcomes, and the optional service field (static markup,
   ?usluga= prefill, manual change, serialization).

   The paths are kept apart on purpose: each one is a separate page in a
   separate context, so a failure names the path that broke instead of a step
   inside one long chain.

   Nothing here talks to Netlify. The form posts to its own relative action, so
   the request cannot leave 127.0.0.1 in the first place; on top of that the
   submission paths intercept it inside Playwright and answer it locally, which
   is also how the failure path gets a deterministic non-2xx response. The
   harness fails any scenario that issues an off-origin request. */

import {
  AssertionError,
  DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
  assert,
  assertDeepEqual,
  assertEqual,
  assertFocusOn,
  assertIncludes,
  openPage,
  waitOutAntiSpamWindow,
  withPage,
} from "./harness.mjs";

const FORM = "section#kontakt .form";
const NOTE = `${FORM} .form-note`;
const SUBMIT = `${FORM} button[type="submit"]`;
const SUBMIT_PATH = "/thank-you.html";
const MSG_REMAINING = "#f-msg-remaining";
const MSG_NOTICE = "#f-msg-notice";
const LIMIT_NOTICE = "Osiągnięto limit 1000 znaków.";
const PASTE_NOTICE =
  "Wklejony tekst został skrócony do dostępnego limitu znaków. Sprawdź, czy opis jest kompletny.";

async function assertMessageLength(page, remaining, notice = "") {
  assertEqual(
    await page.locator(MSG_REMAINING).textContent(),
    `Pozostało znaków: ${remaining}.`,
    "remaining message characters",
  );
  assertEqual(
    await page.locator(MSG_NOTICE).textContent(),
    notice,
    "message limit notice",
  );
  if (notice)
    assert(await page.locator(MSG_NOTICE).isVisible(), "visible limit notice");
}

/* A real clipboard write plus the browser paste shortcut exercises native
   maxlength enforcement; dispatchEvent alone cannot perform a default paste. */
async function pasteMessage(page, text, start, end = start) {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.evaluate((value) => navigator.clipboard.writeText(value), text);
  const field = page.locator("#f-msg");
  await field.focus();
  await field.evaluate(
    (el, selection) => el.setSelectionRange(...selection),
    [start, end],
  );
  await page.keyboard.press("ControlOrMeta+V");
  await page.evaluate(() => new Promise(requestAnimationFrame));
}

/* The validation summary counts the fields in error; the optional service
   field is never one of them. */
const MESSAGES = {
  validation: {
    oneField: "Popraw 1 pole formularza.",
    twoFields: "Popraw 2 pola formularza.",
    allFields: "Popraw 4 pola formularza.",
  },
  tooFast: "Odczekaj chwilę i spróbuj ponownie.",
  success:
    "Wiadomość została wysłana przez formularz do KP_Code Digital Studio. Dziękujemy za kontakt z autorem projektu SolidCraft.",
  failure: "Nie udało się wysłać formularza. Spróbuj ponownie.",
};

const FIELD_ERRORS = {
  nameMissing: "Podaj imię i nazwisko (min. 2 znaki).",
  phoneMissing: "Podaj numer telefonu.",
  phoneFormat: "Podaj poprawny numer (np. 533 537 091 lub +48 533 537 091).",
  msgMissing: "Wpisz treść wiadomości.",
  consentMissing:
    "Wymagana jest zgoda na kontakt ze strony KP_Code Digital Studio w sprawie przesłanego zapytania.",
};

const VALID_INPUT = {
  name: "Jan Kowalski",
  phone: "533537091",
  formattedPhone: "533 537 091",
  msg: "Zapytanie testowe o stworzenie strony internetowej.",
};

/* One digit short: present, so not a required-field error, but not a valid
   Polish number either. */
const INCOMPLETE_PHONE = {
  raw: "53353709",
  formatted: "533 537 09",
};

/* The optional service field: an empty default plus the six services, in the
   order of the home index. */
const SERVICE_FIELD = `${FORM} select[name="usluga"]`;
const SERVICE_LABEL = "Przykładowa usługa (opcjonalnie)";
const SERVICE_VALUES = [
  "",
  "Remonty kompleksowe",
  "Łazienki",
  "Malowanie i gładzie",
  "Kafelkowanie",
  "Elektryka",
  "Hydraulika",
];

async function readServiceState(page) {
  return page.evaluate((selector) => {
    const field = document.querySelector(selector);
    return {
      fields: document.querySelectorAll('[name="usluga"]').length,
      value: field?.value ?? null,
      options: [...(field?.options || [])].map((option) => option.value),
      label: field?.labels?.[0]?.textContent.trim() ?? null,
      height: Math.round(field?.getBoundingClientRect().height ?? 0),
      search: location.search,
      hash: location.hash,
    };
  }, SERVICE_FIELD);
}

/* Records every POST and answers submissions locally. A successful POST
   serves the same confirmation document as a regular GET. */
async function interceptSubmission(context, { status }) {
  const submissions = [];

  context.on("request", (request) => {
    if (request.method() !== "POST") return;
    submissions.push({
      url: request.url(),
      method: request.method(),
      type: request.resourceType(),
      contentType: request.headers()["content-type"] || "",
      body: request.postData() || "",
    });
  });

  await context.route(`**${SUBMIT_PATH}`, async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    if (status === 200) {
      await route.fulfill({ response: await context.request.get(SUBMIT_PATH) });
      return;
    }

    await route.fulfill({
      status,
      contentType: "text/html; charset=utf-8",
      body: "<!doctype html><title>Intercepted submission</title>",
    });
  });

  return submissions;
}

/* initContactForm() upgrades the status paragraph to role="status"; waiting
   for that is how a scenario knows the module — and its anti-spam timer — has
   started. The returned timestamp is therefore at or after the timer's start. */
async function openContactForm(
  page,
  { route = "/index.html", waitUntil = "load" } = {},
) {
  await openPage(page, route, { waitUntil });
  await page.waitForFunction(
    () =>
      Boolean(
        document.querySelector(
          'section#kontakt .form .form-note[role="status"]',
        ),
      ),
    null,
    { timeout: 5000 },
  );
  return Date.now();
}

async function fillValidForm(page, { consent = true } = {}) {
  await page.locator("#f-name").fill(VALID_INPUT.name);
  await page.locator("#f-phone").fill(VALID_INPUT.phone);
  await page.locator("#f-msg").fill(VALID_INPUT.msg);
  await page.locator("#f-consent").setChecked(consent);
}

async function readFormState(page) {
  return page.evaluate(() => {
    const form = document.querySelector("section#kontakt .form");
    const note = form.querySelector(".form-note");
    const field = (id) => document.getElementById(id);
    const error = (id) => {
      const el = document.getElementById(id);
      return {
        text: (el.textContent || "").trim(),
        clipped: el.classList.contains("visually-hidden"),
        height: Math.round(el.getBoundingClientRect().height),
      };
    };

    return {
      busy: form.getAttribute("aria-busy"),
      submitDisabled: form.querySelector('button[type="submit"]').disabled,
      note: {
        text: (note.textContent || "").trim(),
        ok: note.classList.contains("is-ok"),
        err: note.classList.contains("is-err"),
        live: note.getAttribute("aria-live"),
      },
      values: {
        service: field("f-service").value,
        name: field("f-name").value,
        phone: field("f-phone").value,
        msg: field("f-msg").value,
        consent: field("f-consent").checked,
      },
      invalid: {
        service: field("f-service").getAttribute("aria-invalid"),
        name: field("f-name").getAttribute("aria-invalid"),
        phone: field("f-phone").getAttribute("aria-invalid"),
        msg: field("f-msg").getAttribute("aria-invalid"),
        consent: field("f-consent").getAttribute("aria-invalid"),
      },
      errors: {
        name: error("f-name-error"),
        phone: error("f-phone-error"),
        msg: error("f-msg-error"),
        consent: error("f-consent-error"),
      },
    };
  });
}

/* The submission paths settle asynchronously, so the scenarios wait for the
   status region to reach its expected text instead of sleeping. */
async function waitForNote(page, expected, context) {
  try {
    await page.waitForFunction(
      (text) =>
        document
          .querySelector("section#kontakt .form .form-note")
          ?.textContent.trim() === text,
      expected,
      { timeout: 8000 },
    );
  } catch {
    const actual = await page.locator(NOTE).textContent();
    throw new AssertionError(
      `${context} — expected the status region to read ${JSON.stringify(expected)}, it reads ${JSON.stringify((actual || "").trim())}`,
    );
  }
}

function assertVisibleError(error, expected, context) {
  assertEqual(error.text, expected, `${context} — error text`);
  assert(
    !error.clipped,
    `${context} — the error message should leave its visually-hidden state`,
  );
  assert(
    error.height > 1,
    `${context} — the error message should be rendered, measured ${error.height} px tall`,
  );
}

function assertNoFieldError(state, field, context) {
  assertEqual(
    state.invalid[field],
    null,
    `${context} — should not be marked invalid`,
  );
  assertEqual(
    state.errors[field].text,
    "",
    `${context} — should show no error message`,
  );
  assert(
    state.errors[field].clipped,
    `${context} — the empty error message should stay visually hidden`,
  );
}

const contactFormScenarios = [
  ...["js-disabled", "main-script-blocked"].map((mode) => ({
    name: `contact-form-native-fallback-with-${mode}`,
    async run({ browser, baseURL }) {
      const javaScriptEnabled = mode === "main-script-blocked";
      await withPage(
        browser,
        {
          baseURL,
          viewport: DESKTOP_VIEWPORT,
          javaScriptEnabled,
          preAcceptProjectBanner: false,
        },
        async ({ context, page }) => {
          if (javaScriptEnabled) {
            await context.route(
              new URL("/js/script.js", baseURL).href,
              (route) => route.abort(),
            );
          }
          const submissions = await interceptSubmission(context, {
            status: 200,
          });
          const response = await page.goto("/#kontakt");
          assertEqual(response?.status(), 200, "the contact page should load");

          const form = page.locator(FORM);
          const submit = page.locator(SUBMIT);
          assert(
            await page.locator("#kontakt-desc").isVisible(),
            "the contact purpose should be visible on direct entry",
          );
          const purpose = await page.locator("#kontakt-desc").innerText();
          for (const text of [
            "projekt demonstracyjny",
            "KP_Code Digital Studio o stworzenie strony internetowej",
            "fikcyjnymi danymi",
            "wyceny są tu wyłącznie przykładowe",
          ]) {
            assertIncludes(purpose, text, "the contact purpose");
          }
          assertIncludes(
            await form.getAttribute("aria-describedby"),
            "kontakt-desc",
            "the form should reference its purpose",
          );
          assertEqual(
            await form.getAttribute("novalidate"),
            null,
            "native validation should stay enabled without the submit handler",
          );
          assertEqual(
            await form.getAttribute("action"),
            SUBMIT_PATH,
            "the form should post to its local action",
          );

          await submit.click();
          await assertFocusOn(page, "#f-name", "empty required fields");
          assertEqual(submissions.length, 0, "empty fields should block POST");

          await fillValidForm(page, { consent: false });
          await submit.click();
          await assertFocusOn(page, "#f-consent", "missing consent");
          assertEqual(
            submissions.length,
            0,
            "missing consent should block POST",
          );

          await page
            .getByRole("checkbox", {
              name: "Wyrażam zgodę na kontakt ze strony KP_Code Digital Studio w sprawie przesłanego zapytania.",
              exact: true,
            })
            .check();
          const action = new URL(SUBMIT_PATH, baseURL).href;
          await Promise.all([page.waitForURL(action), submit.click()]);
          assertEqual(
            submissions.length,
            1,
            "valid input should send one POST",
          );
          const [submission] = submissions;
          assertEqual(submission.url, action, "native POST destination");
          assertEqual(submission.method, "POST", "native submission method");
          assertEqual(
            submission.type,
            "document",
            "native document navigation",
          );
          assertIncludes(
            submission.contentType,
            "application/x-www-form-urlencoded",
            "native form encoding",
          );
          assertDeepEqual(
            [...new URLSearchParams(submission.body)],
            [
              ["form-name", "contact"],
              ["bot-field", ""],
              ["usluga", ""],
              ["name", VALID_INPUT.name],
              ["phone", VALID_INPUT.phone],
              ["msg", VALID_INPUT.msg],
              ["consent", "yes"],
            ],
            "native Netlify form payload",
          );
          assertEqual(
            await page.locator("main .page-status__text").innerText(),
            MESSAGES.success,
            "native confirmation text should match the enhanced confirmation",
          );
        },
      );
    },
  })),
  {
    name: "contact-form-message-length-counts-edits-and-announces-the-limit-once",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: MOBILE_VIEWPORT },
        async ({ page }) => {
          await openContactForm(page);
          await assertMessageLength(page, 1000);
          const semantics = await page.locator("#f-msg").evaluate((el) => {
            const ids = el.getAttribute("aria-describedby").split(/\s+/);
            return {
              maxLength: el.maxLength,
              name: el.name,
              required: el.required,
              ids,
              referencesExist: ids.every((id) =>
                Boolean(document.getElementById(id)),
              ),
              routineLive: Boolean(
                document
                  .getElementById("f-msg-length")
                  .closest('[aria-live], [role="status"], [role="alert"]'),
              ),
              noticeLive: document
                .getElementById("f-msg-notice")
                .getAttribute("aria-live"),
              description: document.getElementById("f-msg-length").textContent,
            };
          });
          assertEqual(semantics.maxLength, 1000, "native maxlength");
          assertEqual(semantics.name, "msg", "Netlify field name");
          assert(
            semantics.required && semantics.referencesExist,
            "required field with valid descriptions",
          );
          assertDeepEqual(
            semantics.ids,
            ["f-msg-length", "f-msg-notice", "f-msg-error"],
            "field descriptions and existing error",
          );
          assertIncludes(
            semantics.description,
            "Maksymalnie 1000 znaków.",
            "visible maximum",
          );
          assert(
            !semantics.routineLive,
            "routine count must stay outside live regions",
          );
          assertEqual(
            semantics.noticeLive,
            "polite",
            "significant notices should be polite",
          );

          const field = page.locator("#f-msg");
          await field.pressSequentially("Opis");
          await assertMessageLength(page, 996);
          await field.press("Backspace");
          await assertMessageLength(page, 997);
          await field.fill("a".repeat(999));
          await field.press("End");
          await field.press("b");
          await assertMessageLength(page, 0, LIMIT_NOTICE);
          assertEqual(
            await field.getAttribute("aria-invalid"),
            null,
            "the limit is not a validation error",
          );
          await page.evaluate(() => {
            window.limitMutations = 0;
            new MutationObserver((entries) => {
              window.limitMutations += entries.length;
            }).observe(document.getElementById("f-msg-notice"), {
              childList: true,
              characterData: true,
              subtree: true,
            });
          });
          await field.pressSequentially("xyz");
          await page.locator("#f-name").focus();
          await assertMessageLength(page, 0, LIMIT_NOTICE);
          assertEqual(
            await page.evaluate(() => window.limitMutations),
            0,
            "blocked typing and blur must not repeat the announcement",
          );
          await field.focus();
          await field.press("Backspace");
          await assertMessageLength(page, 1);
          assertEqual(
            (await field.inputValue()).length,
            999,
            "native typing limit and deletion",
          );
        },
      );
    },
  },
  {
    name: "contact-form-message-paste-reports-only-native-truncation",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ page }) => {
          await openContactForm(page);
          const field = page.locator("#f-msg");
          await page.evaluate(() => {
            window.pasteNoticeMutations = 0;
            new MutationObserver((entries) => {
              window.pasteNoticeMutations += entries.length;
            }).observe(document.getElementById("f-msg-notice"), {
              childList: true,
            });
          });
          await pasteMessage(page, "a".repeat(1200), 0);
          assertEqual(
            await field.inputValue(),
            "a".repeat(1000),
            "native paste retains 1000 characters",
          );
          await assertMessageLength(page, 0, PASTE_NOTICE);
          assertEqual(
            await page.evaluate(() => window.pasteNoticeMutations),
            1,
            "truncation should produce one notice without a competing limit announcement",
          );
          await page.locator("#f-name").focus();
          await assertMessageLength(page, 0, PASTE_NOTICE);

          await field.fill("a".repeat(999));
          await pasteMessage(page, "😀", 999);
          assertEqual(
            await field.inputValue(),
            "a".repeat(999),
            "native maxlength must not split a surrogate pair",
          );
          await assertMessageLength(page, 1, PASTE_NOTICE);

          await field.fill("a".repeat(900));
          await pasteMessage(page, "b".repeat(200), 400);
          assertEqual(
            await field.inputValue(),
            "a".repeat(400) + "b".repeat(100) + "a".repeat(500),
            "partial-field paste preserves surrounding text",
          );
          await assertMessageLength(page, 0, PASTE_NOTICE);

          await field.fill("a".repeat(900));
          await pasteMessage(page, "b".repeat(300), 400, 600);
          assertEqual(
            await field.inputValue(),
            "a".repeat(400) + "b".repeat(300) + "a".repeat(300),
            "selection makes room for an exact-fit paste",
          );
          await assertMessageLength(page, 0, LIMIT_NOTICE);

          await field.fill("a".repeat(900));
          await pasteMessage(page, "b".repeat(400), 400, 600);
          assertEqual(
            await field.inputValue(),
            "a".repeat(400) + "b".repeat(300) + "a".repeat(300),
            "oversized selection replacement",
          );
          await assertMessageLength(page, 0, PASTE_NOTICE);

          await field.fill("a".repeat(1000));
          await pasteMessage(page, "more", 1000);
          await assertMessageLength(page, 0, PASTE_NOTICE);
          assertEqual(
            await field.inputValue(),
            "a".repeat(1000),
            "paste into full field keeps its value",
          );

          await field.fill("");
          await pasteMessage(page, "Opis\r\nprac", 0);
          assertEqual(
            await field.inputValue(),
            "Opis\nprac",
            "native newline normalization",
          );
          await assertMessageLength(page, 991);
          await field.fill("a".repeat(990));
          await pasteMessage(page, "\r\nb".repeat(10), 990);
          assertEqual(
            await field.inputValue(),
            "a".repeat(990) + "\nb".repeat(5),
            "normalized oversized multiline paste",
          );
          await assertMessageLength(page, 0, PASTE_NOTICE);

          await field.fill("Opis");
          await field.dispatchEvent("paste");
          await page.evaluate(() => new Promise(requestAnimationFrame));
          await assertMessageLength(page, 996);
          await field.evaluate((el) =>
            el.addEventListener(
              "paste",
              (event) =>
                Object.defineProperty(event, "clipboardData", { value: null }),
              { once: true, capture: true },
            ),
          );
          await pasteMessage(page, "c".repeat(1200), 4);
          assertEqual(
            (await field.inputValue()).length,
            1000,
            "native paste still enforces maxlength without readable clipboard data",
          );
          await assertMessageLength(page, 0, LIMIT_NOTICE);
          await field.fill("Opis");
          await field.evaluate((el) =>
            el.addEventListener("paste", (event) => event.preventDefault(), {
              once: true,
            }),
          );
          await pasteMessage(page, "c".repeat(1200), 4);
          assertEqual(
            await field.inputValue(),
            "Opis",
            "canceled paste leaves the value intact",
          );
          await assertMessageLength(page, 996);
        },
      );
    },
  },
  {
    name: "contact-form-message-length-syncs-trimming-reset-and-initialization",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: MOBILE_VIEWPORT },
        async ({ page }) => {
          await openContactForm(page);
          const field = page.locator("#f-msg");
          await field.fill("  Opis prac  ");
          await assertMessageLength(page, 987);
          await page.locator("#f-name").focus();
          assertEqual(
            await field.inputValue(),
            "Opis prac",
            "blur trims the message",
          );
          await assertMessageLength(page, 991);
          await field.fill(" " + "a".repeat(998) + " ");
          await assertMessageLength(page, 0, LIMIT_NOTICE);
          await page.locator("#f-name").focus();
          await assertMessageLength(page, 2);
          await pasteMessage(page, "b".repeat(20), 998);
          await assertMessageLength(page, 0, PASTE_NOTICE);
          await page.locator(FORM).evaluate((el) => el.reset());
          await assertMessageLength(page, 1000);
          assertEqual(await field.inputValue(), "", "reset clears the message");

          // Reinitialization must read restored DOM values and clean up listeners.
          await page.evaluate(async () => {
            document.getElementById("f-msg").value = "Gotowy opis";
            const { initContactForm } = await import("/js/modules/forms.js");
            initContactForm();
          });
          await assertMessageLength(page, 989);
          await field.fill("Nowy opis");
          await assertMessageLength(page, 991);
        },
      );
    },
  },
  {
    name: "contact-form-message-length-resets-on-both-anti-spam-paths",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ context, page }) => {
          const submissions = await interceptSubmission(context, {
            status: 200,
          });
          await openContactForm(page);
          for (const spam of ["honeypot", "links"]) {
            await page.locator("#f-msg").fill("a".repeat(1000));
            await assertMessageLength(page, 0, LIMIT_NOTICE);
            if (spam === "honeypot") {
              await page.locator('input[name="bot-field"]').evaluate((el) => {
                el.value = "bot";
              });
            } else {
              await page
                .locator("#f-msg")
                .fill(
                  "https://example.com https://example.org " + "a".repeat(962),
                );
            }
            await page.locator(FORM).evaluate((el) => el.requestSubmit());
            await assertMessageLength(page, 1000);
            assertEqual(
              await page.locator("#f-msg").inputValue(),
              "",
              `${spam} resets the value`,
            );
            assertEqual(
              await page.locator(NOTE).textContent(),
              "",
              `${spam} stays silent`,
            );
          }
          assertEqual(submissions.length, 0, "anti-spam paths never submit");
        },
      );
    },
  },
  {
    name: "contact-form-rejects-an-empty-submission",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ context, page }) => {
          const submissions = await interceptSubmission(context, {
            status: 200,
          });
          const initialisedAt = await openContactForm(page);
          assert(
            await page.locator(FORM).evaluate((form) => form.noValidate),
            "enhanced initialization should enable novalidate",
          );
          await waitOutAntiSpamWindow(page, initialisedAt);

          /* Four required fields are empty; the empty service field is
             optional and must not raise the count to five. */
          await page.locator(SUBMIT).click();
          await waitForNote(
            page,
            MESSAGES.validation.allFields,
            "submitting the empty form",
          );

          const state = await readFormState(page);

          assertEqual(
            state.invalid.name,
            "true",
            "the empty name field should be marked invalid",
          );
          assertEqual(
            state.invalid.phone,
            "true",
            "the empty phone field should be marked invalid",
          );
          assertEqual(
            state.invalid.msg,
            "true",
            "the empty message field should be marked invalid",
          );
          assertEqual(
            state.invalid.consent,
            "true",
            "the unchecked consent box should be marked invalid",
          );
          assertEqual(
            state.invalid.service,
            null,
            "the optional service field should never be marked invalid",
          );

          assertVisibleError(
            state.errors.name,
            FIELD_ERRORS.nameMissing,
            "name field",
          );
          assertVisibleError(
            state.errors.phone,
            FIELD_ERRORS.phoneMissing,
            "phone field",
          );
          assertVisibleError(
            state.errors.msg,
            FIELD_ERRORS.msgMissing,
            "message field",
          );
          assertVisibleError(
            state.errors.consent,
            FIELD_ERRORS.consentMissing,
            "consent field",
          );
          assertEqual(
            await page.locator("#f-consent").getAttribute("aria-describedby"),
            "f-consent-error",
            "consent should reference its validation error",
          );
          assertEqual(
            await page.locator("#f-consent-error").getAttribute("aria-live"),
            "polite",
            "the consent validation error should be announced politely",
          );

          assertEqual(
            state.note.live,
            "polite",
            "the validation summary should be announced politely",
          );
          assert(
            state.note.err,
            "the validation summary should be styled as an error",
          );
          await assertFocusOn(
            page,
            "#f-name",
            "validation should move focus to the first invalid field",
          );
          assertEqual(
            submissions.length,
            0,
            "an invalid form should not be submitted",
          );
        },
      );
    },
  },

  {
    name: "contact-form-reports-every-problem-in-one-attempt",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ context, page }) => {
          const submissions = await interceptSubmission(context, {
            status: 200,
          });
          const initialisedAt = await openContactForm(page);

          /* An empty name and an incomplete phone, with the message and
             consent already valid: both problems must surface together. */
          await page.locator("#f-phone").fill(INCOMPLETE_PHONE.raw);
          await page.locator("#f-msg").fill(VALID_INPUT.msg);
          await page.locator("#f-consent").check();
          await waitOutAntiSpamWindow(page, initialisedAt);

          await page.locator(SUBMIT).click();
          await waitForNote(
            page,
            MESSAGES.validation.twoFields,
            "submitting an empty name and an incomplete phone",
          );

          const state = await readFormState(page);

          assertEqual(
            state.invalid.name,
            "true",
            "the empty name field should be marked invalid",
          );
          assertVisibleError(
            state.errors.name,
            FIELD_ERRORS.nameMissing,
            "name field",
          );
          assertEqual(
            state.invalid.phone,
            "true",
            "the incomplete phone should be marked invalid in the same attempt",
          );
          assertVisibleError(
            state.errors.phone,
            FIELD_ERRORS.phoneFormat,
            "phone field",
          );
          assertEqual(
            state.values.phone,
            INCOMPLETE_PHONE.formatted,
            "the incomplete phone should keep its mask",
          );
          assertNoFieldError(state, "msg", "the filled message field");
          assertNoFieldError(state, "consent", "the ticked consent box");
          assertEqual(
            state.invalid.service,
            null,
            "the optional service field should never be marked invalid",
          );

          assert(
            !/zgod/i.test(state.note.text),
            `the summary should not mention consent once it is given, it reads ${JSON.stringify(state.note.text)}`,
          );
          assert(
            state.note.err,
            "the validation summary should be styled as an error",
          );
          assertEqual(
            state.note.live,
            "polite",
            "the validation summary should be announced politely",
          );
          await assertFocusOn(
            page,
            "#f-name",
            "validation should move focus to the first invalid field",
          );
          assertEqual(
            submissions.length,
            0,
            "an invalid form should not be submitted",
          );
        },
      );
    },
  },

  {
    name: "contact-form-submits-a-phone-corrected-after-a-format-error",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ context, page }) => {
          const submissions = await interceptSubmission(context, {
            status: 200,
          });
          const initialisedAt = await openContactForm(page);
          const phone = page.locator("#f-phone");

          await fillValidForm(page);
          await phone.fill(INCOMPLETE_PHONE.raw);
          await waitOutAntiSpamWindow(page, initialisedAt);

          await page.locator(SUBMIT).click();
          await waitForNote(
            page,
            MESSAGES.validation.oneField,
            "submitting an incomplete phone only",
          );

          const state = await readFormState(page);

          assertEqual(
            state.invalid.phone,
            "true",
            "the incomplete phone should be marked invalid",
          );
          assertVisibleError(
            state.errors.phone,
            FIELD_ERRORS.phoneFormat,
            "phone field",
          );
          assertNoFieldError(state, "name", "the filled name field");
          assertNoFieldError(state, "msg", "the filled message field");
          assertNoFieldError(state, "consent", "the ticked consent box");
          await assertFocusOn(
            page,
            "#f-phone",
            "a single phone error should move focus to the phone field",
          );
          assertEqual(
            submissions.length,
            0,
            "an incomplete phone should not be submitted",
          );

          /* The correction is assigned without an input event, so the
             custom error from the failed attempt is still attached when the
             form is submitted again; it must not outlive the value it
             described. */
          await phone.evaluate((el, value) => {
            el.value = value;
          }, VALID_INPUT.phone);
          assert(
            await phone.evaluate((el) => el.validity.customError),
            "precondition — the earlier phone error should still be attached",
          );

          await page.locator(SUBMIT).click();
          await waitForNote(
            page,
            MESSAGES.success,
            "resubmitting the corrected phone",
          );

          assertEqual(
            submissions.length,
            1,
            "the corrected form should send exactly one request",
          );
          assertEqual(
            new URLSearchParams(submissions[0].body).get("phone"),
            VALID_INPUT.formattedPhone,
            "the corrected phone should be masked before it is sent",
          );

          const after = await readFormState(page);
          assertNoFieldError(after, "phone", "the corrected phone field");
          assertEqual(
            after.busy,
            "false",
            "the form should leave its busy state after the corrected submission",
          );
        },
      );
    },
  },

  {
    name: "contact-form-holds-a-submission-inside-the-anti-spam-window",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ context, page }) => {
          const submissions = await interceptSubmission(context, {
            status: 200,
          });

          // Freeze Date.now() before the form records its anti-spam start time.
          await page.clock.setFixedTime(new Date());
          await openContactForm(page, { waitUntil: "domcontentloaded" });
          await fillValidForm(page);

          await page.locator(SUBMIT).click();
          await waitForNote(
            page,
            MESSAGES.tooFast,
            "submitting inside the anti-spam window",
          );

          const state = await readFormState(page);

          assert(
            state.note.err,
            "the retry message should be styled as an error",
          );
          assertEqual(
            state.values.name,
            VALID_INPUT.name,
            "the entered name should survive the rejection",
          );
          assertEqual(
            state.values.phone,
            VALID_INPUT.formattedPhone,
            "the entered phone should survive the rejection",
          );
          assertEqual(
            state.values.msg,
            VALID_INPUT.msg,
            "the entered message should survive the rejection",
          );
          assertEqual(
            state.values.consent,
            true,
            "the given consent should survive the rejection",
          );
          assertEqual(
            state.busy,
            null,
            "a held submission should never enter the busy state",
          );
          assertEqual(
            state.submitDisabled,
            false,
            "the submit button should stay usable for the retry",
          );
          assertEqual(
            submissions.length,
            0,
            "a submission inside the anti-spam window should not be sent",
          );
        },
      );
    },
  },

  {
    name: "contact-form-posts-a-valid-submission",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ context, page }) => {
          const submissions = await interceptSubmission(context, {
            status: 200,
          });
          const initialisedAt = await openContactForm(page);

          await fillValidForm(page);
          await waitOutAntiSpamWindow(page, initialisedAt);
          await page.locator(SUBMIT).click();
          await waitForNote(page, MESSAGES.success, "a valid submission");

          assertEqual(
            submissions.length,
            1,
            "a valid submission should send exactly one request",
          );

          const [submission] = submissions;
          assertEqual(submission.method, "POST", "the form should use POST");
          assertEqual(
            submission.url,
            new URL(SUBMIT_PATH, baseURL).href,
            "enhanced POST destination",
          );
          assertEqual(
            submission.type,
            "fetch",
            "enhanced submission transport",
          );
          assertIncludes(
            submission.contentType,
            "application/x-www-form-urlencoded",
            "the form should post url-encoded data",
          );

          const body = new URLSearchParams(submission.body);
          assertEqual(
            body.get("form-name"),
            "contact",
            "the posted body should carry the Netlify form name",
          );
          assertEqual(
            body.get("name"),
            VALID_INPUT.name,
            "the posted body should carry the entered name",
          );
          assertEqual(
            body.get("phone"),
            VALID_INPUT.formattedPhone,
            "the posted body should carry the masked phone number",
          );
          assertEqual(
            body.get("msg"),
            VALID_INPUT.msg,
            "the posted body should carry the entered message",
          );
          assertEqual(
            body.get("consent"),
            "yes",
            "the posted body should carry the consent value",
          );
          assertDeepEqual(
            body.getAll("usluga"),
            [""],
            "an unchosen service should post one empty usluga value",
          );

          const state = await readFormState(page);

          assert(
            state.note.ok,
            "the success message should be styled as a success",
          );
          await assertMessageLength(page, 1000);
          assertEqual(
            state.values.name,
            "",
            "a successful submission should reset the name field",
          );
          assertEqual(
            state.values.phone,
            "",
            "a successful submission should reset the phone field",
          );
          assertEqual(
            state.values.msg,
            "",
            "a successful submission should reset the message field",
          );
          assertEqual(
            state.values.consent,
            false,
            "a successful submission should reset the consent box",
          );
          assertEqual(
            state.busy,
            "false",
            "the form should leave its busy state after a successful submission",
          );
          assertEqual(
            state.submitDisabled,
            false,
            "the submit button should be usable again after a successful submission",
          );
          await assertFocusOn(
            page,
            `${FORM} .form-note`,
            "a successful submission should move focus to the status region",
          );
        },
      );
    },
  },

  {
    name: "contact-form-reports-a-failed-submission",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ context, page }) => {
          const submissions = await interceptSubmission(context, {
            status: 500,
          });
          const initialisedAt = await openContactForm(page);

          await fillValidForm(page);
          await page.locator(SERVICE_FIELD).selectOption("Hydraulika");
          await waitOutAntiSpamWindow(page, initialisedAt);
          await page.locator(SUBMIT).click();
          await waitForNote(page, MESSAGES.failure, "a rejected submission");

          assertEqual(
            submissions.length,
            1,
            "a rejected submission should still have been attempted once",
          );
          assertEqual(
            new URLSearchParams(submissions[0].body).get("usluga"),
            "Hydraulika",
            "the attempted submission should carry the chosen service",
          );

          const state = await readFormState(page);

          assert(
            state.note.err,
            "the failure message should be styled as an error",
          );
          await assertMessageLength(page, 1000 - VALID_INPUT.msg.length);
          assertEqual(
            state.values.service,
            "Hydraulika",
            "a failed submission should keep the chosen service",
          );
          assertEqual(
            state.values.name,
            VALID_INPUT.name,
            "a failed submission should keep the entered name",
          );
          assertEqual(
            state.values.msg,
            VALID_INPUT.msg,
            "a failed submission should keep the entered message",
          );
          assertEqual(
            state.values.consent,
            true,
            "a failed submission should keep the given consent",
          );
          assertEqual(
            state.busy,
            "false",
            "the form should leave its busy state after a failed submission",
          );
          assertEqual(
            state.submitDisabled,
            false,
            "the submit button should be usable again after a failed submission",
          );
        },
      );
    },
  },

  {
    name: "contact-form-service-field-is-in-the-static-markup",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ page }) => {
          /* Netlify Forms registers fields from the deployed HTML, so the
             field has to exist before any script runs: the served page is
             parsed here without executing it. */
          const response = await page.request.get(
            new URL("/index.html", baseURL).href,
          );
          assertEqual(response.status(), 200, "/index.html should be served");

          const markup = await page.evaluate(
            (source) => {
              const doc = new DOMParser().parseFromString(source, "text/html");
              const form = doc.querySelector('form[name="contact"]');
              const fields = doc.querySelectorAll('[name="usluga"]');
              const field = fields[0];
              const options = [...(field?.options || [])];
              return {
                netlifyForm: Boolean(form?.hasAttribute("netlify")),
                fields: fields.length,
                tag: field?.tagName.toLowerCase() ?? null,
                insideForm: Boolean(form && field && form.contains(field)),
                required: Boolean(field?.hasAttribute("required")),
                label:
                  doc
                    .querySelector(`label[for="${field?.id}"]`)
                    ?.textContent.trim() ?? null,
                options: options.map((option) => option.value),
                texts: options.slice(1).map((option) => option.textContent),
                preselected: options.filter((option) =>
                  option.hasAttribute("selected"),
                ).length,
              };
            },
            await response.text(),
          );

          assert(
            markup.netlifyForm,
            "the contact form should stay a Netlify form",
          );
          assertEqual(
            markup.fields,
            1,
            "the static page should contain exactly one usluga field",
          );
          assertEqual(
            markup.tag,
            "select",
            "the usluga field should be a select",
          );
          assert(
            markup.insideForm,
            "the usluga field should sit inside the contact form",
          );
          assert(!markup.required, "the service field should be optional");
          assertEqual(markup.label, SERVICE_LABEL, "service field label");
          assertDeepEqual(
            markup.options,
            SERVICE_VALUES,
            "the service field should offer an empty default and the six services",
          );
          assertDeepEqual(
            markup.texts,
            SERVICE_VALUES.slice(1),
            "each service option should read as its own value",
          );
          assertEqual(
            markup.preselected,
            0,
            "no service should be preselected in the markup",
          );
        },
      );
    },
  },

  {
    name: "contact-form-shows-the-service-from-the-url-and-lets-it-change",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: MOBILE_VIEWPORT },
        async ({ page }) => {
          await openContactForm(page, {
            route: "/index.html?usluga=Łazienki#kontakt",
          });

          const state = await readServiceState(page);
          assertEqual(state.value, "Łazienki", "the prefilled service");
          assertEqual(state.label, SERVICE_LABEL, "service field label");
          assert(
            state.height > 1 && (await page.locator(SERVICE_FIELD).isVisible()),
            "the prefilled service should be visible in the form",
          );
          assertEqual(state.fields, 1, "prefill should not add a usluga field");
          assertDeepEqual(
            state.options,
            SERVICE_VALUES,
            "prefill should not change the offered services",
          );
          assertEqual(state.search, "", "the query should leave the URL");
          assertEqual(
            state.hash,
            "#kontakt",
            "the #kontakt fragment should stay",
          );

          const field = page.locator(SERVICE_FIELD);
          await field.selectOption("Kafelkowanie");
          assertEqual(
            (await readServiceState(page)).value,
            "Kafelkowanie",
            "choosing another service should replace the prefilled one",
          );
          await field.selectOption("");
          assertEqual(
            (await readServiceState(page)).value,
            "",
            "the empty option should clear the service",
          );

          /* Keyboard: Tab reaches the field right after the contact facts,
             shows the focus ring, and arrows and Home change and clear it. */
          await page.locator("#kontakt .contact-list a").last().focus();
          await page.keyboard.press("Tab");
          await assertFocusOn(
            page,
            SERVICE_FIELD,
            "Tab should move from the contact facts to the service field",
          );
          const ring = await field.evaluate((el) => {
            const style = getComputedStyle(el);
            return `${style.outlineStyle} ${style.outlineWidth}`;
          });
          assertEqual(ring, "solid 3px", "keyboard focus ring on the field");

          await page.keyboard.press("ArrowDown");
          await page.keyboard.press("ArrowDown");
          assertEqual(
            (await readServiceState(page)).value,
            "Łazienki",
            "ArrowDown should step through the services",
          );
          await page.keyboard.press("Home");
          assertEqual(
            (await readServiceState(page)).value,
            "",
            "Home should return the field to no service",
          );
        },
      );
    },
  },

  {
    name: "contact-form-ignores-an-unsupported-service-value",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ page }) => {
          for (const value of ["Ogrody", "łazienki", '"><img src=x>']) {
            await openContactForm(page, {
              route: `/index.html?usluga=${encodeURIComponent(value)}#kontakt`,
            });

            const state = await readServiceState(page);
            const context = `?usluga=${JSON.stringify(value)}`;
            assertEqual(state.value, "", `${context} — nothing selected`);
            assertDeepEqual(
              state.options,
              SERVICE_VALUES,
              `${context} — no option should be added`,
            );
            assertEqual(state.fields, 1, `${context} — one usluga field`);
            assertEqual(state.search, "", `${context} — query removed`);
            assertEqual(state.hash, "#kontakt", `${context} — fragment kept`);
          }
        },
      );
    },
  },

  {
    name: "contact-form-posts-the-prefilled-service",
    async run({ browser, baseURL }) {
      await withPage(
        browser,
        { baseURL, viewport: DESKTOP_VIEWPORT },
        async ({ context, page }) => {
          const submissions = await interceptSubmission(context, {
            status: 200,
          });
          const initialisedAt = await openContactForm(page, {
            route: "/index.html?usluga=Łazienki#kontakt",
          });

          await fillValidForm(page);
          await waitOutAntiSpamWindow(page, initialisedAt);
          await page.locator(SUBMIT).click();
          await waitForNote(
            page,
            MESSAGES.success,
            "a submission with a prefilled service",
          );

          assertEqual(
            submissions.length,
            1,
            "the submission should send exactly one request",
          );
          assertDeepEqual(
            new URLSearchParams(submissions[0].body).getAll("usluga"),
            ["Łazienki"],
            "the posted body should carry the prefilled service once",
          );
          assertEqual(
            (await readFormState(page)).values.service,
            "",
            "a successful submission should reset the service field",
          );
        },
      );
    },
  },
];

export { contactFormScenarios };

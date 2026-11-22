"use strict";

function initContactForm() {
  if (initContactForm._abort) initContactForm._abort.abort();
  const ac = new AbortController();
  const { signal } = ac;
  initContactForm._abort = ac;
  const form = document.querySelector("section#kontakt .form");
  if (!form) return;
  const note = form.querySelector(".form-note");
  const btnSubmit = form.querySelector('button[type="submit"]');
  const hpInput = form.querySelector('input[name="bot-field"]');
  const nameInput = form.querySelector("#f-name");
  const phoneInput = form.querySelector("#f-phone");
  const msgInput = form.querySelector("#f-msg");
  const msgRemaining = form.querySelector("#f-msg-remaining");
  const msgNotice = form.querySelector("#f-msg-notice");
  const consentInput = form.querySelector("#f-consent");
  const isDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (note) {
    note.setAttribute("role", "status");
    note.setAttribute("aria-atomic", "true");
    note.setAttribute("aria-live", "polite");
    if (!note.hasAttribute("tabindex")) note.setAttribute("tabindex", "-1");
  }
  if (hpInput) {
    const wrap = hpInput.closest("label, div") || hpInput;
    Object.assign(wrap.style, {
      position: "absolute",
      left: "-9999px",
      width: "1px",
      height: "1px",
      overflow: "hidden",
    });
    wrap.setAttribute("aria-hidden", "true");
    hpInput.setAttribute("tabindex", "-1");
    hpInput.setAttribute("autocomplete", "off");
  }

  const startedAt = Date.now();
  const isTooFast = () => Date.now() - startedAt < 2000;
  const looksSpammy = (text) => {
    const t = String(text || "").toLowerCase();
    const links = (t.match(/https?:\/\//g) || []).length;
    return links >= 2 || /viagra|bitcoin|casino/.test(t);
  };

  const setBusy = (busy) => {
    form.setAttribute("aria-busy", busy ? "true" : "false");
    if (btnSubmit) btnSubmit.disabled = !!busy;
  };

  const showNote = (msg, ok = false) => {
    if (!note) return;
    note.textContent = msg || "";
    note.classList.toggle("is-ok", !!ok);
    note.classList.toggle("is-err", !ok && !!msg);
  };

  const encodeForm = (formEl) =>
    new URLSearchParams(new FormData(formEl)).toString();

  const errSpan = (el) => {
    const ids = (el.getAttribute("aria-describedby") || "").split(/\s+/);
    const id = ids.find((x) => x.endsWith("-error"));
    return id ? document.getElementById(id) : null;
  };

  const setFieldError = (el, msg) => {
    if (!el) return;
    el.setAttribute("aria-invalid", "true");
    el.setCustomValidity(msg || "");
    const span = errSpan(el);
    if (span) {
      span.textContent = msg || "";
      span.classList.toggle("visually-hidden", !msg);
    }
  };

  const clearFieldError = (el) => {
    if (!el) return;
    el.removeAttribute("aria-invalid");
    el.setCustomValidity("");
    const span = errSpan(el);
    if (span) {
      span.textContent = "";
      span.classList.add("visually-hidden");
    }
  };

  const formatPLPhone = (raw) => {
    raw = String(raw || "");
    const hasPlus48 = raw.trim().startsWith("+48");
    let digits = raw.replace(/\D/g, "");
    let prefix = "";
    if (hasPlus48) {
      if (digits.startsWith("48")) digits = digits.slice(2);
      prefix = "+48 ";
    }
    digits = digits.slice(0, 9);
    const g1 = digits.slice(0, 3);
    const g2 = digits.slice(3, 6);
    const g3 = digits.slice(6, 9);
    const grouped = [g1, g2, g3].filter(Boolean).join(" ");
    return (prefix + grouped).trim();
  };

  const isValidPLPhone = (val) => {
    const digits = String(val || "").replace(/\D/g, "");
    if (digits.length === 9) return true;
    if (digits.length === 11 && digits.startsWith("48")) return true;
    return false;
  };

  /* Error message for one validated field, or "" when it is valid. The custom
     error left by an earlier attempt is dropped first, so only the current
     value decides. */
  const fieldError = (el) => {
    el.setCustomValidity("");
    const { validity } = el;
    if (el === nameInput) {
      if (validity.valueMissing) return "Podaj imię i nazwisko (min. 2 znaki).";
      if (validity.tooShort) {
        return "Imię i nazwisko powinno mieć co najmniej 2 znaki.";
      }
    } else if (el === phoneInput) {
      if (validity.valueMissing) return "Podaj numer telefonu.";
      if (!isValidPLPhone(el.value.trim())) {
        return "Podaj poprawny numer (np. 533 537 091 lub +48 533 537 091).";
      }
    } else if (el === msgInput) {
      if (validity.valueMissing) return "Napisz krótki opis prac.";
      if (validity.tooLong) return "Opis może mieć maksymalnie 1000 znaków.";
    } else if (el === consentInput && !el.checked) {
      return "Wymagana zgoda na kontakt w celu wyceny.";
    }
    return "";
  };

  /* Sets or clears the error of every validated field in one pass and returns
     the invalid ones in form order. The optional service select is not one of
     them. */
  const validateFields = () =>
    [nameInput, phoneInput, msgInput, consentInput].filter((el) => {
      if (!el) return false;
      const message = fieldError(el);
      if (message) setFieldError(el, message);
      else clearFieldError(el);
      return message !== "";
    });

  const pluralPL = new Intl.PluralRules("pl");
  const FIELD_WORDS = { one: "pole", few: "pola", many: "pól" };
  const invalidSummary = (count) =>
    `Popraw ${count} ${FIELD_WORDS[pluralPL.select(count)]} formularza.`;

  const applyPhoneMask = () => {
    if (!phoneInput) return;
    const active = document.activeElement === phoneInput;
    const before = phoneInput.value;
    const after = formatPLPhone(before);
    if (after !== before) {
      phoneInput.value = after;
      if (active && phoneInput.setSelectionRange) {
        phoneInput.setSelectionRange(after.length, after.length);
      }
    }
  };

  let pendingPaste = null;
  const syncMessageLength = (paste = null, announce = true) => {
    if (!msgInput) return;
    const remaining = Math.max(0, msgInput.maxLength - msgInput.value.length);
    if (msgRemaining) {
      msgRemaining.textContent = `Pozostało znaków: ${remaining}.`;
    }
    if (!msgNotice || !announce) return;

    // Confirm the browser retained a prefix of an oversized paste, with the
    // unselected text intact. Missing clipboard data never implies truncation.
    let truncated = false;
    if (paste && !paste.event.defaultPrevented) {
      const value = msgInput.value;
      const insertedLength =
        value.length - paste.prefix.length - paste.suffix.length;
      const inserted = value.slice(
        paste.prefix.length,
        paste.prefix.length + insertedLength,
      );
      truncated =
        insertedLength >= 0 &&
        insertedLength <= paste.capacity &&
        (paste.inserted || paste.capacity === 0) &&
        value.startsWith(paste.prefix) &&
        value.endsWith(paste.suffix) &&
        paste.text.startsWith(inserted) &&
        insertedLength < paste.text.length;
    }
    const message = truncated
      ? "Wklejony tekst został skrócony do dostępnego limitu znaków. Sprawdź, czy opis jest kompletny."
      : remaining === 0
        ? `Osiągnięto limit ${msgInput.maxLength} znaków.`
        : "";
    // Leave an unchanged live region alone, including attempts to type at max.
    if (msgNotice.textContent !== message) msgNotice.textContent = message;
  };
  syncMessageLength();

  msgInput?.addEventListener(
    "paste",
    (e) => {
      pendingPaste = null;
      const text = e.clipboardData
        ?.getData("text/plain")
        .replace(/\r\n?/g, "\n");
      if (!text || !e.isTrusted) return;
      const prefix = msgInput.value.slice(0, msgInput.selectionStart);
      const suffix = msgInput.value.slice(msgInput.selectionEnd);
      const capacity = Math.max(
        0,
        msgInput.maxLength - prefix.length - suffix.length,
      );
      if (text.length <= capacity) return;
      const paste = {
        event: e,
        text,
        prefix,
        suffix,
        capacity,
        inserted: false,
      };
      pendingPaste = paste;
      // A paste into a full field may not emit input. Check after the native
      // default action without replacing it or retaining stale paste state.
      requestAnimationFrame(() => {
        if (signal.aborted || pendingPaste !== paste) return;
        pendingPaste = null;
        syncMessageLength(paste);
      });
    },
    { signal },
  );
  form.addEventListener(
    "input",
    (e) => {
      const t = e.target;
      if (note?.textContent) showNote("", true);
      if (t.matches("input, textarea")) clearFieldError(t);

      if (t === msgInput) {
        if (pendingPaste && e.isTrusted && e.inputType === "insertFromPaste") {
          pendingPaste.inserted = true;
        }
        syncMessageLength(
          e.inputType === "insertFromPaste" ? pendingPaste : null,
        );
        pendingPaste = null;
      }

      if (t === phoneInput) {
        applyPhoneMask();
        const raw = phoneInput.value.trim();
        if (raw === "" || isValidPLPhone(raw)) clearFieldError(phoneInput);
      }
    },
    { signal },
  );
  phoneInput?.addEventListener(
    "paste",
    () => requestAnimationFrame(applyPhoneMask),
    { signal },
  );
  phoneInput?.addEventListener("blur", applyPhoneMask, { signal });
  form.addEventListener(
    "blur",
    (e) => {
      const t = e.target;
      if (t.matches('input[type="text"], textarea')) {
        const before = t.value;
        t.value = t.value.trim();
        if (t === msgInput) syncMessageLength(null, t.value !== before);
      }
    },
    { capture: true, signal },
  );
  form.addEventListener(
    "reset",
    (e) => {
      showNote("", true);
      pendingPaste = null;
      // reset fires before the browser restores the controls' default values.
      queueMicrotask(() => {
        if (signal.aborted || e.defaultPrevented) return;
        syncMessageLength(null, false);
        if (msgNotice) msgNotice.textContent = "";
      });
      form
        .querySelectorAll('[aria-invalid="true"]')
        .forEach((el) => clearFieldError(el));
    },
    { signal },
  );

  let submitting = false;
  signal.addEventListener(
    "abort",
    () => {
      form.noValidate = false;
    },
    { once: true },
  );
  form.addEventListener(
    "submit",
    async (e) => {
      e.preventDefault();
      if (submitting) return;

      if (
        (hpInput && hpInput.value.trim() !== "") ||
        looksSpammy(msgInput?.value)
      ) {
        form.reset();
        return;
      }
      if (isTooFast()) {
        showNote("Odczekaj chwilę i spróbuj ponownie.", false);
        return;
      }
      applyPhoneMask();
      const invalidFields = validateFields();
      if (invalidFields.length > 0) {
        invalidFields[0].focus({ preventScroll: true });
        showNote(invalidSummary(invalidFields.length), false);
        return;
      }

      submitting = true;
      setBusy(true);
      showNote("Wysyłanie…", true);

      const submitUrl = form.getAttribute("action") || "/";
      const timeoutMs = 10000;
      const fetchController = new AbortController();
      const timeoutId = window.setTimeout(
        () => fetchController.abort(),
        timeoutMs,
      );

      try {
        const response = await fetch(submitUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encodeForm(form),
          signal: fetchController.signal,
        });

        if (!response.ok) {
          throw new Error(`Form submit failed: ${response.status}`);
        }

        form
          .querySelectorAll('[aria-invalid="true"]')
          .forEach((el) => el.removeAttribute("aria-invalid"));
        form.reset();
        showNote("Dziękujemy! Skontaktujemy się wkrótce.", true);
        note?.focus?.();
      } catch (err) {
        if (isDev) console.error(err);
        const message = fetchController.signal.aborted
          ? "Przekroczono limit czasu. Spróbuj ponownie."
          : "Nie udało się wysłać formularza. Spróbuj ponownie.";
        showNote(message, false);
      } finally {
        window.clearTimeout(timeoutId);
        setBusy(false);
        submitting = false;
      }
    },
    { signal },
  );
  form.noValidate = true;
}

export { initContactForm };

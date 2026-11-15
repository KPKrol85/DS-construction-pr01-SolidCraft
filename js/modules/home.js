"use strict";

/* === 13 - Home helpers === */

function initHomeHelpers() {
  // Reset previous listeners (if re-initialized)
  if (initHomeHelpers._abort) initHomeHelpers._abort.abort();

  const ac = new AbortController();
  const { signal } = ac;
  initHomeHelpers._abort = ac;

  const isHome =
    !!document.querySelector("#kontakt") ||
    !!document.querySelector("#oferta") ||
    !!document.querySelector("#strona-glowna");

  if (!isHome) {
    window.addEventListener("pagehide", () => ac.abort(), {
      once: true,
      signal,
    });
    return;
  }

  /* Same-page top links are handled by initSmoothTop (ui-core.js). */

  const cleanUrlKeepHash = () => {
    history.replaceState(null, "", location.pathname + location.hash);
  };

  /* The static select[name="usluga"] in #kontakt is the only service field.
     Only its own option values are accepted, so an unknown value leaves the
     current choice untouched instead of adding an option. */
  const serviceField = document.querySelector(
    '#kontakt form select[name="usluga"]',
  );

  const selectService = (service) => {
    if (!serviceField || !service) return;
    const known = [...serviceField.options].some(
      (option) => option.value === service,
    );
    if (known) serviceField.value = service;
  };

  (function prefillService() {
    const service = new URLSearchParams(location.search).get("usluga");
    if (!service) return;

    selectService(service);
    cleanUrlKeepHash();
  })();

  /* Home index image links keep their plain href="#kontakt"; activating one
     (pointer or keyboard, both fire click) selects its service first. */
  document.querySelector("#oferta-grid")?.addEventListener(
    "click",
    (e) => {
      const link = e.target.closest('a[href="#kontakt"][data-usluga]');
      if (link) selectService(link.dataset.usluga);
    },
    { signal },
  );

  /* A page kept in the back/forward cache is restored without re-running
     init, so its listeners stay attached; only a discarded page aborts. */
  window.addEventListener(
    "pagehide",
    (e) => {
      if (!e.persisted) ac.abort();
    },
    { signal },
  );
}

export { initHomeHelpers };

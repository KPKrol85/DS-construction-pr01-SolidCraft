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

  (function prefillService() {
    const form = document.querySelector("#kontakt form");
    if (!form) return;

    const params = new URLSearchParams(location.search);
    const service = params.get("usluga");
    if (!service) return;

    let input = form.querySelector('[name="usluga"]');

    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = "usluga";
      form.appendChild(input);
    }

    input.value = service;
    cleanUrlKeepHash();
  })();

  window.addEventListener("pagehide", () => ac.abort(), { once: true, signal });
}

export { initHomeHelpers };

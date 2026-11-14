"use strict";

/* Footer Year  */
function initFooterYear() {
  const el = document.getElementById("year");
  if (!el) return;
  const yearNow = String(new Date().getFullYear());
  const start = el.getAttribute("data-year-start");
  if (start && /^\d{4}$/.test(start) && start < yearNow) {
    const desired = `${start}–${yearNow}`;
    if (el.textContent !== desired) el.textContent = desired;
    return;
  }
  if (el.textContent !== yearNow) el.textContent = yearNow;
}

/* Scroll to Top
   Sole owner of same-page top-link activation: one click performs the
   scroll, focus placement and URL update. ScrollSpy and home helpers leave
   top links to this handler. URL policy: the home page clears the fragment
   and keeps the query string without adding a history entry; other pages
   push "#top". */
const HOME_PAGE_MARKERS = "#kontakt, #oferta, #strona-glowna";
const TOP_TABINDEX_RELEASE_MS = 800;

function initSmoothTop() {
  if (initSmoothTop._abort) initSmoothTop._abort.abort();
  const ac = new AbortController();
  const { signal } = ac;
  initSmoothTop._abort = ac;
  const prefersNoAnim = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const behavior = prefersNoAnim ? "auto" : "smooth";
  const isVisible = (el) =>
    !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  const getFocusTarget = () => {
    const main =
      document.querySelector("#main") ||
      document.querySelector("main") ||
      document.querySelector(".main");
    if (main && main.getAttribute("aria-hidden") !== "true" && isVisible(main))
      return main;
    const heading = Array.from(document.querySelectorAll("h1")).find(
      (el) => el.getAttribute("aria-hidden") !== "true" && isVisible(el),
    );
    if (heading) return heading;
    const container =
      document.querySelector('[role="main"]') ||
      document.querySelector("[data-page]");
    if (container && container.getAttribute("aria-hidden") !== "true") {
      return container;
    }
    return document.body;
  };
  const focusTarget = () => {
    const target = getFocusTarget();
    if (!target || typeof target.focus !== "function") return;
    const hadTabindex = target.hasAttribute("tabindex");
    if (!hadTabindex) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    if (!hadTabindex) {
      setTimeout(
        () => target.removeAttribute("tabindex"),
        TOP_TABINDEX_RELEASE_MS,
      );
    }
  };
  const updateUrl = () => {
    if (document.querySelector(HOME_PAGE_MARKERS)) {
      history.replaceState(null, "", location.pathname + location.search);
    } else if (history.pushState) {
      history.pushState(null, "", "#top");
    } else {
      location.hash = "#top";
    }
  };
  const isPrimaryClick = (e) =>
    e.button === 0 &&
    !e.defaultPrevented &&
    !e.metaKey &&
    !e.ctrlKey &&
    !e.shiftKey &&
    !e.altKey;
  const isSamePageTopLink = (el) => {
    if (!el?.matches?.("a")) return false;
    const rawHref = el.getAttribute("href");
    if (!rawHref) return el.classList.contains("scroll-top");
    if (rawHref === "#top") return true;
    try {
      const url = new URL(rawHref, window.location.href);
      return (
        url.hash === "#top" &&
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      );
    } catch {
      return false;
    }
  };
  document.addEventListener(
    "click",
    (e) => {
      const el = e.target.closest(
        'a[href="#top"], .scroll-top, [data-scroll="top"]',
      );
      if (!el) return;
      if (!isPrimaryClick(e)) return;
      if (el.matches("a") && !isSamePageTopLink(el)) return;
      if (
        el.getAttribute &&
        (el.getAttribute("target") === "_blank" || el.hasAttribute("download"))
      )
        return;
      e.preventDefault();
      window.scrollTo({ top: 0, behavior });
      focusTarget();
      updateUrl();
    },
    { signal },
  );
}

/* Scroll Reveal */
function initScrollReveal() {
  if (initScrollReveal._abort) initScrollReveal._abort.abort();
  const ac = new AbortController();
  const { signal } = ac;
  initScrollReveal._abort = ac;
  const prefersReduced = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const items = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!items.length) return;
  if (prefersReduced) {
    items.forEach((el) => el.classList.add("is-revealed"));
    return;
  }
  const applyDelay = (el) => {
    const ms = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
    if (Number.isFinite(ms) && ms > 0) el.style.transitionDelay = `${ms}ms`;
  };
  const onceByDefault = true;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const revealOnceAttr = el.getAttribute("data-reveal-once");
        const revealOnce =
          revealOnceAttr == null ? true : revealOnceAttr !== "false";
        if (entry.isIntersecting) {
          if (!el.classList.contains("is-revealed")) {
            applyDelay(el);
            requestAnimationFrame(() => el.classList.add("is-revealed"));
          }
          if (revealOnce) io.unobserve(el);
        } else if (!revealOnce) {
          el.classList.remove("is-revealed");
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -15% 0px",
      threshold: 0.14,
    },
  );
  items.forEach((el) => io.observe(el));
  window.addEventListener("pagehide", () => io.disconnect(), {
    once: true,
    signal,
  });
}

/* Theme Toggle */

function initThemeToggle() {
  if (initThemeToggle._abort) initThemeToggle._abort.abort();
  const ac = new AbortController();
  const { signal } = ac;
  initThemeToggle._abort = ac;
  const btn = document.querySelector(".theme-toggle");
  const root = document.documentElement;
  if (!btn || !root) return;
  const KEY = "theme";
  const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
  const safeGet = (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  };

  const safeSet = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  };

  const nextOf = (mode) => (mode === "dark" ? "light" : "dark");

  const syncThemeToggleState = () => {
    const current =
      root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    btn.setAttribute("aria-pressed", String(current === "dark"));
  };

  const apply = (mode, { persist = false, silent = false } = {}) => {
    const normalized = mode === "dark" ? "dark" : "light";
    root.setAttribute("data-theme", normalized);
    btn.setAttribute("data-theme-state", normalized);
    syncThemeToggleState();
    const label =
      `Tryb: ${normalized === "dark" ? "ciemny" : "jasny"}. ` +
      (normalized === "dark"
        ? "Przełącz na jasny tryb"
        : "Przełącz na ciemny tryb");
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
    if (persist) safeSet(KEY, normalized);
    if (!silent) {
      window.dispatchEvent(
        new CustomEvent("theme:change", { detail: { theme: normalized } }),
      );
    }
  };

  const saved = safeGet(KEY);
  const start =
    saved === "light" || saved === "dark"
      ? saved
      : mq && mq.matches
        ? "dark"
        : "light";
  apply(start, {
    persist: saved === "light" || saved === "dark",
    silent: true,
  });
  syncThemeToggleState();

  btn.addEventListener(
    "click",
    () => {
      const current =
        root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = nextOf(current);
      apply(next, { persist: true });
    },
    { signal },
  );

  window.addEventListener(
    "storage",
    (e) => {
      if (e.key !== KEY) return;
      const v = e.newValue;
      if (v === "dark" || v === "light") apply(v, { persist: false });
    },
    { signal },
  );

  initThemeToggle.set = (mode) => {
    apply(mode === "dark" ? "dark" : "light", { persist: true });
  };
}

/* CTA ripple */

function initRipple() {
  if (initRipple._abort) initRipple._abort.abort();
  const ac = new AbortController();
  const { signal } = ac;
  initRipple._abort = ac;
  const btn = document.querySelector(".nav-menu li > a.btn.btn--sm");
  if (!btn) return;
  const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const prefersReduced = !!mql && mql.matches;
  if (prefersReduced) return;
  const cs = getComputedStyle(btn);
  if (cs.position === "static") btn.style.position = "relative";
  if (cs.overflow !== "hidden") btn.style.overflow = "hidden";
  const computeDiameter = (rect, x, y) => {
    const dx1 = x - rect.left;
    const dy1 = y - rect.top;
    const dx2 = rect.right - x;
    const dy2 = rect.bottom - y;
    const maxDist = Math.max(
      Math.hypot(dx1, dy1),
      Math.hypot(dx1, dy2),
      Math.hypot(dx2, dy1),
      Math.hypot(dx2, dy2),
    );
    return Math.ceil(maxDist * 2);
  };

  const spawn = (x, y) => {
    const rect = btn.getBoundingClientRect();
    const d = computeDiameter(rect, x, y);
    btn.querySelector(".ripple")?.remove();
    const ink = document.createElement("span");
    ink.className = "ripple";
    ink.style.width = ink.style.height = `${d}px`;
    ink.style.left = `${x - rect.left - d / 2}px`;
    ink.style.top = `${y - rect.top - d / 2}px`;
    btn.appendChild(ink);
    const cleanup = () => ink.remove();
    ink.addEventListener("animationend", cleanup, { once: true, signal });
    setTimeout(() => ink.isConnected && cleanup(), 1200);
  };

  const isPrimary = (e) =>
    e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  btn.addEventListener(
    "pointerdown",
    (e) => {
      if (!isPrimary(e)) return;
      spawn(e.clientX, e.clientY);
    },
    { signal },
  );

  btn.addEventListener(
    "keydown",
    (e) => {
      const isEnter = e.key === "Enter";
      const isSpace = e.key === " " || e.code === "Space";
      if (!isEnter && !isSpace) return;
      const rect = btn.getBoundingClientRect();
      spawn(rect.left + rect.width / 2, rect.top + rect.height / 2);
      if (isSpace) {
        e.preventDefault();
        btn.click();
      }
    },
    { signal },
  );

  if (mql?.addEventListener) {
    mql.addEventListener(
      "change",
      (e) => {
        if (e.matches) initRipple._abort?.abort();
      },
      { signal },
    );
  }
}

/* Hero light (Craft Spotlight)
   Lets the hero's resting pool of light follow a hover-capable fine pointer
   across the photograph. Pointer events only record a position; one animation
   frame writes a transform on the light and its CSS transition supplies the
   damping, so nothing runs while the pointer is still. Touch, coarse pointers
   and reduced motion keep the static light defined in CSS. */
function initHeroLight() {
  if (initHeroLight._abort) initHeroLight._abort.abort();
  const ac = new AbortController();
  const { signal } = ac;
  initHeroLight._abort = ac;

  const hero = document.querySelector(".hero");
  const light = hero?.querySelector(".hero__light-spot");
  const frame = light?.offsetParent;
  if (!hero || !light || !frame) return;

  const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  let enabled = false;
  let rafId = 0;
  let pointerX = 0;
  let pointerY = 0;

  const rest = () => {
    cancelAnimationFrame(rafId);
    rafId = 0;
    light.style.removeProperty("transform");
    delete light.dataset.active;
  };

  /* Reads before writing within one frame: the frame's box and the light's
     resting centre (its left/top offsets; translate is not part of them). */
  const render = () => {
    rafId = 0;
    const box = frame.getBoundingClientRect();
    const dx = pointerX - box.left - light.offsetLeft;
    const dy = pointerY - box.top - light.offsetTop;
    light.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
  };

  const onPointer = (event) => {
    if (!enabled || event.pointerType === "touch") return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!light.dataset.active) light.dataset.active = "";
    if (!rafId) rafId = requestAnimationFrame(render);
  };

  const sync = () => {
    enabled = !!finePointer?.matches && !reducedMotion?.matches;
    if (!enabled) rest();
  };

  hero.addEventListener("pointerenter", onPointer, { passive: true, signal });
  hero.addEventListener("pointermove", onPointer, { passive: true, signal });
  hero.addEventListener("pointerleave", rest, { passive: true, signal });
  finePointer?.addEventListener?.("change", sync, { signal });
  reducedMotion?.addEventListener?.("change", sync, { signal });
  window.addEventListener("pagehide", rest, { signal });
  signal.addEventListener("abort", rest);
  sync();
}

export {
  initFooterYear,
  initSmoothTop,
  initScrollReveal,
  initThemeToggle,
  initRipple,
  initHeroLight,
};

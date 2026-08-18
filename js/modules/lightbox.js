"use strict";

function initOfertaLightbox() {
  if (initOfertaLightbox._abort) initOfertaLightbox._abort.abort();

  const ac = new AbortController();
  const { signal } = ac;
  initOfertaLightbox._abort = ac;

  const thumbs = Array.from(
    document.querySelectorAll(
      "#oferta .card picture img, .gallery .gallery-item picture img",
    ),
  );

  if (!thumbs.length) return;

  const $ = (t) => document.createElement(t);

  const html = document.documentElement;
  const main =
    document.getElementById("main") || document.querySelector("main");
  const header = document.querySelector(".site-header");

  let backdrop = document.querySelector(".lb-backdrop");
  let wrap = document.querySelector(".lb-wrap");
  let viewport, img, btnClose, btnPrev, btnNext;

  if (!backdrop || !wrap) {
    backdrop = $("div");
    backdrop.className = "lb-backdrop";

    wrap = $("div");
    wrap.className = "lb-wrap";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-label", "Podgląd zdjęcia");
    wrap.tabIndex = -1;

    viewport = $("div");
    viewport.className = "lb-viewport";

    img = new Image();
    img.alt = "";
    img.decoding = "async";

    viewport.appendChild(img);
    wrap.appendChild(viewport);

    const mkBtn = (cls, label, svg) => {
      const b = $("button");
      b.type = "button";
      b.className = `lb-btn ${cls}`;
      b.setAttribute("aria-label", label);
      b.innerHTML = svg;
      return b;
    };

    const svgX =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7A1 1 0 0 0 5.7 7.1L10.6 12l-4.9 4.9a1 1 0 1 0 1.4 1.4L12 13.4l4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4z"/></svg>';

    const svgL =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.7 5.3a1 1 0 0 1 0 1.4L11.4 11l4.3 4.3a 1 1 0 1 1-1.4 1.4l-5-5a 1 1 0 0 1 0-1.4l5-5a 1 1 0 0 1 1.4 0z"/></svg>';

    const svgR =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.3 5.3a 1 1 0 0 0 0 1.4L12.6 11l-4.3 4.3a 1 1 0 1 0 1.4 1.4l5-5a 1 1 0 0 0 0-1.4l-5-5a 1 1 0 0 0-1.4 0z"/></svg>';

    btnClose = mkBtn("lb-close", "Zamknij podgląd", svgX);
    btnPrev = mkBtn("lb-prev", "Poprzednie zdjęcie", svgL);
    btnNext = mkBtn("lb-next", "Następne zdjęcie", svgR);

    document.body.append(backdrop, wrap, btnClose, btnPrev, btnNext);
  } else {
    viewport = wrap.querySelector(".lb-viewport") || $("div");
    img = wrap.querySelector("img") || new Image();

    btnClose = document.querySelector(".lb-btn.lb-close");
    btnPrev = document.querySelector(".lb-btn.lb-prev");
    btnNext = document.querySelector(".lb-btn.lb-next");
  }

  const parseSrcset = (ss) => {
    if (!ss) return [];

    return ss
      .split(",")
      .map((s) => s.trim())
      .map((s) => {
        const m = s.match(/(.+)\s+(\d+)w$/);
        return m
          ? { url: m[1], w: parseInt(m[2], 10) }
          : { url: s.split(" ")[0], w: 0 };
      })
      .sort((a, b) => b.w - a.w);
  };

  const bestUrlFor = (el) => {
    let best = parseSrcset(el.getAttribute("srcset"))[0]?.url;

    if (!best) {
      const pic = el.closest("picture");

      if (pic) {
        const candidates = [];

        pic.querySelectorAll("source").forEach((s) => {
          candidates.push(...parseSrcset(s.getAttribute("srcset")));
        });

        candidates.sort((a, b) => b.w - a.w);
        best = candidates[0]?.url || null;
      }
    }

    return best || el.currentSrc || el.src || "";
  };

  const preload = (i) => {
    if (i < 0 || i >= thumbs.length) return;

    const url = bestUrlFor(thumbs[i]);

    if (!url) return;

    const tmp = new Image();
    tmp.src = url;
  };

  let index = 0;
  let isOpen = false;
  let lastFocus = null;

  const applyImage = () => {
    const el = thumbs[index];
    const url = bestUrlFor(el);

    if (!url) return;

    img.src = url;
    img.alt = el.getAttribute("alt") || "";

    preload((index + 1) % thumbs.length);
    preload((index - 1 + thumbs.length) % thumbs.length);
  };

  const focusables = () => [btnClose, btnPrev, btnNext].filter(Boolean);

  const setOpen = (open) => {
    isOpen = open;

    backdrop.classList.toggle("is-open", open);
    wrap.classList.toggle("is-open", open);
    btnClose.classList.toggle("is-open", open);
    btnPrev.classList.toggle("is-open", open);
    btnNext.classList.toggle("is-open", open);

    html.classList.toggle("lb-no-scroll", open);
    wrap.setAttribute("aria-hidden", open ? "false" : "true");

    try {
      if (main && "inert" in main) main.inert = open;
      if (header && "inert" in header) header.inert = open;
    } catch {}

    if (open) {
      lastFocus = document.activeElement;

      applyImage();

      const multi = thumbs.length > 1;
      btnPrev.style.display = multi ? "grid" : "none";
      btnNext.style.display = multi ? "grid" : "none";

      (btnClose || wrap).focus({ preventScroll: true });
      return;
    }

    img.src = "";
    img.alt = "";

    btnPrev.style.display = "none";
    btnNext.style.display = "none";

    lastFocus?.focus?.({ preventScroll: true });
    lastFocus = null;

    if (document.fullscreenElement) document.exitFullscreen?.();
  };

  const prev = () => {
    if (thumbs.length < 2) return;

    index = (index - 1 + thumbs.length) % thumbs.length;
    applyImage();
  };

  const next = () => {
    if (thumbs.length < 2) return;

    index = (index + 1) % thumbs.length;
    applyImage();
  };

  thumbs.forEach((el, i) => {
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", "Powiększ zdjęcie");

    el.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        index = i;
        setOpen(true);
      },
      { signal },
    );

    el.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Enter" || e.key === " " || e.code === "Space") {
          e.preventDefault();
          index = i;
          setOpen(true);
        }
      },
      { signal },
    );
  });

  btnClose?.addEventListener("click", () => setOpen(false), { signal });
  btnPrev?.addEventListener("click", prev, { signal });
  btnNext?.addEventListener("click", next, { signal });

  backdrop.addEventListener("click", () => setOpen(false), { signal });

  document.addEventListener(
    "keydown",
    (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      if (e.key === "ArrowLeft") {
        prev();
        return;
      }

      if (e.key === "ArrowRight") {
        next();
        return;
      }

      if (e.key !== "Tab") return;

      const list = focusables();
      if (!list.length) return;

      const first = list[0];
      const last = list[list.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    { signal },
  );

  let sx = 0;
  let sy = 0;
  let moved = false;

  const onStart = (e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;

    sx = t.clientX;
    sy = t.clientY;
    moved = false;
  };

  const onMove = () => {
    moved = true;
  };

  const onEnd = (e) => {
    if (!moved) return;

    const t = e.changedTouches?.[0];
    if (!t) return;

    const dx = t.clientX - sx;
    const dy = t.clientY - sy;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? next() : prev();
    }
  };

  const viewportEl = wrap.querySelector(".lb-viewport") || wrap;

  viewportEl.addEventListener("touchstart", onStart, { passive: true, signal });
  viewportEl.addEventListener("touchmove", onMove, { passive: true, signal });
  viewportEl.addEventListener("touchend", onEnd, { passive: true, signal });

  let lastTap = 0;

  const toggleFs = () => {
    const target = img || viewportEl;
    if (!target) return;

    if (!document.fullscreenElement) {
      (
        target.requestFullscreen ||
        target.webkitRequestFullscreen ||
        target.msRequestFullscreen
      )?.call(target);
      return;
    }

    document.exitFullscreen?.();
  };

  viewportEl.addEventListener(
    "dblclick",
    () => {
      if (!isOpen) return;
      toggleFs();
    },
    { signal },
  );

  viewportEl.addEventListener(
    "touchend",
    (e) => {
      if (!isOpen) return;

      const now = Date.now();

      if (now - lastTap < 350) {
        e.preventDefault();
        toggleFs();
      }

      lastTap = now;
    },
    { passive: true, signal },
  );

  window.addEventListener("pagehide", () => ac.abort(), { once: true, signal });
}

export { initOfertaLightbox };

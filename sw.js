const APP_ID = "solidcraft";
const CACHE_VERSION = "1.2";
const CACHE_NAME = `${APP_ID}-v${CACHE_VERSION}`;

const ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/404.html",
  "/doc/cookies.html",
  "/doc/polityka-prywatnosci.html",
  "/doc/regulamin.html",
  "/oferta/elektryka.html",
  "/oferta/hydraulika.html",
  "/oferta/kafelkowanie.html",
  "/oferta/lazienki.html",
  "/oferta/malowanie.html",
  "/oferta/remonty.html",
  "/thank-you.html",
  "/manifest.webmanifest",
  "/css/style.min.css",
  "/js/script.min.js",
  "/assets/img/favicon/favicon.ico",
  "/assets/img/favicon/favicon.svg",
  "/assets/img/favicon/favicon-96x96.png",
  "/assets/img/favicon/apple-touch-icon.png",
  "/assets/img/favicon/web-app-manifest-192x192.png",
  "/assets/img/favicon/web-app-manifest-512x512.png",
];

const STATIC_DESTINATIONS = new Set(["style", "script", "font", "image", "manifest"]);

const isCacheableResponse = (response) => response && response.ok;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith(`${APP_ID}-v`) && k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (req.method !== "GET") return;
  if (!isSameOrigin) return;

  const isHTML = req.mode === "navigate" || req.headers.get("accept")?.includes("text/html");
  const isStaticAsset = STATIC_DESTINATIONS.has(req.destination) || /\.(?:css|js|mjs|png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?|ttf|otf|eot|webmanifest)$/i.test(url.pathname);

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (isCacheableResponse(res)) {
            caches.open(CACHE_NAME).then((c) => c.put(req, res.clone()));
          }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((cached) => cached || caches.match("/offline.html"))),
    );
    return;
  }

  if (isStaticAsset) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;

        return fetch(req).then((res) => {
          if (isCacheableResponse(res)) {
            caches.open(CACHE_NAME).then((c) => c.put(req, res.clone()));
          }
          return res;
        });
      }),
    );
    return;
  }

  event.respondWith(fetch(req));
});

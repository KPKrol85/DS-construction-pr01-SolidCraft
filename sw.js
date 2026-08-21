const APP_ID = "solidcraft";
const CACHE_VERSION = "1.3";
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
  "/js/theme-init.min.js",
  "/js/script.min.js",
  "/js/sw-register.js",
  "/assets/fonts/montserrat-v31-latin-regular.woff2",
  "/assets/fonts/montserrat-v31-latin-600.woff2",
  "/assets/fonts/montserrat-v31-latin-700.woff2",
  "/assets/fonts/poppins-v24-latin-regular.woff2",
  "/assets/fonts/poppins-v24-latin-500.woff2",
  "/assets/fonts/poppins-v24-latin-600.woff2",
  "/assets/img/favicon/favicon.ico",
  "/assets/img/favicon/favicon.svg",
  "/assets/img/favicon/favicon-96x96.png",
  "/assets/img/favicon/apple-touch-icon.png",
  "/assets/img/favicon/web-app-manifest-192x192.png",
  "/assets/img/favicon/web-app-manifest-512x512.png",
];

const STATIC_DESTINATIONS = new Set(["style", "script", "font", "image", "manifest"]);

const isCacheableResponse = (response) => response && response.ok;

const persistRuntimeResponse = (event, request, responsePromise) => {
  event.waitUntil(
    responsePromise.then(
      ({ response, fromNetwork }) => {
        if (!fromNetwork || !isCacheableResponse(response)) return;

        return caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      },
      () => undefined,
    ),
  );
};

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
    const responsePromise = fetch(req).then((response) => ({ response, fromNetwork: true }));
    persistRuntimeResponse(event, req, responsePromise);

    event.respondWith(
      responsePromise
        .then(({ response }) => response)
        .catch(() => caches.match(req, { ignoreSearch: true }).then((cached) => cached || caches.match("/offline.html"))),
    );
    return;
  }

  if (isStaticAsset) {
    const responsePromise = caches.match(req).then((cached) => {
      if (cached) return { response: cached, fromNetwork: false };

      return fetch(req).then((response) => ({ response, fromNetwork: true }));
    });
    persistRuntimeResponse(event, req, responsePromise);

    event.respondWith(
      responsePromise.then(({ response }) => response),
    );
    return;
  }

  event.respondWith(fetch(req));
});

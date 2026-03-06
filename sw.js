const CACHE_NAME = "cardtracker-v26";
const INDEX_FALLBACK = "./index.html";
const APP_SHELL = [
  "./",
  INDEX_FALLBACK,
  "./styles.css",
  "./app.js",
  "./catalog-core.js",
  "./comparison-core.js",
  "./wallet-core.js",
  "./manifest.webmanifest",
  "./assets/icon.svg",
];
const NETWORK_FIRST_DESTINATIONS = new Set(["script", "style", "worker"]);

function cacheResponse(request, response) {
  if (!response || response.status !== 200 || response.type !== "basic") {
    return;
  }

  const copy = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          cacheResponse(INDEX_FALLBACK, response);
          return response;
        })
        .catch(() => caches.match(INDEX_FALLBACK)),
    );
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isNetworkFirstTarget = isSameOrigin && NETWORK_FIRST_DESTINATIONS.has(event.request.destination);

  if (isNetworkFirstTarget) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          cacheResponse(event.request, response);
          return response;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        cacheResponse(event.request, response);
        return response;
      });
    }),
  );
});

const CACHE_NAME = "app-cache-v1";

const URLS_TO_CACHE = [
  "/painel-login-tpe/",
  "/painel-login-tpe/index.html",
  "/painel-login-tpe/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  event.respondWith(fetch(event.request));
});
const CACHE = "mindset-v19";
const ASSETS = [
  "./", "./index.html", "./styles.css", "./app.js", "./figure.js", "./lib.mjs", "./weeks.js", "./mara.js",
  "./data/cards.json", "./data/values.json", "./data/daily.json", "./data/mara.json",
  "./manifest.webmanifest", "./assets/favicon.svg",
  "./assets/fonts/fraunces-normal.woff2", "./assets/fonts/fraunces-italic.woff2",
  "./assets/fonts/ibm-plex-mono-400.woff2", "./assets/fonts/ibm-plex-mono-500.woff2",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          e.waitUntil(caches.open(CACHE).then((c) => c.put(e.request, copy)));
          return res;
        }
        // v1.34: an HTTP error is a live response, not a network failure -- .catch() below
        // never sees it. Fall back to cache same as offline; only surface the error itself if
        // nothing cached exists to fall back to.
        return caches.match(e.request, { ignoreSearch: true }).then((cached) => cached || res);
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});

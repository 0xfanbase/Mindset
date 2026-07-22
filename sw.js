const CACHE = "mindset-v8";
const ASSETS = [
  "./", "./index.html", "./styles.css", "./app.js", "./figure.js", "./lib.mjs", "./weeks.js",
  "./data/cards.json", "./data/values.json", "./data/daily.json",
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
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});

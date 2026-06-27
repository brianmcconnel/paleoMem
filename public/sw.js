/* paleoMem service worker — install + offline caching */
const CACHE = 'paleomem-v7';
const BASE = '/paleoMem';

function isHtmlRequest(request) {
  if (request.mode === 'navigate') return true;
  if (request.destination === 'document') return true;
  const accept = request.headers.get('accept');
  return accept != null && accept.includes('text/html');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([
        `${BASE}/`,
        `${BASE}/manifest.webmanifest`,
        `${BASE}/apple-touch-icon.png`,
        `${BASE}/icons/icon-192.png`,
        `${BASE}/icons/icon-512.png`,
        `${BASE}/icons/icon-maskable-192.png`,
        `${BASE}/icons/icon-maskable-512.png`,
      ]),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (!url.pathname.startsWith(BASE)) return;

  // Never cache Next.js build chunks — Turbopack uses stable names in dev,
  // so cache-first here serves stale JS long after source changes.
  if (url.pathname.includes('/_next/')) return;

  if (isHtmlRequest(event.request)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (response && response.status === 200 && response.type !== 'opaque') {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() => caches.match(request));
}

function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;

    return fetch(request).then((response) => {
      if (!response || response.status !== 200 || response.type === 'opaque') {
        return response;
      }

      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
      return response;
    });
  });
}
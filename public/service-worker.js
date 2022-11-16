const alwaysCache = [
  '/logo.png',
  '/assets/tile-bw.png',
  '/assets/tile-satellite.png',
  '/assets/tile-street.png',
];

const cacheForOffline = [
  '/index.html',
  '/assets/index.081ff665.css',
  '/assets/index.dec81e95.js'
];

const CACHE_VERSION = 'osm-tiles-v1';

self.addEventListener('install', (event) =>
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => {
        cache.addAll(alwaysCache);
        cache.addAll(cacheForOffline);
      })
  )
);

const cachedHosts = [
  "tile.openstreetmap.org",
  "a.tile.openstreetmap.org",
  "stamen-tiles.a.ssl.fastly.net"
];

self.addEventListener('fetch', (event) =>
  event.respondWith(
      caches
          .match(event.request)
          .then((response) => {
            if (response) {                 // Cache hit
              const {pathname} = new URL(event.request.url);
              // Serve from cache static assets or cached items (when offline):
              if (cacheForOffline.includes(pathname) && !navigator.onLine || alwaysCache.includes(pathname)) {
                return response;
              } else {
                // Update cache if online:
                response = fetch(event.request);
                if (response.ok) {
                  caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, new Response(response.body, response)));
                }
                return response;
              }
            } else {                        // Cache miss
              const {hostname} = new URL(event.request.url);
              const response = fetch(event.request);
              if (cachedHosts.includes(hostname) && response.ok) {
                caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, new Response(response.body, response)));
              }
              return response;
            }
          })
  )
);

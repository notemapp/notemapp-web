const alwaysCache = [
  '/logo.png',
  '/assets/tile-bw.png',
  '/assets/tile-satellite.png',
  '/assets/tile-street.png',
];

const CACHE_VERSION = 'osm-tiles-v1';

self.addEventListener('install', (event) =>
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => {
        cache.addAll(alwaysCache);
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
              const {pathname, hostname} = new URL(event.request.url);
              // Serve from cache static assets or cached items (when offline):
              if (alwaysCache.includes(pathname) || cachedHosts.includes(hostname) || !navigator.onLine) {
                console.log('Cache hit, serving from cache:', event.request.url);
                return response;
              } else {
                // Update cache if online:
                response = fetch(event.request);
                if (response.ok) {
                  console.log('Cache hit but online, updating cache:', event.request.url);
                  caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, new Response(response.body, response)));
                }
                return response;
              }
            } else {                        // Cache miss
              const response = fetch(event.request);
              if (response.ok) {
                console.log('Cache miss, adding to cache:', event.request.url);
                caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, new Response(response.body, response)));
              }
              return response;
            }
          })
  )
);

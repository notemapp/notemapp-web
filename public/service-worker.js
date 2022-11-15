const initialCache = [];

const CACHE_VERSION = 'osm-tiles-v1';

self.addEventListener('install', (event) =>
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(initialCache))
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
            if (response) return response;  // Cache hit
            else {                          // Cache miss
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

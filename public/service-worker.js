const CACHE_NAME = 'v1';

const ALWAYS_CACHED_HOSTS = [
  "stamen-tiles-a.a.ssl.fastly.net",
  "stamen-tiles-b.a.ssl.fastly.net",
  "stamen-tiles-c.a.ssl.fastly.net",
  "stamen-tiles-d.a.ssl.fastly.net",
  "t0.ssl.ak.dynamic.tiles.virtualearth.net",
  "t1.ssl.ak.dynamic.tiles.virtualearth.net",
  "t2.ssl.ak.dynamic.tiles.virtualearth.net",
  "t3.ssl.ak.dynamic.tiles.virtualearth.net"
];

const PREFETCHED_URLS = [
  '/assets/index.css',
  '/assets/index.js',
  '/assets/layer-1.png',
  '/assets/layer-2.png',
  '/assets/layer-3.png',
  '/assets/logo512-w.png',
  '/assets/logo512-w.svg',
  '/assets/logo512-mw.png',
  '/assets/logo512-mw.svg',
  '/index.html',
  '/manifest.json',
  '/service-worker.js'
];

const prefetch = async (urls) => {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(urls);
};

const cacheResponse = async (request, response) => {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response);
};

const isOnline = () => {
  return navigator.onLine;
}

const fetchFromCacheIfOffline = async ({ request, preloadResponsePromise, fallbackUrl }) => {

  // Fetch from cache if offline:
  const {hostname} = new URL(request.url);
  const responseFromCache = await caches.match(request);
  if (responseFromCache && (ALWAYS_CACHED_HOSTS.includes(hostname) || !isOnline())) {
    console.debug('Serving from cache', request.url);
    return responseFromCache;
  }

  // Otherwise use preload response if available:
  const preloadResponse = await preloadResponsePromise;
  if (preloadResponse) {
    console.debug('Using preload response', preloadResponse, 'for', request.url);
    await cacheResponse(request, preloadResponse.clone());
    return preloadResponse;
  }

  // Otherwise fetch from network:
  try {
    const responseFromNetwork = await fetch(request);
    await cacheResponse(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    if (fallbackUrl) {
      const fallbackResponse = await caches.match(fallbackUrl);
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    return new Response(JSON.stringify(error), {
      status: 408,
      headers: {'Content-Type': 'application/json'}
    });
  }

};

const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    await self.registration.navigationPreload.enable();
  }
};

self.addEventListener('activate', (event) => {
  event.waitUntil(enableNavigationPreload());
});

self.addEventListener('install', (event) => {
  event.waitUntil(prefetch(PREFETCHED_URLS));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetchFromCacheIfOffline({
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
      fallbackUrl: undefined
    })
  );
});
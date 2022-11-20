const CACHE_NAME = 'v1';

const ALWAYS_CACHE_HOSTS = [
  "tile.openstreetmap.org",
  "a.tile.openstreetmap.org",
  "stamen-tiles.a.ssl.fastly.net",
  "tile-proxy-bing.alessiovierti.workers.dev"
];

const addResourcesToCache = async (resources) => {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(resources);
};

const putInCache = async (request, response) => {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response);
};

const cacheFirstIfOffline = async ({ request, preloadResponsePromise, fallbackUrl }) => {

  // First try to get the resource from the cache
  const {hostname} = new URL(request.url);
  const responseFromCache = await caches.match(request);
  if (responseFromCache && (ALWAYS_CACHE_HOSTS.includes(hostname) || !navigator.onLine)) {
    return responseFromCache;
  }

  // Next try to use the preloaded response, if it's there
  const preloadResponse = await preloadResponsePromise;
  if (preloadResponse) {
    console.info('Using preload response', preloadResponse);
    putInCache(request, preloadResponse.clone());
    return preloadResponse;
  }

  // Next try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request);
    // response may be used only once
    // we need to save clone to put one copy in cache
    // and serve second one
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    if (fallbackUrl) {
      const fallbackResponse = await caches.match(fallbackUrl);
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    // when even the fallback response is not available,
    // there is nothing we can do, but we must always
    // return a Response object
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};

const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    // Enable navigation preloads!
    await self.registration.navigationPreload.enable();
  }
};

self.addEventListener('activate', (event) => {
  event.waitUntil(enableNavigationPreload());
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    addResourcesToCache([
      '/',
      '/index.html',
      '/assets/index.css',
      '/assets/index.js',
      '/assets/tile-bw.png',
      '/assets/tile-satellite.png',
      '/assets/tile-street.png',
      '/logo.png',
      'manifest.json'
    ])
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    cacheFirstIfOffline({
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
      fallbackUrl: undefined,
    })
  );
});
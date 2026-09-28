const CACHE_NAME = 'farmeezy-pwa-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Caching static assets warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  // Ignore non-HTTP(S) schemes (e.g. chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // API endpoints: Network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          return cached || new Response(JSON.stringify({ success: false, error: 'Offline' }), {
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }

  // HTML pages & assets: Stale-While-Revalidate with valid Response guarantee
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'cors')
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => null);

      if (cachedResponse) {
        // Trigger background revalidation
        networkFetch.catch(() => {});
        return cachedResponse;
      }

      return networkFetch.then((res) => {
        if (res && res instanceof Response) return res;
        return new Response('Service Unavailable', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

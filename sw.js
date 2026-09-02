// ==========================================================================
// Aachico Vault - Service Worker (Offline Support & Caching)
// ==========================================================================

const CACHE_NAME = 'aachico-vault-v1';
const assetsToCache = [
  './index.html',
  './admin.html',
  './manager.html',
  './driver.html',
  './invoice.html',
  './css/themes.css',
  './js/config/firebase-init.js'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
  self.skipWaiting();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    }).catch(() => {
      // Fallback if offline and asset not cached
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});

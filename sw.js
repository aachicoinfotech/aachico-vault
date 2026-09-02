/* ==========================================================================
   Aachico Vault - Service Worker (Auto-Update Cache v2)
   ========================================================================== */

const CACHE_NAME = 'aachico-vault-v2';
const ASSETS_TO_CACHE = [
  './index.html',
  './admin.html',
  './manager.html',
  './driver.html',
  './superadmin.html',
  './invoice.html',
  './css/themes.css',
  './manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event & Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    }).catch(() => {
      // Fallback if offline
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});

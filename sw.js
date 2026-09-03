/* sw.js */
/* ==========================================================================
   Aachico Vault - Service Worker (Auto-Update Cache v3 - Phase 1 Final)
   ========================================================================== */

const CACHE_NAME = 'aachico-vault-v3';
const ASSETS_TO_CACHE = [
  './index.html',
  './admin.html',
  './manager.html',
  './driver.html',
  './superadmin.html',
  './invoice.html',
  './css/themes.css',
  './css/components.css',
  './js/config/firebase-init.js',
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

// Fetch Event with Cache-First & Offline Fallback Strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

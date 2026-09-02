// Aachico Vault Smart Auto-Updater Service Worker
const CACHE_NAME = 'aachico-vault-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

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
    }).then(() => self.clients.claim())
  );
});

// Network-First Strategy for Code, Direct Cloud Pass-Through for Firebase
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Firebase API & Database calls ALWAYS go direct to cloud - NEVER cached
  if (url.origin.includes('firebase') || url.origin.includes('googleapis')) {
    return;
  }

  // HTML and UI Files: Always check network first for newest update
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

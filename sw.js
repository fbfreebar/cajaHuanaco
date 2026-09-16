/* Caja Huanaco — guarda la app en el dispositivo para usarla sin conexión.
   Si subís una versión nueva del index.html, cambiá el número de CACHE
   (v1 -> v2) para que el iPad tome los cambios. */

const CACHE = 'caja-huanaco-v10';
const ARCHIVOS = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cacheada => {
      const red = fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const copia = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
        }
        return resp;
      }).catch(() => cacheada);
      return cacheada || red;
    })
  );
});

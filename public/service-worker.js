const CACHE_NAME = 'pokemon-pwa-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json'
];

// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

// ===== NUEVO CÓDIGO PARA NOTIFICACIONES =====

// Manejar mensajes desde la app para mostrar notificaciones
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const options = {
      body: event.data.body || '¡Nuevo Pokémon encontrado!',
      icon: event.data.icon || "/logo192.png",
      badge: "/logo192.png",
      vibrate: [200, 100, 200, 100, 200],
      tag: "poke-notify",
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Abrir Pokédex'
        },
        {
          action: 'close',
          title: 'Cerrar'
        }
      ]
    };
    
    self.registration.showNotification(
      event.data.title || "Pokédex Actualizada", 
      options
    );
  }
});

// Manejar clic en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({type: 'window'}).then(windowClients => {
        // Si ya hay una ventana abierta, enfócala
        for (let client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abre una nueva
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  } else if (event.action === 'close') {
    // Solo cerrar la notificación (ya se hizo con event.notification.close())
  } else {
    // Clic en el cuerpo de la notificación
    event.waitUntil(
      clients.matchAll({type: 'window'}).then(windowClients => {
        for (let client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Manejar cierre de notificación
self.addEventListener('notificationclose', (event) => {
  console.log('Notificación cerrada:', event.notification.tag);
});
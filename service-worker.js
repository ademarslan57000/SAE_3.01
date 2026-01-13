const CACHE_NAME = "smart-parking-v1";
const urlsToCache = [
    "./", 
    "./views/index.html",
    "./assets/css/style.css",
    "./assets/css/reservation.css",
    "./assets/css/mobilite.css",
    "./assets/js/reservation.js",
    "./assets/js/mobilite.js",
    "./views/reservation.html",
    "./views/mobilite.html",
    "./views/liste-parkings.html",
    "./assets/image/logo.png",
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
    "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css",
    "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js",
];

// Installation du Service Worker
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log("📦 Cache ouvert");
                return cache.addAll(urlsToCache);
            }),
    );
});

// Activation et nettoyage des anciens caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log("🗑️ Suppression ancien cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                }),
            );
        }),
    );
});

// Interception des requêtes - Stratégie Network First avec fallback sur Cache
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cloner la réponse pour la mettre en cache
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            })
            .catch(() => {
                // En cas d'erreur réseau, utiliser le cache
                return caches.match(event.request).then((response) => {
                    if (response) {
                        return response;
                    }
                    // Page par défaut en cas d'absence de cache
                    if (event.request.mode === "navigate") {
                        return caches.match("/index.html");
                    }
                });
            }),
    );
});

// Messages depuis l'application
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

// Notifications push (pour les rappels de stationnement)
self.addEventListener("push", (event) => {
    const options = {
        body: event.data ? event.data.text() : "Rappel de stationnement",
        icon: "/image/logo.png",
        badge: "/image/logo.png",
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
        },
        actions: [
            {
                action: "explore",
                title: "Voir détails",
                icon: "/image/logo.png",
            },
            {
                action: "close",
                title: "Fermer",
                icon: "/image/logo.png",
            },
        ],
    };

    event.waitUntil(
        self.registration.showNotification("Smart Parking Metz", options),
    );
});

// Gestion des clics sur les notifications
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "explore") {
        event.waitUntil(
            clients.openWindow("/views/reservation.html"),
        );
    }
});

import { distanceGPS } from "../utils/Utils.js";

export class RoutingService {
  constructor(map, icons) {
    this.map = map;
    this.icons = icons;
    this.routingControl = null;
    this.watchId = null;
    this.lastPosition = null;
  }

  clearRoute() {
    if (!this.routingControl) return;
    this.map.removeControl(this.routingControl);
    this.routingControl = null;
  }

  demarrerGuidage(latDest, lonDest, nom) {
    const DISTANCE_RECALCUL = 0.015;
    let firstUpdate = true;
    this.lastPosition = null;

    if (window.innerWidth < 768) {
      document.getElementById("btn-stop-guidage-mobile").style.display =
        "block";
    } else {
      document.getElementById("btn-stop-guidage").style.display = "block";
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const [userLat, userLon] = [pos.coords.latitude, pos.coords.longitude];

        if (firstUpdate) {
          this.map.setView([userLat, userLon], 16);
          firstUpdate = false;
        }

        if (
          this.lastPosition &&
          distanceGPS(
              userLat,
              userLon,
              this.lastPosition.lat,
              this.lastPosition.lon,
            ) < DISTANCE_RECALCUL
        ) return;

        this.lastPosition = { lat: userLat, lon: userLon };

        if (this.routingControl) {
          this.map.removeControl(this.routingControl);
        }

        this.routingControl = L.Routing.control({
          waypoints: [L.latLng(userLat, userLon), L.latLng(latDest, lonDest)],
          router: L.Routing.osrmv1({
            serviceUrl: "https://router.project-osrm.org/route/v1",
            profile: "driving", // 'driving' ou 'car' pour le trafic routier
            timeout: 30 * 1000,
            routingOptions: {
              alternatives: true, // Calculer des itinéraires alternatifs
              steps: true, // Obtenir les instructions détaillées
              overview: "full", // Vue complète de l'itinéraire
              continue_straight: false, // Permettre les demi-tours si nécessaire
              annotations: ["duration", "distance", "speed"], // Annotations de trafic
            },
          }),
          lineOptions: {
            styles: [{ color: "#004cbe", weight: 6, opacity: 0.8 }],
            extendToWaypoints: true,
            missingRouteTolerance: 0,
          },
          routeWhileDragging: false,
          addWaypoints: false,
          showAlternatives: true, // Afficher les itinéraires alternatifs
          altLineOptions: {
            styles: [{ color: "#85189b", weight: 4, opacity: 0.5 }],
          },
          createMarker: (i, wp) =>
            L.marker(wp.latLng, {
              icon: i === 0 ? this.icons.user : this.icons.destination,
            }).bindPopup(i === 0 ? "📍 Position actuelle" : "🎯 " + nom),
          fitSelectedRoutes: "smart",
        }).addTo(this.map);

        // Ajouter un écouteur pour afficher les informations de trafic
        this.routingControl.on("routesfound", (e) => {
          const routes = e.routes;
          const summary = routes[0].summary;
          const duration = Math.round(summary.totalTime / 60); // en minutes
          const distance = (summary.totalDistance / 1000).toFixed(1); // en km

          console.log(
            `🚗 Itinéraire calculé: ${distance} km, ${duration} min (trafic en temps réel)`,
          );

          // Afficher une notification avec les infos de trafic
          if (routes.length > 1) {
            const altDuration = Math.round(routes[1].summary.totalTime / 60);
            console.log(
              `🛣️ Itinéraire alternatif disponible: ${altDuration} min`,
            );
          }
        });
      },
      (err) => alert("Erreur GPS : " + err.message),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 },
    );
  }

  arreterGuidage() {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    this.lastPosition = null;
    this.clearRoute();
    document.getElementById("btn-stop-guidage").style.display = "none";
    document.getElementById("btn-stop-guidage-mobile").style.display = "none";
    alert("Guidage arrêté.");
  }
}

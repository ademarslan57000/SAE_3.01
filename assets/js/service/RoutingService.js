import { distanceGPS } from "../utils/Utils.js";

export class RoutingService {
  constructor(map, icons) {
    this.map = map;
    this.icons = icons;
    this.routingControl = null;
    this.watchId = null;
    this.lastPosition = null;
  }

  // Supprimer l'itinéraire de la carte
  clearRoute() {
    if (!this.routingControl) return;
    this.map.removeControl(this.routingControl);
    this.routingControl = null;
  }

  // Démarrer le guidage en temps réel
  demarrerGuidage(latDest, lonDest, nom, defaultLocation = null) {
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
            this.lastPosition.lon
          ) < DISTANCE_RECALCUL
        )
          return;

        this.lastPosition = { lat: userLat, lon: userLon };

        if (this.routingControl) {
          this.map.removeControl(this.routingControl);
        }

        this.routingControl = L.Routing.control({
          waypoints: [L.latLng(userLat, userLon), L.latLng(latDest, lonDest)],
          router: L.Routing.osrmv1({
            serviceUrl: "https://router.project-osrm.org/route/v1",
            profile: "driving",
            timeout: 30 * 1000,
            routingOptions: {
              alternatives: true,
              steps: true,
              overview: "full",
              continue_straight: false,
              annotations: ["duration", "distance", "speed"],
            },
          }),
          lineOptions: {
            styles: [{ color: "#004cbe", weight: 6, opacity: 0.8 }],
            extendToWaypoints: true,
            missingRouteTolerance: 0,
          },
          routeWhileDragging: false,
          addWaypoints: false,
          showAlternatives: true,
          altLineOptions: {
            styles: [{ color: "#85189b", weight: 4, opacity: 0.5 }],
          },
          createMarker: (i, wp) =>
            L.marker(wp.latLng, {
              icon: i === 0 ? this.icons.user : this.icons.destination,
            }).bindPopup(i === 0 ? "📍 Position actuelle" : "🎯 " + nom),
          fitSelectedRoutes: "smart",
        }).addTo(this.map);

        this.routingControl.on("routesfound", (e) => {
          const routes = e.routes;
          const summary = routes[0].summary;
          const duration = Math.round(summary.totalTime / 60);
          const distance = (summary.totalDistance / 1000).toFixed(1);

          console.log(
            `Itinéraire calculé: ${distance} km, ${duration} min (trafic en temps réel)`
          );

          if (routes.length > 1) {
            const altDuration = Math.round(routes[1].summary.totalTime / 60);
            console.log(
              `Itinéraire alternatif disponible: ${altDuration} min`
            );
          }
        });
      },
      (err) => {
        console.error("Erreur GPS lors du guidage:", err.message);
        // Arrêter le watchPosition
        if (this.watchId !== null) {
          navigator.geolocation.clearWatch(this.watchId);
          this.watchId = null;
        }

        if (defaultLocation && defaultLocation.length === 2) {
          console.log(
            "Bascule vers itinéraire statique depuis position par défaut"
          );
          alert(
            "GPS perdu. Affichage de l'itinéraire depuis la position par défaut (Metz Centre)."
          );
          this.startRoute(defaultLocation, [latDest, lonDest], nom);

          if (window.innerWidth < 768) {
            document.getElementById("btn-stop-guidage-mobile").style.display =
              "block";
          } else {
            document.getElementById("btn-stop-guidage").style.display =
              "inline-block";
          }
        } else {
          document.getElementById("btn-stop-guidage").style.display = "none";
          document.getElementById("btn-stop-guidage-mobile").style.display =
            "none";
        }
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
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

  startRoute(startLatLon, endLatLon, nom = "Destination") {
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
    }

    this.routingControl = L.Routing.control({
      waypoints: [
        L.latLng(startLatLon[0], startLatLon[1]),
        L.latLng(endLatLon[0], endLatLon[1]),
      ],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "driving",
        timeout: 30 * 1000,
        routingOptions: {
          alternatives: true,
          steps: true,
          overview: "full",
          continue_straight: false,
          annotations: ["duration", "distance", "speed"],
        },
      }),
      lineOptions: {
        styles: [{ color: "#004cbe", weight: 6, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      routeWhileDragging: false,
      addWaypoints: false,
      showAlternatives: true,
      altLineOptions: {
        styles: [{ color: "#85189b", weight: 4, opacity: 0.5 }],
      },
      createMarker: (i, wp) =>
        L.marker(wp.latLng, {
          icon: i === 0 ? this.icons.user : this.icons.destination,
        }).bindPopup(i === 0 ? "📍 Point de départ" : "🎯 " + nom),
      fitSelectedRoutes: "smart",
    }).addTo(this.map);

    this.routingControl.on("routesfound", (e) => {
      const routes = e.routes;
      const summary = routes[0].summary;
      const duration = Math.round(summary.totalTime / 60);
      const distance = (summary.totalDistance / 1000).toFixed(1);

      console.log(`🚗 Itinéraire calculé: ${distance} km, ${duration} min`);
    });
  }
}

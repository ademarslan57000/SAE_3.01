import { distanceGPS } from "./utils.js";

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
    const btn = document.getElementById("btn-annuler-itineraire");
    if (btn) btn.style.display = "none";
  }

  afficherItineraireTempsReel(latDest, lonDest, nom) {
    const DISTANCE_RECALCUL = 0.015;
    let firstUpdate = true;
    this.lastPosition = null;

    document.getElementById("btn-stop-guidage").style.display = "inline-block";

    this.watchId = navigator.geolocation.watchPosition(
      pos => {
        const [userLat, userLon] = [pos.coords.latitude, pos.coords.longitude];

        if (firstUpdate) {
          this.map.setView([userLat, userLon], 16);
          firstUpdate = false;
        }

        if (this.lastPosition && distanceGPS(userLat, userLon, this.lastPosition.lat, this.lastPosition.lon) < DISTANCE_RECALCUL) return;

        this.lastPosition = { lat: userLat, lon: userLon };

        if (this.routingControl) {
          this.routingControl.getPlan().setWaypoints([]);
          this.map.removeControl(this.routingControl);
        }

        this.routingControl = L.Routing.control({
          waypoints: [L.latLng(userLat, userLon), L.latLng(latDest, lonDest)],
          lineOptions: { styles: [{ color: "#004cbe", weight: 6 }] },
          routeWhileDragging: false,
          addWaypoints: false,
          showAlternatives: false,
          createMarker: (i, wp) => L.marker(wp.latLng, { icon: i === 0 ? this.icons.user : this.icons.destination }).bindPopup(i === 0 ? "📍 Position actuelle" : "🎯 " + nom)
        }).addTo(this.map);
      },
      err => alert("Erreur GPS : " + err.message),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );
  }

  stopGuidage() {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    this.lastPosition = null;
    this.clearRoute();
    document.getElementById("btn-stop-guidage").style.display = "none";
    alert("Guidage stoppé.");
  }
}

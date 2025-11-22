import { ParkingService } from './parkingService.js';
import { RoutingService } from './routingService.js';
import { getLocation, distanceGPS } from './utils.js';

export class MapController {
  constructor() {
    this.map = L.map("map").setView([49.1193, 6.1757], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors" }).addTo(this.map);

    this.ICONS = {
      user: L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
      destination: L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    };

    this.parkingService = new ParkingService("https://maps.eurometropolemetz.eu/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public:pub_tsp_sta&srsName=EPSG:4326&outputFormat=application%2Fjson&cql_filter=id%20is%20not%20null");
    this.routingService = new RoutingService(this.map, this.ICONS);

    this.markers = [];
    this.markerClusterGroup = null;
    this.parkings = [];
  }

  async init() {
    this.parkings = await this.parkingService.loadParkings();
    this.afficherParkings(this.parkings);
  }

  afficherParkings(data) {
    if (this.markerClusterGroup) this.map.removeLayer(this.markerClusterGroup);
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
    this.markerClusterGroup = L.markerClusterGroup({ maxClusterRadius: 50 });

    data.forEach(p => {
      const marker = L.circleMarker([p.lat, p.lon], {
        radius: 8,
        color: "#004cbe",
        fillColor: p.gratuit ? "#28a745" : "#4bb6c9",
        fillOpacity: 0.9,
        weight: 2,
      });

      const nomSafe = (p.name || "Parking").replace(/'/g, "\\'").replace(/"/g, "");
      const popup = `
  <div style="min-width:240px; font-size:14px;">
    <b>${p.name}</b><br>
    ${p.nature ? `Nature : ${p.nature}<br>` : ""}
    ${p.statut ? `Statut : ${p.statut}<br>` : ""}
    ${p.domaine ? `Domaine : ${p.domaine}<br>` : ""}
    ${p.gestion ? `Gestion : ${p.gestion}<br>` : ""}
    ${p.place_total != null ? `Places : <b>${p.place_libre ?? "?"}</b> / ${p.place_total}<br>` : ""}
      Prix : 1.60 € / heure<br>
    ${p.gratuit ? "Gratuit<br>" : "Payant<br>"}
    ${p.observ ? `${p.observ}<br>` : ""}
    <hr>
    <div class="popup-buttons">
      <button onclick="window.mapController.routingService.afficherItineraireTempsReel(${p.lat}, ${p.lon}, '${nomSafe}', window.getLocation)">Itinéraire</button>
    </div>
  </div>
`;

      marker.bindPopup(popup);
      this.markerClusterGroup.addLayer(marker);
      this.markers.push(marker);
    });

    this.map.addLayer(this.markerClusterGroup);
    const bounds = this.markerClusterGroup.getBounds();
    if (bounds.isValid()) this.map.fitBounds(bounds.pad(0.1));
  }

  async rechercheParking() {
    const q = document.getElementById("search").value.toLowerCase();
    const filtre = this.parkings.filter(p => p.name.toLowerCase().includes(q));
    this.afficherParkings(filtre);
    if (filtre.length === 1) this.map.setView([filtre[0].lat, filtre[0].lon], 16);
  }

  async trierParProximite() {
    try {
      const [latU, lonU] = await getLocation();
      const sorted = [...this.parkings].sort((a, b) => distanceGPS(latU, lonU, a.lat, a.lon) - distanceGPS(latU, lonU, b.lat, b.lon));
      const plusProche = sorted[0];
      if (!plusProche) return alert("Aucun parking disponible pour le moment.");
      this.map.setView([plusProche.lat, plusProche.lon], 15);
      const marker = this.markers.find(m => m.getLatLng().lat === plusProche.lat && m.getLatLng().lng === plusProche.lon);
      if (marker) marker.openPopup();
    } catch (e) {
      alert("Impossible d'obtenir votre position : " + e);
    }
  }

  async localiserUtilisateur() {
    try {
      const [lat, lon] = await getLocation();
      L.marker([lat, lon], { icon: this.ICONS.user }).addTo(this.map).bindPopup("Vous êtes ici").openPopup();
      this.map.setView([lat, lon], 15);
    } catch (e) {
      alert("Impossible d'obtenir votre position : " + e);
    }
  }

  async afficherItineraire(lat, lon) {
    try {
    const [latU, lonU] = await getLocation();
    this.routingService.clearRoute();
    this.routingService.routingControl = L.Routing.control({
      waypoints: [L.latLng(latU, lonU), L.latLng(lat, lon)],
      routeWhileDragging: false,
      addWaypoints: false,
      showAlternatives: false,
      lineOptions: { styles: [{ color: "#004cbe", weight: 6 }] },
    }).addTo(this.map);
    document.getElementById("btn-annuler-itineraire").style.display = "inline-block";
  } catch (e) {
    alert("Impossible d'obtenir votre position : " + e);
  }
}

  ouvrirItineraire(lat, lon) {
    const destination = `${lat},${lon}`;
    let url = `https://www.google.com/maps/search/?api=1&query=${destination}`;
    const newWindow = window.open(url, "_blank");
    getLocation().then(([latU, lonU]) => {
      const origin = `${latU},${lonU}`;
      const urlDir = `https://www.google.com/maps/dir/${origin}/${destination}`;
      if (newWindow) newWindow.location.href = urlDir;
    }).catch(() => {});
  }

  supprimerItineraire() {
    this.routingService.clearRoute();
  }

}

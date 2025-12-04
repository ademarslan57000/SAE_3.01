import { ParkingService } from "../service/ParkingService.js";
import { RoutingService } from "../service/RoutingService.js";
import { ParkingRenderer } from "../views/ParkingRenderer.js";
import { UserLocationService } from "../service/UserLocationService.js";


export class MapController {
  constructor() {
    this.map = this.initMap();
    this.ICONS = this.initIcons();

    this.parkingService = new ParkingService("/map/backend/GetParkingWithRealTime.php");
    this.routingService = new RoutingService(this.map, this.ICONS);
    this.userLocationService = new UserLocationService(this.ICONS.user);
    this.renderer = new ParkingRenderer(this.map, this.ICONS.destination, this.routingService);

    this.parkings = [];
  }

  initMap() {
    const map = L.map("map").setView([49.1193, 6.1757], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    return map;
  }

  initIcons() {
    const shadow = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png";
    const makeIcon = (url) => L.icon({
      iconUrl: url,
      shadowUrl: shadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    return {
      user: makeIcon("https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"),
      destination: makeIcon("https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"),
    };
  }

  async init() {
    this.parkings = await this.parkingService.loadParkings();
    this.renderer.renderParkings(this.parkings);
  }

  async rechercheParking() {
    const q = document.getElementById("search").value.toLowerCase();
    const filtered = this.parkings.filter(p => p.name.toLowerCase().includes(q));
    this.renderer.renderParkings(filtered);
    if (filtered.length === 1) this.map.setView([filtered[0].lat, filtered[0].lon], 16);
  }

  async trierParProximite() {
    try {
      const [uLat, uLon] = await this.userLocationService.getLocation();
      const sorted = [...this.parkings].sort(
        (a, b) => this.userLocationService.distance(uLat, uLon, a.lat, a.lon) -
                  this.userLocationService.distance(uLat, uLon, b.lat, b.lon)
      );
      if (sorted.length > 0) this.renderer.openPopupAt(sorted[0], this.map);
    } catch (e) {
      alert("Impossible d'obtenir votre position : " + e);
    }
  }

  async localiserUtilisateur() {
    try {
      const [lat, lon] = await this.userLocationService.getLocation();
      this.userLocationService.showMarker(lat, lon, this.map);
      this.map.setView([lat, lon], 15);
    } catch (e) {
      alert("Impossible d'obtenir votre position : " + e);
    }
  }

  async afficherItineraire(lat, lon) {
    try {
      const [uLat, uLon] = await this.userLocationService.getLocation();
      this.routingService.startRoute([uLat, uLon], [lat, lon]);
      document.getElementById("btn-annuler-itineraire").style.display = "inline-block";
    } catch (e) {
      alert("Impossible d'obtenir votre position : " + e);
    }
  }

  ouvrirItineraire(lat, lon) {
    this.routingService.openGoogleMaps([lat, lon]);
  }

  supprimerItineraire() {
    this.routingService.clearRoute();
  }
}
import { ParkingService } from "../service/ParkingService.js";
import { RoutingService } from "../service/RoutingService.js";
import { ParkingRenderer } from "../views/ParkingRenderer.js";
import { UserLocationService } from "../service/UserLocationService.js";


export class MapController {
  constructor() {
    this.map = this.initMap();
    this.ICONS = this.initIcons();

    this.parkingService = new ParkingService("./map/backend/GetParkingWithRealTime.php");
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
    // Utiliser des icons Leaflet par défaut au lieu des URLs GitHub
    return {
      user: L.icon({
        iconUrl:
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="25" height="41"%3E%3Cpath fill="%2328a745" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.3 12.5 28.5 12.5 28.5s12.5-20.2 12.5-28.5C25 5.6 19.4 0 12.5 0z"/%3E%3Ccircle fill="white" cx="12.5" cy="12.5" r="5"/%3E%3C/svg%3E',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      }),
      destination: L.icon({
        iconUrl:
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="25" height="41"%3E%3Cpath fill="%23dc3545" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.3 12.5 28.5 12.5 28.5s12.5-20.2 12.5-28.5C25 5.6 19.4 0 12.5 0z"/%3E%3Ccircle fill="white" cx="12.5" cy="12.5" r="5"/%3E%3C/svg%3E',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      }),
    };
  }

  async init() {
    this.parkings = await this.parkingService.loadParkings();

    console.log("=== INIT MapController ===");
    console.log("📍 Parkings chargés:", this.parkings.length);

    const urlParams = new URLSearchParams(window.location.search);
    let parkingId = urlParams.get("parking");
    const itineraire = urlParams.get("itineraire");

    if (!parkingId) {
      parkingId = sessionStorage.getItem("targetParkingId");
      if (parkingId) {
        console.log("🔍 Parking ID depuis sessionStorage:", parkingId);
        sessionStorage.removeItem("targetParkingId");
      }
    } else {
      console.log("🔍 Parking ID depuis URL:", parkingId);
    }

    // ✅ Render TOUS les parkings + sidebar
    this.renderer.renderParkings(this.parkings, true);
    this.renderer.renderSidebar(this.parkings);

    // Vérifier si on doit lancer un itinéraire
    if (itineraire === "1") {
      const destinationData = sessionStorage.getItem("itineraireDestination");
      if (destinationData) {
        const destination = JSON.parse(destinationData);
        sessionStorage.removeItem("itineraireDestination");

        console.log("🧭 Lancement de l'itinéraire vers:", destination.nom);

        setTimeout(() => {
          this.lancerItineraireVers(
            destination.lat,
            destination.lon,
            destination.nom,
          );
        }, 1000);
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (parkingId) {
      const parking = this.parkings.find((p) =>
        String(p.id) === String(parkingId)
      );

      if (parking && parking.lat && parking.lon) {
        console.log("✅ Parking trouvé:", parking.name);

        setTimeout(() => {
          this.map.setView([parking.lat, parking.lon], 18, { animate: false });

          setTimeout(() => {
            this.renderer.simpleOpenPopup(parking);
          }, 1000);
        }, 500);
      } else {
        console.error("❌ Parking non trouvé");
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  async lancerItineraireVers(lat, lon, nom) {
    try {
      console.log("📍 Obtention de la position utilisateur...");
      const [uLat, uLon] = await this.userLocationService.getLocation();

      console.log("🗺️ Démarrage du guidage GPS vers:", nom);
      this.routingService.demarrerGuidage(lat, lon, nom);

      // Afficher le bouton pour arrêter le guidage
      document.getElementById("btn-stop-guidage").style.display =
        "inline-block";
    } catch (e) {
      console.error("❌ Erreur position:", e);
      alert(
        "Impossible d'obtenir votre position. Veuillez activer la géolocalisation.",
      );
    }
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

      // ✅ Sauvegarder la position pour le tri
      window.userLocation = [lat, lon];
      console.log("📍 Position sauvegardée pour le tri par distance");
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

  zoomToParking(lat, lon) {
    this.map.setView([lat, lon], 17, { animate: true });

    // Trouver et ouvrir le popup du parking
    const marker = this.renderer.markers.find((m) => {
      const latLng = m.getLatLng();
      return Math.abs(latLng.lat - lat) < 0.00001 &&
        Math.abs(latLng.lng - lon) < 0.00001;
    });

    if (marker) {
      setTimeout(() => marker.openPopup(), 500);
    }
  }
}
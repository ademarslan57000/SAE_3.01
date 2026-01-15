import { ParkingService } from "../service/ParkingService.js";
import { RoutingService } from "../service/RoutingService.js";
import { ParkingRenderer } from "../views/ParkingRenderer.js";
import { UserLocationService } from "../service/UserLocationService.js";

// Contrôleur principal de la carte
export class MapController {
  constructor() {
    this.DEFAULT_LOCATION = [49.12031084724555, 6.163799704645889];   //localisation par défaut : IUT de Metz

    this.map = this.initMap();
    this.ICONS = this.initIcons();

    this.parkingService = new ParkingService(
      "../api/GetParkingWithRealTime.php",
    );
    this.routingService = new RoutingService(this.map, this.ICONS);
    this.userLocationService = new UserLocationService(this.ICONS.user);
    this.renderer = new ParkingRenderer(
      this.map,
      this.ICONS.destination,
      this.routingService,
    );
    window.ParkingRenderer = this.renderer;
    window.MapController = this;
    this.parkings = [];
  }

  // Initialisation de la carte Leaflet
  initMap() {
    const map = L.map("map").setView([49.1193, 6.1757], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    return map;
  }

  initIcons() {
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

  // Initialisation du contrôleur
  async init() {
    this.parkings = await this.parkingService.loadParkings();

    const urlParams = new URLSearchParams(window.location.search);
    let parkingId = urlParams.get("parking");
    const itineraire = urlParams.get("itineraire");

    if (!parkingId) {
      parkingId = sessionStorage.getItem("targetParkingId");
      if (parkingId) {
        console.log("Parking ID depuis sessionStorage:", parkingId);
        sessionStorage.removeItem("targetParkingId");
      }
    } else {
      console.log("Parking ID depuis URL:", parkingId);
    }

    // Rendu des parkings et de la sidebar
    this.renderer.renderParkings(this.parkings, true);
    this.renderer.renderSidebar(this.parkings);

    // Vérifier si on doit lancer un itinéraire
    if (itineraire === "1") {
      const destinationData = sessionStorage.getItem("itineraireDestination");
      if (destinationData) {
        const destination = JSON.parse(destinationData);
        sessionStorage.removeItem("itineraireDestination");

        console.log("Lancement de l'itinéraire vers:", destination.nom);

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
        console.log("Parking trouvé:", parking.name);

        setTimeout(() => {
          this.map.setView([parking.lat, parking.lon], 18, { animate: false });

          setTimeout(() => {
            this.renderer.simpleOpenPopup(parking);
          }, 1000);
        }, 500);
      } else {
        console.error("Parking non trouvé");
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  // Lancer un itinéraire vers une destination donnée
  async lancerItineraireVers(lat, lon, nom) {
    console.log("🎯 Tentative de lancement d'itinéraire vers:", nom);
    let uLat, uLon;
    let hasRealGPS = false;
    try {
      console.log("📍 Demande de géolocalisation...");
      [uLat, uLon] = await this.userLocationService.getLocation();
      hasRealGPS = true;
      console.log("✅ GPS obtenu:", uLat, uLon);
    } catch (e) {
      console.log("⚠️ GPS refusé/timeout, utilisation position par défaut");
      [uLat, uLon] = this.DEFAULT_LOCATION;
      alert(
        "Position GPS indisponible. Départ du point par défaut (Metz Centre).",
      );
    }

    console.log(
      "🗺️ Démarrage de l'itinéraire vers:",
      nom,
      "depuis",
      uLat,
      uLon,
    );

    // Si on a le GPS réel, utiliser le guidage en temps réel
    if (hasRealGPS) {
      console.log("Mode guidage GPS en temps réel");
      this.routingService.demarrerGuidage(lat, lon, nom, this.DEFAULT_LOCATION);
    } else {
      // Sinon, afficher un itinéraire statique depuis la position par défaut
      console.log("Mode itinéraire statique depuis position par défaut");
      this.routingService.startRoute([uLat, uLon], [lat, lon], nom);
    }

    // Afficher le bouton stop guidage dans tous les cas
    if (window.innerWidth < 768) {
      document.getElementById("btn-stop-guidage-mobile").style.display =
        "block";
    } else {
      document.getElementById("btn-stop-guidage").style.display =
        "inline-block";
    }

    console.log("✅ Fonction lancerItineraireVers terminée");
  }

  // Recherche de parkings par nom
  async rechercheParking() {
    const q = document.getElementById("search").value.toLowerCase();
    const filtered = this.parkings.filter((p) =>
      p.name.toLowerCase().includes(q)
    );
    this.renderer.renderParkings(filtered);
    if (filtered.length === 1) {
      this.map.setView([filtered[0].lat, filtered[0].lon], 16);
    }
  }

  async trierParProximite() {
    let uLat, uLon;
    try {
      [uLat, uLon] = await this.userLocationService.getLocation();
    } catch (e) {
      // En cas d'échec, on trie par rapport au point par défaut
      [uLat, uLon] = this.DEFAULT_LOCATION;
      console.log("Tri effectué via le point par défaut.");
      alert(
        "Position GPS indisponible. Tri effectué depuis Metz Centre (position par défaut).",
      );
    }

    const sorted = [...this.parkings].sort(
      (a, b) =>
        this.userLocationService.distance(uLat, uLon, a.lat, a.lon) -
        this.userLocationService.distance(uLat, uLon, b.lat, b.lon),
    );

    if (sorted.length > 0) {
      this.renderer.openPopupAt(sorted[0], this.map);
    }
  }

  async localiserUtilisateur() {
    let lat, lon;
    try {
      [lat, lon] = await this.userLocationService.getLocation();
      console.log("📍 Position GPS obtenue");
    } catch (e) {
      console.warn(
        "⚠️ Géolocalisation refusée ou impossible, utilisation du point par défaut.",
      );
      [lat, lon] = this.DEFAULT_LOCATION;
      alert(
        "Géolocalisation impossible. Utilisation de la position par défaut (Metz Centre).",
      );
    }

    this.userLocationService.showMarker(lat, lon, this.map);
    this.map.setView([lat, lon], 15);
    window.userLocation = [lat, lon];
  }

  async afficherItineraire(lat, lon, nom = "Destination") {
    let uLat, uLon;
    try {
      [uLat, uLon] = await this.userLocationService.getLocation();
    } catch (e) {
      [uLat, uLon] = this.DEFAULT_LOCATION;
      console.log("Utilisation de la position par défaut pour l'itinéraire");
    }

    this.routingService.startRoute([uLat, uLon], [lat, lon], nom);
    document.getElementById("btn-annuler-itineraire").style.display =
      "inline-block";
  }

  ouvrirItineraire(lat, lon) {
    this.routingService.openGoogleMaps([lat, lon]);
  }

  supprimerItineraire() {
    this.routingService.clearRoute();
    document.getElementById("btn-stop-guidage").style.display = "none";
    document.getElementById("btn-stop-guidage-mobile").style.display = "none";
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

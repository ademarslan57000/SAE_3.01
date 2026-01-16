import { MapController } from "../js/controller/MapController.js";
import { networkManager } from "./utils/NetworkManager.js";
import { notificationManager } from "./utils/NotificationManager.js";

networkManager.addListener((isOnline) => {
  console.log("État réseau changé:", isOnline ? "Online" : "Offline");
});

window.mapController = new MapController();
window.mapController.init();

window.toggleEquipementDropdown = () => {
  const dropdown = document.getElementById("equipementDropdown");
  dropdown.classList.toggle("show");
};

window.updateEquipementFilter = () => {
  const filterPmr = document.getElementById("filterPmr").checked;
  const filterElectrique = document.getElementById("filterElectrique").checked;
  const filterVelo = document.getElementById("filterVelo").checked;

  const selectLabel = document.querySelector(".select-label");
  const selected = [];

  if (filterPmr) selected.push("PMR");
  if (filterElectrique) selected.push("Électrique");
  if (filterVelo) selected.push("Vélo");

  if (selected.length === 0) {
    selectLabel.textContent = "🔧 Tous équipements";
    selectLabel.setAttribute("data-i18n", "allEquip");
  } else {
    selectLabel.textContent = `🔧 ${selected.join(", ")}`;
    selectLabel.removeAttribute("data-i18n");
  }

  window.filterSidebarParkings();
};

window.rechercheParking = () => mapController.rechercheParking();
window.trierParProximite = () => mapController.trierParProximite();
window.localiserUtilisateur = () => mapController.localiserUtilisateur();
window.supprimerItineraire = () => mapController.supprimerItineraire();
window.arreterGuidage = () => mapController.routingService.arreterGuidage();
window.getLocation = () => mapController.userLocationService.getLocation();

window.filterSidebarParkings = async () => {
  const searchTerm = document
    .getElementById("sidebarSearch")
    .value.toLowerCase();
  const filterZone = document.getElementById("filterZoneSidebar").value;
  const filterType = document.getElementById("filterTypeSidebar").value;
  const filterPmr = document.getElementById("filterPmr").checked;
  const filterElectrique = document.getElementById("filterElectrique").checked;
  const filterVelo = document.getElementById("filterVelo").checked;
  const sortBy = document.getElementById("sortSidebar").value;

  if (!window.allSidebarParkings) return;

  let filtered = window.allSidebarParkings.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm) ||
      (p.adresse && p.adresse.toLowerCase().includes(searchTerm));

    const isLondon = String(p.id).startsWith("LONDON_");
    let matchZone = true;
    if (filterZone === "france") matchZone = !isLondon;
    else if (filterZone === "uk") matchZone = isLondon;

    let matchType = true;
    if (filterType === "gratuit") {
      matchType = p.gratuit === 1 || p.gratuit === true;
    } else if (filterType === "payant") {
      matchType = p.gratuit === 0 || p.gratuit === false;
    }

    let matchEquip = true;
    // Si au moins un filtre équipement est activé
    if (filterPmr || filterElectrique || filterVelo) {
      matchEquip = false;
      // Le parking doit avoir AU MOINS un des équipements cochés
      if (filterPmr && p.nb_pmr && p.nb_pmr > 0) matchEquip = true;
      if (
        filterElectrique && p.nb_voitures_electriques &&
        p.nb_voitures_electriques > 0
      ) matchEquip = true;
      if (filterVelo && p.nb_velo && p.nb_velo > 0) matchEquip = true;
    }

    return matchSearch && matchZone && matchType && matchEquip;
  });

  // Si tri par distance et pas encore de position, demander la géolocalisation
  if (sortBy === "distance" && !window.userLocation) {
    try {
      console.log("Récupération de la position pour le tri...");
      const [lat, lon] = await mapController.userLocationService.getLocation();
      window.userLocation = [lat, lon];
      console.log("Position obtenue:", lat, lon);
    } catch (e) {
      console.log(
        "Géolocalisation refusée, utilisation de la position par défaut",
      );
      window.userLocation = mapController.DEFAULT_LOCATION;
      alert(
        "Position GPS indisponible. Tri effectué depuis Metz Centre (position par défaut).",
      );
    }
  }

  // TRI des parkings
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return (a.name || "").localeCompare(b.name || "");

      case "price_asc":
        const priceA = a.gratuit ? 0 : a.tarif_1h || 999;
        const priceB = b.gratuit ? 0 : b.tarif_1h || 999;
        return priceA - priceB;

      case "price_desc":
        const priceA2 = a.gratuit ? 0 : a.tarif_1h || 0;
        const priceB2 = b.gratuit ? 0 : b.tarif_1h || 0;
        return priceB2 - priceA2;

      case "places_desc":
        return (b.place_libre || 0) - (a.place_libre || 0);

      case "capacity_desc":
        return (b.nb_places || 0) - (a.nb_places || 0);

      case "distance":
        if (window.userLocation) {
          const distA = mapController.userLocationService.distance(
            window.userLocation[0],
            window.userLocation[1],
            a.lat,
            a.lon,
          );
          const distB = mapController.userLocationService.distance(
            window.userLocation[0],
            window.userLocation[1],
            b.lat,
            b.lon,
          );
          return distA - distB;
        }
        return 0;

      default:
        return 0;
    }
  });

  const container = document.getElementById("sidebarContent");
  if (filtered.length === 0) {
    container.innerHTML =
      '<div style="text-align:center;padding:20px;color:#999;">Aucun parking trouvé</div>';
  } else {
    container.innerHTML = filtered
      .map((p) => {
        let item = mapController.renderer.createSidebarItem(p);

        if (sortBy === "distance" && window.userLocation) {
          const dist = mapController.userLocationService.distance(
            window.userLocation[0],
            window.userLocation[1],
            p.lat,
            p.lon,
          );
          const distText = dist < 1
            ? `${Math.round(dist * 1000)}m`
            : `${dist.toFixed(1)}km`;

          item = item.replace(
            '<div class="parking-item-info">',
            `<div class="parking-item-info"><div style="color:#667eea;font-weight:600;">📍 ${distText}</div>`,
          );
        }

        return item;
      })
      .join("");

    const items = container.querySelectorAll(".sidebar-parking-item");
    items.forEach((item) => {
      const lat = parseFloat(item.dataset.lat);
      const lon = parseFloat(item.dataset.lon);
      const onSelect = () => {
        window.mapController.zoomToParking(lat, lon);
        const sidebar = document.getElementById("sidebar");
        if (!sidebar.classList.contains("collapsed")) {
          toggleSidebar();
        }
      };
      item.addEventListener("pointerup", onSelect);
    });
  }

  mapController.renderer.renderParkings(filtered, filtered.length > 0);
};

window.resetSidebarFilters = () => {
  document.getElementById("sidebarSearch").value = "";
  document.getElementById("filterZoneSidebar").value = "all";
  document.getElementById("filterTypeSidebar").value = "all";
  document.getElementById("filterPmr").checked = false;
  document.getElementById("filterElectrique").checked = false;
  document.getElementById("filterVelo").checked = false;
  document.getElementById("sortSidebar").value = "name";

  // Réinitialiser le label du dropdown équipements
  const selectLabel = document.querySelector(".select-label");
  if (selectLabel) {
    selectLabel.textContent = "🔧 Tous équipements";
    selectLabel.setAttribute("data-i18n", "allEquip");
  }

  if (window.allSidebarParkings) {
    const container = document.getElementById("sidebarContent");
    container.innerHTML = window.allSidebarParkings
      .map((p) => mapController.renderer.createSidebarItem(p))
      .join("");
    mapController.renderer.renderParkings(window.allSidebarParkings, true);
  }
};

window.saveUserLocation = async () => {
  try {
    const [lat, lon] = await mapController.userLocationService.getLocation();
    window.userLocation = [lat, lon];
    console.log("📍 Position utilisateur sauvegardée pour le tri");
  } catch (e) {
    console.error("❌ Impossible de sauvegarder la position");
  }
};

window.addEventListener("DOMContentLoaded", () => {
  const sidebarSearch = document.getElementById("sidebarSearch");
  const filterZone = document.getElementById("filterZoneSidebar");
  const filterType = document.getElementById("filterTypeSidebar");
  const filterPmr = document.getElementById("filterPmr");
  const filterElectrique = document.getElementById("filterElectrique");
  const filterVelo = document.getElementById("filterVelo");
  const sortSidebar = document.getElementById("sortSidebar");

  [sidebarSearch].forEach(
    (el) => el && el.addEventListener("input", window.filterSidebarParkings),
  );
  [filterZone, filterType, filterPmr, filterElectrique, filterVelo, sortSidebar]
    .forEach(
      (el) => el && el.addEventListener("change", window.filterSidebarParkings),
    );

  // Fermer le dropdown quand on clique ailleurs
  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("equipementDropdown");
    const selectContainer = document.querySelector(".custom-select-container");

    if (dropdown && selectContainer && !selectContainer.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
});

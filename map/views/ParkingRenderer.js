import { traduire } from "./PopUp.translation.js";

export class ParkingRenderer {
  constructor(map, destinationIcon, routingService) {
    this.map = map;
    this.destinationIcon = destinationIcon;
    this.routingService = routingService;
    this.markers = [];
    this.markerClusterGroup = null;
  }

  renderParkings(data, fitBounds = true) {
    this.clearMarkers();
    this.shouldFitBounds = fitBounds;

    this.markerClusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
      animate: false,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html:
            `<div style="background:#004cbe;color:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${count}</div>`,
          className: "",
          iconSize: [40, 40],
        });
      },
    });

    data.forEach((p) => {
      const priceLabel = this.createPriceLabel(p);
      const marker = L.circleMarker([p.lat, p.lon], {
        radius: 8,
        color: "#004cbe",
        fillColor: p.gratuit ? "#28a745" : "#b12424ff",
        fillOpacity: 0.9,
        weight: 2,
      });

      marker.bindTooltip(priceLabel, {
        permanent: true,
        direction: "top",
        className: "price-label " + (p.gratuit ? "gratuit" : "payant"),
        offset: [0, -10],
      });

      marker.bindPopup(this.buildPopup(p));
      marker.parkingData = p;
      this.markerClusterGroup.addLayer(marker);
      this.markers.push(marker);
    });

    this.map.addLayer(this.markerClusterGroup);

    if (this.shouldFitBounds && data.length > 0) {
      const bounds = this.markerClusterGroup.getBounds();
      if (bounds.isValid()) {
        this.map.fitBounds(bounds.pad(0.1));
      }
    }
  }

  createPriceLabel(parking) {
    if (parking.gratuit) {
      return traduire("free");
    }
    if (parking.tarif_1h) {
      return `${parking.tarif_1h}€/h`;
    }
    if (parking.tarif_24h) {
      return `${parking.tarif_24h}€/24h`;
    }
    return traduire("paid");
  }

  renderSidebar(parkings) {
    const container = document.getElementById("sidebarContent");
    if (!container) return;

    if (parkings.length === 0) {
      container.innerHTML =
        '<div style="text-align:center;padding:20px;color:#999;">Aucun parking trouvé</div>';
      return;
    }

    window.allSidebarParkings = parkings;
    container.innerHTML = parkings.map((p) => this.createSidebarItem(p)).join(
      "",
    );

    const items = container.querySelectorAll(".sidebar-parking-item");
    items.forEach((item) => {
      const lat = parseFloat(item.dataset.lat);
      const lon = parseFloat(item.dataset.lon);

      const onSelect = (e) => {
        e.preventDefault();
        window.mapController.zoomToParking(lat, lon);

        const sidebar = document.getElementById("sidebar");
        if (!sidebar.classList.contains("collapsed")) {
          toggleSidebar();
        }
      };

      item.addEventListener("pointerup", onSelect); // PC + mobile + tablette
    });
  }

  createSidebarItem(p) {
    const gratuit = p.gratuit || p.gratuit === 1;
    const prix = gratuit
      ? "GRATUIT"
      : (p.tarif_1h
        ? `${p.tarif_1h}€/h`
        : (p.tarif_24h ? `${p.tarif_24h}€/24h` : "Payant"));
    const dispo = p.place_libre != null
      ? `${p.place_libre}/${p.place_total_rt || p.nb_places} places`
      : "N/A";
    const dispoClass = p.place_libre > 10
      ? "disponible"
      : (p.place_libre > 0 ? "" : "complet");
    const imageUrl = this.getParkingImage(p);

    return `
      <div class="sidebar-parking-item ${gratuit ? "gratuit" : "payant"}"
           data-lat="${p.lat}" data-lon="${p.lon}">
        <img src="${imageUrl}" alt="${p.name}" class="parking-item-image" 
             onerror="this.src='${this.getDefaultImage(p)}'">
        <div class="parking-item-header">
          <div class="parking-item-name">${p.name || "Parking"}</div>
          <div class="parking-item-price ${
      gratuit ? "gratuit" : ""
    }">${prix}</div>
        </div>
        <div class="parking-item-info">
          <div>📍 ${p.adresse || "Adresse non disponible"}</div>
          <div class="parking-item-dispo ${dispoClass}">🅿️ ${dispo}</div>
        </div>
      </div>
    `;
  }

  getParkingImage(parking) {
    if (parking.image) {
      return parking.image;
    }

    const parkingName = String(parking.name || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    console.log(`📸 Image attendue pour "${parking.name}": ${parkingName}.jpg`);

    return `./image/parkings/${parkingName}.jpg`;
  }

  getDefaultImage(parking) {
    const nomParking = (parking.name || "Parking").substring(0, 15);
    const encodedName = encodeURIComponent(nomParking);

    // ✅ Utiliser un SVG en Data URI au lieu de via.placeholder.com
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='180'%3E%3Crect fill='%23667eea' width='350' height='180'/%3E%3Ctext fill='white' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='20' font-family='Arial' font-weight='bold'%3E${encodedName}%3C/text%3E%3C/svg%3E`;
  }

  clearMarkers() {
    if (this.markerClusterGroup) this.map.removeLayer(this.markerClusterGroup);
    this.markers.forEach((m) => this.map.removeLayer(m));
    this.markers = [];
  }

  buildPopup(p) {
    const nomSafe = (p.name || "Parking").replace(/'/g, "\\'").replace(
      /"/g,
      "",
    );
    const dispoPopup = p.place_libre != null
      ? `<hr style="margin:5px 0;"><b>Disponibilité :</b><br>
         <span style="color:#e67e22; font-weight:700;">${p.place_libre}</span> / ${
        p.place_total_rt ?? p.nb_places
      }
         ${
        p.place_update
          ? `<br><small>Maj : ${
            new Date(p.place_update).toLocaleString()
          }</small>`
          : ""
      }`
      : "";
    const tarifs = p.gratuit
      ? "<span style='color:#28a745;'><b>GRATUIT</b></span>"
      : `${p.tarif_1h ? `1h : ${p.tarif_1h}€<br>` : ""}
         ${p.tarif_2h ? `2h : ${p.tarif_2h}€<br>` : ""}
         ${p.tarif_24h ? `24h : ${p.tarif_24h}€<br>` : ""}`;
    return `
      <div style="min-width:280px; font-size:13px;">
        <b style="font-size:15px;">${p.name}</b><br>
        ${p.adresse ? `<small>${p.adresse}</small><br>` : ""}
        <hr style="margin:5px 0;"><b>Capacité :</b><br>Total : ${p.nb_places} places
        <hr style="margin:5px 0;"><b>Tarifs :</b><br>${tarifs}
        ${p.info ? `<hr style="margin:5px 0;"><i>${p.info}</i><br>` : ""}
        ${dispoPopup}
        <hr style="margin:5px 0;">
        <div class="popup-buttons">
          <button onclick="window.mapController.routingService.demarrerGuidage(${p.lat}, ${p.lon}, '${nomSafe}', ()=>window.mapController.userLocationService.getLocation())">Itinéraire</button>
          ${
      p.url
        ? `<button onclick="window.open('${p.url}', '_blank')">Plus d'infos</button>`
        : ""
    }
        </div>
      </div>
    `;
  }

  simpleOpenPopup(parking) {
    let markerTrouve = null;
    for (let i = 0; i < this.markers.length; i++) {
      const m = this.markers[i];
      const latLng = m.getLatLng();
      if (
        Math.abs(latLng.lat - parking.lat) < 0.00001 &&
        Math.abs(latLng.lng - parking.lon) < 0.00001
      ) {
        markerTrouve = m;
        break;
      }
    }
    if (!markerTrouve) {
      console.error("❌ Marker non trouvé");
      return;
    }
    markerTrouve.openPopup();
    setTimeout(() => {
      if (!markerTrouve.isPopupOpen()) {
        markerTrouve.openPopup();
      }
    }, 200);
  }

  forceOpenPopup(parking) {
    this.simpleOpenPopup(parking);
  }

  openParkingPopupSimple(parking) {
    this.simpleOpenPopup(parking);
  }

  openParkingPopup(parking) {
    const marker = this.markers.find((m) => {
      const latLng = m.getLatLng();
      return Math.abs(latLng.lat - parking.lat) < 0.0001 &&
        Math.abs(latLng.lng - parking.lon) < 0.0001;
    });
    if (!marker) {
      console.error("❌ Marker non trouvé");
      return;
    }
    this.markerClusterGroup.zoomToShowLayer(marker, () => {
      marker.openPopup();
    });
  }

  clickOnMarker(parking) {
    this.openParkingPopup(parking);
  }

  openPopupAt(parking) {
    this.openParkingPopup(parking);
  }
}

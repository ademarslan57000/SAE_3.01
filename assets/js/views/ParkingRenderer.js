export class ParkingRenderer {
  constructor(map, destinationIcon, routingService) {
    this.map = map;
    this.destinationIcon = destinationIcon;
    this.routingService = routingService;
    this.markers = [];

    // Remplacer l'ancien binding par une fonction sécurisée
    this.traduire = (key) => {
      if (typeof window.traduirePopup === "function") {
        return window.traduirePopup(key);
      }
      // Fallback si la traduction n'est pas encore prête
      return key;
    };
  }

  // Fonction pour détecter les parkings P+R
  isParkAndRide(parking) {
    const PR_KEYWORDS = ["p+r", "p&r", "rochambeau", "foire expo", "woippy"];
    const name = (parking.name || parking.nom || "").toLowerCase();
    return PR_KEYWORDS.some((keyword) => name.includes(keyword));
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
      const isPR = this.isParkAndRide(p);
      const marker = L.circleMarker([p.lat, p.lon], {
        radius: 8,
        color: "#004cbe",
        fillColor: isPR ? "#e67e22" : (p.gratuit ? "#28a745" : "#b12424ff"),
        fillOpacity: 0.9,
        weight: 2,
      });

      marker.bindTooltip(priceLabel, {
        permanent: true,
        direction: "top",
        className: "price-label " +
          (isPR ? "park-ride" : (p.gratuit ? "gratuit" : "payant")),
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
    if (this.isParkAndRide(parking)) return "P+R";
    if (parking.gratuit) return this.traduire("free");
    if (parking.tarif_1h) return `${parking.tarif_1h}€/h`;
    if (parking.tarif_24h) return `${parking.tarif_24h}€/24h`;
    return this.traduire("paid");
  }

  renderSidebar(parkings) {
    const container = document.getElementById("sidebarContent");
    if (!container) return;

    if (parkings.length === 0) {
      container.innerHTML =
        `<div style="text-align:center;padding:20px;color:#999;">${
          this.traduire("no_parking_found")
        }</div>`;
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

      item.addEventListener("pointerup", onSelect);
    });
  }

  createSidebarItem(p) {
    const isPR = this.isParkAndRide(p);
    const gratuit = p.gratuit || p.gratuit === 1;

    let prix;
    if (isPR) {
      prix = "P+R - Gratuit avec ticket";
    } else if (gratuit) {
      prix = this.traduire("free");
    } else if (p.tarif_1h) {
      prix = `${p.tarif_1h}€/h`;
    } else if (p.tarif_24h) {
      prix = `${p.tarif_24h}€/24h`;
    } else {
      prix = this.traduire("paid");
    }

    const dispo = p.place_libre != null
      ? `${p.place_libre}/${p.place_total_rt || p.nb_places} ${
        this.traduire("places")
      }`
      : `? / ${p.nb_places} ${this.traduire("places")}`;

    const dispoClass = p.place_libre != null && p.place_libre > 10
      ? "disponible"
      : (p.place_libre != null && p.place_libre > 0
        ? ""
        : (p.place_libre === 0 ? "complet" : ""));

    const imageUrl = this.getParkingImage(p);

    return `
      <div class="sidebar-parking-item ${
      isPR ? "park-ride" : (gratuit ? "gratuit" : "payant")
    }"
           data-lat="${p.lat}" data-lon="${p.lon}">
        <img src="${imageUrl}" 
     alt="${p.name}" 
     class="parking-item-image" 
     onerror="this.onerror=null; this.src='${this.getDefaultImage()}';" />
        <div class="parking-item-header">
          <div class="parking-item-name">${
      p.name || this.traduire("parking")
    }</div>
          <div class="parking-item-price ${
      isPR ? "park-ride" : (gratuit ? "gratuit" : "")
    }">${prix}</div>
        </div>
        <div class="parking-item-info">
          <div>📍 ${p.adresse || this.traduire("address_not_available")}</div>
          <div class="parking-item-dispo ${dispoClass}">🅿️ ${dispo}</div>
        </div>
        ${
      isPR
        ? `<div class="pr-info">🎟️ Gratuit avec ticket de transport en commun</div>`
        : ""
    }
      </div>
    `;
  }

  getParkingImage(parking) {
    if (parking.image) return parking.image;

    const parkingName = String(parking.name || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    console.log(`📸 Image attendue pour "${parking.name}": ${parkingName}.jpg`);
    return `../assets/image/parkings/${parkingName}.jpg`;
  }

  getDefaultImage(parking) {
    return "../assets/image/parkings/no-image-park.jpg";
  }

  clearMarkers() {
    if (this.markerClusterGroup) this.map.removeLayer(this.markerClusterGroup);
    this.markers.forEach((m) => this.map.removeLayer(m));
    this.markers = [];
  }

  buildPopup(p) {
    const nomSafe = (p.name || this.traduire("parking")).replace(/'/g, "\\'")
      .replace(/"/g, "");

    const dispoPopup = p.place_libre != null
      ? `<hr style="margin:5px 0;"><b>${this.traduire("availability")} :</b><br>
         <span style="color:#e67e22; font-weight:700;">${p.place_libre}</span> / ${
        p.place_total_rt ?? p.nb_places
      }
         ${
        p.place_update
          ? `<br><small>${this.traduire("updated")} : ${
            new Date(p.place_update).toLocaleString()
          }</small>`
          : ""
      }`
      : `<hr style="margin:5px 0;"><b>${this.traduire("availability")} :</b><br>
         <span style="color:#999; font-weight:700;">?</span> / ${p.nb_places}<br>
         <small style="color:#999;">${
        this.traduire("realtime_unavailable")
      }</small>`;

    const isPR = this.isParkAndRide(p);
    let tarifs;

    if (isPR) {
      tarifs =
        `<div style='background:#fff3cd; border-left:3px solid #e67e22; padding:8px; margin:5px 0;'>
        <span style='color:#e67e22; font-size:16px;'>🅿️ <b>Parking P+R</b></span><br>
        <span style='color:#28a745; font-weight:600;'>✓ GRATUIT avec ticket de transport en commun</span><br>
        <small style='color:#666;'>Sans ticket : tarif standard applicable</small>
      </div>`;
    } else if (p.gratuit) {
      tarifs = `<span style='color:#28a745;'><b>${
        this.traduire("free")
      }</b></span>`;
    } else {
      tarifs = `${p.tarif_1h ? `1h : ${p.tarif_1h}€<br>` : ""}${
        p.tarif_2h ? `2h : ${p.tarif_2h}€<br>` : ""
      }${p.tarif_24h ? `24h : ${p.tarif_24h}€<br>` : ""}`;
    }

    return `
      <div style="min-width:280px; font-size:13px;">
        <b style="font-size:15px;">${p.name}</b><br>
        ${p.adresse ? `<small>${p.adresse}</small><br>` : ""}
        <hr style="margin:5px 0;"><b>${
      this.traduire("capacity")
    } :</b><br>Total : ${p.nb_places} ${this.traduire("places")}
        <hr style="margin:5px 0;"><b>${
      this.traduire("rates")
    } :</b><br>${tarifs}
        ${p.info ? `<hr style="margin:5px 0;"><i>${p.info}</i><br>` : ""}
        ${dispoPopup}
        <hr style="margin:5px 0;">
        <div class="popup-buttons">
          <button onclick="window.mapController.routingService.demarrerGuidage(${p.lat}, ${p.lon}, '${nomSafe}', ()=>window.mapController.userLocationService.getLocation())">
            ${this.traduire("directions")}
          </button>
          ${
      p.url && !p.name.includes("(LUL)")
        ? `<button onclick="window.open('${p.url}', '_blank')">${
          this.traduire("more_info")
        }</button>`
        : ""
    }
        </div>
      </div>
    `;
  }

  // méthodes pour ouvrir popups
  simpleOpenPopup(parking) {
    const markerTrouve = this.markers.find((m) => {
      const latLng = m.getLatLng();
      return Math.abs(latLng.lat - parking.lat) < 0.00001 &&
        Math.abs(latLng.lng - parking.lon) < 0.00001;
    });
    if (!markerTrouve) return console.error("❌ Marker non trouvé");
    markerTrouve.openPopup();
    setTimeout(() => {
      if (!markerTrouve.isPopupOpen()) markerTrouve.openPopup();
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
    if (!marker) return console.error("❌ Marker non trouvé");
    this.markerClusterGroup.zoomToShowLayer(marker, () => marker.openPopup());
  }

  clickOnMarker(parking) {
    this.openParkingPopup(parking);
  }
  openPopupAt(parking) {
    this.openParkingPopup(parking);
  }
}

export class ParkingRenderer {
  constructor(map, destinationIcon, routingService) {
    this.map = map;
    this.destinationIcon = destinationIcon;
    this.routingService = routingService;
    this.markers = [];
    this.markerClusterGroup = null;
  }

  renderParkings(data) {
    this.clearMarkers();
    this.markerClusterGroup = L.markerClusterGroup({ maxClusterRadius: 50 });

    data.forEach((p) => {
      const marker = L.circleMarker([p.lat, p.lon], {
        radius: 8,
        color: "#004cbe",
        fillColor: p.gratuit ? "#28a745" : "#4bb6c9",
        fillOpacity: 0.9,
        weight: 2,
      });
      marker.bindPopup(this.buildPopup(p));
      this.markerClusterGroup.addLayer(marker);
      this.markers.push(marker);
    });

    this.map.addLayer(this.markerClusterGroup);

    const bounds = this.markerClusterGroup.getBounds();
    if (bounds.isValid()) this.map.fitBounds(bounds.pad(0.1));
  }

  clearMarkers() {
    if (this.markerClusterGroup) this.map.removeLayer(this.markerClusterGroup);
    this.markers.forEach((m) => this.map.removeLayer(m));
    this.markers = [];
  }

  buildPopup(p) {
    const nomSafe = (p.name || "Parking").replace(/'/g, "\\'").replace(/"/g, "");
    const dispo = p.place_libre != null
      ? `<hr style="margin:5px 0;"><b>Disponibilité :</b><br>
         <span style="color:#e67e22; font-weight:700;">${p.place_libre}</span> / ${p.place_total_rt ?? p.nb_places}
         ${p.place_update ? `<br><small>Maj : ${new Date(p.place_update).toLocaleString()}</small>` : ""}`
      : "";
    const tarifs = p.gratuit ? "<span style='color:#28a745;'><b>GRATUIT</b></span>"
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
        ${dispo}
        <hr style="margin:5px 0;">
        <div class="popup-buttons">
          <button onclick="window.mapController.routingService.demarrerGuidage(${p.lat}, ${p.lon}, '${nomSafe}', window.getLocation)">Itinéraire</button>
          ${p.url ? `<button onclick="window.open('${p.url}', '_blank')">Plus d'infos</button>` : ""}
        </div>
      </div>
    `;
  }

  openPopupAt(parking) {
    const marker = this.markers.find(m =>
      m.getLatLng().lat === parking.lat && m.getLatLng().lng === parking.lon
    );
    if (marker) {
      marker.openPopup();
      this.map.setView([parking.lat, parking.lon], 15);
    }
  }
}

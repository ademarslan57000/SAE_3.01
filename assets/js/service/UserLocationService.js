export class UserLocationService {
  constructor(userIcon) {
    this.userIcon = userIcon;
    this.userMarker = null;
  }

  async getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(
          window.traduirePopup("geoNotSupported") ||
            "Géolocalisation non supportée",
        );
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
        (err) => reject(err.message || err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }

  /**
   * Calculates distance between two points using the Haversine formula
   */
  distance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  showMarker(lat, lon, map) {
    const translatedText = window.traduirePopup("youAreHere");
    const popupContent = translatedText !== "youAreHere" ? translatedText : "Vous êtes ici";

    this.userMarker = L.marker([lat, lon], { icon: this.userIcon })
      .addTo(map)
      .bindPopup(popupContent)
      .openPopup();
  }

  updatePopup() {
    if (!this.userMarker) return;

    const translatedText = window.traduirePopup("youAreHere");
    const popupContent = translatedText !== "youAreHere" ? translatedText : "Vous êtes ici";
    
    this.userMarker.setPopupContent(popupContent);

    if (this.userMarker.isPopupOpen()) {
      this.userMarker.openPopup();
    }
  }
}
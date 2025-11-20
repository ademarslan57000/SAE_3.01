import { getCentroid } from './utils.js';

export class ParkingService {
  constructor(url) {
    this.url = url;
    this.parkings = [];
  }

  async loadParkings() {
    try {
      const res = await fetch(this.url);
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const json = await res.json();
      const features = json.features || [];

      this.parkings = features.map(f => {
        const props = f.properties;
        const centroid = getCentroid(f.geometry);
        return {
          name: props.lib || "Parking",
          lat: centroid ? centroid[0] : 49.1193,
          lon: centroid ? centroid[1] : 6.1757,
          gratuit: props.cout !== "payant",
          nature: props.nature || "",
          statut: props.statut || "",
          domaine: props.domaine || "",
          gestion: props.gestion || "",
          observ: props.observ || "",
          place_total: props.place_total != null ? Number(props.place_total) : null,
          place_libre: props.place_libre != null ? Number(props.place_libre) : null,
        };
      });

      return this.parkings;
    } catch (err) {
      console.error("Erreur chargement parkings :", err);
      return [];
    }
  }
}

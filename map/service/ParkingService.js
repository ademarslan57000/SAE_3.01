import { getCentroid } from '../utils/Utils.js';

export class ParkingService {
  constructor(urlSQL) {
    this.urlSQL = urlSQL;
  }

  async loadParkings() {
    const sql = await this.loadSQL();
    return sql;
  }

  async loadSQL() {
    try {
      const res = await fetch(this.urlSQL);
      const text = await res.text();
      
      if (!res.ok) {
        console.error("Erreur HTTP SQL :", res.status, text);
        return [];
      }

      if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
      console.error("Réponse SQL non JSON :", text);
      return [];
    }
      
      return JSON.parse(text);
    } catch (e) {
      console.error("Erreur SQL :", e);
      return [];
    }
  }

  async loadAPI() {
    try {
      const res = await fetch(this.urlAPI);
      const text = await res.text();
      
      console.log("Réponse API :", text.substring(0, 200));
      
      if (!res.ok) {
        console.error("Erreur HTTP API :", res.status, text);
        return [];
      }
      
      const json = JSON.parse(text);
      const features = json.features || [];

      return features.map(f => {
        const p = f.properties;
        const centroid = getCentroid(f.geometry);

        return {
          id: p.id,
          name: p.lib,
          lat: centroid ? centroid[0] : null,
          lon: centroid ? centroid[1] : null,
          gratuit: p.cout !== "payant",
          nature: p.nature,
          statut: p.statut,
          domaine: p.domaine,
          gestion: p.gestion,
          observ: p.observ,
          place_total: Number(p.place_total),
          place_libre: Number(p.place_libre)
        };
      });
    } catch (e) {
      console.error("Erreur API :", e);
      return [];
    }
  }
}

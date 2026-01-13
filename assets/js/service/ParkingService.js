import { getCentroid } from "../utils/Utils.js";
import { ApiHelper } from "../utils/ApiHelper.js";
import { notificationManager } from "../utils/NotificationManager.js";

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
      const res = await ApiHelper.fetchWithTimeout(this.urlSQL, {}, 10000);
      const text = await res.text();

      if (!res.ok) {
        console.error("Erreur HTTP SQL :", res.status, text);
        notificationManager.error(`Erreur serveur (${res.status})`);
        return [];
      }

      if (!text.trim().startsWith("{") && !text.trim().startsWith("[")) {
        console.error("Réponse SQL non JSON :", text);
        notificationManager.error("Erreur: Réponse serveur invalide");
        return [];
      }

      return JSON.parse(text);
    } catch (e) {
      console.error("Erreur SQL :", e);
      ApiHelper.handleApiError(e, "Chargement des parkings");
      return [];
    }
  }

  async loadAPI() {
    try {
      const res = await ApiHelper.fetchWithTimeout(this.urlAPI, {}, 10000);
      const text = await res.text();

      console.log("Réponse API :", text.substring(0, 200));

      if (!res.ok) {
        console.error("Erreur HTTP API :", res.status, text);
        notificationManager.error(`Erreur serveur API (${res.status})`);
        return [];
      }

      const json = JSON.parse(text);
      const features = json.features || [];

      return features.map((f) => {
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
          place_libre: Number(p.place_libre),
        };
      });
    } catch (e) {
      console.error("Erreur API :", e);
      ApiHelper.handleApiError(e, "Chargement des données en temps réel");
      return [];
    }
  }
}

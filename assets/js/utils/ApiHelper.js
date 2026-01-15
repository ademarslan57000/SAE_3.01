
import { networkManager } from "./NetworkManager.js";
import { notificationManager } from "./NotificationManager.js";

export class ApiHelper {
    /**
     * Effectue un appel fetch avec timeout
     * @param {string} url - URL à appeler
     * @param {object} options - Options fetch
     * @param {number} timeout - Timeout en ms (défaut: 10s)
     * @returns {Promise} - Réponse fetch
     */
    static async fetchWithTimeout(url, options = {}, timeout = 10000) {
        // Vérifier la connexion d'abord
        if (!networkManager.isOnline) {
            throw new Error("NETWORK_OFFLINE");
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === "AbortError") {
                throw new Error("TIMEOUT");
            }
            throw error;
        }
    }

    /**
     * Gère les erreurs API de manière uniforme
     * @param {Error} error - Erreur à traiter
     * @param {string} context - Contexte de l'erreur
     * @returns {string} - Message d'erreur formaté
     */
    static handleApiError(error, context = "Opération") {
        console.error(`Erreur ${context}:`, error);

        let message;

        if (error.message === "NETWORK_OFFLINE") {
            message =
                "📡 Aucune connexion Internet. Veuillez vérifier votre réseau.";
        } else if (error.message === "TIMEOUT") {
            message = "⏱️ Délai d'attente dépassé. Le serveur ne répond pas.";
        } else if (error.message.includes("Failed to fetch")) {
            message =
                "🔌 Impossible de contacter le serveur. Vérifiez votre connexion.";
        } else {
            message = `❌ ${context} échouée. Veuillez réessayer.`;
        }

        notificationManager.error(message);
        return message;
    }

    /**
     * Affiche/masque un loader
     * @param {boolean} show - Afficher ou masquer
     * @param {string} elementId - ID de l'élément loader (optionnel)
     */
    static toggleLoader(show, elementId = null) {
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.style.display = show ? "flex" : "none";
            }
        }

        // Loader global
        const globalLoader = document.getElementById("global-loader");
        if (globalLoader) {
            globalLoader.style.display = show ? "flex" : "none";
        }
    }

    /**
     * Wrapper pour appels API avec gestion complète
     * @param {Function} apiCall - Fonction async à exécuter
     * @param {string} loaderId - ID du loader (optionnel)
     * @param {string} errorContext - Contexte pour les erreurs
     * @returns {Promise} - Résultat de l'appel
     */
    static async withLoader(
        apiCall,
        loaderId = null,
        errorContext = "Chargement",
    ) {
        try {
            this.toggleLoader(true, loaderId);
            const result = await apiCall();
            this.toggleLoader(false, loaderId);
            return result;
        } catch (error) {
            this.toggleLoader(false, loaderId);
            this.handleApiError(error, errorContext);
            throw error;
        }
    }
}

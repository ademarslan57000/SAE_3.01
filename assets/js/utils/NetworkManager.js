/**
 * NetworkManager - Gestion de l'état du réseau et détection mode avion
 */
export class NetworkManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.listeners = [];
        this.init();
    }

    init() {
        // Écoute les changements d'état du réseau
        window.addEventListener("online", () => this.handleOnline());
        window.addEventListener("offline", () => this.handleOffline());
    }

    handleOnline() {
        this.isOnline = true;
        this.notifyListeners(true);
        this.showNetworkStatus("✅ Connexion rétablie", "success");
    }

    handleOffline() {
        this.isOnline = false;
        this.notifyListeners(false);
        this.showNetworkStatus(
            "⚠️ Aucune connexion Internet (Mode hors ligne)",
            "error",
        );
    }

    /**
     * Enregistre un listener pour être notifié des changements réseau
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(isOnline) {
        this.listeners.forEach((callback) => callback(isOnline));
    }

    /**
     * Affiche un indicateur visuel de l'état réseau
     */
    showNetworkStatus(message, type) {
        const existing = document.getElementById("network-status-indicator");
        if (existing) existing.remove();

        const indicator = document.createElement("div");
        indicator.id = "network-status-indicator";
        indicator.className = `network-indicator ${type}`;
        indicator.textContent = message;
        document.body.appendChild(indicator);

        // Auto-masquer après 5 secondes pour les succès
        if (type === "success") {
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.style.opacity = "0";
                    setTimeout(() => indicator.remove(), 300);
                }
            }, 5000);
        }
    }

    /**
     * Vérifie si le réseau est disponible avant d'effectuer une action
     */
    checkBeforeAction(
        action,
        errorMessage = "Impossible sans connexion Internet",
    ) {
        if (!this.isOnline) {
            this.showNetworkStatus(`❌ ${errorMessage}`, "error");
            return false;
        }
        return true;
    }

    /**
     * Masque l'indicateur réseau
     */
    hideNetworkStatus() {
        const existing = document.getElementById("network-status-indicator");
        if (existing) {
            existing.style.opacity = "0";
            setTimeout(() => existing.remove(), 300);
        }
    }
}

// Instance singleton
export const networkManager = new NetworkManager();

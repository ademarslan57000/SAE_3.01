/**
 * NotificationManager - Système de notifications toast pour l'utilisateur
 */
export class NotificationManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Créer le conteneur de notifications
        this.container = document.createElement("div");
        this.container.id = "toast-container";
        this.container.className = "toast-container";
        document.body.appendChild(this.container);
    }

    /**
     * Affiche une notification toast
     * @param {string} message - Message à afficher
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Durée en ms (0 = permanent)
     */
    show(message, type = "info", duration = 5000) {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        const icon = this.getIcon(type);
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.container.appendChild(toast);

        // Animation d'entrée
        setTimeout(() => toast.classList.add("toast-show"), 10);

        // Auto-fermeture
        if (duration > 0) {
            setTimeout(() => {
                toast.classList.remove("toast-show");
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        return toast;
    }

    getIcon(type) {
        const icons = {
            success: "✅",
            error: "❌",
            warning: "⚠️",
            info: "ℹ️",
            loading: "⏳",
        };
        return icons[type] || icons.info;
    }

    success(message, duration = 4000) {
        return this.show(message, "success", duration);
    }

    error(message, duration = 6000) {
        return this.show(message, "error", duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, "warning", duration);
    }

    info(message, duration = 4000) {
        return this.show(message, "info", duration);
    }

    /**
     * Affiche une notification de chargement
     */
    loading(message = "Chargement...") {
        return this.show(message, "loading", 0);
    }

    /**
     * Ferme toutes les notifications
     */
    clearAll() {
        const toasts = this.container.querySelectorAll(".toast");
        toasts.forEach((toast) => {
            toast.classList.remove("toast-show");
            setTimeout(() => toast.remove(), 300);
        });
    }
}

// Instance singleton
export const notificationManager = new NotificationManager();

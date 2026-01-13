/**
 * Module de traduction réutilisable
 * Principe SOLID : Single Responsibility Principle
 * Une seule responsabilité : gérer les traductions
 */
class TranslationModule {
    constructor(langFilePath, options = {}) {
        this.langFilePath = langFilePath;
        this.currentLang = localStorage.getItem("lang") || "fr";
        this.btnSelector = options.btnSelector || "#btn-langue";
        this.menuBtnSelector = options.menuBtnSelector || "#menu-langue";
        this.customUpdateCallback = options.customUpdateCallback || null;
    }

    /**
     * Initialiser le module
     */
    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.applyLanguage(this.currentLang);
            this.updateLanguageButton();
        });
    }

    /**
     * Changer la langue
     */
    changeLanguage() {
        this.currentLang = this.currentLang === "fr" ? "en" : "fr";
        localStorage.setItem("lang", this.currentLang);
        this.updateLanguageButton();
        this.applyLanguage(this.currentLang);
    }

    /**
     * Appliquer une langue
     */
    async applyLanguage(lang) {
        try {
            const response = await fetch(`../assets/lang/${this.langFilePath}.${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const translations = await response.json();

            // Traduire les éléments avec data-i18n
            this.translateElements(translations);

            // Traduire les placeholders
            this.translatePlaceholders(translations);

            // Traduire le titre de la page
            this.translateTitle(translations);

            // Définir la langue du document
            document.documentElement.lang = lang;

            // Callback personnalisé si défini
            if (this.customUpdateCallback) {
                this.customUpdateCallback(translations, lang);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des traductions:", error);
        }
    }

    /**
     * Traduire les éléments avec data-i18n
     */
    translateElements(translations) {
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            if (translations[key]) {
                // Gérer les cas spéciaux
                if (el.tagName.toLowerCase() === "input" && el.type === "submit") {
                    el.value = translations[key];
                } else if (el.id === "parkingCount" || el.id === "parkingList") {
                    // Ne pas traduire le contenu dynamique
                    return;
                } else {
                    el.textContent = translations[key];
                }
            }
        });
    }

    /**
     * Traduire les placeholders
     */
    translatePlaceholders(translations) {
        document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
            const key = el.getAttribute("data-i18n-placeholder");
            if (translations[key]) {
                el.placeholder = translations[key];
            }
        });
    }

    /**
     * Traduire le titre de la page
     */
    translateTitle(translations) {
        const titleEl = document.querySelector("title[data-i18n]");
        if (titleEl) {
            const key = titleEl.getAttribute("data-i18n");
            if (translations[key]) {
                document.title = translations[key];
            }
        }
    }

    /**
     * Mettre à jour le bouton de langue
     */
    updateLanguageButton() {
        const btn = document.querySelector(this.btnSelector);
        const menuBtn = document.querySelector(this.menuBtnSelector);

        if (btn) {
            btn.innerHTML = this.currentLang === "fr" ? "EN" : "FR";
        }

        if (menuBtn) {
            menuBtn.innerHTML = this.currentLang === "fr" ? "English" : "Français";
        }
    }

    /**
     * Obtenir la langue actuelle
     */
    getCurrentLanguage() {
        return this.currentLang;
    }
}

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TranslationModule;
}

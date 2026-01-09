let langueActuelle = localStorage.getItem("lang") || "fr";

function changerLangue() {
    langueActuelle = langueActuelle === "fr" ? "en" : "fr";
    localStorage.setItem("lang", langueActuelle);
    mettreAJourBoutonLangue();
    appliquerLangue(langueActuelle);
}

async function appliquerLangue(lang) {
    try {
        const response = await fetch(`../lang/reservation.${lang}.json`);
        const traductions = await response.json();

        // Traduire les éléments avec data-i18n
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            if (traductions[key]) {
                // Ne pas traduire les options du parkingSelect (générées dynamiquement)
                if (
                    el.tagName === "OPTION" &&
                    el.parentElement.id === "parkingSelect"
                ) {
                    return;
                }

                if (
                    el.tagName === "OPTION" || el.tagName === "BUTTON" ||
                    el.tagName === "LABEL"
                ) {
                    // Pour les options et boutons, garder les icônes
                    const icon = el.textContent.match(/^[^\w\s]+/);
                    if (icon) {
                        el.textContent = icon[0] + " " +
                            traductions[key].replace(/^[^\w\s]+\s*/, "");
                    } else {
                        el.textContent = traductions[key];
                    }
                } else {
                    el.textContent = traductions[key];
                }
            }
        });

        // Traduire les placeholders
        document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
            const key = el.getAttribute("data-i18n-placeholder");
            if (traductions[key]) {
                el.placeholder = traductions[key];
            }
        });

        // Mettre à jour le titre de la page
        const titleEl = document.querySelector("title[data-i18n]");
        if (titleEl) {
            const key = titleEl.getAttribute("data-i18n");
            if (traductions[key]) {
                document.title = traductions[key];
            }
        }

        document.documentElement.lang = lang;
        localStorage.setItem("lang", lang);
    } catch (e) {
        console.error("Erreur langue :", e);
    }
}

function mettreAJourBoutonLangue() {
    const btn = document.getElementById("btn-langue");
    if (!btn) return;

    if (langueActuelle === "fr") {
        btn.innerHTML = "🇬🇧 English";
    } else {
        btn.innerHTML = "🇫🇷 Français";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    appliquerLangue(langueActuelle);
    mettreAJourBoutonLangue();
});

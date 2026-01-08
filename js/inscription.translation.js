document.addEventListener("DOMContentLoaded", () => {

    async function loadLang(lang) {
        try {
            const res = await fetch(`../lang/inscription.${lang}.json`);
            const data = await res.json();

            // Texte & value
            document.querySelectorAll("[data-i18n]").forEach(el => {
                const key = el.getAttribute("data-i18n");

                if (!data[key]) return;

                if (el.tagName.toLowerCase() === "input" && el.type === "submit") {
                    el.value = data[key];
                } else {
                    el.textContent = data[key];
                }
            });

            // Placeholders
            document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
                const key = el.getAttribute("data-i18n-placeholder");
                if (data[key]) {
                    el.placeholder = data[key];
                }
            });

        } catch (err) {
            console.error("Erreur chargement langue :", err);
        }
    }

    const langSelector = document.getElementById("lang-selector");

    // Sécurité si l'élément n'existe pas
    if (!langSelector) return;

    // Changement de langue
    langSelector.addEventListener("change", () => {
        loadLang(langSelector.value);
    });

    // Chargement initial
    loadLang(langSelector.value);
});
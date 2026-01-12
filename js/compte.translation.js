let langueActuelle = localStorage.getItem("lang") || "fr";

function changerLangue() {
    langueActuelle = langueActuelle === "fr" ? "en" : "fr";
    appliquerLangue(langueActuelle);
}

async function appliquerLangue(lang) {
    try {
        const response = await fetch(`../lang/compte.${lang}.json`);
        const traductions = await response.json();

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (traductions[key]) {
                if (el.tagName.toLowerCase() === "input" && el.type === "submit") {
                    el.value = traductions[key];
                } else {
                    el.textContent = traductions[key];
                }
            }
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const key = el.getAttribute("data-i18n-placeholder");
            if (traductions[key]) {
                el.placeholder = traductions[key];
            }
        });

        localStorage.setItem("lang", lang);
        mettreAJourBoutonLangue();

    } catch (err) {
        console.error("Erreur chargement langue:", err);
    }
}

function mettreAJourBoutonLangue() {
    const btn = document.getElementById("btn-langue");
    if (!btn) return;

    if (langueActuelle === "fr") {
        btn.innerHTML = "EN";
    } else {
        btn.innerHTML = "FR";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    appliquerLangue(langueActuelle);
});
let langueActuelle = localStorage.getItem("lang") || "fr";


function changerLangue() {
  langueActuelle = langueActuelle === "fr" ? "en" : "fr";
  localStorage.setItem("lang", langueActuelle);
  mettreAJourBoutonLangue();
  appliquerLangue(langueActuelle);
  const titleEl=document.querySelectorAll("title[data-i18n]");
  if(titleEl){

    const key=titleEl.getAttribute("data-i18n");
    if(traductions[key]){
        document.title=traductions[key];
    }
  }
}


async function appliquerLangue(lang) {
  try {
    const response = await fetch(`../assets/lang/accueil.${lang}.json`);
    const traductions = await response.json();

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (traductions[key]) {
        el.textContent = traductions[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (traductions[key]) {
        el.placeholder = traductions[key];
      }
    });

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
    btn.textContent = "Français vers anglais";
  } else {
    btn.textContent = "English to french";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  appliquerLangue(langueActuelle);
});

let langueActuelle = localStorage.getItem("lang") || "fr";

function changerLangue() {
    langueActuelle = langueActuelle === "fr" ? "en" : "fr";
    localStorage.setItem("lang", langueActuelle);
    mettreAJourBoutonLangue();
    appliquerLangue(langueActuelle);
}


async function appliquerLangue(lang) {
  try {
    const response = await fetch(`lang/index.${lang}.json`);
    const traductions = await response.json();


    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (traductions[key]) {
        el.textContent = traductions[key];
      }
    });

 
    document.querySelectorAll("option[data-i18n]").forEach(option => {
      const key = option.getAttribute("data-i18n");
      if (traductions[key]) {
        option.text = traductions[key];
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
  } catch (e) {
    console.error("Erreur langue :", e);
  }
}



function mettreAJourBoutonLangue() {
    const btn = document.getElementById("btn-langue");
    const menuBtn = document.getElementById("menu-langue");
    
    if (btn) {
        btn.innerHTML = langueActuelle === "fr" ? "EN" : "FR";
    }
    
    if (menuBtn) {
        menuBtn.innerHTML = langueActuelle === "fr" ? "English" : "Français";
  }
}

document.addEventListener("DOMContentLoaded", () => {
    appliquerLangue(langueActuelle);
    mettreAJourBoutonLangue();
});

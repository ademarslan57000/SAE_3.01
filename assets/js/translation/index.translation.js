window.traduirePopup = function(key) {
  return (window.traductionsGlobales && window.traductionsGlobales[key]) ? 
          window.traductionsGlobales[key] : key;
};

let langueActuelle = localStorage.getItem("lang") || "fr";
window.traductionsGlobales = {};

async function changerLangue() {
  langueActuelle = langueActuelle === "fr" ? "en" : "fr";
  localStorage.setItem("lang", langueActuelle);
  await appliquerLangue(langueActuelle);

  
  if (window.userLocationService) {
    window.userLocationService.updatePopup();
  }
}





async function appliquerLangue(lang) {
  try {
    const response = await fetch(`../assets/lang/index.${lang}.json`);
    const traductions = await response.json();

    window.traductionsGlobales = traductions;

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (traductions[key]) el.textContent = traductions[key];
    });

    document.querySelectorAll("option[data-i18n]").forEach(option => {
      const key = option.getAttribute("data-i18n");
      if (traductions[key]) option.text = traductions[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (traductions[key]) el.placeholder = traductions[key];
    });

    localStorage.setItem("lang", lang);
    mettreAJourBoutonLangue();

   
    if (window.parkingRenderer && window.allParkings) {
      window.parkingRenderer.renderParkings(window.allParkings, true);
    }

  } catch (e) {
    console.error("Erreur langue :", e);
  }
}

function mettreAJourBoutonLangue() {
    const btn = document.getElementById("btn-langue");
    const menuBtn = document.getElementById("menu-langue");

    if (btn) btn.innerHTML = langueActuelle === "fr" ? "EN" : "FR";
    if (menuBtn) menuBtn.innerHTML = langueActuelle === "fr" ? "🇬🇧 English" : "🇲🇫 Français";
}

document.addEventListener("DOMContentLoaded", () => {
    appliquerLangue(langueActuelle);
    mettreAJourBoutonLangue();
});




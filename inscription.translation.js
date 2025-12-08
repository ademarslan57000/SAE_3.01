async function loadLang(lang) {
    try {
        const res = await fetch(`lang/inscription.${lang}.json`);
        const data = await res.json();


        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            
            if (data[key]) {

                
                if (el.tagName.toLowerCase() === "input" && el.type === "submit") {
                    el.value = data[key];
                } 
                
                
                else {
                    el.textContent = data[key];
                }
            }
        });

       
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

//menu déroulant
document.getElementById("lang-selector").addEventListener("change", function() {
    loadLang(this.value);
});

//charger la langue par défaut au chargement de la page
loadLang(document.getElementById("lang-selector").value);

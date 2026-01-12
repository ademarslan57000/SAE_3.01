// --- Variables globales ---
let allParkings = [];
let selectedParking = null;

// --- Éléments du DOM ---
const parkingSearch = document.getElementById("parkingSearch");
const parkingSelect = document.getElementById("parkingSelect");
const vehicleType = document.getElementById("vehicleType");
const vehicleImmat = document.getElementById("vehicleImmat");
const borneElectriqueGroup = document.getElementById("borneElectriqueGroup");
const borneElectrique = document.getElementById("borneElectrique");
const borneInfo = document.getElementById("borneInfo");
const startInput = document.getElementById("startTime");
const endInput = document.getElementById("endTime");
const durationDisplay = document.getElementById("durationDisplay");
const rateDisplay = document.getElementById("rateDisplay");
const totalDisplay = document.getElementById("totalDisplay");
const submitBtn = document.getElementById("submitBtn");
const cityBadge = document.getElementById("cityBadge");
const dateError = document.getElementById("dateError");
const notifEnabled = document.getElementById("notifEnabled");
const notifOptions = document.getElementById("notifOptions");

// --- 1. CHARGEMENT DES PARKINGS ---
async function loadParkings() {
    try {
        const response = await fetch("../map/backend/GetParkingWithRealTime.php");
        allParkings = await response.json();

        allParkings.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        parkingSelect.innerHTML = '<option value="" disabled selected>Choisir un parking...</option>';
        
        allParkings.forEach((parking, index) => {
            const parkingName = parking.name || parking.nom;
            const parkingId = parking.id || parking.id_parking;
            const flag = String(parkingId).startsWith("LONDON_") ? "🇬🇧" : "🇫🇷";
            
            let prix = (parking.gratuit == 1) ? "GRATUIT" : (parking.tarif_1h ? `${parking.tarif_1h}€/h` : "Payant");

            const option = document.createElement("option");
            option.value = index; 
            option.textContent = `${flag} ${parkingName} - ${prix}`;
            parkingSelect.appendChild(option);
        });
    } catch (e) {
        console.error("Erreur chargement parkings:", e);
        parkingSelect.innerHTML = '<option value="">Erreur de chargement</option>';
    }
}

// --- 2. MISE À JOUR INFOS PARKING ---
function updateParkingInfo() {
    const selectedIndex = parkingSelect.value;
    if (!selectedIndex) return;

    selectedParking = allParkings[selectedIndex];
    cityBadge.textContent = selectedParking.name || selectedParking.nom;

    checkAvailability();
    calculatePrice();
}

// --- 3. VÉRIFICATION DISPONIBILITÉ ---
function checkAvailability() {
    if (!selectedParking) return;

    // Nettoyage ancien message
    const oldMessage = document.getElementById("availabilityMessage");
    if (oldMessage) oldMessage.remove();

    const type = vehicleType.value;
    let message = "";
    let available = true;

    if (type === "electrique") {
        borneElectriqueGroup.style.display = "block";
        if (!selectedParking.nb_voitures_electriques || selectedParking.nb_voitures_electriques == 0) {
            borneInfo.textContent = "⚠️ Aucune borne disponible";
            borneElectrique.disabled = true;
            borneElectrique.checked = false;
        } else {
            borneInfo.textContent = `✅ Bornes disponibles`;
            borneElectrique.disabled = false;
        }
    } else {
        borneElectriqueGroup.style.display = "none";
    }

    // Messages de places libres
    if (type === "velo" && (!selectedParking.nb_velo || selectedParking.nb_velo == 0)) {
        message = "⚠️ Pas d'emplacements vélo";
        available = false;
    } else if (selectedParking.place_libre !== undefined && selectedParking.place_libre == 0) {
        message = "⚠️ Parking complet";
        available = false;
    } else {
        message = "✅ Places disponibles";
    }

    const msg = document.createElement("div");
    msg.id = "availabilityMessage";
    msg.style.cssText = `padding:12px; margin:10px 0; border-radius:8px; text-align:center; font-weight:600; background:${available ? "#e8f5e9" : "#ffebee"}; color:${available ? "#2e7d32" : "#c62828"};`;
    msg.textContent = message;
    vehicleType.parentElement.after(msg);
}

// --- 4. CALCUL DU PRIX ---
function calculatePrice() {
    if (!selectedParking) return;
    const startVal = startInput.value;
    const endVal = endInput.value;
    const immat = vehicleImmat.value.trim();

    if (!startVal || !endVal){
        submitBtn.disabled = true;
        return;
    }

    const start = new Date(startVal);
    const end = new Date(endVal);

    if (end <= start) {
        dateError.style.display = "block";
        submitBtn.disabled = true;
        totalDisplay.innerText = "---";
        durationDisplay.innerText = "0h 00m";
        return;
    } 
    
    dateError.style.display = "none";

    // Durée
    const diffHrs = (end-start) / (1000 * 60 * 60);
    const hours = Math.floor(diffHrs);
    const minutes = Math.round((diffHrs - hours) * 60);
    durationDisplay.innerText = `${hours}h ${minutes}m`;

    // Prix (Approximation pour affichage)
    let total = 0;
    if (selectedParking.gratuit != 1 && selectedParking.tarif_1h) {
        total = diffHrs * parseFloat(selectedParking.tarif_1h);
    }
    totalDisplay.innerText = selectedParking.gratuit == 1 ? "GRATUIT" : `${total.toFixed(2)} €`;
    submitBtn.disabled = (immat === "");
}

// --- 5. GESTION DES NOTIFICATIONS (ACTIVER / DESACTIVER LA ZONE) ---

function toggleNotifZone() {
    const isEnabled = notifEnabled.checked;
    
    if (isEnabled) {
        // Affiche la zone
        notifOptions.style.display = "block";
    } else {
        // Cache complètement la zone
        notifOptions.style.display = "none";
        
        // Optionnel : décocher les sous-options quand on ferme
        const inputs = notifOptions.querySelectorAll("input");
        inputs.forEach(input => input.checked = false);
    }
}

// Écouteur de changement
notifEnabled.addEventListener("change", toggleNotifZone);

// Initialisation au chargement
toggleNotifZone();



// --- 6. ÉVÉNEMENTS ---
parkingSearch.addEventListener("input", () => {
    const term = parkingSearch.value.toLowerCase();
    Array.from(parkingSelect.options).forEach(opt => {
        if (opt.value === "") return;
        opt.style.display = opt.textContent.toLowerCase().includes(term) ? "" : "none";
    });
});

parkingSelect.addEventListener("change", updateParkingInfo);
vehicleType.addEventListener("change", ()=>{
    checkAvailability();
    calculatePrice();
});
vehicleImmat.addEventListener("input", calculatePrice); // Recalcule l'état du bouton
startInput.addEventListener("change", calculatePrice);
endInput.addEventListener("change", calculatePrice);

// --- 6. ENVOI DE LA RÉSERVATION (CONNEXION PHP) ---
submitBtn.addEventListener("click", async () => {
    if (!selectedParking) return;

    const data = {
        parkingId: selectedParking.id || selectedParking.id_parking,
        vehicleTypeRaw: vehicleType.value,
        immatriculation: vehicleImmat.value.toUpperCase().trim(),
        dateDebut: startInput.value,
        dateFin: endInput.value
    };

    // UI Chargement
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Traitement en cours...";

    try {
        // APPEL AU FICHIER PHP QUE TU VIENS DE CRÉER
        const response = await fetch('../auth/reservation.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            alert("✅ " + result.message);
            window.location.href = "../index.html"; // Redirection accueil
        } else {
            alert("❌ Erreur : " + result.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }

    } catch (error) {
        console.error('Erreur technique:', error);
        alert("Erreur de communication avec le serveur.");
        submitBtn.disabled = false;
        submitBtn.textContent=originalText;
    }
});

// Initialisation
loadParkings();
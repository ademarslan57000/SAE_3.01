// --- Variables globales ---
let allParkings = [];
let selectedParking = null;

// --- Constantes ---
const PARKING_TYPES = {
    PR: "park-and-ride",
    FREE: "free",
    PAID: "paid",
};

const PR_KEYWORDS = ["p+r", "p&r", "rochambeau", "foire expo", "woippy"];

// --- Fonction pour détecter les parkings P+R ---
function isParkAndRide(parking) {
    const name = (parking.name || parking.nom || "").toLowerCase();
    return PR_KEYWORDS.some((keyword) => name.includes(keyword));
}

// --- Éléments du DOM ---
const parkingSearch = document.getElementById("parkingSearch");
const parkingSelect = document.getElementById("parkingSelect");
const vehicleType = document.getElementById("vehicleType");
const vehicleImmat = document.getElementById("vehicleImmat");
const immatGroup = document.getElementById("immatGroup");
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
/**
 * Charge la liste des parkings depuis l'API
 * @returns {Promise<void>}
 */
async function loadParkings() {
    try {
        const response = await fetch(
            "../api/GetParkingWithRealTime.php",
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allParkings = await response.json();

        allParkings.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        parkingSelect.innerHTML =
            '<option value="" disabled selected>Choisir un parking...</option>';

        allParkings.forEach((parking, index) => {
            const parkingName = parking.name || parking.nom;
            const parkingId = parking.id || parking.id_parking;
            const flag = String(parkingId).startsWith("LONDON_") ? "🇬🇧" : "🇫🇷";

            let prix;
            if (isParkAndRide(parking)) {
                prix = "P+R - Gratuit avec Métis";
            } else if (parking.gratuit == 1) {
                prix = "GRATUIT";
            } else if (parking.tarif_1h) {
                prix = `${parking.tarif_1h}€/h`;
            } else {
                prix = "Payant";
            }

            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${flag} ${parkingName} - ${prix}`;
            parkingSelect.appendChild(option);
        });
    } catch (e) {
        console.error("Erreur chargement parkings:", e);
        parkingSelect.innerHTML =
            '<option value="">Erreur de chargement</option>';
    }
}

// --- 2. MISE À JOUR INFOS PARKING ---
/**
 * Met à jour l'affichage des informations du parking sélectionné
 * Principe: Single Responsibility - gère uniquement l'affichage des infos
 */
function updateParkingInfo() {
    const selectedIndex = parkingSelect.value;
    if (!selectedIndex || selectedIndex === "") return;

    selectedParking = allParkings[selectedIndex];
    cityBadge.textContent = selectedParking.name || selectedParking.nom;

    // Affichage du tarif horaire avec info spéciale P+R
    if (isParkAndRide(selectedParking)) {
        rateDisplay.innerHTML =
            '<span style="color: #e67e22; font-weight: 600;">P+R - Gratuit avec ticket Métis</span><br><small style="color: #666;">Sans ticket : tarif standard applicable</small>';
    } else if (selectedParking.gratuit == 1) {
        rateDisplay.textContent = "Gratuit";
        rateDisplay.style.color = "#28a745";
    } else if (selectedParking.tarif_1h) {
        rateDisplay.textContent = `${selectedParking.tarif_1h} €/h`;
        rateDisplay.style.color = "";
    } else {
        rateDisplay.textContent = "Non renseigné";
        rateDisplay.style.color = "#666";
    }

    checkAvailability();
    calculatePrice();
}

// --- 3. VÉRIFICATION DISPONIBILITÉ ---
/**
 * Vérifie la disponibilité des places selon le type de véhicule
 * Principe: Single Responsibility - gère uniquement la vérification de disponibilité
 */
function checkAvailability() {
    if (!selectedParking) return;

    // Nettoyage ancien message
    const oldMessage = document.getElementById("availabilityMessage");
    if (oldMessage) oldMessage.remove();

    const type = vehicleType.value;
    let message = "";
    let available = true;

    // Masquer l'immatriculation pour les vélos
    if (type === "velo") {
        immatGroup.style.display = "none";
        vehicleImmat.value = "VELO";
    } else {
        immatGroup.style.display = "block";
        if (vehicleImmat.value === "VELO") {
            vehicleImmat.value = "";
        }
    }

    if (type === "electrique") {
        borneElectriqueGroup.style.display = "block";
        if (
            !selectedParking.nb_voitures_electriques ||
            selectedParking.nb_voitures_electriques == 0
        ) {
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
    if (
        type === "velo" &&
        (!selectedParking.nb_velo || selectedParking.nb_velo == 0)
    ) {
        message = "⚠️ Pas d'emplacements vélo";
        available = false;
    } else if (
        selectedParking.place_libre !== undefined &&
        selectedParking.place_libre == 0
    ) {
        message = "⚠️ Parking complet";
        available = false;
    } else {
        message = "✅ Places disponibles";
    }

    const msg = document.createElement("div");
    msg.id = "availabilityMessage";
    msg.style.cssText =
        `padding:12px; margin:10px 0; border-radius:8px; text-align:center; font-weight:600; background:${
            available ? "#e8f5e9" : "#ffebee"
        }; color:${available ? "#2e7d32" : "#c62828"};`;
    msg.textContent = message;
    vehicleType.parentElement.after(msg);
}

// --- 4. CALCUL DU PRIX ---
/**
 * Calcule le prix estimé de la réservation
 * Principe: Single Responsibility - gère uniquement le calcul du prix
 */
function calculatePrice() {
    if (!selectedParking) return;
    const startVal = startInput.value;
    const endVal = endInput.value;
    const immat = vehicleImmat.value.trim();

    if (!startVal || !endVal) {
        submitBtn.disabled = true;
        return;
    }

    const start = new Date(startVal);
    const end = new Date(endVal);
    const now = new Date();

    // Vérifier que la date de début n'est pas dans le passé
    if (start < now) {
        dateError.textContent =
            "⚠️ La date d'arrivée ne peut pas être dans le passé.";
        dateError.style.display = "block";
        submitBtn.disabled = true;
        totalDisplay.innerText = "---";
        durationDisplay.innerText = "0h 00m";
        return;
    }

    if (end <= start) {
        dateError.textContent =
            "⚠️ La date de fin doit être après la date de début.";
        dateError.style.display = "block";
        submitBtn.disabled = true;
        totalDisplay.innerText = "---";
        durationDisplay.innerText = "0h 00m";
        return;
    }

    dateError.style.display = "none";

    // Durée
    const diffHrs = (end - start) / (1000 * 60 * 60);
    const hours = Math.floor(diffHrs);
    const minutes = Math.round((diffHrs - hours) * 60);
    durationDisplay.innerText = `${hours}h ${minutes}m`;

    // Prix (Approximation pour affichage)
    let total = 0;
    let displayText;

    if (isParkAndRide(selectedParking)) {
        displayText = "Gratuit avec ticket Métis";
        totalDisplay.style.color = "#e67e22";
    } else if (selectedParking.gratuit == 1) {
        displayText = "GRATUIT";
        totalDisplay.style.color = "#28a745";
    } else if (selectedParking.tarif_1h) {
        total = diffHrs * parseFloat(selectedParking.tarif_1h);
        displayText = `${total.toFixed(2)} €`;
        totalDisplay.style.color = "";
    } else {
        displayText = "Voir sur place";
        totalDisplay.style.color = "";
    }

    totalDisplay.innerText = displayText;
    // Ne pas bloquer pour les vélos (pas d'immatriculation requise)
    const isVelo = vehicleType.value === "velo";
    submitBtn.disabled = !isVelo && (immat === "");
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
        inputs.forEach((input) => input.checked = false);
    }
}

// Écouteur de changement
notifEnabled.addEventListener("change", toggleNotifZone);

// Initialisation au chargement
toggleNotifZone();

// --- 6. ÉVÉNEMENTS ---
parkingSearch.addEventListener("input", () => {
    const term = parkingSearch.value.toLowerCase();
    Array.from(parkingSelect.options).forEach((opt) => {
        if (opt.value === "") return;
        opt.style.display = opt.textContent.toLowerCase().includes(term)
            ? ""
            : "none";
    });
});

parkingSelect.addEventListener("change", updateParkingInfo);
vehicleType.addEventListener("change", () => {
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
        dateFin: endInput.value,
    };

    // UI Chargement
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Traitement en cours...";

    try {
        // APPEL AU FICHIER PHP QUE TU VIENS DE CRÉER
        const response = await fetch("../api/reservation.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
            alert("✅ " + result.message);
            window.location.href = "index.html"; // Redirection accueil
        } else {
            alert("❌ Erreur : " + result.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error("Erreur technique:", error);
        alert("Erreur de communication avec le serveur.");
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Initialisation
loadParkings();

// Définir la date/heure minimale pour empêcher les réservations dans le passé
function setMinDateTime() {
    const now = new Date();
    // Formater la date au format YYYY-MM-DDThh:mm requis par datetime-local
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    startInput.setAttribute("min", minDateTime);
    endInput.setAttribute("min", minDateTime);
}

setMinDateTime();
// Actualiser toutes les minutes pour garder la date minimale à jour
setInterval(setMinDateTime, 60000);

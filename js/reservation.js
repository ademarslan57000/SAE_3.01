// --- Variables globales ---
let allParkings = [];
let selectedParking = null;


// --- Traductions internes ---
const i18n = {
    choose_parking: { fr: "Choisir un parking...", en: "Choose a parking..." },
    free: { fr: "GRATUIT", en: "FREE" },
    paid: { fr: "Payant", en: "Paid" },
    rate_unavailable: { fr: "Tarif non disponible", en: "Rate not available" },

    bike_available: { fr: "places vélo disponibles", en: "bike spots available" },
    bike_none: { fr: "Ce parking n'a pas d'emplacements vélo", en: "This parking has no bike spots" },

    pmr_available: { fr: "places PMR disponibles", en: "accessible spots available" },
    pmr_none: { fr: "Ce parking n'a pas de places PMR", en: "This parking has no accessible spots" },

    charging_available: { fr: "bornes disponibles", en: "charging stations available" },
    charging_none: { fr: "Aucune borne électrique disponible", en: "No charging station available" },

    parking_full: { fr: "Parking complet actuellement", en: "Parking currently full" },
    parking_available: { fr: "places disponibles", en: "available spaces" },

    reservation_ok: { fr: "Réservation confirmée !", en: "Reservation confirmed !" },

    parking: { fr: "Parking", en: "Parking" },
    vehicle: { fr: "Véhicule", en: "Vehicle" },
    plate: { fr: "Immat", en: "License plate" },
    amount: { fr: "Montant", en: "Amount" },

    hour: { fr: "h", en: "h" },
    minute: { fr: "m", en: "m" },

    loading_error: { fr: "Erreur de chargement", en: "Loading error" }
};

// Fonction traduction
function t(key) {
    return i18n[key]?.[langueActuelle] || key;
}

// --- DOM Elements ---
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

        parkingSelect.innerHTML = `<option value="" disabled selected>${t("choose_parking")}</option>`;

        allParkings.forEach((parking, index) => {
            const parkingName = parking.name || parking.nom;
            const parkingId = parking.id || parking.id_parking;
            const flag = String(parkingId).startsWith("LONDON_") ? "🇬🇧" : "🇫🇷";

            let prix = (parking.gratuit == 1)
                ? t("free")
                : (parking.tarif_1h ? `${parking.tarif_1h}€/h` : t("paid"));

            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${flag} ${parkingName} - ${prix}`;
            parkingSelect.appendChild(option);
        });
    } catch (e) {
        console.error("Erreur chargement parkings:", e);
        parkingSelect.innerHTML = `<option value="">${t("loading_error")}</option>`;
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

    const oldMessage = document.getElementById("availabilityMessage");
    if (oldMessage) oldMessage.remove();

    const type = vehicleType.value;
    let message = "";
    let available = true;

    if (type === "electrique" || type === "hybride") {
        borneElectriqueGroup.style.display = "block";
        if (!selectedParking.nb_voitures_electriques || selectedParking.nb_voitures_electriques == 0) {
            borneInfo.textContent = `⚠️ ${t("charging_none")}`;
            borneElectrique.disabled = true;
            borneElectrique.checked = false;
        } else {
            borneInfo.textContent = `✅ ${selectedParking.nb_voitures_electriques} ${t("charging_available")}`;
            borneElectrique.disabled = false;
        }
    } else {
        borneElectriqueGroup.style.display = "none";
    }

    if (type === "velo") {
        if (!selectedParking.nb_velo || selectedParking.nb_velo == 0) {
            message = `⚠️ ${t("bike_none")}`;
            available = false;
        } else {
            message = `✅ ${selectedParking.nb_velo} ${t("bike_available")}`;
        }
    } else if (type === "pmr") {
        if (!selectedParking.nb_pmr || selectedParking.nb_pmr == 0) {
            message = `⚠️ ${t("pmr_none")}`;
            available = false;
        } else {
            message = `✅ ${selectedParking.nb_pmr} ${t("pmr_available")}`;
        }
    } else if (selectedParking.place_libre !== undefined) {
        if (selectedParking.place_libre == 0) {
            message = `⚠️ ${t("parking_full")}`;
            available = false;
        } else {
            message = `✅ ${selectedParking.place_libre} ${t("parking_available")}`;
        }
    }

    if (message) {
        const msg = document.createElement("div");
        msg.id = "availabilityMessage";
        msg.style.cssText = `padding:12px; margin:10px 0; border-radius:8px; text-align:center; font-weight:600; background:${available ? "#e8f5e9" : "#ffebee"}; color:${available ? "#2e7d32" : "#c62828"};`;
        msg.textContent = message;
        vehicleType.parentElement.after(msg);
    }
}

// --- 4. CALCUL DU PRIX ---
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

    if (end <= start) {
        dateError.style.display = "block";
        submitBtn.disabled = true;
        totalDisplay.innerText = "---";
        durationDisplay.innerText = `0${t("hour")} 00${t("minute")}`;
        return;
    }

    dateError.style.display = "none";

    const diffHrs = (end - start) / (1000 * 60 * 60);
    const hours = Math.floor(diffHrs);
    const minutes = Math.round((diffHrs - hours) * 60);
    durationDisplay.innerText = `${hours}${t("hour")} ${minutes.toString().padStart(2,'0')}${t("minute")}`;

    let total = 0;
    if (selectedParking.gratuit != 1 && selectedParking.tarif_1h) {
        total = diffHrs * parseFloat(selectedParking.tarif_1h);
    }
    totalDisplay.innerText = selectedParking.gratuit == 1 ? t("free") : `${total.toFixed(2)} €`;
    submitBtn.disabled = (immat === "");
}

// --- 5. GESTION NOTIFICATIONS ---
function toggleNotifZone() {
    const isEnabled = notifEnabled.checked;
    notifOptions.style.display = isEnabled ? "block" : "none";
    if (!isEnabled) {
        const inputs = notifOptions.querySelectorAll("input");
        inputs.forEach(input => input.checked = false);
    }
}
notifEnabled.addEventListener("change", toggleNotifZone);
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
vehicleType.addEventListener("change", ()=>{ checkAvailability(); calculatePrice(); });
vehicleImmat.addEventListener("input", calculatePrice);
startInput.addEventListener("change", calculatePrice);
endInput.addEventListener("change", calculatePrice);

// --- 7. ENVOI RÉSERVATION ---
submitBtn.addEventListener("click", async () => {
    if (!selectedParking) return;

    const data = {
        parkingId: selectedParking.id || selectedParking.id_parking,
        vehicleTypeRaw: vehicleType.value,
        immatriculation: vehicleImmat.value.toUpperCase().trim(),
        dateDebut: startInput.value,
        dateFin: endInput.value
    };

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Traitement en cours...";

    try {
        const response = await fetch('../auth/reservation.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            alert(`✅ ${t("reservation_ok")}`);
            window.location.href = "../index.html";
        } else {
            alert("❌ " + result.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Erreur technique:', error);
        alert("Erreur de communication avec le serveur.");
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// --- Initialisation ---
loadParkings();



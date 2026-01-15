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
    loading_error: { fr: "Erreur de chargement", en: "Loading error" },

    hour: { fr: "h", en: "h" },
    minute: { fr: "m", en: "m" }
};

function t(key) {
    return i18n[key]?.[langueActuelle] || key;
}

// --- Imports ---
import { ApiHelper } from "./utils/ApiHelper.js";
import { notificationManager } from "./utils/NotificationManager.js";
import { networkManager } from "./utils/NetworkManager.js";

// --- Constantes ---
const PR_KEYWORDS = ["p+r", "p&r", "rochambeau", "foire expo", "woippy"];

function isParkAndRide(parking) {
    const name = (parking.name || parking.nom || "").toLowerCase();
    return PR_KEYWORDS.some(k => name.includes(k));
}

// --- DOM ---
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

// --- 1. Chargement des parkings ---
async function loadParkings() {
    if (!networkManager.isOnline) {
        notificationManager.error(t("loading_error"));
        return;
    }

    parkingSelect.innerHTML = `<option disabled selected>⏳</option>`;

    try {
        const response = await ApiHelper.fetchWithTimeout(
            "../api/GetParkingWithRealTime.php",
            {},
            10000
        );

        allParkings = await response.json();
        allParkings.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        parkingSelect.innerHTML =
            `<option value="" disabled selected>${t("choose_parking")}</option>`;

        allParkings.forEach((p, i) => {
            const flag = String(p.id || "").startsWith("LONDON_") ? "🇬🇧" : "🇫🇷";
            let priceLabel = t("paid");

            if (isParkAndRide(p)) priceLabel = "P+R";
            else if (p.gratuit == 1) priceLabel = t("free");
            else if (p.tarif_1h) priceLabel = `${p.tarif_1h}€/h`;

            const opt = document.createElement("option");
            opt.value = i;
            opt.textContent = `${flag} ${p.name || p.nom} - ${priceLabel}`;
            parkingSelect.appendChild(opt);
        });
    } catch (e) {
        console.error(e);
        notificationManager.error(t("loading_error"));
    }
}

// --- 2. Infos parking ---
function updateParkingInfo() {
    if (!parkingSelect.value) return;

    selectedParking = allParkings[parkingSelect.value];
    cityBadge.textContent = selectedParking.name || selectedParking.nom;

    if (isParkAndRide(selectedParking)) {
        rateDisplay.textContent = "P+R - Gratuit avec ticket transport";
    } else if (selectedParking.gratuit == 1) {
        rateDisplay.textContent = t("free");
    } else if (selectedParking.tarif_1h) {
        rateDisplay.textContent = `${selectedParking.tarif_1h} €/h`;
    } else {
        rateDisplay.textContent = t("rate_unavailable");
    }

    checkAvailability();
    calculatePrice();
}

// --- 3. Disponibilité (CORRIGÉ) ---
function checkAvailability() {
    if (!selectedParking) return;

    document.getElementById("availabilityMessage")?.remove();

    const type = vehicleType.value;
    let messages = [];
    let ok = true;

    // Vélo
    if (type === "velo") {
        immatGroup.style.display = "none";
        vehicleImmat.value = "VELO";

        if (!selectedParking.nb_velo || selectedParking.nb_velo == 0) {
            messages.push("⚠️ " + t("bike_none"));
            ok = false;
        } else {
            messages.push(`✅ ${selectedParking.nb_velo} ${t("bike_available")}`);
        }
    } else {
        immatGroup.style.display = "block";
        if (vehicleImmat.value === "VELO") vehicleImmat.value = "";
    }

    // Électrique
    if (type === "electrique") {
        borneElectriqueGroup.style.display = "block";

        if (!selectedParking.nb_voitures_electriques || selectedParking.nb_voitures_electriques == 0) {
            messages.push("⚠️ " + t("charging_none"));
            borneInfo.textContent = t("charging_none");
            borneElectrique.disabled = true;
            ok = false;
        } else {
            messages.push(`✅ ${selectedParking.nb_voitures_electriques} ${t("charging_available")}`);
            borneInfo.textContent = `${selectedParking.nb_voitures_electriques} ${t("charging_available")}`;
            borneElectrique.disabled = false;
        }
    } else {
        borneElectriqueGroup.style.display = "none";
    }

    // PMR
    if (type === "pmr") {
        if (!selectedParking.nb_pmr || selectedParking.nb_pmr == 0) {
            messages.push("⚠️ " + t("pmr_none"));
            ok = false;
        } else {
            messages.push(`✅ ${selectedParking.nb_pmr} ${t("pmr_available")}`);
        }
    }

    // Places globales
    if (selectedParking.place_libre === 0) {
        messages.push("⚠️ " + t("parking_full"));
        ok = false;
    } else if (selectedParking.place_libre >0) {
        messages.push(`✅ ${selectedParking.place_libre} ${t("parking_available")}`);
    }

    if (messages.length > 0) {
        const div = document.createElement("div");
        div.id = "availabilityMessage";
        div.innerHTML = messages.join("<br>");
        div.style.cssText = `
            margin:10px 0;
            padding:12px;
            border-radius:8px;
            background:${ok ? "#e8f5e9" : "#ffebee"};
            color:${ok ? "#2e7d32" : "#c62828"};
            font-weight:600;
            text-align:center;
        `;
        vehicleType.parentElement.after(div);
    }
}

// --- 4. Calcul prix ---
function calculatePrice() {
    if (!selectedParking) return;

    if (!startInput.value || !endInput.value) {
        submitBtn.disabled = true;
        return;
    }

    const start = new Date(startInput.value);
    const end = new Date(endInput.value);

    if (end <= start) {
        dateError.style.display = "block";
        submitBtn.disabled = true;
        return;
    }

    dateError.style.display = "none";

    const diff = (end - start) / 36e5;
    const h = Math.floor(diff);
    const m = Math.round((diff - h) * 60);

    durationDisplay.textContent =
        `${h}${t("hour")} ${String(m).padStart(2, "0")}${t("minute")}`;

    if (isParkAndRide(selectedParking) || selectedParking.gratuit == 1) {
        totalDisplay.textContent = t("free");
    } else if (selectedParking.tarif_1h) {
        totalDisplay.textContent = `${(diff * selectedParking.tarif_1h).toFixed(2)} €`;
    } else {
        totalDisplay.textContent = "---";
    }

    submitBtn.disabled =
        vehicleType.value !== "velo" && vehicleImmat.value.trim() === "";
}

// --- 5. Notifications ---
function toggleNotifZone() {
    notifOptions.style.display = notifEnabled.checked ? "block" : "none";
}
notifEnabled.addEventListener("change", toggleNotifZone);
toggleNotifZone();

// --- 6. Events ---
parkingSearch.addEventListener("input", () => {
    const term = parkingSearch.value.toLowerCase();
    Array.from(parkingSelect.options).forEach(opt => {
        if (!opt.value) return;
        opt.style.display = opt.textContent.toLowerCase().includes(term) ? "" : "none";
    });
});

parkingSelect.addEventListener("change", updateParkingInfo);
vehicleType.addEventListener("change", () => {
    checkAvailability();
    calculatePrice();
});
vehicleImmat.addEventListener("input", calculatePrice);
startInput.addEventListener("change", calculatePrice);
endInput.addEventListener("change", calculatePrice);

// --- 7. Envoi réservation ---
submitBtn.addEventListener("click", async () => {
    if (!selectedParking) return;
    if (!networkManager.checkBeforeAction("submit")) return;

    const data = {
        parkingId: selectedParking.id || selectedParking.id_parking,
        vehicleTypeRaw: vehicleType.value,
        immatriculation: vehicleImmat.value.trim().toUpperCase(),
        dateDebut: startInput.value,
        dateFin: endInput.value
    };

    const loading = notificationManager.loading("⏳");
    submitBtn.disabled = true;

    try {
        const res = await ApiHelper.fetchWithTimeout(
            "../api/reservation.php",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            },
            15000
        );

        const json = await res.json();
        loading.remove();

        if (json.success) {
            notificationManager.success(t("reservation_ok"));
            setTimeout(() => window.location.href = "index.html", 1200);
        } else {
            notificationManager.error(json.message);
            submitBtn.disabled = false;
        }
    } catch (e) {
        loading.remove();
        notificationManager.error("Erreur serveur");
        submitBtn.disabled = false;
    }
});

// --- Init ---
loadParkings();




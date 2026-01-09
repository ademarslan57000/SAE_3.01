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
const notif30min = document.getElementById("notif30min");
const notif1h = document.getElementById("notif1h");
const notif2h = document.getElementById("notif2h");

// --- Chargement des parkings ---
async function loadParkings() {
    try {
        const response = await fetch(
            "../map/backend/GetParkingWithRealTime.php",
        );
        allParkings = await response.json();

        // Trier par nom
        allParkings.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        // Remplir le select
        parkingSelect.innerHTML =
            '<option value="" disabled selected>Choisir un parking...</option>';
        allParkings.forEach((parking, index) => {
            const isLondon = String(parking.id).startsWith("LONDON_");
            const flag = isLondon ? "🇬🇧" : "🇫🇷";
            const prix = parking.gratuit
                ? "GRATUIT"
                : (parking.tarif_1h
                    ? `${parking.tarif_1h}€/h`
                    : (parking.tarif_24h
                        ? `${parking.tarif_24h}€/24h`
                        : "Payant"));

            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${flag} ${parking.name} - ${prix}`;
            parkingSelect.appendChild(option);
        });
    } catch (e) {
        console.error("Erreur chargement parkings:", e);
        parkingSelect.innerHTML =
            '<option value="">Erreur de chargement</option>';
    }
}

// --- Mise à jour des infos parking ---
function updateParkingInfo() {
    const selectedIndex = parkingSelect.value;
    if (!selectedIndex) return;

    selectedParking = allParkings[selectedIndex];
    const isLondon = String(selectedParking.id).startsWith("LONDON_");

    // Mise à jour du badge
    cityBadge.textContent = selectedParking.name;
    cityBadge.style.backgroundColor = isLondon ? "#fadbd8" : "#d6eaf8";
    cityBadge.style.color = isLondon ? "#c0392b" : "#2980b9";

    // Supprimer l'ancienne notification avant de vérifier la nouvelle disponibilité
    const oldMessage = document.getElementById("availabilityMessage");
    if (oldMessage) {
        oldMessage.remove();
    }

    // Vérifier les équipements
    checkAvailability();
    calculatePrice();
}

// --- Vérifier la disponibilité selon le type de véhicule ---
function checkAvailability() {
    if (!selectedParking) return;

    // Supprimer l'ancienne notification à chaque changement
    const oldMessage = document.getElementById("availabilityMessage");
    if (oldMessage) {
        oldMessage.remove();
    }

    const type = vehicleType.value;
    const parking = selectedParking;

    let message = "";
    let available = true;

    switch (type) {
        case "velo":
            if (!parking.nb_velo || parking.nb_velo === 0) {
                message = "⚠️ Ce parking n'a pas d'emplacements vélo";
                available = false;
            } else {
                message = `✅ ${parking.nb_velo} places vélo disponibles`;
            }
            break;

        case "pmr":
            if (!parking.nb_pmr || parking.nb_pmr === 0) {
                message = "⚠️ Ce parking n'a pas de places PMR";
                available = false;
            } else {
                message = `✅ ${parking.nb_pmr} places PMR disponibles`;
            }
            break;

        case "electrique":
            borneElectriqueGroup.style.display = "block";
            if (
                !parking.nb_voitures_electriques ||
                parking.nb_voitures_electriques === 0
            ) {
                borneInfo.textContent = "⚠️ Aucune borne électrique disponible";
                borneElectrique.disabled = true;
                borneElectrique.checked = false;
            } else {
                borneInfo.textContent =
                    `✅ ${parking.nb_voitures_electriques} bornes disponibles`;
                borneElectrique.disabled = false;
            }
            break;

        default: // voiture normale
            borneElectriqueGroup.style.display = "none";
            if (parking.place_libre !== null && parking.place_libre === 0) {
                message = "⚠️ Parking complet actuellement";
            } else if (parking.place_libre !== null) {
                message = `✅ ${parking.place_libre} places disponibles`;
            }
    }

    if (message) {
        const msg = document.createElement("div");
        msg.id = "availabilityMessage";
        msg.style.cssText = `padding:10px; margin:10px 0; border-radius:8px; 
                            background:${available ? "#d4edda" : "#f8d7da"}; 
                            color:${available ? "#155724" : "#721c24"}; 
                            font-size:14px;`;
        msg.textContent = message;
        vehicleType.parentElement.after(msg);
    }
}

// --- Logique de Calcul ---
function calculatePrice() {
    if (!selectedParking) return;

    const startVal = startInput.value;
    const endVal = endInput.value;

    if (!startVal || !endVal) return;

    const start = new Date(startVal);
    const end = new Date(endVal);

    // Validation des dates
    if (end <= start) {
        dateError.style.display = "block";
        submitBtn.disabled = true;
        totalDisplay.innerText = "---";
        return;
    } else {
        dateError.style.display = "none";
        submitBtn.disabled = vehicleImmat.value.trim() === "";
    }

    // Calcul de la différence en heures
    const diffMs = end - start;
    const diffHrs = diffMs / (1000 * 60 * 60);

    // Formatage durée
    const hours = Math.floor(diffHrs);
    const minutes = Math.round((diffHrs - hours) * 60);
    durationDisplay.innerText = `${hours}h ${minutes}m`;

    // Calcul financier
    const parking = selectedParking;
    const isLondon = String(parking.id).startsWith("LONDON_");
    const currency = isLondon ? "£" : "€";

    let rate = 0;
    let total = 0;

    if (parking.gratuit) {
        rateDisplay.innerText = "GRATUIT";
        totalDisplay.innerText = `0.00 ${currency}`;
        return;
    }

    // Utiliser le tarif approprié
    if (parking.tarif_1h) {
        rate = parseFloat(parking.tarif_1h);
        total = diffHrs * rate;
        rateDisplay.innerText = `${rate.toFixed(2)} ${currency} / h`;
    } else if (parking.tarif_24h) {
        rate = parseFloat(parking.tarif_24h);
        const days = diffHrs / 24;
        total = days * rate;
        rateDisplay.innerText = `${rate.toFixed(2)} ${currency} / 24h`;
    } else {
        rateDisplay.innerText = "Tarif non disponible";
        totalDisplay.innerText = "---";
        return;
    }

    // Affichage
    totalDisplay.innerText = `${total.toFixed(2)} ${currency}`;
}

// --- Fonction de filtrage des parkings ---
function filterParkings() {
    const searchTerm = parkingSearch.value.toLowerCase();
    const options = parkingSelect.options;

    for (let i = 1; i < options.length; i++) { // Commence à 1 pour sauter l'option "Choisir..."
        const optionText = options[i].textContent.toLowerCase();
        if (optionText.includes(searchTerm)) {
            options[i].style.display = "";
        } else {
            options[i].style.display = "none";
        }
    }
}

// --- Gestion des notifications ---
notifEnabled.addEventListener("change", () => {
    if (notifEnabled.checked) {
        notifOptions.classList.remove("disabled");
    } else {
        notifOptions.classList.add("disabled");
    }
});

// --- Écouteurs d'événements ---
parkingSearch.addEventListener("input", filterParkings);
parkingSelect.addEventListener("change", updateParkingInfo);
vehicleType.addEventListener("change", checkAvailability);
vehicleImmat.addEventListener("input", () => {
    submitBtn.disabled = vehicleImmat.value.trim() === "" ||
        !startInput.value || !endInput.value;
});
startInput.addEventListener("change", calculatePrice);
endInput.addEventListener("change", calculatePrice);

// --- Simulation d'envoi ---
submitBtn.addEventListener("click", () => {
    if (!selectedParking) return;

    const data = {
        parking: selectedParking.name,
        parkingId: selectedParking.id,
        vehicleType: vehicleType.options[vehicleType.selectedIndex].text,
        immatriculation: vehicleImmat.value,
        borneElectrique: borneElectrique.checked,
        dateDebut: startInput.value,
        dateFin: endInput.value,
        montant: totalDisplay.innerText,
        notifications: {
            enabled: notifEnabled.checked,
            rappel30min: notif30min.checked,
            rappel1h: notif1h.checked,
            rappel2h: notif2h.checked,
        },
    };

    console.log("Données réservation:", data);

    // Construire le message des notifications
    let notifMessage = "";
    if (data.notifications.enabled) {
        const rappels = [];
        if (data.notifications.rappel30min) rappels.push("30 min");
        if (data.notifications.rappel1h) rappels.push("1h");
        if (data.notifications.rappel2h) rappels.push("2h");
        if (rappels.length > 0) {
            notifMessage = `🔔 Rappels activés: ${
                rappels.join(", ")
            } avant la fin\n`;
        }
    }

    alert(
        `✅ Réservation confirmée !\n\n` +
            `📍 Parking: ${data.parking}\n` +
            `🚗 Véhicule: ${data.vehicleType}\n` +
            `📝 Immat: ${data.immatriculation}\n` +
            `${data.borneElectrique ? "⚡ Avec borne électrique\n" : ""}` +
            `💰 Montant: ${data.montant}\n` +
            notifMessage +
            `\n(Données prêtes pour envoi au serveur)`,
    );
});

// --- Initialisation ---
loadParkings();

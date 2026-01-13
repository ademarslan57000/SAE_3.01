let allParkings = [];
let filteredParkings = [];

// 1. Dictionnaire de traduction (V1) enrichi avec les termes P+R
const translations = {
    fr: {
        gratuit: "Gratuit",
        payant: "Payant",
        parkAndRide: "P+R",
        prTitre: "🅿️ PARKING RELAIS (P+R)",
        prDetail: "✓ GRATUIT avec un ticket Métis",
        prNote: "Sans ticket : tarif normal applicable",
        placesDisponibles: "Places disponibles",
        capaciteTotale: "Capacité totale",
        placesPMR: "♿ Places PMR",
        placesVelo: "🚲 Places vélo",
        bornesElectriques: "⚡ Bornes électriques",
        tarifs: "💰 Tarifs",
        tarif1h: "1 heure",
        tarif2h: "2 heures",
        tarifJour: "Tarif Jour (dès)",
        voirCarte: "🗺️ Voir sur la carte",
        itineraire: "🧭 Itinéraire",
        plusInfos: "ℹ️ Plus d'infos",
        parkingGratuit: "PARKING GRATUIT ✓",
        aucune: "Aucun parking trouvé",
        erreurChargement: "Erreur lors du chargement des parkings",
        parkingAffiche: "parking affiché",
        derniereMAJ: "Dernière mise à jour :"
    },
    en: {
        gratuit: "Free",
        payant: "Paid",
        parkAndRide: "P&R",
        prTitre: "🅿️ PARK AND RIDE (P+R)",
        prDetail: "✓ FREE with a Métis ticket",
        prNote: "Without ticket: standard rates apply",
        placesDisponibles: "Available spots",
        capaciteTotale: "Total capacity",
        placesPMR: "♿ Accessible spots",
        placesVelo: "🚲 Bike spots",
        bornesElectriques: "⚡ Electric charging",
        tarifs: "💰 Prices",
        tarif1h: "1 hour",
        tarif2h: "2 hours",
        tarifJour: "Day Rate (from)",
        voirCarte: "🗺️ View on map",
        itineraire: "🧭 Directions",
        plusInfos: "ℹ️ More info",
        parkingGratuit: "FREE PARKING ✓",
        aucune: "No parking found",
        erreurChargement: "Error loading parkings",
        parkingAffiche: "parking displayed",
        derniereMAJ: "Last update:"
    }
};

const lang = sessionStorage.getItem("parkingLang") || "fr";

document.addEventListener("DOMContentLoaded", () => {
    loadParkings();
    setupFilters();
});

// 2. Logique de détection P+R (V2)
function isParkAndRide(parking) {
    const name = (parking.name || "").toLowerCase();
    return name.includes("p+r") || name.includes("p&r") ||
           name.includes("rochambeau") || name.includes("foire expo") ||
           name.includes("woippy");
}

async function loadParkings() {
    try {
        const response = await fetch("../api/GetParkingWithRealTime.php");
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        allParkings = data;
        filteredParkings = data;
        renderParkings(data);
        updateCount(data.length);
    } catch (error) {
        console.error("Erreur chargement:", error);
        document.getElementById("parkingList").innerHTML =
            `<div class="no-results">${translations[lang].erreurChargement}</div>`;
    }
}

function renderParkings(parkings) {
    const container = document.getElementById("parkingList");
    if (parkings.length === 0) {
        container.innerHTML = `<div class="no-results">${translations[lang].aucune}</div>`;
        return;
    }
    container.innerHTML = parkings.map((p) => createParkingCard(p)).join("");
}

function createParkingCard(p) {
    const gratuit = p.gratuit || p.gratuit === 1;
    const isPR = isParkAndRide(p);
    const disponibilite = getDisponibilite(p);
    const tarifs = getTarifs(p);
    const encodedId = encodeURIComponent(p.id);
    const isLondon = String(p.id).startsWith("LONDON_");

    // Badges Dynamiques
    const badgeClass = isPR ? "badge-park-ride" : (gratuit ? "badge-gratuit" : "badge-payant");
    const badgeText = isPR ? translations[lang].parkAndRide : (gratuit ? translations[lang].gratuit : translations[lang].payant);
    
    const zoneBadge = isLondon
        ? '<span class="zone-badge zone-uk">GB Londres</span>'
        : '<span class="zone-badge zone-france">🇫🇷 Metz</span>';

    const hasVelo = p.nb_velo > 0 || (isLondon && p.info && p.info.toLowerCase().includes('cycle'));
    const hasElec = p.nb_voitures_electriques > 0 || (isLondon && p.info && p.info.toLowerCase().includes('charging'));

    return `
    <div class="parking-card ${isPR ? "park-and-ride" : (gratuit ? "gratuit" : "payant")} ${isLondon ? "parking-london" : "parking-france"}">
      <div class="parking-header">
        <div>
          <div class="parking-name">${p.name || "Parking"}</div>
          ${p.adresse ? `<div class="parking-address">📍 ${p.adresse}</div>` : ""}
          ${zoneBadge}
        </div>
        <span class="parking-badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="parking-info">
        <div class="info-row">
          <span class="info-label">${translations[lang].capaciteTotale}</span>
          <span class="info-value">${p.nb_places || "N/A"} places</span>
        </div>
        ${disponibilite}
        ${p.nb_pmr ? `<div class="info-row"><span class="info-label">${translations[lang].placesPMR}</span><span class="info-value">${p.nb_pmr}</span></div>` : ""}
        ${hasVelo ? `<div class="info-row"><span class="info-label">${translations[lang].placesVelo}</span><span class="info-value">${p.nb_velo || "OK"}</span></div>` : ""}
        ${hasElec ? `<div class="info-row"><span class="info-label">${translations[lang].bornesElectriques}</span><span class="info-value">${p.nb_voitures_electriques || "OK"}</span></div>` : ""}
      </div>
      ${tarifs}
      ${p.info ? `<div class="parking-update">ℹ️ ${p.info}</div>` : ""}
      ${p.place_update ? `<div class="parking-update">${translations[lang].derniereMAJ} ${new Date(p.place_update).toLocaleString(lang === 'fr' ? "fr-FR" : "en-GB")}</div>` : ""}
      <div class="parking-actions">
        <button class="btn btn-primary" onclick="voirSurCarte('${encodedId}')">${translations[lang].voirCarte}</button>
        <button class="btn btn-itineraire" onclick="lancerItineraire(${p.lat}, ${p.lon}, '${p.name.replace(/'/g, "\\'")}')">${translations[lang].itineraire}</button>
        
        ${p.url && !isLondon ? `<a href="${p.url}" target="_blank" class="btn btn-secondary">${translations[lang].plusInfos}</a>` : ""}
      </div>
    </div>`;
}

function getTarifs(p) {
    // 1. Cas P+R (Prioritaire)
    if (isParkAndRide(p)) {
        return `
        <div class="tarifs-section">
            <div class="tarifs-title">${translations[lang].tarifs}</div>
            <div style="text-align: center; padding: 10px;">
                <div style="color: #e67e22; font-weight: 700; font-size: 16px; margin-bottom: 8px;">${translations[lang].prTitre}</div>
                <div style="color: #28a745; font-weight: 600; margin-bottom: 5px;">${translations[lang].prDetail}</div>
                <div style="color: #666; font-size: 12px;">${translations[lang].prNote}</div>
            </div>
        </div>`;
    }

    // 2. Cas Gratuit
    if (p.gratuit || p.gratuit === 1) {
        return `
        <div class="tarifs-section">
            <div class="tarifs-title">${translations[lang].tarifs}</div>
            <div style="text-align: center; color: #28a745; font-weight: 700; padding: 10px;">${translations[lang].parkingGratuit}</div>
        </div>`;
    }

    // 3. Cas Payant avec calcul de devise (V2)
    const isLondon = String(p.id).startsWith("LONDON_");
    const currency = isLondon ? "£" : "€";
    let displayTarif = p.tarif_24h;

    if (!displayTarif && isLondon && p.info) {
        const match = p.info.match(/(?:\|\s*|^)(\d+(?:\.\d{1,2})?)/);
        if (match) displayTarif = match[1];
    }

    if (p.tarif_1h || p.tarif_2h || displayTarif) {
        return `
            <div class="tarifs-section">
                <div class="tarifs-title">${translations[lang].tarifs}</div>
                ${p.tarif_1h ? `<div class="tarif-item"><span>${translations[lang].tarif1h}</span><span>${p.tarif_1h} ${currency}</span></div>` : ""}
                ${p.tarif_2h ? `<div class="tarif-item"><span>${translations[lang].tarif2h}</span><span>${p.tarif_2h} ${currency}</span></div>` : ""}
                ${displayTarif ? `<div class="tarif-item"><span>${translations[lang].tarifJour}</span><span>${displayTarif} ${currency}</span></div>` : ""}
            </div>`;
    }
    return "";
}

function getDisponibilite(p) {
    if (p.place_libre !== null && p.place_libre !== undefined) {
        const total = p.place_total_rt || p.nb_places;
        const disponible = Number(p.place_libre);
        const classe = disponible > 10 ? "disponible" : (disponible > 0 ? "" : "complet");
        return `
      <div class="info-row">
        <span class="info-label">${translations[lang].placesDisponibles}</span>
        <span class="info-value ${classe}">${disponible} / ${total}</span>
      </div>`;
    }
    return "";
}

function setupFilters() {
    const ids = ["searchParking", "filterZone", "filterType", "sortBy"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener(id === "searchParking" ? "input" : "change", applyFilters);
    });
}

function applyFilters() {
    const searchTerm = document.getElementById("searchParking").value.toLowerCase();
    const filterZone = document.getElementById("filterZone").value;
    const filterType = document.getElementById("filterType").value;
    const sortBy = document.getElementById("sortBy").value;

    filteredParkings = allParkings.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm) || (p.adresse && p.adresse.toLowerCase().includes(searchTerm));
        const isLondon = String(p.id).startsWith("LONDON_");
        let matchZone = (filterZone === "all") || (filterZone === "france" && !isLondon) || (filterZone === "uk" && isLondon);
        
        let matchType = true;
        switch (filterType) {
            case "gratuit": matchType = p.gratuit === 1 || p.gratuit === true; break;
            case "payant": matchType = p.gratuit === 0 || p.gratuit === false; break;
            case "pmr": matchType = p.nb_pmr > 0; break;
            case "electrique": matchType = p.nb_voitures_electriques > 0; break;
            case "velo": matchType = p.nb_velo > 0; break;
        }
        return matchSearch && matchZone && matchType;
    });

    filteredParkings.sort((a, b) => {
        const valA = a[sortBy] || 0;
        const valB = b[sortBy] || 0;
        return sortBy === "name" ? (a.name||"").localeCompare(b.name||"") : valB - valA;
    });

    renderParkings(filteredParkings);
    updateCount(filteredParkings.length);
}

function updateCount(count) {
    const plural = count > 1 ? "s" : "";
    document.getElementById("parkingCount").textContent = 
        `${count} ${translations[lang].parkingAffiche}${plural}`;
}

// 3. Fonctions de Redirection (V2 avec logs de debug)
function voirSurCarte(parkingId) {
    console.log("=== REDIRECTION CARTE ID:", parkingId);
    sessionStorage.setItem("targetParkingId", String(parkingId));
    localStorage.setItem("targetParkingId", String(parkingId));
    window.location.href = `index.html?parking=${encodeURIComponent(parkingId)}`;
}

function lancerItineraire(lat, lon, nom) {
    console.log("🧭 ITINERAIRE VERS:", nom);
    sessionStorage.setItem("itineraireDestination", JSON.stringify({ lat, lon, nom }));
    window.location.href = `index.html?itineraire=1`;
}
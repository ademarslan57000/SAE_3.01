let allParkings = [];
let filteredParkings = [];

// Charger les parkings au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    loadParkings();
    setupFilters();
});

async function loadParkings() {
    try {
        const response = await fetch(
            "../map/backend/GetParkingWithRealTime.php",
        );
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        allParkings = data;
        filteredParkings = data;
        renderParkings(data);
        updateCount(data.length);
    } catch (error) {
        console.error("Erreur chargement parkings:", error);
        document.getElementById("parkingList").innerHTML =
            '<div class="no-results">Erreur lors du chargement des parkings</div>';
    }
}

function renderParkings(parkings) {
    const container = document.getElementById("parkingList");

    if (parkings.length === 0) {
        container.innerHTML =
            '<div class="no-results">Aucun parking trouvé</div>';
        return;
    }

    container.innerHTML = parkings.map((p) => createParkingCard(p)).join("");
}

function createParkingCard(p) {
    const gratuit = p.gratuit || p.gratuit === 1;
    const disponibilite = getDisponibilite(p);
    const tarifs = getTarifs(p); // Utilise la fonction unique ci-dessous
    const encodedId = encodeURIComponent(p.id);

    const isLondon = String(p.id).startsWith("LONDON_");
    const zoneBadge = isLondon
        ? '<span class="zone-badge zone-uk">GB Londres</span>'
        : '<span class="zone-badge zone-france">🇫🇷 Metz</span>';

    const hasVelo = p.nb_velo > 0 || (isLondon && p.info && p.info.toLowerCase().includes('cycle'));
    const hasElec = p.nb_voitures_electriques > 0 || (isLondon && p.info && p.info.toLowerCase().includes('charging'));

    return `
    <div class="parking-card ${gratuit ? "gratuit" : "payant"} ${isLondon ? "parking-london" : "parking-france"}">
      <div class="parking-header">
        <div>
          <div class="parking-name">${p.name || "Parking"}</div>
          ${p.adresse ? `<div class="parking-address">📍 ${p.adresse}</div>` : ""}
          ${zoneBadge}
        </div>
        <span class="parking-badge ${gratuit ? "badge-gratuit" : "badge-payant"}">${gratuit ? "Gratuit" : "Payant"}</span>
      </div>
      
      <div class="parking-info">
        <div class="info-row">
          <span class="info-label">Capacité totale</span>
          <span class="info-value">${p.nb_places || "N/A"} places</span>
        </div>
        ${disponibilite}
        ${p.nb_pmr ? `<div class="info-row"><span class="info-label">♿ Places PMR</span><span class="info-value">${p.nb_pmr}</span></div>` : ""}
        ${hasVelo ? `<div class="info-row"><span class="info-label">🚲 Places vélo</span><span class="info-value">${p.nb_velo || "Disponible"}</span></div>` : ""}
        ${hasElec ? `<div class="info-row"><span class="info-label">⚡ Bornes électriques</span><span class="info-value">${p.nb_voitures_electriques || "Oui"}</span></div>` : ""}
      </div>
      
      ${tarifs}
      
      ${p.info ? `<div class="parking-update">ℹ️ ${p.info}</div>` : ""}
      ${p.place_update ? `<div class="parking-update">Dernière mise à jour : ${new Date(p.place_update).toLocaleString("fr-FR")}</div>` : ""}
      
      <div class="parking-actions">
        <button class="btn btn-primary" onclick="voirSurCarte('${encodedId}')">🗺️ Voir sur la carte</button>
        <button class="btn btn-itineraire" onclick="lancerItineraire(${p.lat}, ${p.lon}, '${p.name.replace(/'/g, "\\'")}')">🧭 Itinéraire</button>
        ${p.url ? `<a href="${p.url}" target="_blank" class="btn btn-secondary">ℹ️ Plus d'infos</a>` : ""}
      </div>
    </div>`;
}

// FONCTION UNIQUE POUR LES TARIFS
function getTarifs(p) {
    if (p.gratuit || p.gratuit === 1) {
        return `<div class="tarifs-section"><div class="tarifs-title">💰 Tarifs</div><div style="text-align: center; color: #28a745; font-weight: 700; padding: 10px;">PARKING GRATUIT ✓</div></div>`;
    }

    const isLondon = String(p.id).startsWith("LONDON_");
    const currency = isLondon ? "£" : "€";
    
    let displayTarif = p.tarif_24h;

    // Secours Londres : si tarif_24h est vide, on cherche un prix dans la chaîne "info"
    if (!displayTarif && isLondon && p.info) {
        const match = p.info.match(/(?:\|\s*|^)(\d+(?:\.\d{1,2})?)/);
        if (match) displayTarif = match[1];
    }

    if (p.tarif_1h || p.tarif_2h || displayTarif) {
        return `
            <div class="tarifs-section">
                <div class="tarifs-title">💰 Tarifs</div>
                ${p.tarif_1h ? `<div class="tarif-item"><span>1 heure</span><span>${p.tarif_1h} ${currency}</span></div>` : ""}
                ${p.tarif_2h ? `<div class="tarif-item"><span>2 heures</span><span>${p.tarif_2h} ${currency}</span></div>` : ""}
                ${displayTarif ? `<div class="tarif-item"><span>Tarif Jour (dès)</span><span>${displayTarif} ${currency}</span></div>` : ""}
            </div>`;
    }
    return "";
}

function getDisponibilite(p) {
    if (p.place_libre !== null && p.place_libre !== undefined) {
        const total = p.place_total_rt || p.nb_places;
        const disponible = Number(p.place_libre);
        const classe = disponible > 10
            ? "disponible"
            : (disponible > 0 ? "" : "complet");

        return `
      <div class="info-row">
        <span class="info-label">Places disponibles</span>
        <span class="info-value ${classe}">${disponible} / ${total}</span>
      </div>
    `;
    }
    return "";
}

function getTarifs(p) {
    if (p.gratuit || p.gratuit === 1) {
        return `
      <div class="tarifs-section">
        <div class="tarifs-title">💰 Tarifs</div>
        <div style="text-align: center; color: #28a745; font-weight: 700; padding: 10px;">
          PARKING GRATUIT ✓
        </div>
      </div>
    `;
    }

    const currency = String(p.id).startsWith("LONDON_") ? "£" : "€";

    if (p.tarif_1h || p.tarif_2h || p.tarif_24h) {
        return `
      <div class="tarifs-section">
        <div class="tarifs-title">💰 Tarifs</div>
        ${
            p.tarif_1h
                ? `<div class="tarif-item"><span>1 heure</span><span>${p.tarif_1h} ${currency}</span></div>`
                : ""
        }
        ${
            p.tarif_2h
                ? `<div class="tarif-item"><span>2 heures</span><span>${p.tarif_2h} ${currency}</span></div>`
                : ""
        }
        ${
            p.tarif_24h
                ? `<div class="tarif-item"><span>24 heures</span><span>${p.tarif_24h} ${currency}</span></div>`
                : ""
        }
      </div>
    `;
    }

    return "";
}

function setupFilters() {
    const searchInput = document.getElementById("searchParking");
    const filterZone = document.getElementById("filterZone");
    const filterType = document.getElementById("filterType");
    const sortBy = document.getElementById("sortBy");

    searchInput.addEventListener("input", applyFilters);
    filterZone.addEventListener("change", applyFilters);
    filterType.addEventListener("change", applyFilters);
    sortBy.addEventListener("change", applyFilters);
}

function applyFilters() {
    const searchTerm = document.getElementById("searchParking").value
        .toLowerCase();
    const filterZone = document.getElementById("filterZone").value;
    const filterType = document.getElementById("filterType").value;
    const sortBy = document.getElementById("sortBy").value;

    // Filtrage
    filteredParkings = allParkings.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm) ||
            (p.adresse && p.adresse.toLowerCase().includes(searchTerm));

        // Filtre géographique
        let matchZone = true;
        const isLondon = String(p.id).startsWith("LONDON_");

        if (filterZone === "france") {
            matchZone = !isLondon;
        } else if (filterZone === "uk") {
            matchZone = isLondon;
        }

        // Filtre par type
        let matchType = true;
        switch (filterType) {
            case "all":
                matchType = true;
                break;
            case "gratuit":
                matchType = p.gratuit === 1 || p.gratuit === true;
                break;
            case "payant":
                matchType = p.gratuit === 0 || p.gratuit === false;
                break;
            case "pmr":
                matchType = p.nb_pmr && p.nb_pmr > 0;
                break;
            case "electrique":
                matchType = p.nb_voitures_electriques &&
                    p.nb_voitures_electriques > 0;
                break;
            case "velo":
                matchType = p.nb_velo && p.nb_velo > 0;
                break;
        }

        return matchSearch && matchZone && matchType;
    });

    // Tri
    filteredParkings.sort((a, b) => {
        switch (sortBy) {
            case "name":
                return (a.name || "").localeCompare(b.name || "");
            case "places":
                return (b.place_libre || 0) - (a.place_libre || 0);
            case "capacity":
                return (b.nb_places || 0) - (a.nb_places || 0);
            case "pmr":
                return (b.nb_pmr || 0) - (a.nb_pmr || 0);
            case "electrique":
                return (b.nb_voitures_electriques || 0) -
                    (a.nb_voitures_electriques || 0);
            case "velo":
                return (b.nb_velo || 0) - (a.nb_velo || 0);
            default:
                return 0;
        }
    });

    renderParkings(filteredParkings);
    updateCount(filteredParkings.length);
}

function updateCount(count) {
    document.getElementById("parkingCount").textContent = `${count} parking${
        count > 1 ? "s" : ""
    } affiché${count > 1 ? "s" : ""}`;
}

function voirSurCarte(parkingId) {
    console.log("=== REDIRECTION VERS CARTE ===");
    console.log("Parking ID:", parkingId);

    const parking = allParkings.find((p) => String(p.id) === String(parkingId));

    if (!parking) {
        console.error("❌ Parking introuvable");
        alert("Erreur : parking introuvable");
        return;
    }

    console.log("✅ Parking:", parking.name);

    sessionStorage.setItem("targetParkingId", String(parkingId));
    localStorage.setItem("targetParkingId", String(parkingId));

    console.log("💾 ID stocké:", parkingId);

    window.location.href = `../index.html?parking=${
        encodeURIComponent(parkingId)
    }`;
}

function lancerItineraire(lat, lon, nom) {
    console.log("🧭 Lancement itinéraire vers:", nom);

    sessionStorage.setItem(
        "itineraireDestination",
        JSON.stringify({
            lat: lat,
            lon: lon,
            nom: nom,
        }),
    );

    window.location.href = `../index.html?itineraire=1`;
}

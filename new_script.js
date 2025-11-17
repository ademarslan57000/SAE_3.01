// Initialisation carte
const map = L.map("map").setView([49.1193, 6.1757], 14);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Variables globales
let parkings = [];
let markers = [];
let markerClusterGroup = null;
let routingControl = null;

// Icônes Leaflet communes
const ICONS = {
  user: L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  destination: L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};

// -----------------------------------------------------------------------------
// Utilitaires
// -----------------------------------------------------------------------------

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation)
      return reject("Géolocalisation non supportée.");
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
      (err) => reject(err.message || "Erreur géolocalisation")
    );
  });
}

function clearRoute() {
  if (!routingControl) return;
  map.removeControl(routingControl);
  routingControl = null;
  const btn = document.getElementById("btn-annuler-itineraire");
  if (btn) btn.style.display = "none";
}

// -----------------------------------------------------------------------------
// Itinéraire sur la carte
// -----------------------------------------------------------------------------

window.afficherItineraireSurCarte = async function (lat, lon, nom) {
  try {
    const [userLat, userLon] = await getLocation();
    clearRoute();
    routingControl = L.Routing.control({
      waypoints: [L.latLng(userLat, userLon), L.latLng(lat, lon)],
      lineOptions: { styles: [{ color: "#004cbe", weight: 6 }] },
      routeWhileDragging: false,
      addWaypoints: false,
      showAlternatives: false,
      createMarker: (i, wp) =>
        L.marker(wp.latLng, {
          icon: i === 0 ? ICONS.user : ICONS.destination,
        }).bindPopup(i === 0 ? "📍 Départ" : "🎯 " + nom),
    }).addTo(map);
    document.getElementById("btn-annuler-itineraire").style.display = "block";
  } catch (e) {
    alert("Impossible d'obtenir votre position : " + e);
  }
};

window.ouvrirItineraire = async function (lat, lon) {
  try {
    const [latU, lonU] = await getLocation();
    window.open(`https://www.google.com/maps/dir/${latU},${lonU}/${lat},${lon}`, "_blank");
  } catch {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, "_blank");
  }
};

// -----------------------------------------------------------------------------
// Affichage des parkings
// -----------------------------------------------------------------------------

function afficherParkings(data) {
  if (markerClusterGroup) map.removeLayer(markerClusterGroup);
  markers.forEach((m) => map.removeLayer(m));

  markers = [];
  markerClusterGroup = L.markerClusterGroup({ maxClusterRadius: 50 });

  data.forEach((p) => {
    const marker = L.circleMarker([p.lat, p.lon], {
      radius: 8,
      color: "#004cbe",
      fillColor: p.gratuit ? "#28a745" : "#4bb6c9",
      fillOpacity: 0.9,
      weight: 2,
    });

    const nomSafe = (p.name || "Parking").replace(/'/g, "&#39;");

const popup = `
  <div style="min-width:220px; font-size:14px;">
    <b>${p.name || "Parking sans nom"}</b><br>

    ${p.adresse ? `📍 ${p.adresse}<br>` : ""}
    ${p.places ? `🚗 ${p.places} places<br>` : ""}
    ${p.pmr ? `♿ ${p.pmr} PMR<br>` : ""}
    ${p.electrique ? `🔌 ${p.electrique} bornes<br>` : ""}
    ${p.gratuit ? "💚 <b>Gratuit</b><br>" : "💰 Payant<br>"}

    ${p.tarif_1h ? `1h : ${p.tarif_1h}€<br>` : ""}
    ${p.tarif_24h ? `24h : ${p.tarif_24h}€<br>` : ""}
    ${p.url ? `<a href="${p.url}" target="_blank">Plus d'infos</a><br>` : ""}

    <br>
    <button onclick="afficherItineraireSurCarte(${p.lat},${p.lon},'${nomSafe}')">
      🗺️ Itinéraire
    </button>

    <button onclick="ouvrirItineraire(${p.lat},${p.lon})">
      📱 Maps
    </button>
  </div>
`;

    marker.bindPopup(popup);
    markerClusterGroup.addLayer(marker);
    markers.push(marker);
  });

  map.addLayer(markerClusterGroup);

  const bounds = markerClusterGroup.getBounds();
  if (bounds.isValid()) map.fitBounds(bounds.pad(0.1));
}

// -----------------------------------------------------------------------------
// Chargement CSV — VERSION FINALE
// -----------------------------------------------------------------------------

async function loadParkings() {
  try {
    const url = "https://si.eurometropolemetz.eu/fiches/opendata/agd/stationnement_eurometropolemetz.csv";
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

    const csvText = await res.text();
    const rows = csvText.split("\n").map(r => r.split(";"));
    const headers = rows[0];
    const items = rows.slice(1);

    parkings = items
      .map(cols => {
        const obj = {};
        headers.forEach((h, i) => obj[h.trim()] = cols[i]);

        return {
          name: obj.nom || "Parking",
          lat: obj.Ylat ? Number(obj.Ylat) : null,
          lon: obj.Xlong ? Number(obj.Xlong) : null,
          adresse: obj.adresse || "",
          pmr: Number(obj.pmr || 0),
          electrique: Number(obj.bornes || 0),
          gratuit: obj.gratuit === "1",
          places: obj.places ? Number(obj.places) : null,
        };
      })
      .filter(p => p.lat && p.lon); // IMPORTANT : évite l'erreur .lat undefined

    afficherParkings(parkings);

  } catch (err) {
    console.error("Erreur chargement parkings :", err);
  }
}

loadParkings();

// -----------------------------------------------------------------------------
// Recherche
// -----------------------------------------------------------------------------

function rechercheParking() {
  const q = document.getElementById("search").value.toLowerCase();
  const filtre = parkings.filter(p => p.name.toLowerCase().includes(q));
  afficherParkings(filtre);

  if (filtre.length === 1) {
    map.setView([filtre[0].lat, filtre[0].lon], 16);
  }
}

// -----------------------------------------------------------------------------
// Tri par proximité
// -----------------------------------------------------------------------------

async function trierParProximite() {
  try {
    const [latU, lonU] = await getLocation();

    const dist = (a, b, c, d) =>
      6371 * 2 * Math.asin(Math.sqrt(
        Math.sin((c - a) * Math.PI / 180 / 2) ** 2 +
        Math.cos(a * Math.PI / 180) *
        Math.cos(c * Math.PI / 180) *
        Math.sin((d - b) * Math.PI / 180 / 2) ** 2
      ));

    const sorted = [...parkings].sort(
      (a, b) => dist(latU, lonU, a.lat, a.lon) - dist(latU, lonU, b.lat, b.lon)
    );

    afficherParkings(sorted);

    map.fitBounds([
      [latU, lonU],
      [sorted[0].lat, sorted[0].lon]
    ].map(p => L.latLng(p[0], p[1])).reduce((acc, cur) => acc.extend(cur), L.latLngBounds()));
    
  } catch (e) {
    alert("Impossible d'obtenir votre position : " + e);
  }
}

// -----------------------------------------------------------------------------
// Localisation utilisateur
// -----------------------------------------------------------------------------

async function localiserUtilisateur() {
  try {
    const [lat, lon] = await getLocation();
    L.marker([lat, lon], { icon: ICONS.user })
      .addTo(map)
      .bindPopup("📍 Vous êtes ici")
      .openPopup();

    map.setView([lat, lon], 15);
  } catch (e) {
    alert("Impossible d'obtenir votre position : " + e);
  }
}

window.supprimerItineraire = clearRoute;
window.trierParProximite = trierParProximite;
window.localiserUtilisateur = localiserUtilisateur;
window.rechercheParking = rechercheParking;

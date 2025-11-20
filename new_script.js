// Initialisation carte
const map = L.map("map").setView([49.1193, 6.1757], 13);

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
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  destination: L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};

// Position de l'ultilisateur
function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject("Géolocalisation non supportée.");
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

function distanceGPS(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // distance en km
}

// Itinéraire sur la carte
let watchId = null;
let lastRoutedPosition = null;
let firstUpdate = true;

const DISTANCE_RECALCUL = 0.015; // 15 m

window.afficherItineraireTempsReel = function (lat, lon, nom) {
  if (!navigator.geolocation) {
    alert("Géolocalisation non supportée.");
    return;
  }

  clearRoute();
  firstUpdate = true;
  lastRoutedPosition = null;

  // Afficher bouton stop
  document.getElementById("btn-stop-guidage").style.display = "inline-block";


  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const userLat = pos.coords.latitude;
      const userLon = pos.coords.longitude;

      // Premier centrage
      if (firstUpdate) {
        map.setView([userLat, userLon], 16);
        firstUpdate = false;
      }

      // Distance trop faible => ne pas recalculer
      if (
        lastRoutedPosition &&
        distanceGPS(userLat, userLon, lastRoutedPosition.lat, lastRoutedPosition.lon) <
          DISTANCE_RECALCUL
      ) {
        return;
      }

      lastRoutedPosition = { lat: userLat, lon: userLon };

      // Suppression propre de l'ancien itinéraire
      if (routingControl) {
        routingControl.getPlan().setWaypoints([]);
        map.removeControl(routingControl);
      }

      routingControl = L.Routing.control({
        waypoints: [L.latLng(userLat, userLon), L.latLng(lat, lon)],
        lineOptions: { styles: [{ color: "#004cbe", weight: 6 }] },
        routeWhileDragging: false,
        addWaypoints: false,
        showAlternatives: false,
        createMarker: function (i, wp) {
          return L.marker(wp.latLng, {
            icon: i === 0 ? ICONS.user : ICONS.destination,
          }).bindPopup(i === 0 ? "📍 Position actuelle" : "🎯 " + nom);
        },
      }).addTo(map);
    },
    (err) => {
      alert("Erreur GPS : " + err.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000,
    }
  );
};

window.stopGuidage = function () {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  document.getElementById("btn-stop-guidage").style.display = "none";


  lastRoutedPosition = null;
  clearRoute();

  alert("Guidage stoppé.");
};



window.ouvrirItineraire = async function (lat, lon) {
  const destination = `${lat},${lon}`;
  try {
    const [latU, lonU] = await getLocation();
    const origin = `${latU},${lonU}`;

    const mapUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
    window.open(mapUrl, "_blank");
  } catch {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
    window.open(mapsUrl, "_blank");
  }
};

// Affichage des parkings
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

    const nomSafe = (p.name || "Parking")
      .replace(/'/g, "\\'")
      .replace(/"/g, "");

    const popup = `
  <div style="min-width:240px; font-size:14px;">
    <b>${p.name}</b><br>

    ${p.nature ? `🏷️ Nature : ${p.nature}<br>` : ""}
    ${p.statut ? `📌 Statut : ${p.statut}<br>` : ""}
    ${p.domaine ? `📁 Domaine : ${p.domaine}<br>` : ""}
    ${p.gestion ? `🏛️ Gestion : ${p.gestion}<br>` : ""}

    ${
      p.place_total != null
        ? `🚗 Places : <b>${p.place_libre ?? "?"}</b> / ${p.place_total}<br>`
        : ""
    }

    ${p.gratuit ? "💚 Gratuit<br>" : "💰 Payant<br>"}

    ${p.observ ? `📝 ${p.observ}<br>` : ""}

    <hr>
    <button onclick="afficherItineraireTempsReel(${p.lat},${p.lon},'${nomSafe}')">🗺️ Itinéraire temps réel</button>
    <button onclick="ouvrirItineraire(${p.lat},${p.lon})">📱 Maps</button>
  </div>
`;

    marker.bindPopup(popup);

    marker.on("click", function () {
      this.openPopup();
    });

    markerClusterGroup.addLayer(marker);
    markers.push(marker);
  });

  map.addLayer(markerClusterGroup);

  const bounds = markerClusterGroup.getBounds();
  if (bounds.isValid()) map.fitBounds(bounds.pad(0.1));
}

// Fonction pour calculer le centroïde d'une géométrie (Point, Polygon, MultiPolygon)
function getCentroid(geometry) {
  if (!geometry) return null;

  if (geometry.type === "Point") {
    return [geometry.coordinates[1], geometry.coordinates[0]];
  }

  const coords = [];

  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach(ring => ring.forEach(c => coords.push(c)));
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach(polygon =>
      polygon.forEach(ring => ring.forEach(c => coords.push(c)))
    );
  }

  if (coords.length === 0) return null;

  const x = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
  const y = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;

  return [y, x];
}

// Chargement des parkings
async function loadParkings() {
  try {
    const url =
      "https://maps.eurometropolemetz.eu/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public:pub_tsp_sta&srsName=EPSG:4326&outputFormat=application%2Fjson&cql_filter=id%20is%20not%20null";

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

    const json = await res.json();
    const features = json.features || [];

    // Mapping des parkings avec centroïde
    parkings = features.map((feature) => {
      const props = feature.properties;
      const centroid = getCentroid(feature.geometry);

      return {
        name: props.lib || "Parking",
        lat: centroid ? centroid[0] : 49.1193,
        lon: centroid ? centroid[1] : 6.1757,
        gratuit: props.cout !== "payant",
        nature: props.nature || "",
        statut: props.statut || "",
        domaine: props.domaine || "",
        gestion: props.gestion || "",
        observ: props.observ || "",
        place_total: props.place_total != null ? Number(props.place_total) : null,
        place_libre: props.place_libre != null ? Number(props.place_libre) : null,
      };
    });

    afficherParkings(parkings); // Affiche tous les parkings
  } catch (err) {
    console.error("Erreur chargement parkings :", err);
  }
}

loadParkings();

// Recherche
function rechercheParking() {
  const q = document.getElementById("search").value.toLowerCase();
  const filtre = parkings.filter((p) => p.name.toLowerCase().includes(q));
  afficherParkings(filtre);

  if (filtre.length === 1) {
    map.setView([filtre[0].lat, filtre[0].lon], 16);
  }
}

// Tri par proximité
async function trierParProximite() {
  try {
    const [latU, lonU] = await getLocation();

    const dist = (a, b, c, d) =>
      6371*2*Math.asin(Math.sqrt(Math.sin(((c-a)*Math.PI)/180/2)**2+Math.cos((a*Math.PI)/180)*Math.cos((c*Math.PI)/180)*Math.sin(((d-b)*Math.PI)/180/2)**2));

    const sorted = [...parkings].sort(
      (a, b) => dist(latU, lonU, a.lat, a.lon) - dist(latU, lonU, b.lat, b.lon)
    );

    const plusProche = sorted[0];

    if (!plusProche) {
      alert("Aucun parking disponible pour le moment.");
      return;
    }

    map.setView([plusProche.lat, plusProche.lon], 15);

    const marker = markers.find(
      (m) =>
        m.getLatLng().lat === plusProche.lat &&
        m.getLatLng().lng === plusProche.lon
    );

    if (marker) {
      marker.openPopup();
    }
  } catch (e) {
    alert("Impossible d'obtenir votre position : " + e);
  }
}

// Localisation utilisateur
async function localiserUtilisateur() {
  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      userMarker=L.marker([lat, lon], {icon: ICONS.user})
          .addTo(map)
          .bindPopup("📍 Vous êtes ici")
          .openPopup();
           map.setView([lat, lon], 15);

           navigator.geolocation.watchPosition(
            (position)=>{
              const lat=position.coords.latitude;
              const lon=position.coords.longitude;

              userMarker.setLatLng([lat,lon]);
            },
            (error)=>{
              console.error("Geolocalisation impossible: ", error);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 10000,
            }
           );
          },
          (error)=>{
            alert("IMpossible d'obtenir la position: "+error.message)
          },
          {enableHighAccuracy:true}
        );
      }
     

window.supprimerItineraire = clearRoute;
window.trierParProximite = trierParProximite;
window.localiserUtilisateur = localiserUtilisateur;
window.rechercheParking = rechercheParking;
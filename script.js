// carte centrée sur Metz
const map = L.map("map").setView([49.1193, 6.1757], 14);

// couche OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let parkings = [];
let markers = [];
let markerClusterGroup = null;
let routingControl = null;
let parkingSelectionne = null;

// Données des parkings
const parkingsData = [
  {
    id: "57463-P-001",
    nom: "REPUBLIQUE",
    adresse: "Boulevard Poincaré",
    nb_places: 2100,
    nb_pmr: 27,
    nb_voitures_electriques: 4,
    gratuit: false,
    tarif_1h: "1.7",
    tarif_24h: "14.8",
    type_ouvrage: "ouvrage",
    url: "https://metz.fr/lieux/lieu-276.php",
    Xlong: 6.169005632,
    Ylat: 49.1162285,
  },
  {
    id: "57463-P-002",
    nom: "THEATRE COMEDIE",
    adresse: "Place de la Comédie",
    nb_places: 602,
    nb_pmr: 3,
    nb_voitures_electriques: 2,
    gratuit: false,
    tarif_1h: "1.7",
    tarif_24h: "14.8",
    type_ouvrage: "ouvrage",
    url: "https://metz.fr/lieux/lieu-360.php",
    Xlong: 6.174090922,
    Ylat: 49.12164867,
  },
  {
    id: "57463-P-007",
    nom: "MAUD HUY",
    adresse: "Rue Paul Verlaine",
    nb_places: 378,
    nb_pmr: 8,
    nb_voitures_electriques: 0,
    gratuit: false,
    tarif_1h: "1.3",
    tarif_24h: "9",
    type_ouvrage: "ouvrage",
    url: "https://metz.fr/lieux/lieu-368.php",
    Xlong: 6.166908056,
    Ylat: 49.1086891,
  },
  {
    id: "57463-P-009",
    nom: "GARE CENTRE POMPIDOU-METZ",
    adresse: "106 Rue aux Arènes & Avenue François Mitterrand",
    nb_places: 703,
    nb_pmr: 18,
    nb_voitures_electriques: 4,
    gratuit: false,
    tarif_1h: "1.7",
    tarif_24h: "16.8",
    type_ouvrage: "ouvrage",
    url: "https://metz.fr/lieux/lieu-369.php",
    Xlong: 6.1787006,
    Ylat: 49.107786,
  },
  {
    id: "57463-P-010",
    nom: "DE GAULLE",
    adresse: "Place du Général de Gaulle",
    nb_places: 585,
    nb_pmr: 10,
    nb_voitures_electriques: 2,
    gratuit: false,
    tarif_1h: "1.7",
    tarif_24h: "16.8",
    type_ouvrage: "ouvrage",
    url: "https://metz.fr/lieux/lieu-366.php",
    Xlong: 6.176006153,
    Ylat: 49.10999913,
  },
  {
    id: "57480-P-001",
    nom: "BELVEDERE",
    adresse: "128 Rue de Pont-à-Mousson, 57950 Montigny-lès-Metz",
    nb_places: 131,
    nb_pmr: 6,
    nb_voitures_electriques: 0,
    gratuit: false,
    tarif_1h: "0.8",
    tarif_24h: "4",
    type_ouvrage: "ouvrage",
    url:
      "https://www.transdevpark.com/parkings_et_voiries/montigny_les_metz/centre_belvedere",
    Xlong: 6.154098,
    Ylat: 49.101024,
  },
  {
    id: "57480-P-002",
    nom: "SAINT JOSEPH",
    adresse: "2 Rue Général Pougin, 57950 Montigny-lès-Metz",
    nb_places: 138,
    nb_pmr: 7,
    nb_voitures_electriques: 0,
    gratuit: false,
    tarif_1h: "0.8",
    tarif_24h: "4",
    type_ouvrage: "ouvrage",
    url:
      "https://www.transdevpark.com/parkings_et_voiries/montigny_les_metz/saint_joseph",
    Xlong: 6.15489,
    Ylat: 49.099885,
  },
  {
    id: "57463-P-201",
    nom: "P+R ROCHAMBEAU",
    adresse: "Pont Jean Monnet, 57000 Metz",
    nb_places: 115,
    nb_pmr: 3,
    nb_voitures_electriques: 2,
    gratuit: false,
    tarif_1h: "",
    tarif_24h: "",
    type_ouvrage: "enclos_en_surface",
    url: "https://metz.fr/lieux/lieu-1828.php",
    Xlong: 6.171068,
    Ylat: 49.130237,
  },
  {
    id: "57463-P-202",
    nom: "P+R FOIRE EXPO",
    adresse: "Rue de la Grange aux Bois, 57070 Metz",
    nb_places: 250,
    nb_pmr: 5,
    nb_voitures_electriques: 6,
    gratuit: false,
    tarif_1h: "",
    tarif_24h: "",
    type_ouvrage: "enclos_en_surface",
    url: "https://metz.fr/lieux/lieu-4202.php",
    Xlong: 6.233557,
    Ylat: 49.091283,
  },
  {
    id: "57751-P-201",
    nom: "P+R WOIPPY",
    adresse: "Rue du Fort Gambetta, 57140 Woippy",
    nb_places: 250,
    nb_pmr: 6,
    nb_voitures_electriques: 4,
    gratuit: false,
    tarif_1h: "",
    tarif_24h: "",
    type_ouvrage: "enclos_en_surface",
    url: "https://metz.fr/lieux/lieu-4201.php",
    Xlong: 6.173992,
    Ylat: 49.150622,
  },
  {
    id: "57463-P-005",
    nom: "SAINT THIEBAULT",
    adresse: "Place St Thiébault",
    nb_places: 418,
    nb_pmr: 9,
    nb_voitures_electriques: 4,
    gratuit: false,
    tarif_1h: "1.6",
    tarif_24h: "13.6",
    type_ouvrage: "ouvrage",
    url: "https://metz.fr/lieux/lieu-365.php",
    Xlong: 6.178479105,
    Ylat: 49.11258692,
  },
  {
    id: "57463-P-004",
    nom: "CATHEDRALE",
    adresse: "Rue d'Estrées",
    nb_places: 365,
    nb_pmr: 8,
    nb_voitures_electriques: 2,
    gratuit: false,
    tarif_1h: "1.7",
    tarif_24h: "14.8",
    type_ouvrage: "ouvrage",
    url: "https://metz.fr/lieux/lieu-362.php",
    Xlong: 6.174192935,
    Ylat: 49.11992172,
  },
  {
    id: "57463-P-006",
    nom: "PAIXHANS",
    adresse: "Rue du Général Fournier",
    nb_places: 400,
    nb_pmr: 9,
    nb_voitures_electriques: 2,
    gratuit: false,
    tarif_1h: "1.6",
    tarif_24h: "10.5",
    type_ouvrage: "ouvrage",
    url: "https://metz.fr/lieux/lieu-370.php",
    Xlong: 6.184540987,
    Ylat: 49.12110175,
  },
  {
    id: "57463-P-008",
    nom: "MAZELLE",
    adresse: "Place Mazelle",
    nb_places: 270,
    nb_pmr: 6,
    nb_voitures_electriques: 2,
    gratuit: false,
    tarif_1h: "1.6",
    tarif_24h: "10.5",
    type_ouvrage: "ouvrage",
    url: "https://metz.fr/lieux/lieu-371.php",
    Xlong: 6.184385,
    Ylat: 49.113768,
  },
  {
    id: "57463-P-003",
    nom: "COISLIN",
    adresse: "7 Rue Coislin, 57000, Metz",
    nb_places: 393,
    nb_pmr: 8,
    nb_voitures_electriques: 2,
    gratuit: false,
    tarif_1h: "1.8",
    tarif_24h: "17.2",
    type_ouvrage: "enclos_en_surface",
    url: "https://www.q-park-resa.fr/fr/parking/metz/coislin-30.html",
    Xlong: 6.17995,
    Ylat: 49.11515,
  },
];

// Fonction pour supprimer l'itinéraire
window.supprimerItineraire = function () {
  if (routingControl) {
    console.log("🗑️ Suppression de l'itinéraire");
    map.removeControl(routingControl);
    routingControl = null;

    // Masquer le bouton d'annulation
    const btnAnnuler = document.getElementById("btn-annuler-itineraire");
    if (btnAnnuler) {
      btnAnnuler.style.display = "none";
    }

    alert("Itinéraire supprimé");
  }
};

// Fonction pour afficher l'itinéraire sur la carte
window.afficherItineraireSurCarte = function (lat, lon, nom) {
  console.log("🗺️ Affichage itinéraire vers:", nom);

  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;

      console.log("📍 Position utilisateur:", userLat, userLon);
      console.log("🎯 Destination:", lat, lon);

      // Supprimer l'ancien itinéraire
      if (routingControl) {
        console.log("🗑️ Suppression ancien itinéraire");
        map.removeControl(routingControl);
        routingControl = null;
      }

      // Créer le nouvel itinéraire
      console.log("✨ Création nouvel itinéraire");
      routingControl = L.Routing.control({
        waypoints: [L.latLng(userLat, userLon), L.latLng(lat, lon)],
        routeWhileDragging: false,
        showAlternatives: false,
        addWaypoints: false,
        lineOptions: {
          styles: [{ color: "#004cbe", opacity: 0.8, weight: 6 }],
        },
        createMarker: function (i, wp, nWps) {
          if (i === 0) {
            return L.marker(wp.latLng, {
              icon: L.icon({
                iconUrl:
                  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
                shadowUrl:
                  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              }),
            }).bindPopup("📍 Départ : Vous êtes ici");
          } else {
            return L.marker(wp.latLng, {
              icon: L.icon({
                iconUrl:
                  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                shadowUrl:
                  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              }),
            }).bindPopup(`🎯 Arrivée : ${nom}`);
          }
        },
      }).addTo(map);

      console.log("✅ Itinéraire ajouté");

      // Afficher le bouton d'annulation
      let btnAnnuler = document.getElementById("btn-annuler-itineraire");
      if (!btnAnnuler) {
        btnAnnuler = document.createElement("button");
        btnAnnuler.id = "btn-annuler-itineraire";
        btnAnnuler.innerHTML = "❌ Annuler l'itinéraire";
        btnAnnuler.onclick = window.supprimerItineraire;
        btnAnnuler.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 12px 20px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          z-index: 1000;
          transition: all 0.3s;
        `;
        btnAnnuler.onmouseover = function () {
          this.style.background = "#c82333";
          this.style.transform = "scale(1.05)";
        };
        btnAnnuler.onmouseout = function () {
          this.style.background = "#dc3545";
          this.style.transform = "scale(1)";
        };
        document.body.appendChild(btnAnnuler);
      } else {
        btnAnnuler.style.display = "block";
      }
    },
    (error) => {
      console.error("❌ Erreur géolocalisation:", error);
      alert("Impossible d'obtenir votre position : " + error.message);
    },
  );
};

// Fonction pour ouvrir Google Maps
window.ouvrirItineraire = function (lat, lon, nom) {
  if (!navigator.geolocation) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`,
      "_blank",
    );
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;
      window.open(
        `https://www.google.com/maps/dir/${userLat},${userLon}/${lat},${lon}`,
        "_blank",
      );
    },
    (error) => {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`,
        "_blank",
      );
    },
  );
};

function loadParkings() {
  console.log("🔄 Chargement des parkings...");

  parkings = parkingsData.map((p) => ({
    id: p.id,
    name: p.nom || "Parking",
    lat: p.Ylat,
    lon: p.Xlong,
    places: p.nb_places || null,
    adresse: p.adresse,
    gratuit: p.gratuit,
    tarif_1h: p.tarif_1h,
    tarif_24h: p.tarif_24h,
    url: p.url,
    type: p.type_ouvrage,
    pmr: p.nb_pmr || 0,
    electrique: p.nb_voitures_electriques || 0,
    source: "Données locales",
  }));

  console.log(`✅ ${parkings.length} parkings chargés`);
  afficherParkings(parkings);
}

function afficherParkings(data) {
  if (markerClusterGroup) {
    map.removeLayer(markerClusterGroup);
  }

  markers.forEach((m) => map.removeLayer(m));
  markers = [];

  if (!data || data.length === 0) {
    console.warn("Aucun parking à afficher");
    return;
  }

  console.log(`Affichage de ${data.length} parkings`);

  markerClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
  });

  data.forEach((p) => {
    const couleur = p.gratuit ? "#28a745" : "#4bb6c9";
    const nomEscaped = p.name.replace(/'/g, "\\'").replace(/"/g, "&quot;");

    const marker = L.circleMarker([p.lat, p.lon], {
      radius: 8,
      color: "#004cbe",
      fillColor: couleur,
      fillOpacity: 0.9,
      weight: 2,
    });

    marker.on("click", function () {
      parkingSelectionne = p;
      console.log("Parking sélectionné:", p.name);
    });

    marker.bindPopup(
      `<div style="min-width: 200px;">
        <b>${p.name}</b><br>
        ${p.adresse ? `📍 ${p.adresse}<br>` : ""}
        ${p.places ? `🚗 ${p.places} places<br>` : ""}
        ${p.pmr ? `♿ ${p.pmr} places PMR<br>` : ""}
        ${p.electrique ? `🔌 ${p.electrique} bornes électriques<br>` : ""}
        ${p.gratuit ? "💚 <b>Gratuit</b><br>" : "💰 Payant<br>"}
        ${p.tarif_1h ? `1h: ${p.tarif_1h}€ | 24h: ${p.tarif_24h}€<br>` : ""}
        ${p.type ? `Type: ${p.type}<br>` : ""}
        ${
        p.url
          ? `<a href="${p.url}" target="_blank" style="color: #004cbe;">Plus d'infos</a><br>`
          : ""
      }
        <br>
        <button onclick="window.afficherItineraireSurCarte(${p.lat}, ${p.lon}, '${nomEscaped}')" 
                style="width: 100%; padding: 8px 12px; background: #004cbe; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; margin-bottom: 5px;">
          🗺️ Itinéraire sur carte
        </button>
        <button onclick="window.ouvrirItineraire(${p.lat}, ${p.lon}, '${nomEscaped}')" 
                style="width: 100%; padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">
          📱 Google Maps
        </button>
        <br><br><i style="font-size: 11px; color: #666;">${p.source}</i>
      </div>`,
    );

    markerClusterGroup.addLayer(marker);
    markers.push(marker);
  });

  map.addLayer(markerClusterGroup);

  try {
    const bounds = markerClusterGroup.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.1));
    }
  } catch (e) {
    console.error("Erreur fitBounds:", e);
  }
}

loadParkings();

function rechercheParking() {
  const query = document.getElementById("search").value.toLowerCase();
  const resultats = parkings.filter(
    (p) => p.name && p.name.toLowerCase().includes(query),
  );
  afficherParkings(resultats);
  if (resultats.length === 1) {
    map.setView([resultats[0].lat, resultats[0].lon], 16);
  }
}

function trierParProximite() {
  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée sur ce navigateur.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;

      const calculDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };

      const parkingsTries = [...parkings].sort((a, b) => {
        const distA = calculDistance(userLat, userLon, a.lat, a.lon);
        const distB = calculDistance(userLat, userLon, b.lat, b.lon);
        return distA - distB;
      });

      afficherParkings(parkingsTries);

      const userMarker = L.marker([userLat, userLon])
        .addTo(map)
        .bindPopup("📍 Vous êtes ici")
        .openPopup();

      const plusProche = parkingsTries[0];

      const bounds = L.latLngBounds([
        [userLat, userLon],
        [plusProche.lat, plusProche.lon],
      ]);
      map.fitBounds(bounds.pad(0.2));

      setTimeout(() => {
        markers[0].openPopup();
      }, 500);
    },
    (err) => {
      alert("Impossible d'obtenir la position : " + (err.message || err.code));
    },
  );
}

function localiserUtilisateur() {
  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée par votre navigateur.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      L.marker([lat, lon], { title: "Vous êtes ici" })
        .addTo(map)
        .bindPopup("📍 Vous êtes ici")
        .openPopup();
      map.setView([lat, lon], 15);
    },
    (error) => {
      alert("Impossible d'obtenir votre position : " + error.message);
    },
  );
}

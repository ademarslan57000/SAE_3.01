
export const translations = {
  fr: {
    free: "GRATUIT",
    paid: "Payant",
    capacity: "Capacité",
    total: "Total",
    places: "places",
    prices: "Tarifs",
    availability: "Disponibilité",
    route: "Itinéraire",
    moreInfo: "Plus d'infos",
    addressUnavailable: "Adresse non disponible",
    noParking: "Aucun parking trouvé",
    updatedAt: "Maj",
  },
  en: {
    free: "FREE",
    paid: "Paid",
    capacity: "Capacity",
    total: "Total",
    places: "spaces",
    prices: "Prices",
    availability: "Availability",
    route: "Directions",
    moreInfo: "More info",
    addressUnavailable: "Address not available",
    noParking: "No parking found",
    updatedAt: "Updated",
  },
};



let currentLang = "fr";

export function setLang(lang) {
  currentLang = translations[lang] ? lang : "fr";
}

export function traduire(key) {
  return translations[currentLang][key] || key;
}
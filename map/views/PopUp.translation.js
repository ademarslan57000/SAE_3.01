export const traductions = {
  fr: {
    free: "GRATUIT",
    paid: "Payant",
    parking: "Parking",
    availability: "Disponibilité",
    updated: "Maj",
    realtime_unavailable: "Données temps réel non disponibles",
    capacity: "Capacité",
    rates: "Tarifs",
    directions: "Itinéraire",
    more_info: "Plus d'infos",
  },
  en: {
    free: "FREE",
    paid: "Paid",
    parking: "Parking",
    availability: "Availability",
    updated: "Updated",
    realtime_unavailable: "Realtime data unavailable",
    capacity: "Capacity",
    rates: "Rates",
    directions: "Directions",
    more_info: "More info",
  },
};

export function traduire(key, lang = "fr") {
  return traductions[lang]?.[key] ?? key;
}




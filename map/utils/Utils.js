export function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject("Géolocalisation non supportée.");
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
      (err) => reject(err.message || "Erreur géolocalisation")
    );
  });
}

export function distanceGPS(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getCentroid(geometry) {
  if (!geometry) return null;

  if (geometry.type === "Point") return [geometry.coordinates[1], geometry.coordinates[0]];

  const coords = [];
  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach(ring => ring.forEach(c => coords.push(c)));
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach(polygon => polygon.forEach(ring => ring.forEach(c => coords.push(c))));
  }

  if (!coords.length) return null;
  const x = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
  const y = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
  return [y, x];
}

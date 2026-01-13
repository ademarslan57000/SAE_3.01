<?php
// -------------------------------------------------------------------------
// CONFIGURATION ET DÉBOGAGE
// -------------------------------------------------------------------------
// Affiche les erreurs PHP (utile pour voir si "ça ne marche pas")
ini_set('display_errors', 1);
error_reporting(E_ALL);

// En-tête JSON
header('Content-Type: application/json; charset=utf-8');

// Inclusion de la connexion
require_once __DIR__ . "/../classes/connexion.class.php";
$conn = new Connexion();

// -------------------------------------------------------------------------
// FONCTIONS UTILITAIRES
// -------------------------------------------------------------------------

// Normalisation des noms pour la comparaison (Metz BDD vs Metz API)
function normalize_name($s)
{
    if (!$s)
        return '';
    $trans = @iconv('UTF-8', 'ASCII//TRANSLIT', trim($s));
    if ($trans !== false)
        $s = $trans;
    $s = preg_replace('/[^a-zA-Z0-9\s]/', '', $s);
    $s = preg_replace('/\s+/', '', $s);
    return strtolower($s);
}

// Fetch API Générique (pour Metz)
function fetchAPI($url)
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_USERAGENT => "Mozilla/5.0",
        CURLOPT_TIMEOUT => 10
    ]);

    $data = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http !== 200 || !$data)
        return [];
    $json = json_decode($data, true);
    return $json["features"] ?? [];
}

// -------------------------------------------------------------------------
// FONCTIONS LONDRES (TfL + OSM)
// -------------------------------------------------------------------------

function fetchLondonParkings()
{
    $app_key = "7c19be0a44704afd8f3b84e585a897a7";
    $url = "https://api.tfl.gov.uk/Place/Type/CarPark?app_key={$app_key}";

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_USERAGENT => "Mozilla/5.0",
        CURLOPT_HTTPHEADER => ["Accept: application/json"]
    ]);

    $data = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if (!$data || $httpCode !== 200)
        return [];
    $json = json_decode($data, true);
    if (!is_array($json))
        return [];

    $list = [];

    foreach ($json as $item) {
        $lat = isset($item["lat"]) ? (float) $item["lat"] : null;
        $lon = isset($item["lon"]) ? (float) $item["lon"] : null;
        if (!$lat || !$lon)
            continue;

        $capacity = 0;
        $nb_pmr = 0;
        $nb_velo = 0;
        $nb_elec = 0;
        $url_parking = "";
        $info_sup = "TfL Station";
        $tarif_24h = null;

        if (isset($item["additionalProperties"])) {
            foreach ($item["additionalProperties"] as $prop) {
                $key = strtolower(preg_replace('/[^a-z]/', '', $prop["key"] ?? ''));
                $val = trim($prop["value"] ?? '');

                if (preg_match('/capacity|spaces|numberofspaces|total/', $key))
                    $capacity = (int) $val;
                elseif (preg_match('/disabled|accessible|bluebadge/', $key))
                    $nb_pmr = (int) $val;
                elseif (preg_match('/cycle|bike/', $key))
                    $nb_velo = (int) $val;
                elseif (preg_match('/electric|ev|charging/', $key))
                    $nb_elec = (int) $val;
                elseif (preg_match('/payment|tariff|price|peak|cost/', $key)) {
                    if ($val !== '' && strtolower($val) !== 'no') {
                        if (!preg_match('/^[\d\s\.\/|]+$/', $val))
                            $info_sup .= " | " . $val;
                        if (preg_match('/(\d+(?:\.\d{1,2})?)/', $val, $m)) {
                            $p = floatval($m[1]);
                            if ($p > 0 && $p < 50 && $tarif_24h === null)
                                $tarif_24h = $m[1];
                        }
                    }
                } elseif (preg_match('/url|website/', $key))
                    $url_parking = $val;
            }
        }
        if ($capacity == 0 && isset($item["capacity"]))
            $capacity = (int) $item["capacity"];

        $list[] = [
            "id" => "LONDON_" . ($item["id"] ?? uniqid()),
            "name" => strtoupper($item["commonName"] ?? "LONDON PARKING"),
            "lat" => $lat,
            "lon" => $lon,
            "adresse" => ($item["commonName"] ?? "London") . ", UK",
            "gratuit" => 0,
            "nb_places" => $capacity,
            "nb_pmr" => ($nb_pmr > 0) ? $nb_pmr : null,
            "nb_velo" => ($nb_velo > 0) ? $nb_velo : null,
            "nb_voitures_electriques" => ($nb_elec > 0) ? $nb_elec : null,
            "place_libre" => null,
            "place_total_rt" => $capacity,
            "place_update" => date("Y-m-d H:i:s"),
            "place_variation" => null,
            "tarif_1h" => null,
            "tarif_2h" => null,
            "tarif_24h" => $tarif_24h,
            "url" => $url_parking,
            "info" => $info_sup,
            "type_place" => "Parking",
            "pays" => "GB"
        ];
    }
    return $list;
}

function fetchOverpassLondonParkings()
{
    $bbox = "51.40,-0.30,51.60,0.10";
    $query = '[out:json][timeout:30];(nwr["amenity"="parking"]["name"](' . $bbox . '););out center 25;';

    $ch = curl_init("https://overpass-api.de/api/interpreter");
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => "data=" . urlencode($query),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => "ParkingFinder/1.0",
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded']
    ]);
    $data = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch); // Fermeture propre du curl

    if ($httpCode !== 200)
        return [];

    $json = json_decode($data, true);
    $list = [];
    if (isset($json['elements'])) {
        foreach ($json['elements'] as $e) {
            $lat = $e['lat'] ?? $e['center']['lat'] ?? null;
            $lon = $e['lon'] ?? $e['center']['lon'] ?? null;
            if (!$lat || !$lon)
                continue;

            $tags = $e['tags'] ?? [];
            $type = $tags['parking'] ?? 'surface';

            $list[] = [
                "id" => "LONDON_OSM_" . $e['id'],
                "name" => strtoupper($tags['name'] ?? "PARKING"),
                "lat" => (float) $lat,
                "lon" => (float) $lon,
                "adresse" => "London, UK",
                "gratuit" => (isset($tags['fee']) && $tags['fee'] === 'no') ? 1 : 0,
                "nb_places" => isset($tags['capacity']) ? (int) $tags['capacity'] : 50,
                "nb_pmr" => null,
                "nb_velo" => null,
                "nb_voitures_electriques" => null,
                "place_libre" => null,
                "place_total_rt" => null,
                "place_update" => date("Y-m-d H:i:s"),
                "place_variation" => null,
                "tarif_1h" => null,
                "tarif_2h" => null,
                "tarif_24h" => null,
                "url" => $tags['website'] ?? "",
                "info" => "OSM (" . $type . ")",
                "type_place" => ucfirst($type),
                "pays" => "GB"
            ];
        }
    }
    return $list;
}

// -------------------------------------------------------------------------
// MAIN (LOGIQUE PRINCIPALE)
// -------------------------------------------------------------------------
try {
    // 1. REQUÊTE SQL METZ (Avec Jointure)
    // On sélectionne les infos de 'parking' et les capacités de 'type_place'
    // La liaison se fait via 'id_parking' qui est présent dans les deux tables.

    $sql = "SELECT 
                p.id_parking AS id, 
                p.nom AS name, 
                p.adresse, 
                p.latitude AS lat, 
                p.longitude AS lon, 
                p.tarif_1h, 
                p.tarif_2h, 
                p.tarif_24h, 
                p.url, 
                p.info,
                -- Champs de la table type_place
                tp.nb_place_standard AS nb_places,
                tp.nb_place_PMR AS nb_pmr,
                tp.nb_place_velo AS nb_velo,
                tp.nb_place_voiture_electrique AS nb_voitures_electriques,
                -- Valeurs par défaut
                'Parking' AS type_place,
                0 AS gratuit
            FROM Parking p
            LEFT JOIN Type_place tp ON p.id_parking = tp.id_parking";

    $parkings = $conn->execSQL($sql);

    // 2. FETCH API METZ (Temps réel)
    $apiUrl = "https://maps.eurometropolemetz.eu/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public:pub_tsp_sta&srsName=EPSG:4326&outputFormat=application/json";
    $features = fetchAPI($apiUrl);

    // Indexation pour recherche rapide
    $byId = [];
    $byName = [];
    foreach ($features as $f) {
        $pr = $f["properties"];
        if (!empty($pr["id"]))
            $byId[$pr["id"]] = $pr;
        if (!empty($pr["lib"]))
            $byName[normalize_name($pr["lib"])] = $pr;
    }

    // 3. FUSION DONNÉES METZ
    $out = [];

    // Si la requête SQL n'a rien retourné (tableau vide), on ne rentre pas dans la boucle
    if (is_array($parkings)) {
        foreach ($parkings as $p) {
            // CAST (Typage correct pour le JSON)
            $p["lat"] = (float) $p["lat"];
            $p["lon"] = (float) $p["lon"];
            $p["tarif_1h"] = (float) $p["tarif_1h"];
            $p["tarif_2h"] = (float) $p["tarif_2h"];
            $p["tarif_24h"] = (float) $p["tarif_24h"];

            // Si la jointure type_place est NULL (pas de ligne correspondante), on met 0
            $p["nb_places"] = (int) $p["nb_places"];
            $p["nb_pmr"] = (int) $p["nb_pmr"];
            $p["nb_velo"] = (int) $p["nb_velo"];
            $p["nb_voitures_electriques"] = (int) $p["nb_voitures_electriques"];

            // Récupération des données temps réel
            $api = $byId[$p["id"]] ?? $byName[normalize_name($p["name"])] ?? null;

            $p["place_libre"] = $api["place_libre"] ?? null;
            // Si nb_places est 0 en BDD, on essaie de prendre le total de l'API
            if ($p["nb_places"] == 0 && isset($api["place_total"])) {
                $p["nb_places"] = (int) $api["place_total"];
            }
            $p["place_total_rt"] = $api["place_total"] ?? null;
            $p["place_update"] = $api["place_update"] ?? null;
            $p["place_variation"] = $api["place_variation"] ?? null;

            $p["pays"] = "FR";
            $out[] = $p;
        }
    }

    // 4. AJOUT DE LONDRES
    $london_tfl = fetchLondonParkings();
    $london_osm = fetchOverpassLondonParkings();
    $london_all = array_merge($london_tfl, $london_osm);

    // Dédoublonnage Londres
    $seen_coords = [];
    foreach ($london_all as $p) {
        $key = round($p['lat'], 4) . "_" . round($p['lon'], 4);
        if (!isset($seen_coords[$key])) {
            $seen_coords[$key] = true;
            $out[] = $p;
        }
    }

    // 5. SORTIE JSON
    // On nettoie le tampon de sortie pour éviter les caractères parasites (espaces, warnings PHP)
    ob_clean();
    echo json_encode($out, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // En cas d'erreur grave, on renvoie un JSON d'erreur
    ob_clean();
    echo json_encode(["error" => $e->getMessage()]);
}
?>
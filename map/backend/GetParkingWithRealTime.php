<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . "/../../classes/connexion.class.php";
$conn = new Connexion();

//--------------------------------------
// Normalisation des noms
//--------------------------------------
function normalize_name($s)
{
    if (!$s) return '';
    $trans = @iconv('UTF-8', 'ASCII//TRANSLIT', trim($s));
    if ($trans !== false) $s = $trans;
    $s = preg_replace('/[^a-zA-Z0-9\s]/', '', $s);
    $s = preg_replace('/\s+/', '', $s);
    return strtolower($s);
}

//--------------------------------------
// Fetch API METZ
//--------------------------------------
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

    if ($http !== 200 || !$data) return [];
    $json = json_decode($data, true);
    return $json["features"] ?? [];
}

//--------------------------------------
// Fetch API LONDRES (TFL) - VERSION COMPLÈTE
//--------------------------------------
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

    if (!$data || $httpCode !== 200) return [];
    $json = json_decode($data, true);
    if (!is_array($json)) return [];

    $list = [];

    foreach ($json as $item) {
        $lat = isset($item["lat"]) ? (float)$item["lat"] : null;
        $lon = isset($item["lon"]) ? (float)$item["lon"] : null;
        if (!$lat || !$lon) continue;

        $capacity = 0;
        $nb_pmr = 0;
        $nb_velo = 0;
        $nb_elec = 0;
        $url_parking = "";
        $info_sup = "TfL Station";
        $tarif_24h = null;

        if (isset($item["additionalProperties"])) {
            foreach ($item["additionalProperties"] as $prop) {
                // Nettoyage strict des clés pour éviter les erreurs d'encodage
                $key = strtolower($prop["key"] ?? '');
                $key = preg_replace('/[^a-z]/', '', $key); // 🔥 CRUCIAL
                $val = trim($prop["value"] ?? '');

                // 1. CAPACITÉ
                if (preg_match('/capacity|spaces|numberofspaces|total/', $key)) {
                    $capacity = (int)$val;
                }

                // 2. PMR
                elseif (preg_match('/disabled|accessible|bluebadge/', $key)) {
                    $nb_pmr = (int)$val;
                }

                // 3. VELOS
                elseif (preg_match('/cycle|bike/', $key)) {
                    $nb_velo = (int)$val;
                }

                // 4. ELECTRIQUE
                elseif (preg_match('/electric|ev|charging/', $key)) {
                    $nb_elec = (int)$val;
                }

                // 5. TARIFS / INFOS
                elseif (preg_match('/payment|tariff|price|peak|cost/', $key)) {
                    if ($val !== '' && strtolower($val) !== 'no') {
                        // Si la valeur contient uniquement des chiffres et des barres, on ne l'ajoute pas à info_sup
                        if (!preg_match('/^[\d\s\.\/|]+$/', $val)) {
                            $info_sup .= " | " . $val;
                        }

                        // On continue d'extraire le prix pour le champ tarif_24h
                        if (preg_match('/(\d+(?:\.\d{1,2})?)/', $val, $m)) {
                            $prixFound = floatval($m[1]);
                            if ($prixFound > 0 && $prixFound < 50 && $tarif_24h === null) {
                                $tarif_24h = $m[1];
                            }
                        }
                    }
                }

                // 6. URL
                elseif (preg_match('/url|website/', $key)) {
                    $url_parking = $val;
                }
            }
        }

        // Sécurité pour la capacité par défaut
        if ($capacity == 0 && isset($item["capacity"])) $capacity = (int)$item["capacity"];

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
            "tarif_24h" => $tarif_24h, // Désormais rempli via RegEx
            "url" => $url_parking,
            "info" => $info_sup,
            "pays" => "GB"
        ];
    }
    return $list;
}

function fetchOverpassLondonParkings() {
    $bbox = "51.40,-0.30,51.60,0.10"; 
    $query = '[out:json][timeout:30];(nwr["amenity"="parking"]["name"]('.$bbox.'););out center 25;';

    $url = "https://overpass-api.de/api/interpreter";
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => "data=" . urlencode($query),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ParkingFinder/1.0",
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded']
    ]);

    $data = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) return [];
    $json = json_decode($data, true);
    $list = [];

    if (isset($json['elements'])) {
        foreach ($json['elements'] as $element) {
            $lat = $element['lat'] ?? $element['center']['lat'] ?? null;
            $lon = $element['lon'] ?? $element['center']['lon'] ?? null;
            $tags = $element['tags'] ?? [];
            if (!$lat || !$lon) continue;

            // --- RECONSTRUCTION DE L'ADRESSE ---
            $addrParts = [];
            if (isset($tags['addr:housenumber'])) $addrParts[] = $tags['addr:housenumber'];
            if (isset($tags['addr:street'])) $addrParts[] = $tags['addr:street'];
            if (isset($tags['addr:city'])) $addrParts[] = $tags['addr:city'];
            if (isset($tags['addr:postcode'])) $addrParts[] = $tags['addr:postcode'];
            $full_address = !empty($addrParts) ? implode(", ", $addrParts) : "London, UK";

            // --- INFO COMPLÉMENTAIRE ---
            $type = $tags['parking'] ?? 'surface';
            $access = isset($tags['access']) ? " | Accès: " . $tags['access'] : "";
            $info_sup = "Parking OSM (" . $type . ")" . $access;

            $list[] = [
                "id" => "LONDON_OSM_" . $element['id'],
                "name" => strtoupper($tags['name'] ?? "PARKING LONDRES"),
                "lat" => (float)$lat,
                "lon" => (float)$lon,
                "adresse" => $full_address,
                "gratuit" => (isset($tags['fee']) && $tags['fee'] === 'no') ? 1 : 0,
                "nb_places" => isset($tags['capacity']) ? (int)$tags['capacity'] : 50, // Valeur par défaut si inconnue
                "nb_pmr" => isset($tags['capacity:disabled']) ? (int)$tags['capacity:disabled'] : null,
                "nb_velo" => null,
                "nb_voitures_electriques" => isset($tags['capacity:charging']) ? (int)$tags['capacity:charging'] : null,
                "place_libre" => null,
                "place_total_rt" => isset($tags['capacity']) ? (int)$tags['capacity'] : null,
                "place_update" => date("Y-m-d H:i:s"),
                "place_variation" => null,
                "tarif_1h" => null,
                "tarif_2h" => null,
                "tarif_24h" => null,
                "url" => $tags['website'] ?? "",
                "info" => $info_sup,
                "pays" => "GB"
            ];
        }
    }
    return $list;
}

//--------------------------------------
// MAIN
//--------------------------------------
try {
    // 1) Metz (BDD)
    $parkings = $conn->execSQL("SELECT id, nom AS name, adresse, gratuit, nb_places, nb_pmr, nb_velo,
               nb_voitures_electriques, Ylat AS lat, Xlong AS lon,
               tarif_1h, tarif_2h, tarif_24h, url, info
        FROM parkings");

    // 2) Metz (Temps réel)
    $apiUrl = "https://maps.eurometropolemetz.eu/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public:pub_tsp_sta&srsName=EPSG:4326&outputFormat=application/json";
    $features = fetchAPI($apiUrl);

    $byId = [];
    $byName = [];
    foreach ($features as $f) {
        $p = $f["properties"];
        if (!empty($p["id"])) $byId[$p["id"]] = $p;
        if (!empty($p["lib"])) $byName[normalize_name($p["lib"])] = $p;
    }

    // 3) Fusion Metz
    $out = [];
    foreach ($parkings as $p) {
        foreach (["lat", "lon", "tarif_1h", "tarif_2h", "tarif_24h"] as $k) $p[$k] = (float)$p[$k];
        foreach (["nb_places", "nb_pmr", "nb_velo", "nb_voitures_electriques"] as $k) $p[$k] = (int)$p[$k];

        $api = $byId[$p["id"]] ?? $byName[normalize_name($p["name"])] ?? null;

        $p["place_libre"]     = $api["place_libre"] ?? null;
        $p["place_total_rt"]  = $api["place_total"] ?? null;
        $p["place_update"]    = $api["place_update"] ?? null;
        $p["place_variation"] = $api["place_variation"] ?? null;
        $p["pays"] = "FR";
        $out[] = $p;
    }

    // --- LONDRES ---
    $london_tfl = fetchLondonParkings();
    $london_osm = fetchOverpassLondonParkings();
    
    // On fusionne les deux sources de Londres
    $london_all = array_merge($london_tfl, $london_osm);
    
    $seen_coords = [];
    foreach ($london_all as $p) {
        // Clé unique par position pour éviter les doublons TfL/OSM
        $key = round($p['lat'], 4) . "_" . round($p['lon'], 4);
        if (!isset($seen_coords[$key])) {
            $seen_coords[$key] = true;
            $out[] = $p; // On ajoute au tableau final qui contient déjà Metz
        }
    }

    // --- SORTIE FINALE ---
    // On vide le tampon de sortie pour éviter tout caractère parasite
    ob_clean(); 
    echo json_encode($out, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
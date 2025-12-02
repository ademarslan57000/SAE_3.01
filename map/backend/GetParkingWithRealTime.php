<?php
header('Content-Type: application/json; charset=utf-8');

require '../../config/config.php';

function haversine_distance($lat1, $lon1, $lat2, $lon2)
{
    $R = 6371.0;
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);

    $a = sin($dLat / 2) ** 2 +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon / 2) ** 2;

    return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
}

function normalize_name($s)
{
    if (!$s) return '';
    $trans = @iconv('UTF-8', 'ASCII//TRANSLIT', trim($s));
    if ($trans !== false) $s = $trans;

    $s = preg_replace('/[^a-zA-Z0-9\s]/', '', $s);
    $s = preg_replace('/\s+/', '', $s);

    return strtolower($s);
}

function fetchAPI($url)
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT => 10
    ]);

    $data = curl_exec($ch);
    curl_close($ch);

    $json = json_decode($data, true);
    if (!$json || !isset($json['features'])) {
        http_response_code(502);
        echo json_encode([
            "error" => "API error",
            "raw" => substr($data, 0, 200)
        ]);
        exit;
    }
    return $json['features'];
}

try {

    //données statiques de la base de données
    $sql = $db->prepare("
        SELECT id, nom AS name, adresse, gratuit, nb_places, nb_pmr, nb_velo,
               nb_voitures_electriques, Ylat AS lat, Xlong AS lon,
               tarif_1h, tarif_2h, tarif_24h, url, info
        FROM parkings
    ");
    $sql->execute();
    $parkings = $sql->fetchAll(PDO::FETCH_ASSOC);


    //données temps réel de l'API
    $apiUrl = "https://maps.eurometropolemetz.eu/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public:pub_tsp_sta&srsName=EPSG:4326&outputFormat=application%2Fjson&cql_%C3%8Blter=id%20is%20not%20null";
    $features = fetchAPI($apiUrl);

    $byId = [];
    $byName = [];

    foreach ($features as $f) {
        $p = $f['properties'];

        if (isset($f['geometry']['coordinates'])) {
            $p['_coords'] = $f['geometry']['coordinates'];
        }
        if (!empty($p['id'])) {
            $byId[$p['id']] = $p;
        }
        if (!empty($p['lib'])) {
            $byName[normalize_name($p['lib'])] = $p;
        }
    }


    //fusion des données
    $out = [];

    foreach ($parkings as $p) {

        foreach(["lat","lon","tarif_1h","tarif_2h","tarif_24h"] as $k)
            $p[$k] = (float)$p[$k];

        foreach(["nb_places","nb_pmr","nb_velo","nb_voitures_electriques"] as $k)
            $p[$k] = (int)$p[$k];

        $p["place_libre"] = null;
        $p["place_total_rt"] = null;
        $p["place_update"] = null;
        $p["place_variation"] = null;

        $api = $byId[$p["id"]] ?? $byName[normalize_name($p["name"])] ?? null;

        if (!$api && $p["lat"] && $p["lon"]) {

            $best = null;
            $bestDist = 1e9;

            foreach ($features as $f) {
                if (!isset($f['geometry']['coordinates'])) continue;

                [$x, $y] = $f['geometry']['coordinates'];
                $dist = haversine_distance($p["lat"], $p["lon"], $y, $x);

                if ($dist < $bestDist) {
                    $bestDist = $dist;
                    $best = $f['properties'];
                }
            }

            if ($best && $bestDist <= 0.2) {
                $api = $best;
            }
        }

        if ($api) {
            $p["place_libre"]      = $api["place_libre"] ?? null;
            $p["place_total_rt"]   = $api["place_total"] ?? null;
            $p["place_update"]     = $api["place_update"] ?? null;
            $p["place_variation"]  = $api["place_variation"] ?? null;
        }

        $out[] = $p;
    }

    echo json_encode($out);

} catch (Exception $e) {

    http_response_code(500);
    echo json_encode([
        "error" => $e->getMessage()
    ]);

}
?>

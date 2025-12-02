<?php
header('Content-Type: application/json; charset=utf-8');
require '../../config/config.php';

try {
    $res = $db->prepare("SELECT * FROM parkings");
    $res->execute();
    $rows = $res->fetchAll(PDO::FETCH_ASSOC);

    $rows = array_map(function($row) {
        $row['lat'] = isset($row['Ylat']) ? (float)$row['Ylat'] : 0;
        $row['lon'] = isset($row['Xlong']) ? (float)$row['Xlong'] : 0;

        $row['nb_places'] = (int)($row['nb_places'] ?? 0);
        $row['nb_pmr'] = (int)($row['nb_pmr'] ?? 0);
        $row['nb_velo'] = (int)($row['nb_velo'] ?? 0);
        $row['nb_voitures_electriques'] = (int)($row['nb_voitures_electriques'] ?? 0);

        $row['tarif_1h'] = (float)($row['tarif_1h'] ?? 0);
        $row['tarif_2h'] = (float)($row['tarif_2h'] ?? 0);
        $row['tarif_24h'] = (float)($row['tarif_24h'] ?? 0);

        return $row;
    }, $rows);

    echo json_encode($rows);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

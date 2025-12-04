<?php

require "../config/config.php";

try {
    $res = $db->prepare("SELECT * FROM parkings");
    $res->execute();
    $rows = $res->fetchAll(PDO::FETCH_ASSOC);
    
    // Convertir les coordonnées et tarifs en nombres
    $rows = array_map(function($row) {
        $row['lat'] = (float)$row['lat'];
        $row['lon'] = (float)$row['lon'];
        $row['nb_places'] = (int)$row['nb_places'];
        $row['nb_pmr'] = (int)$row['nb_pmr'];
        $row['nb_velo'] = (int)$row['nb_velo'];
        $row['nb_voitures_electriques'] = (int)$row['nb_voitures_electriques'];
        $row['tarif_1h'] = (float)$row['tarif_1h'];
        $row['tarif_2h'] = (float)$row['tarif_2h'];
        $row['tarif_24h'] = (float)$row['tarif_24h'];
        return $row;
    }, $rows);
    
    echo json_encode($rows);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
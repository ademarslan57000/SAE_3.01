<?php
//vérifie que l'utilisateur est connecté
session_start();

header('Content-Type: application/json');

$authenticated = isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);

echo json_encode([
    'authenticated' => $authenticated,
    'user_id' => $_SESSION['user_id'] ?? null
]);

?>
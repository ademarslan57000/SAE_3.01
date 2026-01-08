<?php
session_start();

if(!isset($_SESSION['user_id'])) {
    header('Location: ../views/connexion.view.php');
    exit();
}

require_once "../classes/connexion.class.php";

$db = new Connexion();

$id = $_SESSION['user_id'];

$res = $db->execSQL("SELECT nom, prenom, adresse, tel, mail FROM Utilisateur WHERE id_utilisateur = :id", 
[":id" => $id]);

if(empty($res)) {
    die("Utilisateur non trouvé.");
}

$user = $res[0];
?>

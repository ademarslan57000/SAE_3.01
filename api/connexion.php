<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

require_once "../classes/utilisateurDAO.class.php";
require_once "../classes/Validator.class.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../views/connexion.view.php");
    exit;
}

if (!isset($_POST["email"], $_POST["password"])) {
    header("Location: ../views/connexion.view.php?error=incomplete");
    exit;
}

// Sanitisation de l'email
$email = Validator::sanitizeString($_POST["email"]);
$password = $_POST["password"];

if (empty($email) || empty($password)) {
    header("Location: ../views/connexion.view.php?error=incomplete");
    exit;
}

// Validation du format email
if (!Validator::validateEmail($email)) {
    header("Location: ../views/connexion.view.php?error=invalid_credentials");
    exit;
}

$dao = new UtilisateurDAO();
$user_data = $dao->getByEmail($email);

if ($user_data === null) {
    header("Location: ../views/connexion.view.php?error=invalid_credentials");
    exit;
}

$stored_hash = $user_data["mot_de_passe"];

if (!password_verify($password, $stored_hash)) {
    header("Location: ../views/connexion.view.php?error=invalid_credentials");
    exit;
}

$_SESSION["user_id"] = $user_data["id_utilisateur"];
$_SESSION["user_nom"] = $user_data["nom"];
$_SESSION["user_prenom"] = $user_data["prenom"];

header("Location: ../views/index.html");
exit;
?>
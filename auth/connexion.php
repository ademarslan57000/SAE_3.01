<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

require_once "../classes/utilisateurDAO.class.php";

// ✅ CORRECTION : vérifier que le formulaire a été soumis
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../views/connexion.view.php");
    exit;
}

if (!isset($_POST["email"], $_POST["password"])) {
    header("Location: ../views/connexion.view.php?error=incomplete");
    exit;
}

$email = trim($_POST["email"]);
$password = $_POST["password"];

if (empty($email) || empty($password)) {
    header("Location: ../views/connexion.view.php?error=incomplete");
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

// ✅ CRÉER LA SESSION
$_SESSION["user_id"] = $user_data["id_utilisateur"];
$_SESSION["user_nom"] = $user_data["nom"];
$_SESSION["user_prenom"] = $user_data["prenom"];

// ✅ REDIRIGER VERS LA CARTE
header("Location: ../index.html");
exit;
?>
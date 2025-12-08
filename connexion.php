<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once "utilisateurDAO.class.php";

if (!isset($_POST["login"])) {
    header("Location: connexion.view.php");
    exit;
}

if (!isset($_POST["email"], $_POST["password"])) {
    header("Location: connexion.view.php?error=incomplete");
    exit;
}

$email = trim($_POST["email"]);
$password = $_POST["password"];

$dao = new UtilisateurDAO();

$user_data = $dao->getByEmail($email);

if ($user_data === null) {
    header("Location: connexion.view.php?error=invalid_credentials");
    exit;
}

$stored_hash = $user_data["mot_de_passe"];

if (!password_verify($password, $stored_hash)) {
    header("Location: connexion.view.php?error=invalid_credentials");
    exit;
}

session_start();
$_SESSION["user_id"] = $user_data["id"];
$_SESSION["user_nom"] = $user_data["nom"];
$_SESSION["user_prenom"] = $user_data["prenom"];

header("Location: index.html");
exit;
?>
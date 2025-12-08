<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

require_once "utilisateur.class.php";
require_once "utilisateurDAO.class.php";

if (!isset($_POST["register"])) {
    header("Location: inscription.view.php");
    exit;
}

$nom = trim($_POST["lastname"] ?? "Veuillez saisir un nom   ");
$prenom = trim($_POST["firstname"] ?? "");
$adresse = trim($_POST["adresse"] ?? "");
$tel = trim($_POST["tel"] ?? "");
$email = trim($_POST["email"] ?? "");
$pwd_raw = $_POST["password"] ?? "";

if ($nom === "" || $prenom === "" || $email === "" || $pwd_raw === "") {
    header("Location: inscription.view.php?error=missing");
    exit;
}

$passwordHash = password_hash($pwd_raw, PASSWORD_DEFAULT);

$dao = new UtilisateurDAO();

if ($dao->emailExiste($email)) {
    header("Location: inscription.view.php?error=email");
    exit;
}

$user = new Utilisateur();
$user->setNom($nom);
$user->setPrenom($prenom);
$user->setAdresse($adresse);
$user->setTel($tel);
$user->setEmail($email);
$user->setPassword($passwordHash);

try {
    $dao->insert($user);
    header("Location: connexion.view.php?success=1");
    exit;
} catch (Exception $e) {
    die("Erreur lors de l'inscription : " . $e->getMessage());
}
?>
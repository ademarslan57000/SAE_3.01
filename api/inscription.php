<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

session_start();
require_once "../classes/utilisateur.class.php";
require_once "../classes/utilisateurDAO.class.php";

if (!isset($_POST["register"])) {
    include "../views/inscription.view.php";
    exit;
}

$nom = trim($_POST["lastname"] ?? "");
$prenom = trim($_POST["firstname"] ?? "");
$adresse = trim($_POST["adresse"] ?? "");
$tel = trim($_POST["tel"] ?? "");
$email = trim($_POST["email"] ?? "");
$password = $_POST["password"] ?? "";

if (empty($nom) || empty($prenom) || empty($email) || empty($password)) {
    header("Location: ../views/inscription.view.php?error=missing");
    exit;
}

if(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header("Location: ../views/inscription.view.php?error=invalid_email");
    exit;
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$dao = new UtilisateurDAO();

if ($dao->emailExiste($email)) {
    header("Location: ../views/inscription.view.php?error=email_exists");
    exit;
}

$user = new Utilisateur();
$user->setNom($nom);
$user->setPrenom($prenom);
$user->setAdresse($adresse ?? null);
$user->setTel($tel ?? null);
$user->setEmail($email);
$user->setPassword($passwordHash);

try {
    $dao->insert($user);
    header("Location: ../views/connexion.view.php?success=1");
    exit;
} catch (Exception $e) {
    die("Erreur lors de l'inscription : " . $e->getMessage());
}
?>
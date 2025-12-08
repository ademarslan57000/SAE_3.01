<?php
$sgbd = "mysql";
$host = "devbdd.iutmetz.univ-lorraine.fr";
$dbname = "e11850u_parking";
$user = "e11850u";
$pass = "32406254";

try {
    $dsn = "$sgbd:host=$host;dbname=$dbname;charset=utf8";

    $pdo = new PDO($dsn, $user, $pass);

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (Exception $e) {
    die("Erreur BDD : " . $e->getMessage());
}

<?php
require_once __DIR__."/connexion.class.php";
require_once __DIR__."/utilisateur.class.php";

class UtilisateurDAO
{
    private Connexion $_bd;

    function __construct()
    {
        $this->_bd = new Connexion();
    }

    public function insert(Utilisateur $u): void
    {
        $sql = "INSERT INTO Utilisateur (nom, prenom, adresse, tel, mail, mot_de_passe)
                VALUES (:nom, :prenom, :adresse, :tel, :mail, :mot_de_passe)";

        $this->_bd->execSQL($sql, [
            ":nom" => $u->getNom(),
            ":prenom" => $u->getPrenom(),
            ":adresse" => $u->getAdresse(),
            ":tel" => $u->getTel(),
            ":mail" => $u->getEmail(),
            ":mot_de_passe" => $u->getPassword()
        ]);
    }

    public function emailExiste(string $email): bool
    {
        $sql = "SELECT 1 FROM Utilisateur WHERE mail = :mail LIMIT 1";
        $res = $this->_bd->execSQL($sql, [":mail" => $email]);
        return ($res != []);
    }
    public function getByEmail(string $email): ?array
    {
        $sql = "SELECT id_utilisateur, nom, prenom, mail, mot_de_passe, adresse, tel FROM Utilisateur WHERE mail = :mail LIMIT 1";
        $res = $this->_bd->execSQL($sql, [":mail" => $email]);
        return count($res) > 0 ? $res[0] : null;
    }
}
?>
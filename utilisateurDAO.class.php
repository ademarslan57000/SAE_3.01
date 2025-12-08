<?php
require_once "connexion.class.php";
require_once "utilisateur.class.php";

class UtilisateurDAO
{
    private Connexion $_bd;

    function __construct()
    {
        $this->_bd = new Connexion();
    }

    public function insert(Utilisateur $u): void
    {
        $sql = "INSERT INTO utilisateur (nom, prenom, adresse, tel, mail, mot_de_passe)
                VALUES (:nom, :prenom, :adresse, :tel, :mail, :password)";

        $this->_bd->execSQL($sql, [
            ":nom" => $u->getNom(),
            ":prenom" => $u->getPrenom(),
            ":adresse" => $u->getAdresse(),
            ":tel" => $u->getTel(),
            ":mail" => $u->getEmail(),
            ":password" => $u->getPassword()
        ]);
    }

    public function emailExiste(string $email): bool
    {
        $sql = "SELECT 1 FROM utilisateur WHERE mail = :mail LIMIT 1";
        $res = $this->_bd->execSQL($sql, [":mail" => $email]);
        return ($res != []);
    }
    public function getByEmail(string $email): ?array
    {
        $sql = "SELECT * FROM utilisateur WHERE mail = :mail LIMIT 1";
        $res = $this->_bd->execSQL($sql, [":mail" => $email]);
        return count($res) > 0 ? $res[0] : null;
    }
}
?>
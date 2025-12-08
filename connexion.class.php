<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

class Connexion
{
    private $db;

    public function __construct()
    {
        require 'config.php';

        try {
            $dsn = $db_config['SGBD']
                . ':host=' . $db_config['HOST']
                . ';dbname=' . $db_config['DB_NAME']
                . ';charset=utf8';

            $this->db = new PDO(
                $dsn,
                $db_config['USER'],
                $db_config['PASSWORD'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );

        } catch (Exception $e) {
            die("Erreur de connexion BDD : " . $e->getMessage());
        }
    }
    public function execSQL(string $req, array $valeurs = []): array
    {
        $query = $this->db->prepare($req);
        $query->execute($valeurs);
        return $query->fetchAll();
    }
}
?>
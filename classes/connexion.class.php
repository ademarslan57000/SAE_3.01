<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

class Connexion
{
    private PDO $db;

    public function __construct()
    {
        $db_config = [
            'SGBD' => 'mysql',
            'HOST' => 'devbdd.iutmetz.univ-lorraine.fr',
            'DB_NAME' => 'e11850u_parking',
            'USER' => 'e11850u_appli',
            'PASSWORD' => '32406254'
        ];

        try {

            $this->db = new PDO(
                "{$db_config['SGBD']}:host={$db_config['HOST']};dbname={$db_config['DB_NAME']};charset=utf8",
                $db_config['USER'],
                $db_config['PASSWORD'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                "error" => "DB_CONNECTION_FAILED",
                "message" => $e->getMessage()
            ]);
            exit;
        }
    }
    public function execSQL(string $req, array $valeurs = []): array
    {
        $query = $this->db->prepare($req);
        $query->execute($valeurs);
        return $query->fetchAll();
    }

    public function getPDO(): PDO
    {
        return $this->db;
    }
}

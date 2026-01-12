<?php
require_once __DIR__ . "/connexion.class.php";
require_once __DIR__ . "/vehicule.class.php";

class VehiculeDAO
{
    private Connexion $_bd;

    function __construct()
    {
        $this->_bd = new Connexion();
    }

    // Insère le véhicule et récupère son ID automatiquement
    public function insert(Vehicule $v): void
    {
        $sql = "INSERT INTO Vehicule (nom_vehicule, immatriculation, id_utilisateur, id_type_vehicule)
                VALUES (:nom, :immat, :id_user, :id_type)";

        $this->_bd->execSQL($sql, [
            ":nom" => $v->getNom(),
            ":immat" => $v->getImmatriculation(),
            ":id_user" => $v->getIdUtilisateur(),
            ":id_type" => $v->getIdTypeVehicule()
        ]);

        // IMPORTANT : On récupère l'ID généré par la BDD pour mettre à jour l'objet
        $lastId = $this->_bd->getPDO()->lastInsertId();
        $v->setId((int) $lastId);
    }

    // Vérifie si un véhicule existe déjà pour cet utilisateur
    public function getByImmatriculationAndUser(string $immat, int $idUser): ?Vehicule
    {
        $sql = "SELECT * FROM Vehicule WHERE immatriculation = :immat AND id_utilisateur = :id_user LIMIT 1";
        $res = $this->_bd->execSQL($sql, [
            ":immat" => $immat,
            ":id_user" => $idUser
        ]);

        if (count($res) > 0) {
            $ligne = $res[0];
            $v = new Vehicule();
            $v->setId($ligne['id_vehicule']);
            $v->setNom($ligne['nom_vehicule']);
            $v->setImmatriculation($ligne['immatriculation']);
            $v->setIdUtilisateur($ligne['id_utilisateur']);
            $v->setIdTypeVehicule($ligne['id_type_vehicule']); // Note: varchar dans ta BDD, mais traité comme int ici
            return $v;
        }
        return null;
    }
}
?>
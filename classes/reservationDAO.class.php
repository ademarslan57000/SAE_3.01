<?php
require_once __DIR__ . "/connexion.class.php";
require_once __DIR__ . "/reservation.class.php";

class ReservationDAO
{
    private Connexion $_bd;

    function __construct()
    {
        $this->_bd = new Connexion();
    }

    public function insert(Reservation $r): void
    {
        $sql = "INSERT INTO Reservation (id_utilisateur, id_vehicule, id_parking, date_debut, date_fin, statut)
                VALUES (:id_user, :id_vehicule, :id_parking, :date_debut, :date_fin, :statut)";

        $this->_bd->execSQL($sql, [
            ":id_user" => $r->getIdUtilisateur(),
            ":id_vehicule" => $r->getIdVehicule(),
            ":id_parking" => $r->getIdParking(),
            ":date_debut" => $r->getDateDebut(),
            ":date_fin" => $r->getDateFin(),
            ":statut" => $r->getStatut()
        ]);
        $lastId = $this->_bd->getPDO()->lastInsertId();
        $r->setId((int) $lastId);
    }

    public function delete(int $idReservation, int $idUtilisateur): bool
{
    // Correction : id_utilisateur (avec un u) et id_reservation (minuscule pour la cohérence)
    $sql = "DELETE FROM Reservation 
            WHERE id_reservation = :id
            AND id_utilisateur = :id_user";

    $this->_bd->execSQL($sql, [
        ":id" => $idReservation,
        ":id_user" => $idUtilisateur
    ]);
    return true;
}

    public function getByUser(string $id): array
    {
        $sql = "SELECT r.id_reservation, r.date_debut, r.date_fin, r.statut, p.nom AS nom_parking, v.immatriculation
        FROM Reservation AS r
        JOIN Parking p ON r.id_parking = p.id_parking
        JOIN Vehicule v ON r.id_vehicule = v.id_vehicule
        WHERE r.id_utilisateur = :id
        ORDER by r.date_debut DESC";

        return $this->_bd->execSQL($sql, [
            ":id" => $id
        ]);
    }
}
?>
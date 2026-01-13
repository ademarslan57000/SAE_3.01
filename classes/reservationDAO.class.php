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
        $sql = "INSERT INTO Reservation (id_utilisateur, id_vehicule, id_parking, date_debut, date_fin)
                VALUES (:id_user, :id_vehicule, :id_parking, :date_debut, :date_fin)";

        $this->_bd->execSQL($sql, [
            ":id_user" => $r->getIdUtilisateur(),
            ":id_vehicule" => $r->getIdVehicule(),
            ":id_parking" => $r->getIdParking(),
            ":date_debut" => $r->getDateDebut(),
            ":date_fin" => $r->getDateFin(),
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
        $sql = "SELECT r.id_reservation, r.date_debut, r.date_fin, p.nom AS nom_parking, v.immatriculation
        FROM Reservation AS r
        JOIN Parking p ON r.id_parking = p.id_parking
        JOIN Vehicule v ON r.id_vehicule = v.id_vehicule
        WHERE r.id_utilisateur = :id
        ORDER by r.date_debut DESC";

        return $this->_bd->execSQL($sql, [
            ":id" => $id
        ]);
    }

    /**
     * Vérifie si l'utilisateur a déjà une réservation qui chevauche la période demandée
     * @param int $idUtilisateur
     * @param string $dateDebut
     * @param string $dateFin
     * @return bool true s'il y a un chevauchement, false sinon
     */
    public function hasOverlappingReservation(int $idUtilisateur, string $dateDebut, string $dateFin): bool
    {
        $sql = "SELECT COUNT(*) as count
                FROM Reservation
                WHERE id_utilisateur = :id_user
                AND (
                    (date_debut <= :date_debut AND date_fin > :date_debut)
                    OR (date_debut < :date_fin AND date_fin >= :date_fin)
                    OR (date_debut >= :date_debut AND date_fin <= :date_fin)
                )";

        $result = $this->_bd->execSQL($sql, [
            ":id_user" => $idUtilisateur,
            ":date_debut" => $dateDebut,
            ":date_fin" => $dateFin
        ]);

        return isset($result[0]['count']) && $result[0]['count'] > 0;
    }
}
?>
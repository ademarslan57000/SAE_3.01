<?php
class Reservation
{
    private ?int $id = null;
    private int $idUtilisateur;
    private int $idVehicule;
    private string $idParking; // varchar(20) dans ta BDD
    private string $dateDebut;
    private string $dateFin;
    private string $statut = 'active';

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }
    public function getIdUtilisateur(): int
    {
        return $this->idUtilisateur;
    }
    public function getIdVehicule(): int
    {
        return $this->idVehicule;
    }
    public function getIdParking(): string
    {
        return $this->idParking;
    }
    public function getDateDebut(): string
    {
        return $this->dateDebut;
    }
    public function getDateFin(): string
    {
        return $this->dateFin;
    }
    public function getStatut(): string
    {
        return $this->statut;
    }

    // Setters
    public function setId(int $id): void
    {
        $this->id = $id;
    }
    public function setIdUtilisateur(int $u): void
    {
        $this->idUtilisateur = $u;
    }
    public function setIdVehicule(int $v): void
    {
        $this->idVehicule = $v;
    }
    public function setIdParking(string $p): void
    {
        $this->idParking = $p;
    }
    public function setDateDebut(string $d): void
    {
        $this->dateDebut = $d;
    }
    public function setDateFin(string $d): void
    {
        $this->dateFin = $d;
    }
    public function setStatut(string $s): void
    {
        $this->statut = $s;
    }
}
?>
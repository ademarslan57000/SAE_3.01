<?php
class Vehicule
{
    private ?int $id = null;
    private ?string $nom = null;
    private string $immatriculation;
    private int $idUtilisateur;
    private int $idTypeVehicule;

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }
    public function getNom(): ?string
    {
        return $this->nom;
    }
    public function getImmatriculation(): string
    {
        return $this->immatriculation;
    }
    public function getIdUtilisateur(): int
    {
        return $this->idUtilisateur;
    }
    public function getIdTypeVehicule(): int
    {
        return $this->idTypeVehicule;
    }

    // Setters
    public function setId(int $id): void
    {
        $this->id = $id;
    }
    public function setNom(?string $nom): void
    {
        $this->nom = $nom;
    }
    public function setImmatriculation(string $immat): void
    {
        $this->immatriculation = $immat;
    }
    public function setIdUtilisateur(int $idUser): void
    {
        $this->idUtilisateur = $idUser;
    }
    public function setIdTypeVehicule(int $idType): void
    {
        $this->idTypeVehicule = $idType;
    }
}
?>
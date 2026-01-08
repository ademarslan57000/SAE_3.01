<?php
class Utilisateur
{
    private ?int $id = null;
    private string $nom;
    private string $prenom;
    private ?string $adresse = null;
    private ?string $tel = null;
    private string $email;
    private string $password;
    public function getId(): ?int
    {
        return $this->id;
    }
    public function getNom(): string
    {
        return $this->nom;
    }
    public function getPrenom(): string
    {
        return $this->prenom;
    }
    public function getAdresse(): ?string
    {
        return $this->adresse;
    }
    public function getTel(): ?string
    {
        return $this->tel;
    }
    public function getEmail(): string
    {
        return $this->email;
    }
    public function getPassword(): string
    {
        return $this->password;
    }
    public function setId(int $id): void
    {
        $this->id = $id;
    }
    public function setNom(string $n): void
    {
        $this->nom = $n;
    }
    public function setPrenom(string $p): void
    {
        $this->prenom = $p;
    }
    public function setAdresse(?string $a): void
    {
        $this->adresse = $a;
    }
    public function setTel(?string $t): void
    {
        $this->tel = $t;
    }
    public function setEmail(string $e): void
    {
        $this->email = $e;
    }
    public function setPassword(string $pwd): void
    {
        $this->password = $pwd;
    }
}
?>
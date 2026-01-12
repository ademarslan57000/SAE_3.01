<?php
require_once __DIR__."/connexion.class.php";
require_once __DIR__."/utilisateur.class.php";
require_once __DIR__."/Validator.class.php";

/**
 * Classe UtilisateurDAO
 * Principe SOLID : Single Responsibility + Dependency Injection
 * Gestion des opérations CRUD sur les utilisateurs avec validation
 */
class UtilisateurDAO
{
    private Connexion $_bd;

    public function __construct(Connexion $connexion = null)
    {
        $this->_bd = $connexion ?? new Connexion();
    }

    /**
     * Insérer un utilisateur avec validation
     * @throws Exception si la validation échoue
     */
    public function insert(Utilisateur $u): void
    {
        // Validation des données
        $this->validateUtilisateur($u);

        $sql = "INSERT INTO Utilisateur (nom, prenom, adresse, tel, mail, mot_de_passe)
                VALUES (:nom, :prenom, :adresse, :tel, :mail, :mot_de_passe)";

        $this->_bd->execSQL($sql, [
            ":nom" => Validator::sanitizeString($u->getNom()),
            ":prenom" => Validator::sanitizeString($u->getPrenom()),
            ":adresse" => $u->getAdresse() ? Validator::sanitizeString($u->getAdresse()) : null,
            ":tel" => $u->getTel(),
            ":mail" => $u->getEmail(),
            ":mot_de_passe" => $u->getPassword() // Déjà hashé
        ]);
    }

    /**
     * Vérifier si un email existe
     */
    public function emailExiste(string $email): bool
    {
        if (!Validator::validateEmail($email)) {
            return false;
        }

        $sql = "SELECT 1 FROM Utilisateur WHERE mail = :mail LIMIT 1";
        $res = $this->_bd->execSQL($sql, [":mail" => $email]);
        return !empty($res);
    }

    /**
     * Récupérer un utilisateur par email
     */
    public function getByEmail(string $email): ?array
    {
        if (!Validator::validateEmail($email)) {
            return null;
        }

        $sql = "SELECT id_utilisateur, nom, prenom, mail, mot_de_passe, adresse, tel 
                FROM Utilisateur 
                WHERE mail = :mail 
                LIMIT 1";
        
        $res = $this->_bd->execSQL($sql, [":mail" => $email]);
        return count($res) > 0 ? $res[0] : null;
    }

    /**
     * Récupérer un utilisateur par ID
     */
    public function getById(int $id): ?array
    {
        $sql = "SELECT id_utilisateur, nom, prenom, mail, adresse, tel 
                FROM Utilisateur 
                WHERE id_utilisateur = :id 
                LIMIT 1";
        
        $res = $this->_bd->execSQL($sql, [":id" => $id]);
        return count($res) > 0 ? $res[0] : null;
    }

    /**
     * Mettre à jour un utilisateur
     */
    public function update(Utilisateur $u): void
    {
        $this->validateUtilisateur($u, false);

        $sql = "UPDATE Utilisateur 
                SET nom = :nom, 
                    prenom = :prenom, 
                    adresse = :adresse, 
                    tel = :tel 
                WHERE id_utilisateur = :id";

        $this->_bd->execSQL($sql, [
            ":id" => $u->getId(),
            ":nom" => Validator::sanitizeString($u->getNom()),
            ":prenom" => Validator::sanitizeString($u->getPrenom()),
            ":adresse" => $u->getAdresse() ? Validator::sanitizeString($u->getAdresse()) : null,
            ":tel" => $u->getTel()
        ]);
    }

    /**
     * Supprimer un utilisateur
     */
    public function delete(int $id): void
    {
        $sql = "DELETE FROM Utilisateur WHERE id_utilisateur = :id";
        $this->_bd->execSQL($sql, [":id" => $id]);
    }

    /**
     * Valider les données d'un utilisateur
     * @throws Exception si la validation échoue
     */
    private function validateUtilisateur(Utilisateur $u, bool $checkPassword = true): void
    {
        $errors = [];

        // Validation du nom
        if (!Validator::validateLength($u->getNom(), 2, 50)) {
            $errors[] = "Le nom doit contenir entre 2 et 50 caractères";
        }

        // Validation du prénom
        if (!Validator::validateLength($u->getPrenom(), 2, 50)) {
            $errors[] = "Le prénom doit contenir entre 2 et 50 caractères";
        }

        // Validation de l'email
        if (!Validator::validateEmail($u->getEmail())) {
            $errors[] = "L'adresse email n'est pas valide";
        }

        // Validation du téléphone si présent
        if ($u->getTel() && !Validator::validatePhone($u->getTel())) {
            $errors[] = "Le numéro de téléphone n'est pas valide";
        }

        // Validation du mot de passe si demandé
        if ($checkPassword) {
            $passwordValidation = Validator::validatePassword($u->getPassword());
            if (!$passwordValidation['valid']) {
                $errors = array_merge($errors, $passwordValidation['errors']);
            }
        }

        if (!empty($errors)) {
            throw new Exception(implode(", ", $errors));
        }
    }

    /**
     * Vérifier les credentials de connexion
     */
    public function verifyCredentials(string $email, string $password): ?array
    {
        $user = $this->getByEmail($email);
        
        if (!$user) {
            return null;
        }

        if (password_verify($password, $user['mot_de_passe'])) {
            // Ne pas retourner le mot de passe
            unset($user['mot_de_passe']);
            return $user;
        }

        return null;
    }
}
?>
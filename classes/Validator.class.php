<?php

class Validator
{
    // Nettoyer une chaîne de caractères
    public static function sanitizeString(string $input): string
    {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }

    // Valider une adresse email
    public static function validateEmail(string $email): bool
    {
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    // Valider un numéro de téléphone français
    public static function validatePhone(string $phone): bool
    {
        // Format: 06 12 34 56 78 ou 0612345678 ou +33612345678
        $pattern = '/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/';
        return preg_match($pattern, $phone) === 1;
    }

    /**
     * Valider la force d'un mot de passe
     * Minimum 8 caractères, au moins une majuscule, une minuscule et un chiffre
     */
    public static function validatePassword(string $password): array
    {
        $errors = [];
        
        if (strlen($password) < 8) {
            $errors[] = "Le mot de passe doit contenir au moins 8 caractères";
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = "Le mot de passe doit contenir au moins une majuscule";
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = "Le mot de passe doit contenir au moins une minuscule";
        }
        
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = "Le mot de passe doit contenir au moins un chiffre";
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    public static function validateLength(string $input, int $min, int $max): bool
    {
        $length = strlen($input);
        return $length >= $min && $length <= $max;
    }

    public static function escapeSql(string $input): string
    {
        return self::sanitizeString($input);
    }

    public static function validateDate(string $date, string $format = 'Y-m-d'): bool
    {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date;
    }

    public static function isFutureDate(string $date): bool
    {
        $dateTime = new DateTime($date);
        $now = new DateTime();
        return $dateTime > $now;
    }

    public static function sanitizeArray(array $data): array
    {
        $clean = [];
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $clean[$key] = self::sanitizeString($value);
            } elseif (is_array($value)) {
                $clean[$key] = self::sanitizeArray($value);
            } else {
                $clean[$key] = $value;
            }
        }
        return $clean;
    }

    public static function validateIntInRange(int $value, int $min, int $max): bool
    {
        return $value >= $min && $value <= $max;
    }

    public static function generateCSRFToken(): string
    {
        if (!isset($_SESSION)) {
            session_start();
        }
        
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        $_SESSION['csrf_token_time'] = time();
        
        return $token;
    }

    public static function verifyCSRFToken(string $token): bool
    {
        if (!isset($_SESSION)) {
            session_start();
        }
        
        if (!isset($_SESSION['csrf_token']) || !isset($_SESSION['csrf_token_time'])) {
            return false;
        }
        
        // Token expire après 1 heure
        if (time() - $_SESSION['csrf_token_time'] > 3600) {
            unset($_SESSION['csrf_token']);
            unset($_SESSION['csrf_token_time']);
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }
}
?>

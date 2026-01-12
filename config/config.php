<?php
/**
 * Fichier de configuration centralisé
 * Principe SOLID : Single Responsibility
 * Toutes les configurations en un seul endroit
 */

// Empêcher l'inclusion multiple
if (defined('CONFIG_LOADED')) {
    return;
}
define('CONFIG_LOADED', true);

// Configuration de l'environnement
define('ENVIRONMENT', getenv('APP_ENV') ?: 'development');
define('DEBUG_MODE', ENVIRONMENT === 'development');

// Configuration de la base de données
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'smart_parking');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

// Configuration de sécurité
define('SESSION_LIFETIME', 3600); // 1 heure
define('CSRF_TOKEN_LIFETIME', 3600); // 1 heure
define('PASSWORD_MIN_LENGTH', 8);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_TIME', 900); // 15 minutes

// Configuration des chemins
define('BASE_PATH', dirname(__DIR__));
define('CLASSES_PATH', BASE_PATH . '/classes');
define('VIEWS_PATH', BASE_PATH . '/views');
define('LANG_PATH', BASE_PATH . '/lang');

// Configuration de l'application
define('APP_NAME', 'Smart Parking Metz');
define('APP_VERSION', '1.0.0');
define('DEFAULT_LANG', 'fr');
define('SUPPORTED_LANGS', ['fr', 'en']);

// Configuration des APIs externes
define('METZ_PARKING_API', 'https://data.opendatasoft.com/api/records/1.0/search/?dataset=disponibilite-parkings-temps-reel@eurometropolemetz');
define('LONDON_PARKING_API', 'https://api.tfl.gov.uk/Place/Type/CarPark');
define('API_CACHE_DURATION', 300); // 5 minutes

// Configuration PWA
define('PWA_CACHE_VERSION', 'smart-parking-v1');
define('PWA_OFFLINE_URL', '/offline.html');

// Configuration des logs
define('LOG_PATH', BASE_PATH . '/logs');
define('LOG_LEVEL', DEBUG_MODE ? 'DEBUG' : 'ERROR');

// Configuration des emails (si implémenté)
define('SMTP_HOST', getenv('SMTP_HOST') ?: 'localhost');
define('SMTP_PORT', getenv('SMTP_PORT') ?: 587);
define('SMTP_USER', getenv('SMTP_USER') ?: '');
define('SMTP_PASS', getenv('SMTP_PASS') ?: '');
define('EMAIL_FROM', 'noreply@smartparking.fr');
define('EMAIL_FROM_NAME', APP_NAME);

// Gestion des erreurs selon l'environnement
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
    ini_set('error_log', LOG_PATH . '/php-errors.log');
}

// Configuration de session sécurisée
ini_set('session.cookie_httponly', '1');
ini_set('session.use_strict_mode', '1');
ini_set('session.cookie_samesite', 'Strict');

if (!DEBUG_MODE) {
    ini_set('session.cookie_secure', '1'); // Seulement en HTTPS
}

// Timezone
date_default_timezone_set('Europe/Paris');

/**
 * Fonction helper pour obtenir une configuration
 */
function config(string $key, $default = null)
{
    return defined($key) ? constant($key) : $default;
}

/**
 * Fonction helper pour logger
 */
function logMessage(string $message, string $level = 'INFO')
{
    if (!DEBUG_MODE && $level === 'DEBUG') {
        return;
    }

    $logFile = LOG_PATH . '/' . date('Y-m-d') . '.log';
    $timestamp = date('Y-m-d H:i:s');
    $logLine = "[{$timestamp}] [{$level}] {$message}" . PHP_EOL;
    
    if (!file_exists(LOG_PATH)) {
        mkdir(LOG_PATH, 0755, true);
    }
    
    file_put_contents($logFile, $logLine, FILE_APPEND);
}
?>

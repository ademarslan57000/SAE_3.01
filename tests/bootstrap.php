<?php
/**
 * Bootstrap pour les tests PHPUnit
 * Charge les classes nécessaires
 */

// Définir le chemin racine
define('ROOT_PATH', dirname(__DIR__));

// Autoloader simple pour les classes
spl_autoload_register(function ($class) {
    $classPath = ROOT_PATH . '/classes/' . $class . '.class.php';
    if (file_exists($classPath)) {
        require_once $classPath;
    }
});

// Configuration pour les tests
error_reporting(E_ALL);
ini_set('display_errors', 1);

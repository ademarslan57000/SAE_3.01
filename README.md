# 🚗 Smart Parking Metz - Documentation Technique

## 📋 Table des matières
- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Installation](#installation)
- [Principes SOLID](#principes-solid)
- [Modules créés](#modules-créés)
- [Sécurité](#sécurité)
- [Utilisation](#utilisation)

## 🎯 Vue d'ensemble

Smart Parking Metz est une Progressive Web App (PWA) permettant de trouver et réserver des places de parking à Metz et Londres en temps réel. Compatible Android Auto et Apple CarPlay.

### Fonctionnalités
- 🗺️ Carte interactive avec parkings en temps réel
- 📱 PWA installable (Android Auto & CarPlay)
- 🌐 Multilingue (FR/EN)
- 🚇 Informations mobilité
- 👤 Gestion compte utilisateur
- 📝 Système de réservation

## 🏗️ Architecture

### Stack Technique
- **Frontend**: HTML5, CSS3, JavaScript ES6+, Leaflet.js
- **Backend**: PHP 8+ (POO), MySQL, PDO
- **PWA**: Service Workers, Manifest
- **APIs**: Open Data Metz, TfL London

## 📦 Installation

```bash
# 1. Configuration BDD
mysql -u root -p < database/schema.sql

# 2. Configuration
cp .env.example .env
# Éditer .env avec vos paramètres

# 3. Permissions
chmod 755 -R sae301/
chmod 777 logs/

# 4. HTTPS (obligatoire pour PWA)
certbot --apache -d votre-domaine.com
```

## 🎨 Principes SOLID Appliqués

### ✅ Améliorations implémentées

#### 1. **Single Responsibility Principle**
Chaque classe/module a UNE responsabilité :

**`Validator.class.php`** - Validation uniquement
```php
Validator::validateEmail($email);
Validator::validatePassword($password);
Validator::generateCSRFToken();
```

**`ApiService.js`** - Appels API uniquement
```javascript
const api = new ApiService();
const data = await api.get('/endpoint', { useCache: true });
```

**`TranslationModule.js`** - Traductions uniquement
```javascript
const translation = new TranslationModule('../lang/page');
translation.init();
```

#### 2. **DRY (Don't Repeat Yourself)**

**Avant** : Code dupliqué dans 8 fichiers `*.translation.js`
**Après** : Un seul module réutilisable `TranslationModule.js`

**Avant** : Styles répétés dans 6 fichiers CSS
**Après** : Styles communs dans `common.css`

#### 3. **Dependency Injection**
```php
// UtilisateurDAO accepte injection de Connexion
public function __construct(Connexion $connexion = null)
{
    $this->_bd = $connexion ?? new Connexion();
}
```

#### 4. **Configuration centralisée**
**`config/config.php`** - Toute la config en un seul fichier
```php
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('SESSION_LIFETIME', 3600);
define('API_CACHE_DURATION', 300);
```

## 📚 Modules Créés

### 1. TranslationModule.js
**Objectif** : Éliminer duplication dans les fichiers de traduction

**Utilisation** :
```javascript
const translation = new TranslationModule('../lang/page', {
    btnSelector: '#btn-langue'
});

function changerLangue() {
    translation.changeLanguage();
}

translation.init();
```

### 2. ApiService.js
**Objectif** : Centraliser appels API avec cache

**Utilisation** :
```javascript
const api = new ApiService();

// GET avec cache
const parkings = await api.get('/parkings', { useCache: true });

// POST
await api.post('/reservation', { parking_id: 123 });

// Parallèle
const [data1, data2] = await api.fetchMultiple([
    { method: 'GET', endpoint: '/api1' },
    { method: 'GET', endpoint: '/api2' }
]);
```

### 3. Validator.class.php
**Objectif** : Sécuriser toutes les validations

**Méthodes** :
```php
Validator::sanitizeString($input)
Validator::validateEmail($email)
Validator::validatePhone($phone)
Validator::validatePassword($password)
Validator::generateCSRFToken()
Validator::verifyCSRFToken($token)
```

### 4. common.css
**Objectif** : Styles réutilisables

**Inclus** :
- Header commun
- Boutons standardisés (`.btn-langue`, `.btn-retour`)
- Background gradient
- Responsive design

## 🔐 Sécurité

### Protection XSS
```php
Validator::sanitizeString($input); // htmlspecialchars + trim
```

### Protection CSRF
```php
// Génération
$token = Validator::generateCSRFToken();
echo '<input type="hidden" name="csrf" value="'.$token.'">';

// Vérification
if (!Validator::verifyCSRFToken($_POST['csrf'])) {
    die("CSRF invalide");
}
```

### Protection SQL Injection
```php
// Toujours prepared statements
$sql = "SELECT * FROM Utilisateur WHERE mail = :mail";
$this->_bd->execSQL($sql, [":mail" => $email]);
```

### Hashage mots de passe
```php
// Inscription
$hash = password_hash($password, PASSWORD_DEFAULT);

// Connexion
if (password_verify($password, $hash)) {
    // OK
}
```

### Sessions sécurisées
```php
ini_set('session.cookie_httponly', '1');
ini_set('session.use_strict_mode', '1');
ini_set('session.cookie_samesite', 'Strict');
```

## 🚀 Utilisation

### Ajouter une nouvelle page

1. **Fichiers**
```bash
touch views/ma-page.html
touch css/ma-page.css
touch js/ma-page.js
touch lang/ma-page.fr.json
touch lang/ma-page.en.json
```

2. **HTML - Inclure CSS commun**
```html
<link rel="stylesheet" href="../css/common.css">
<link rel="stylesheet" href="../css/ma-page.css">
```

3. **JS - Utiliser TranslationModule**
```javascript
const translation = new TranslationModule('../lang/ma-page');

function changerLangue() {
    translation.changeLanguage();
}

translation.init();
```

4. **PHP - Utiliser Validator**
```php
require_once 'config/config.php';
require_once 'classes/Validator.class.php';

$email = Validator::sanitizeString($_POST['email']);
if (!Validator::validateEmail($email)) {
    die("Email invalide");
}
```

### Structure recommandée

```
nouvelle-page/
├── HTML : Structure sémantique
├── CSS : common.css + page.css
├── JS : TranslationModule + ApiService
└── PHP : Validator + UtilisateurDAO
```

## 📱 PWA Installation

### Android
1. Chrome → Menu ⋮ → "Installer l'application"
2. Apparaît dans Android Auto automatiquement

### iOS
1. Safari → Partager  → "Sur l'écran d'accueil"
2. Réglages → CarPlay → Activer l'app

**Prérequis** : HTTPS obligatoire en production

## 🎯 Bonnes Pratiques

### Code Style
- Classes : `PascalCase`
- Fonctions : `camelCase`
- Constantes : `UPPER_SNAKE_CASE`
- CSS : `kebab-case`

### Validation
- **Toujours** côté serveur
- Facultatif côté client (UX)

### Gestion erreurs
```javascript
try {
    await api.get('/data');
} catch (error) {
    console.error('Erreur:', error);
    // Message utilisateur
}
```

### Cache
- API cache : 5 minutes
- Service Worker : ressources statiques
- localStorage : préférences utilisateur

## 📊 Performance

✅ Service Worker (PWA)
✅ API avec cache
✅ Prepared statements (PDO)
✅ Images optimisées
✅ CSS/JS minifiés

## 🐛 Debug

```php
// Activer logs
define('DEBUG_MODE', true);
logMessage('Debug info', 'DEBUG');
```

```javascript
console.log('Data:', data);
console.error('Error:', error);
```

## 📄 Fichiers Principaux

```
sae301/
├── config/config.php          ✨ Configuration centralisée
├── classes/
│   ├── Validator.class.php   ✨ Validation sécurisée
│   └── UtilisateurDAO.class.php ✨ CRUD + validation
├── css/common.css             ✨ Styles communs
├── js/
│   ├── TranslationModule.js   ✨ Module traduction
│   └── ApiService.js          ✨ Service API
├── manifest.json              PWA config
└── service-worker.js          Offline support
```

## ✅ Checklist Qualité

- [x] Principes SOLID appliqués
- [x] Code factorisé (DRY)
- [x] Validation sécurisée
- [x] Protection CSRF
- [x] Prepared statements
- [x] Configuration centralisée
- [x] Modules réutilisables
- [x] Documentation complète
- [x] CSS responsive
- [x] PWA fonctionnelle

## 📚 Ressources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [PHP Security](https://www.php.net/manual/en/security.php)
- [Leaflet.js](https://leafletjs.com/)

---

**Version** : 1.0.0  
**Date** : Janvier 2026  
**Projet** : SAE 301 - BUT MMI

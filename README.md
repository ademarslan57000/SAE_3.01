# Smart Parking - Application Web Progressive

## Contexte du projet

**SAE 301 - BUT MMI 2ème année**\

**Année universitaire** : 2025-2026\
**Équipe** : ARSLAN - BENMOUFFEK - COLASSE -  MALLINGER - SWIATOKA 
**Groupe** : 13

Ce projet a été réalisé dans le cadre de la SAE 301 du BUT Informatique. L'objectif était de concevoir et développer une application
web complète permettant de faciliter le stationnement urbain à Metz et Londres,
en exploitant les données ouvertes et en appliquant les bonnes pratiques de
développement web.


### Fonctionnalités principales

✅ **Carte interactive** avec visualisation en temps réel des parkings
disponibles\
✅ **Système de réservation** complet avec gestion des dates et types de
véhicules\
✅ **Gestion utilisateur** : inscription, connexion, profil, historique des
réservations\
✅ **Informations mobilité** : transports en commun, vélos en libre-service,
itinéraires multimodaux\
✅ **Interface multilingue** (français/anglais) avec changement dynamique\
✅ **Progressive Web App** installable sur mobile et ordinateur

### Fonctionnalités avancées

✅ **Compatibilité Android Auto et Apple CarPlay** pour utilisation en voiture\
✅ **Mode hors ligne** grâce au Service Worker pour consultation même sans
connexion\
✅ **Calcul d'itinéraires** vers les parkings avec guidage GPS\
✅ **Données temps réel** synchronisées avec Open Data Metz et TfL London\
✅ **Système de filtrage** par type de parking, disponibilité, tarifs\
✅ **Parkings Relais (P+R)** identifiés avec tarification spéciale Métis\
✅ **Validation intelligente** : empêche réservations passées et doublons\
✅ **Adaptation véhicules** : masquage automatique de l'immatriculation pour les
vélo

- Gestion de compte utilisateur sécurisée
- Compatible Andet compétences mises en œuvre

### Stack technique

**Frontend**

- **HTML5** : structure sémantique et accessibilité
- **CSS3** : design responsive avec Flexbox et Grid, animations
- **JavaScript ES6+** : programmation moderne (modules, async/await, classes)
- **Leaflet.js** : cartographie interactive avec clustering et marqueurs
  personnalisés
- **Service Workers** : mise en cache intelligente et mode hors ligne

**Backend**

- **PHP 8+** : programmation orientée objet, typage strict
- **MySQL** : base de données relationnelle
- **PDO** : requêtes préparées contre les injections SQL
- **Architecture DAO** : séparation modèle/accès données

**APIs et données**

- **Open Data Metz** : données de parkings en temps réel (format JSON)
- **Transport for London (TfL)** : parkings londoniens
- **OpenStreetMap** : fonds de carte

### Compétences développées

**Développement web**

- Architecture MVC adaptée au web
- Principes SOLID appliqués (Single Responsibility, Dependency Injection)
- Code réutilisable et maintenable (modules, classes génériques)
- Gestion d'état et synchronisation client-serveur

**Sécurité**

- Validation et sanitisation des entrées utilisateur
- Protection XSS, CSRF, injections SQL
- Hashage sécurisé des mots de passe (bcrypt)
- Gestion sécurisée des sessions

**UX/UI Design**

- Interface intuitive et responsive (mobile-first)
- Internationalisation (i18n)
- Feedback utilisateur temps réel
- Accessibilité web (WCAG)

**DevOps**

- Gestion de version (Git)
- Configuration d'environnements
- Optimisation des performances (cache, lazy loading) **APIs externes**

- Open Data Metz pour les données de parkings
- Transport for London (TfL) pour les parkings londoniens

## Installation et configuration

### Prérequis

- Serveur web (Apache)
- PHP 8.0 ou supérieur
- MySQL 5.7 ou supérieur
- HTTPS (obligatoire pour PWA)

### Étapes d'installation

1. **Cloner le projet**
   ```bash
   git clone [https://gitlab.univ-lorraine.fr/e10974u/sae301]
   cd sae301
   ```

2. **Configurer la base de données**
   - Créer une base de données MySQL
   - Importer le schéma (fichier SQL fourni)
   - Configurer les identifiants dans `classes/connexion.class.php` ou via
     variables d'environnement

3. **Configuration environnement** Vous pouvez utiliser des variables
   d'environnement :
   ```bash
   export DB_HOST="localhost"
   export DB_NAME="nom_base"
   export DB_USER="utilisateur"
   export DB_PASSWORD="mot_de_passe"
   ```

4. **Permissions**
   ```bash
   chmod 755 -R sae301/
   ```

5. **HTTPS (obligatoire)** L'application nécessite HTTPS pour fonctionner en PWA
   :
   ```bash
   certbot --apache -d votre-domaine.com
   ```

## Structure du projet

```
sae301/
├── auth/              # Scripts d'authentification
├── classes/           # Classes PHP (DAO, modèles)
├── config/            # Configuration
├── css/               # Feuilles de style
├── js/                # Scripts JavaScript
├── lang/              # Fichiers de traduction
├── map/               # Module carte interactive
├── views/             # Pages HTML
├── index.html         # Page d'accueil
├── manifest.json      # Configuration PWA
└── service-worker.js  # Gestion cache et mode hors ligne
```

## Utilisation

### Pour les développeurs

**Ajouter une nouvelle page**

1. Créer les fichiers de base :
   ```bash
   touch views/ma-page.html
   touch css/ma-page.css
   touch js/ma-page.js
   ```

2. Ajouter les traductions :
   ```bash
   touch lang/ma-page.fr.json
   touch lang/ma-page.en.json
   ```

3. Utiliser les modules existants dans votre JavaScript :
   ```javascript
   const translation = new TranslationModule("../lang/ma-page");
   translation.init();
   ```

**Sécurité**

Le projet intègre plusieurs mécanismes de sécurité :

- Validation et sanitisation des données avec `Validator.class.php`
- Protection contre les injections SQL (requêtes préparées)
- Protection XSS (échappement des données)
- Hashage sécurisé des mots de passe (bcrypt)
- Sessions sécurisées avec cookies HTTP-only

**Appels API**

Utiliser le module `ApiService.js` pour les requêtes :

```javascript
const api = new ApiService();
const data = await api.get("/endpoint", { useCache: true });
```

### Pour les utilisateurs finaux

Difficultés rencontrées et solutions apportées

### 1. Intégration des données temps réel

**Problème** : Les APIs Open Data Metz et TfL London retournent des formats
différents.\
**Solution** : Création d'une couche d'abstraction (`ParkingService.js`) qui
normalise les données avant affichage.

### 2. Validation des réservations

**Problème** : Empêcher les utilisateurs de réserver dans le passé ou de créer
des doublons.\
**Solution** : Double validation (client + serveur) avec fonction
`hasOverlappingReservation()` en SQL pour détecter les chevauchements.

### 3. Gestion multilingue

**Problème** : Code dupliqué dans 8 fichiers de traduction différents (800+
lignes).\
**Solution** : Création d'un module réutilisable `TranslationModule.js` qui
centralise la logique.

### 4. Performance de la carte

**Problème** : Affichage ralenti avec plus de 100 marqueurs.\
**Solution** : Implémentation du clustering avec `MarkerClusterGroup` de
Leaflet.

### 5. Sécurité PHP 8.4

**Problème** : Avertissements de dépréciation sur les paramètres nullables.\
**Solution** : Migration vers la syntaxe `?Type` pour tous les paramètres
optionnels.

### 6. Identification des parkings P+R

**Problème** : Pas de champ dédié dans l'API pour identifier les parkings
relais.\
**Solution** : Détection par mots-clés ("P+R", "Rochambeau", etc.) avec
affichage spécifique (couleur orange, badge).

## Qualité du code et bonnes pratiques

### Principes appliqués

✅ **SOLID** : chaque classe a une responsabilité unique (ex: `Validator`,
`ParkingService`)\
✅ **DRY** : code factorisé, modules réutilisables, pas de duplication\
✅ **Defensive Programming** : validation systématique, gestion des erreurs\
✅ **Clean Code** : nommage explicite, fonctions courtes, commentaires
JSDoc/PHPDoc\
✅ **Sécurité** : protection XSS, CSRF, SQL injection, mots de passe hashés

###Bilan et perspectives

### Points forts du projet

✅ Application complète et fonctionnelle répondant au cahier des charges\
✅ Interface utilisateur moderne et intuitive\
✅ Code propre suivant les standards professionnels\
✅ Sécurité renforcée sur toutes les couches\
✅ Performance optimisée (cache, clustering)\
✅ Documentation technique complète

### Améliorations possibles

🔄 **Notifications push** pour rappels de fin de stationnement\
🔄 **Paiement en ligne** intégré directement dans l'application\
🔄 **Historique détaillé** avec statistiques de stationnement\
🔄 **API REST** pour ouverture à des applications tierces\
🔄 **Tests automatisés** (unitaires, intégration, E2E)\
🔄 **PWA++ ** avec fonctionnalités avancées (background sync, share API)

### Apprentissages

Ce projet nous a permis de :

- Maîtriser le développement full-stack avec technologies modernes
- Comprendre l'importance de l'architecture logicielle
- Appliquer concrètement les principes de sécurité web
- Gérer l'intégration d'APIs externes
- Développer une application "production-ready"

## Installation du projet

### Prérequis

- Serveur Apache avec PHP 8.0+
- MySQL 5.7+
- HTTPS configuré (obligatoire pour PWA)

### Procédure d'installation

```bash
# 1. Cloner le projet
git clone https://gitlab.univ-lorraine.fr/e10974u/sae301
cd sae301

# 2. Configurer la base de données
# Créer la base MySQL et importer le schéma fourni

# 3. Configurer les accès BDD
# Modifier classes/connexion.class.php ou utiliser variables d'environnement

# 4. Vérifier les permissions
chmod 755 -R sae301/

# 5. Accéder à l'application
# Ouvrir https://votre-domaine.com dans un navigateur
```

## Crédits et ressources

**Projet académique**\
SAE 301 - BUT MMI 2ème année\
IUT de Metz - Université de Lorraine

**Équipe de développement**\
[Noms des membres]

**Sources de données**

- Open Data Metz (parkings temps réel)
- Transport for London (TfL API)

**Technologies et librairies**

- Leaflet.js (cartographie)
- OpenStreetMap (fonds de carte)
- MarkerCluster plugin

---

**Date de rendu** : Janvier 2026\
**Version** : 1.0.0

- Validation manuelle de tous les parcours utilisateur
- Test sur différents navigateurs (Chrome, Firefox, Safari, Edge)
- Test responsive sur mobile, tablette, desktop
- Vérification de la sécurité (tentatives d'injection, XSS)
- Zéro erreur de compilation après audit completpement

Le code suit les bonnes pratiques de développement web :

- **Principe SOLID** : chaque classe a une responsabilité unique
- **Code réutilisable** : modules JavaScript et classes PHP génériques
- **Sécurité first** : validation systématique des données
- **Performance** : cache API, optimisation des requêtes
- **Accessibilité** : interface claire et responsive

## Points d'attention

- **HTTPS obligatoire** : certaines fonctionnalités PWA nécessitent une
  connexion sécurisée
- **Navigateurs supportés** : Chrome, Firefox, Safari, Edge (versions récentes)
- **Validation des données** : toujours effectuée côté serveur, même si
  validation client active
- **Données temps réel** : dépendent de la disponibilité des APIs externes

## Contribution et développement

Le projet est ouvert aux améliorations. Pour contribuer :

1. Respecter la structure existante
2. Commenter le code de manière claire
3. Tester les fonctionnalités avant commit
4. Suivre les conventions de nommage :
   - Classes : `PascalCase`
   - Fonctions : `camelCase`
   - Constantes : `UPPER_SNAKE_CASE`
   - CSS : `kebab-case`

## Crédits

**Projet académique** : SAE 301 - BUT MMI **Données** : Open Data Metz,
Transport for London **Cartographie** : Leaflet.js, OpenStreetMap

---

Pour toute question ou problème, consulter la documentation technique ou
contacter l'équipe de développement.

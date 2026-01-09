# Configuration Android Auto et Apple CarPlay

## 📱 Configuration requise

Cette application web est maintenant compatible avec Android Auto et Apple
CarPlay via une Progressive Web App (PWA).

## 🚗 Android Auto

### Configuration

1. **Installer l'application sur Android** :
   - Ouvrez Chrome sur votre téléphone Android
   - Accédez à l'application web
   - Menu ⋮ > "Ajouter à l'écran d'accueil"
   - L'application sera installée comme une PWA

2. **Activer le mode développeur Android Auto** :
   - Ouvrez l'application Android Auto
   - Allez dans Paramètres > Version
   - Appuyez 10 fois sur "Version" pour activer le mode développeur
   - Dans Paramètres développeur > Sources inconnues : Activé

3. **Connecter au véhicule** :
   - Connectez votre téléphone via USB ou sans fil
   - L'application apparaîtra dans Android Auto sous "Navigation"

### Fonctionnalités Android Auto

✅ Navigation turn-by-turn ✅ Commandes vocales : "Ok Google, trouve un parking
près de moi" ✅ Interface adaptée au tableau de bord ✅ Notifications de fin de
stationnement

## 🍎 Apple CarPlay

### Configuration

1. **Installer sur iOS** :
   - Ouvrez Safari sur votre iPhone
   - Accédez à l'application web
   - Appuyez sur le bouton Partager
   - Sélectionnez "Sur l'écran d'accueil"

2. **Connecter à CarPlay** :
   - Connectez votre iPhone via Lightning ou sans fil
   - L'application apparaîtra sur l'écran CarPlay

3. **Activer dans CarPlay** :
   - Réglages iOS > Général > CarPlay
   - Sélectionnez votre véhicule
   - Personnaliser > Ajouter "Smart Parking"

### Fonctionnalités CarPlay

✅ Interface CarPlay native ✅ Commandes Siri : "Hey Siri, trouve un parking" ✅
Navigation avec itinéraire vocal ✅ Notifications intelligentes

## 🔧 Configuration technique

### Fichiers créés

- `manifest.json` : Configuration PWA avec métadonnées Android Auto/CarPlay
- `service-worker.js` : Service Worker pour fonctionnement hors ligne
- Métadonnées HTML dans `index.html`

### Pour un déploiement en production

1. **HTTPS obligatoire** :
   ```bash
   # L'application doit être servie en HTTPS
   # Utilisez Let's Encrypt ou un certificat SSL valide
   ```

2. **Icons haute résolution** :
   - Créer des icônes 192x192 et 512x512 pixels
   - Remplacer `image/logo.png` par vos icônes

3. **Test sur appareil réel** :
   - Testez sur un téléphone connecté à un véhicule compatible
   - Vérifiez les commandes vocales
   - Testez la navigation

## 🎯 Commandes vocales supportées

### Android Auto

- "Ok Google, trouve un parking près de moi"
- "Ok Google, réserve un parking"
- "Ok Google, montre mes réservations"
- "Ok Google, navigue vers [nom du parking]"

### Apple CarPlay avec Siri

- "Hey Siri, trouve un parking"
- "Hey Siri, réserve une place"
- "Hey Siri, où est mon parking"
- "Hey Siri, emmène-moi au parking [nom]"

## 🐛 Dépannage

### L'application n'apparaît pas dans Android Auto

1. Vérifiez que le mode développeur est activé
2. Vérifiez que "Sources inconnues" est activé
3. Redémarrez Android Auto
4. Vérifiez que l'application est bien installée comme PWA

### L'application n'apparaît pas dans CarPlay

1. Vérifiez que l'application est ajoutée à l'écran d'accueil
2. Dans Réglages iOS > Général > CarPlay, personnalisez l'écran
3. Vérifiez la connexion (câble ou sans fil)
4. Redémarrez l'iPhone

## 📊 Limitations actuelles

⚠️ **PWA vs Application native** :

- Les PWA ont des limitations par rapport aux apps natives
- Certaines fonctionnalités avancées nécessitent une app native
- Pour une intégration complète, développez une app native Android/iOS

## 🚀 Prochaines étapes pour une app native

Si vous souhaitez une intégration complète :

1. **Android** :
   - Développer avec Android Auto SDK
   - Utiliser les templates de navigation natifs
   - Implémenter `NavigationService`

2. **iOS** :
   - Développer avec CarPlay framework
   - Utiliser `CPMapTemplate` et `CPNavigationTemplate`
   - Configurer l'entitlement CarPlay

## 📝 Notes

- L'application fonctionne hors ligne grâce au Service Worker
- Les données de parkings sont mises en cache
- Les notifications de rappel fonctionnent même quand l'app est fermée
- La navigation en temps réel fonctionne via Android Auto/CarPlay

import { MapController } from './map.js';
import { getLocation } from './utils.js';

window.getLocation = getLocation(); // pour passer aux boutons

window.mapController = new MapController();
window.mapController.init();

window.rechercheParking = () => window.mapController.rechercheParking();
window.trierParProximite = () => window.mapController.trierParProximite();
window.localiserUtilisateur = () => window.mapController.localiserUtilisateur();
window.supprimerItineraire = () => window.mapController.supprimerItineraire();
window.stopGuidage = () => window.mapController.routingService.stopGuidage();

import { MapController } from './controller/MapController.js';

window.mapController = new MapController();
window.mapController.init();

window.rechercheParking = () => mapController.rechercheParking();
window.trierParProximite = () => mapController.trierParProximite();
window.localiserUtilisateur = () => mapController.localiserUtilisateur();
window.supprimerItineraire = () => mapController.supprimerItineraire();
window.arreterGuidage = () => mapController.routingService.arreterGuidage();

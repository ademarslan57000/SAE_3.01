<?php
error_reporting(E_ALL);
ini_set('display_errors', 0); 
header('Content-Type: application/json');

session_start();

// 1. Vérification de l'authentification
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Utilisateur non connecté.']);
    exit;
}
$id_utilisateur = $_SESSION['user_id'];

// 2. Import des classes
try {
    require_once "../classes/connexion.class.php";
    require_once "../classes/vehicule.class.php";
    require_once "../classes/vehiculeDAO.class.php";
    require_once "../classes/reservation.class.php";
    require_once "../classes/reservationDAO.class.php";
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur chargement classes: ' . $e->getMessage()]);
    exit;
}

// 3. Récupération des données JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Données JSON invalides.']);
    exit;
}

$reservationDAO = new ReservationDAO();

// --- NOUVEAU : LOGIQUE DE SUPPRESSION ---
if (isset($data['action']) && $data['action'] === 'delete') {
    if (!isset($data['id_reservation'])) {
        echo json_encode(['success' => false, 'message' => 'ID de réservation manquant.']);
        exit;
    }

    $idRes = (int)$data['id_reservation'];
    // On utilise les deux arguments pour la sécurité comme défini dans ton DAO
    $success = $reservationDAO->delete($idRes, (int)$id_utilisateur);

    echo json_encode([
        'success' => $success,
        'message' => $success ? 'Réservation annulée.' : 'Erreur lors de l\'annulation.'
    ]);
    exit; // On arrête l'exécution ici pour ne pas lancer l'insertion
}

// --- LOGIQUE D'INSERTION EXISTANTE ---
if (!isset($data['parkingId'], $data['immatriculation'], $data['dateDebut'], $data['dateFin'])) {
    echo json_encode(['success' => false, 'message' => 'Données incomplètes pour la création.']);
    exit;
}

try {
    $vehiculeDAO = new VehiculeDAO();
    $typeMapping = [
        'voiture' => 1, 'moto' => 2, 'velo' => 3, 'pmr' => 1, 'electrique' => 1
    ];
    $typeRaw = $data['vehicleTypeRaw'] ?? 'voiture';
    $idType = $typeMapping[$typeRaw] ?? 1;

    $vehicule = $vehiculeDAO->getByImmatriculationAndUser($data['immatriculation'], $id_utilisateur);

    $nom = $_SESSION["user_nom"];
    $prenom = $_SESSION["user_prenom"];

    if ($vehicule === null) {
        $vehicule = new Vehicule();
        $vehicule->setNom("Véhicule de ". $nom . " ". $prenom);
        $vehicule->setImmatriculation($data['immatriculation']);
        $vehicule->setIdUtilisateur($id_utilisateur);
        $vehicule->setIdTypeVehicule($idType);
        $vehiculeDAO->insert($vehicule);
    }

    $reservation = new Reservation();
    $reservation->setIdUtilisateur($id_utilisateur);
    $reservation->setIdVehicule($vehicule->getId());
    $reservation->setIdParking($data['parkingId']);
    $reservation->setDateDebut($data['dateDebut']);
    $reservation->setDateFin($data['dateFin']);
    $reservation->setStatut('active');

    $reservationDAO->insert($reservation);

    echo json_encode(['success' => true, 'message' => 'Réservation confirmée avec succès !']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur technique : ' . $e->getMessage()]);
}
?>
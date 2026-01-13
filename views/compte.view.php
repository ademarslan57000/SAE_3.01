<?php
require_once "../api/compte.php";
// On inclut le DAO pour récupérer les réservations
require_once "../classes/reservationDAO.class.php";
require_once "../api/compte.php";

// On récupère la liste des réservations de l'utilisateur connecté
$reservationDAO = new ReservationDAO();
// On suppose que $user['id_utilisateur'] est disponible via compte.php, sinon on utilise $_SESSION['user_id']
$idUser = $_SESSION['user_id'] ?? $user['id_utilisateur'];
$mesReservations = $reservationDAO->getByUser($idUser);
?>

<!DOCTYPE html>
<html lang="fr">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title data-i18n="monCompte">Mon compte</title>
  <link rel="stylesheet" href="../assets/css/compte.css">
</head>

<body>

  <header class="compte-header">
    <div class="header-spacer"></div>
    <div class="header-center">
      <img src="../assets/image/logo.png" alt="Logo" class="header-logo">
      <h2 data-i18n="infoPerso">Mon Espace</h2>
    </div>
    <div class="header-right">
      <button class="btn-langue" onclick="changerLangue()" id="btn-langue">FR</button>
      <a href="index.html" class="btn" data-i18n="Retour">←
        Retour à la carte</a>
    </div>
  </header>

  <div class="container">

    <section class="account-card">
      <h3 data-i18n="infopersonelle">👤 Informations personnelles</h3>
      <div class="row">
        <label data-i18n="Nom">Nom</label>
        <div class="value"><?= htmlspecialchars($user['nom']) ?></div>
      </div>
      <div class="row">
        <label data-i18n="Prenom">Prénom</label>
        <div class="value"><?= htmlspecialchars($user['prenom']) ?></div>
      </div>
      <div class="row">
        <label data-i18n="Adresse">Adresse</label>
        <div class="value"><?= htmlspecialchars($user['adresse']) ?></div>
      </div>
      <div class="row">
        <label data-i18n="Telephone">Téléphone</label>
        <div class="value"><?= htmlspecialchars($user['tel']) ?></div>
      </div>
      <div class="row">
        <label data-i18n="Email">Email</label>
        <div class="value"><?= htmlspecialchars($user['mail']) ?></div>
      </div>
    </section>

    <section class="account-card margin-top">
      <h3 data-i18n="mesReservations">🅿️ Mes Réservations</h3>

      <?php if (empty($mesReservations)): ?>
        <p class="no-reservation" data-i18n="aucuneReservation">Aucune réservation en cours.</p>
      <?php else: ?>
        <div class="table-wrapper">
          <table class="reservations-table">
            <thead>
              <tr>
                <th data-i18n="parking">Parking</th>
                <th data-i18n="vehicule">Véhicule</th>
                <th data-i18n="du">Du</th>
                <th data-i18n="au">Au</th>
                <th data-i18n="action">Action</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($mesReservations as $res): ?>
                <?php
                // Formatage des dates pour l'affichage (ex: 12/01 à 14:30)
                $debut = new DateTime($res['date_debut']);
                $fin = new DateTime($res['date_fin']);
                ?>
                <tr>
                  <td>
                    <strong><?= htmlspecialchars($res['nom_parking']) ?></strong>
                  </td>
                  <td><?= htmlspecialchars($res['immatriculation']) ?></td>
                  <td><?= $debut->format('d/m H:i') ?></td>
                  <td><?= $fin->format('d/m H:i') ?></td>
                  <td>
                    <button class="btn-delete" onclick="annulerReservation(<?= $res['id_reservation'] ?>)">
                      🗑️ Annuler
                    </button>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php endif; ?>
    </section>

  </div>

  <script src="../assets/js/translation/compte.translation.js"></script>

  <script>
    async function annulerReservation(idReservation) {
    if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

    try {
        // Le chemin remonte de views/ vers le dossier parent, puis entre dans auth/
        const response = await fetch('../api/reservation.php', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete',
                id_reservation: idReservation
            })
        });

        const text = await response.text(); // On récupère le texte brut d'abord
        console.log("Réponse du serveur :", text);

        const result = JSON.parse(text); // On transforme en JSON seulement si c'est possible

        if (result.success) {
            alert("✅ " + result.message);
            window.location.reload();
        } else {
            alert("❌ Erreur : " + result.message);
        }
    } catch (error) {
        console.error("Erreur de parsing ou réseau :", error);
        alert("Erreur technique. Regardez la console (F12) pour voir le message d'erreur PHP.");
    }
}
  </script>

</body>

</html>
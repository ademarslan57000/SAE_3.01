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

  <style>
    .reservations-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    .reservations-table th,
    .reservations-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    .reservations-table th {
      background-color: #f8f9fa;
      color: #333;
      font-weight: 600;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: bold;
    }

    .status-active {
      background: #d4edda;
      color: #155724;
    }

    .status-annulee {
      background: #f8d7da;
      color: #721c24;
    }

    .btn-delete {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-delete:hover {
      background: #c0392b;
    }
  </style>
</head>

<body>

  <header
    style="background: white; padding: 20px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
    <div style="width: 160px;"></div>
    <div style="display: flex; align-items: center; gap: 15px; justify-content: center; flex: 1;">
      <img src="../assets/image/logo.png" alt="Logo" style="height: 50px;">
      <h2 data-i18n="infoPerso" style="margin: 0; color: #333; font-size: 28px;">Mon Espace</h2>
    </div>
    <div style="display: flex; gap: 15px;">
      <button class="btn-langue" onclick="changerLangue()" id="btn-langue">FR</button>
      <a href="index.html" class="btn" data-i18n="Retour"
        style="padding: 10px 20px; background: linear-gradient(90deg, #00d0ff, #006aff); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">←
        Retour à la carte</a>
    </div>
  </header>

  <div class="container">

    <section class="account-card">
      <h3 style="margin-top: 0; color: #006aff;" data-i18n="infopersonelle">👤 Informations personnelles</h3>
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

    <section class="account-card" style="margin-top: 30px;">
      <h3 style="margin-top: 0; color: #006aff;" data-i18n="mesReservations">🅿️ Mes Réservations</h3>

      <?php if (empty($mesReservations)): ?>
        <p style="color: #666; font-style: italic;" data-i18n="aucuneReservation">Aucune réservation en cours.</p>
      <?php else: ?>
        <div style="overflow-x: auto;">
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
<?php require_once "../auth/compte.php"; ?>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title data-i18n="monCompte">Mon compte</title>
  <link rel="stylesheet" href="../css/compte.css">
</head>
<body>

<img src="../image/logo.png" alt="Logo">
<h2 data-i18n="infoPerso">Informations personnelles</h2>


<div class="container">
  <section class="account-card">

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

    <!-- Sélecteur de langue -->
    <select id="lang-selector" class="dropdown-btn">
      <option value="fr">Français</option>
      <option value="en">English</option>
    </select>

    <!-- Bouton Retour -->
    <a href="../index.html" class="btn" data-i18n="Retour">Retour à la carte</a>

  </section>
</div>

<script src="../js/compte.translation.js"></script>
</body>
</html>

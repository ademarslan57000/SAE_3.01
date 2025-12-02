<?php
// inscription.php
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscription</title>
    <link rel="stylesheet" href="inscription.css">
</head>
<body class="light">

<h1>Inscription</h1>

<div class="container">
    <section>
        <h2>Créer un compte</h2>

        <form action="inscription.php" method="post" class="form">

            <div class="row">
                <div class="col">
                    <p>Nom</p>
                    <input type="text" name="lastname" placeholder="Nom" required>
                </div>

                <div class="col">
                    <p>Prénom</p>
                    <input type="text" name="firstname" placeholder="Prénom" required>
                </div>
            </div>

            <p>Email</p>
            <input type="email" name="email" placeholder="Votre email" required>

            <p>Mot de passe</p>
            <input type="password" name="password" placeholder="Votre mot de passe" required>

            <input type="submit" name="register" value="S'inscrire">

            <a href="connexion.view.php">Déjà un compte ?</a>
        </form>
    </section>
</div>

<div class="theme-toggle">
    <input type="button" id="themeBtn" value="☀️ / 🌙">
</div>

<script src="inscription.js"></script>

</body>
</html>

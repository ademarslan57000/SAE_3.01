<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Parking</title>
    <link rel="stylesheet" href="connexion.css">
</head>
<body class="light">

    <h1>Smart Parking</h1>

    <div class="container">
        <section>
            <h2>Se connecter</h2>

            <form action="connexion.php" method="post" class="form">
                <p>Entrez votre identifiant</p>
                <input type="text" name="identifiant" placeholder="Votre identifiant" required>

                <p>Entrez votre mot de passe</p>
                <input type="password" name="password" placeholder="Votre mot de passe" required>

                <input type="submit" name="login" value="Se connecter">

                <a href="inscription.view.php">Pas encore de compte ?</a>
            </form>
        </section>
    </div>
    <div class="toggle-wrapper">
                    <input type="button" id="themeToggle" value="☀️ / 🌙">
                </div>

    <script src="connexion.js"></script>
</body>
</html>

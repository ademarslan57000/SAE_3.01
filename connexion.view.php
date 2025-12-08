<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion</title>
    <link rel="stylesheet" href="connexion.css">
</head>

<body class="light">

    <h1>Smart Parking</h1>

    <div class="container">
        <section>
            <h2>Se connecter</h2>

            <form action="connexion.php" method="post" class="form">

                <p>Email</p>
                <input type="email" name="email" placeholder="Entrez votre email" required>

                <p>Mot de passe</p>
                <input type="password" name="password" placeholder="Entrez votre mot de passe" required>

                <input type="submit" name="login" value="Se connecter">

                <a href="inscription.view.php">Pas encore de compte ?</a>
            </form>

        </section>
    </div>

    <script src="connexion.js"></script>
</body>

</html>
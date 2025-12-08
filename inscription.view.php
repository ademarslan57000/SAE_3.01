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
                        <input type="text" name="lastname" required>
                    </div>
                    <div class="col">
                        <p>Prénom</p>
                        <input type="text" name="firstname" required>
                    </div>
                </div>

                <p>Adresse</p>
                <input type="text" name="adresse" required>

                <p>Téléphone</p>
                <input type="text" name="tel" required>

                <p>Email</p>
                <input type="email" name="email" required>

                <p>Mot de passe</p>
                <input type="password" name="password" required>

                <input type="submit" name="register" value="S'inscrire">

                <a href="connexion.view.php">Déjà un compte ?</a>
            </form>

        </section>
    </div>

    <script src="inscription.js"></script>
</body>

</html>
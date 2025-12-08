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
            <h2 data-i18n="seConnecter" ></h2>

            <form action="connexion.php" method="post" class="form">

                <p data-i18n="Email" ></p>
                <input type="email" name="identifiant" data-i18n-placeholder="identifiantPlaceholder" required>

                <p data-i18n="MotDePasse"></p>
                <input type="password" name="password" data-i18n-placeholder="passwordtPlaceholder" required>

                
                <input type="submit" name="login" data-i18n="Login">

                <a href="inscription.view.php" data-i18n="signupLink">Pas encore de compte ?</a>
            </form>
             <select id="lang-selector">
                <option value="fr">Français</option>
                <option value="en">English</option>
            </select>

        </section>
    </div>

    <script src="connexion.js"></script>
    <script src="connexion.translation.js"></script>
</body>

</html>
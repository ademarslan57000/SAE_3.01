<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-i18n= "TitleInscription" ></title>
    <link rel="stylesheet" href="inscription.css">
</head>

<body class="light">

    <h1 data-i18n ="Inscription">  </h1>

    <div class="container">
        <section>
            <h2 data-i18n ="creerCompte" ></h2>

            <form action="inscription.php" method="post" class="form">

                <div class="row">
                    <div class="col">
                        <p data-i18n="Nom"></p>
                        <input type="text" name="lastname" required>
                    </div>
                    <div class="col">
                        <p data-i18n="Prenom" ></p>
                        <input type="text" name="firstname" required>
                    </div>
                </div>

                <p data-i18n="Adresse"></p>
                <input type="text" name="adresse" required>

                <p data-i18n="Telephone" ></p>
                <input type="text" name="tel" required>

                <p data-i18n="Email"></p>
                <input type="email" name="email" required>

                <p data-i18n="MotDePasse" ></p>
                <input type="password" name="password" required>

                <input type="submit" name="register" data-i18n="Sinscrire">

                <a href="connexion.view.php" data-i18n="CompteExistant">Déjà un compte ?</a>
            </form>
            <select id="lang-selector" class="dropdown-btn">
    <option value="fr">Français</option>
    <option value="en">English</option>
</select>

        </section>
    </div>

    <script src="inscription.js"></script>
    <script src="inscription.translation.js"></script>
</body>

</html>
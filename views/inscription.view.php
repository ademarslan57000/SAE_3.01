<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-i18n="TitleInscription">Inscription</title>
    <link rel="stylesheet" href="../assets/css/inscription.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="center-wrapper">
        <div class="card-register">
            <div class="card-header">
                <h2 data-i18n="rejoindre">Rejoignez Smart Parking</h2>
                <p data-i18n="creerCompte"></p>
            </div>

            <form action="../api/inscription.php" method="post" class="form">

                <div class="row">
                    <div class="col">
                        <div class="input-group">
                            <label data-i18n="Nom">Nom</label>
                            <input type="text" name="lastname" required placeholder="Dupont">
                        </div>
                    </div>
                    <div class="col">
                        <div class="input-group">
                            <label data-i18n="Prenom">Prénom</label>
                            <input type="text" name="firstname" required placeholder="Jean">
                        </div>
                    </div>
                </div>
                <div class="input-group">

                    <label data-i18n="Adresse">Adresse</label>
                    <input type="text" name="adresse" required placeholder="Votre adresse complète"
                        data-i18n-placeholder="placeholderAdresse">
                </div>
                <div class="row">
                    <div class="col">
                        <div class="input-group">
                            <label data-i18n="Telephone">Téléphone</label>
                            <input type="text" name="tel" required placeholder="06 12 34 56 78">
                        </div>
                    </div>
                    <div class="col">
                        <div class="input-group">


                            <label data-i18n="Email">Email</label>
                            <input type="email" name="email" required placeholder="email@exemple.com"
                                data-i18n-placeholder="placeholderEmail">
                        </div>
                    </div>
                </div>
                <div class="input-group">


                    <label data-i18n="MotDePasse">Mot de passe</label>
                    <input type="password" name="password" required placeholder="••••••••">
                </div>


                <input type="submit" name="register" value="S'inscrire" data-i18n="Sinscrire" class="btn-submit">
                <div class="form-footer">
                    <span data-i18n="CompteExistant">Déjà un compte ?</span>
                    <a href="connexion.view.php" data-i18n="seConnecter">Se connecter</a>
                    <br>
                    <a href="../accueil.html"><u data-i18n="retourAccueil">Retour au site</u></a>
                </div>

            </form>
            <div class="lang-container">
                <select id="lang-selector">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                </select>
            </div>
        </div>

    </div>
    <div id="mySidebar" class="sidebar"></div>
    <script src="../assets/js/translation/inscription.translation.js"></script>
</body>

</html>
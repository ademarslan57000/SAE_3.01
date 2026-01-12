<?php session_start();

if (isset($_GET['lang']) && in_array($_GET['lang'], ['fr', 'en'])) {
    $_SESSION['lang'] = $_GET['lang'];
}
$lang = $_SESSION['lang'] ?? 'fr';

//traduction des erreurs 
$messages = [
    'fr' => [
        'incomplete' => 'Veuillez remplir tous les champs',
        'invalid_credentials' => 'Email ou mot de passe incorrect',
        'missing' => 'Informations manquantes',
        'default' => 'Une erreur est survenue'
    ],
    'en' => [
        'incomplete' => 'Please fill all fields',
        'invalid_credentials' => 'Invalid email or password',
        'missing' => 'Missing information',
        'default' => 'An error occured'
    ]
];
?>

<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-i18n="titleConnexion">Connexion</title>
    <link rel="stylesheet" href="../css/connexion.css">
</head>

<body>
    <div class="center-wrapper">
        <img src="../image/logo.png" alt="Logo" class="logo" style="max-width: 300px; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto; background: white; padding: 15px; border-radius: 10px;">
        <div class="card-login">
            <div class="card-header">
                <h2 data-i18n="bonRetour">Bon retour</h2>
                <p data-i18n="introduction">Connectez-vous pour accéder à votre espace.</p>
            </div>

            <?php if (isset($_GET['error'])): ?>
                <div class="error-message">
                    <?php
                    $errorKey = $_GET['error'];
                    $lang = $_SESSION['lang'] ?? 'fr';
                    echo htmlspecialchars($messages[$lang][$errorKey] ?? $messages[$lang]['default']);
                    ?>
                </div>
            <?php endif; ?>

            <form action="../auth/connexion.php" method="post" class="form">
                <div class="input-group">

                    <label data-i18n="Email"></label>
                    <input type="email" name="email" required placeholder="email@exemple.com"
                        data-i18n-placeholder="placeholderEmail">

                    <div class="label-row">
                        <label data-i18n="MotDePasse"></label>
                    </div>
                    <input type="password" name="password" required placeholder="••••••••">
                </div>


                <input type="submit" name="login" value="Se connecter" data-i18n="Login" class="btn-submit">

            </form>
            <div class="form-footer">
                <span data-i18n="pasDeCompte">Pas encore de compte ?</span>
                <a href="inscription.view.php" data-i18n="creerCompte">Créer un compte</a>
                <br>
                <a href="accueil.html"><u data-i18n="retourAccueil">Retour sur le site</u></a>
            </div>
            <div class="lang-container">
                <select id="lang-selector" class="dropdown-btn">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                </select>
            </div>
        </div>


    </div>
    <div id="mySidebar" class="sidebar"></div>
    <script src="../js/connexion.translation.js"></script>
</body>

</html>
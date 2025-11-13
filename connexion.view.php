<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parkings Metz</title>
    <link rel="stylesheet" href="connexion.css">
</header>
      
    <body>
    <h1>Parkings Metz</h1>
        <section>
            <h2>Se connecter</h2>
            <form action ="connexion.php" method ="post">
          <fieldset>
        <p>Entrez votre identifiant (nom d'utilisateur)</p>
        <input type="text" name="identifiant" placeholder="votre identifiant"/>
        <br/><br/>
        <p>Entrez votre mot de passe</p>
        <input type="text" name="password" placeholder="votre mot de passe"/>
        <br/><br/>
        <input type="submit" name="login" value="Se connecter"/>
        <a href="createAccount.php">Pas encore de compte ?</a>
       
  </body>
</html>

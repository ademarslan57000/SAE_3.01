<?php
session_start();
session_unset();
session_destroy();
header("Location: ../views/connexion.view.php?logged_out=1");
exit;
?>
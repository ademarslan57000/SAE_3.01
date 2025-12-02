<?php
$db_config['SGBD'] = 'mysql';
$db_config['HOST'] = 'devbdd.iutmetz.univ-lorraine.fr';
$db_config['DB_NAME'] = 'e11850u_parking';
$db_config['USER'] = 'e11850u_appli';
$db_config['PASSWORD'] = '32406254';
try {
    $db = new PDO(
        $db_config['SGBD'] . ':host=' . $db_config['HOST'] . ';dbname=' . $db_config['DB_NAME'] . ';charset=utf8mb4',
        $db_config['USER'],
        $db_config['PASSWORD'],
        array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
    );

    unset($db_config);
} catch (Exception $exception) {
    die($exception->getMessage());
}
?>
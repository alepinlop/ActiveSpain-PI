<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Rellena exactamente con lo que tengas en el panel
$host = 'sql313.infinityfree.com';
$db   = 'if0_40609679_proyecto_integrado';
$user = 'if0_40609679';
$pass = 'TYxzJSNjg2FpJeF';
$dsn = "mysql:host=$host;dbname=$db;charset=utf8";

try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    echo "Conexión OK a la BD: $db en host $host<br>";
    $r = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tablas: <pre>" . print_r($r, true) . "</pre>";
} catch (PDOException $e) {
    echo "<h3>Fallo de conexión</h3>";
    echo "<pre>" . $e->getMessage() . "</pre>";
    file_put_contents('db_error_log.txt', date('c') . " - " . $e->getMessage() . PHP_EOL, FILE_APPEND);
}

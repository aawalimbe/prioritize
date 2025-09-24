<?php
// Simple script to test MySQL connection using AMPPS defaults
require_once __DIR__ . '/../src/Config/database.php';

try {
    $pdo = getPDO();
    echo "Connection successful to MySQL via AMPPS!\n";
    // Optionally, list databases
    $stmt = $pdo->query("SHOW DATABASES;");
    $dbs = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Databases: " . implode(", ", $dbs) . "\n";
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}

<?php
declare(strict_types=1);

$dbHost = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: 'db';
$dbName = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?: 'weekly_mood';
$dbUser = $_ENV['DB_USER'] ?? getenv('DB_USER') ?: 'mood_user';
$dbPass = $_ENV['DB_PASS'] ?? getenv('DB_PASS') ?: 'mood_pass';

function getDB(): PDO
{
    global $dbHost, $dbName, $dbUser, $dbPass;
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $dbHost, $dbName);
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    return $pdo;
}

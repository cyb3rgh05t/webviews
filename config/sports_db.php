<?php
// includes/database.php
$dbFile = './databases/sports.db';

if (!file_exists($dbFile)) {
    if (!is_dir('./databases')) {
        mkdir('./databases', 0777, true);
    }
    $db = new SQLite3($dbFile);
} else {
    $db = new SQLite3($dbFile);
}

$db->busyTimeout(5000);

$tableName = "selections";
// Create the selections table if it does not exist in the main database
$db->exec("CREATE TABLE IF NOT EXISTS $tableName (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sport TEXT NOT NULL,
    country TEXT NOT NULL,
    league TEXT NOT NULL,
    league_id TEXT NOT NULL
)");

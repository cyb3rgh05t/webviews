<?php
// includes/database.php
$apiKeyDbFile = './databases/apiKeys.db';

if (!file_exists($apiKeyDbFile)) {
    if (!is_dir('./databases')) {
        mkdir('./databases', 0777, true);
    }
    $apiKeyDb = new SQLite3($apiKeyDbFile);
} else {
    $apiKeyDb = new SQLite3($apiKeyDbFile);
}

$apiKeyDb->busyTimeout(5000);

$tableName = "api_keys";

// Create the api_keys table if it does not exist
$apiKeyDb->exec("CREATE TABLE IF NOT EXISTS $tableName (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key TEXT NOT NULL
)");

// Insert the value 3 into the api_key field if it's the first time creating the table
$query = $apiKeyDb->query("SELECT COUNT(*) AS count FROM $tableName");
$row = $query->fetchArray();

if ($row['count'] == 0) {
    // Table is empty, so we insert the value 3 as the initial API key
    $stmt = $apiKeyDb->prepare("INSERT INTO $tableName (api_key) VALUES (:api_key)");
    $stmt->bindValue(':api_key', '3', SQLITE3_TEXT);
    $stmt->execute();
}

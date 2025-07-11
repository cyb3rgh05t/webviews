<?php
// includes/database.php
$dbFile = './databases/backdrop.db';

if (!file_exists($dbFile)) {
    if (!is_dir('./databases')) {
        mkdir('./databases', 0777, true);
    }
    $db = new SQLite3($dbFile);
} else {
    $db = new SQLite3($dbFile);
}

$db->busyTimeout(5000);

$tableName = "backdrops";
$db->exec("CREATE TABLE IF NOT EXISTS $tableName (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    backdrop_style TEXT NOT NULL
)");

$existingColumns = [];
$columnsResult = $db->query("PRAGMA table_info($tableName)");
while ($column = $columnsResult->fetchArray(SQLITE3_ASSOC)) {
    $existingColumns[] = $column['name'];
}

if (!in_array('url', $existingColumns)) {
    $db->exec("ALTER TABLE $tableName ADD COLUMN url TEXT");
}
if (!in_array('token', $existingColumns)) {
    $db->exec("ALTER TABLE $tableName ADD COLUMN token TEXT");
}
if (!in_array('key', $existingColumns)) {
    $db->exec("ALTER TABLE $tableName ADD COLUMN key TEXT");
}
if (!in_array('language', $existingColumns)) {
    $db->exec("ALTER TABLE $tableName ADD COLUMN language TEXT");
}

$checkRow = $db->query("SELECT COUNT(*) as count FROM $tableName WHERE id = 1");
$rowCount = $checkRow->fetchArray(SQLITE3_ASSOC)['count'] ?? 0;

if ($rowCount == 0) {
    $db->exec("INSERT INTO $tableName (id, backdrop_style, url, token, key, language) VALUES (1, 'tmdb', '', '', '', 'en-US')");
}

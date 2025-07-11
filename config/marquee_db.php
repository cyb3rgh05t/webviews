<?php
// config/marquee_db.php
$dbFile = './databases/marquee.db';

if (!file_exists($dbFile)) {
    if (!is_dir('./databases')) {
        mkdir('./databases', 0777, true);
    }
    $db = new SQLite3($dbFile);
} else {
    $db = new SQLite3($dbFile);
}

$db->busyTimeout(5000);

$tableName = "marquee";

// Create the marquee table if it does not exist
$db->exec("CREATE TABLE IF NOT EXISTS $tableName (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    header_t TEXT DEFAULT '',
    header_t_c TEXT DEFAULT '#ffffff',
    header_b_c TEXT DEFAULT '#000000',
    marquee_t_c TEXT DEFAULT '#000000',
    marquee_b_c TEXT DEFAULT '#ffffff',
    marquee_t TEXT DEFAULT ''
)");

// Check if initial record exists, if not create it
$checkRow = $db->query("SELECT COUNT(*) as count FROM $tableName WHERE id = 1");
$rowCount = $checkRow->fetchArray(SQLITE3_ASSOC)['count'] ?? 0;

if ($rowCount == 0) {
    $db->exec("INSERT INTO $tableName (id, header_t, header_t_c, header_b_c, marquee_t_c, marquee_b_c, marquee_t) 
               VALUES (1, '', '#ffffff', '#000000', '#000000', '#ffffff', '')");
}

<?php
try {
    $dbFile = '../databases/dashboard.db';

    // Create the databases directory if it doesn't exist
    if (!file_exists($dbFile)) {
        if (!is_dir('../databases')) {
            mkdir('../databases', 0777, true);
        }
        $db = new SQLite3($dbFile);
    } else {
        $db = new SQLite3($dbFile);
    }

    // Create users table if it doesn't exist
    $tableName = "users";
    $db->exec("CREATE TABLE IF NOT EXISTS $tableName (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )");

    // Insert admin account if no user exists
    $result = $db->querySingle("SELECT COUNT(*) as count FROM users");
    if ($result == 0) {
        $passwordHash = password_hash('admin', PASSWORD_DEFAULT);
        $db->exec("INSERT INTO users (username, password) VALUES ('admin', '$passwordHash')");
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

<?php
require '../config/db.php'; // Adjusted path for db.php

session_start();
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

// Check credentials
$stmt = $db->prepare("SELECT * FROM users WHERE username = :username");
$stmt->bindValue(':username', $username, SQLITE3_TEXT);
$result = $stmt->execute();
$user = $result->fetchArray(SQLITE3_ASSOC);

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user'] = $username;
    header('Location: ../dashboard.php'); // Adjusted path for dashboard redirection
    exit();
} else {
    // Redirect to login page with an error parameter on failed login
    header('Location: ../login.php?error=invalid_credentials'); // Adjusted path for login redirection
    exit();
}

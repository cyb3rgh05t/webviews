<?php
require '../config/db.php';
session_start();

header('Content-Type: application/json'); // Ensure JSON output

if (!isset($_SESSION['user'])) {
    echo json_encode(['type' => 'danger', 'message' => 'You are not logged in.']);
    exit();
}

$newUsername = $_POST['username'] ?? '';
$newPassword = $_POST['password'] ?? '';

// Validate input
if (empty($newUsername) || empty($newPassword)) {
    echo json_encode(['type' => 'danger', 'message' => 'Please fill in all fields.']);
    exit();
}

try {
    // Hash the new password
    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update the user credentials in the database
    $stmt = $db->prepare("UPDATE users SET username = :username, password = :password WHERE username = :currentUser");
    $stmt->bindValue(':username', $newUsername, SQLITE3_TEXT);
    $stmt->bindValue(':password', $passwordHash, SQLITE3_TEXT);
    $stmt->bindValue(':currentUser', $_SESSION['user'], SQLITE3_TEXT);

    // Execute the update
    $result = $stmt->execute();

    if ($result) {
        $_SESSION['user'] = $newUsername; // Update the session username
        echo json_encode(['type' => 'success', 'message' => 'Credentials updated successfully.']);
    } else {
        echo json_encode(['type' => 'danger', 'message' => 'Failed to update credentials.']);
    }
} catch (Exception $e) {
    echo json_encode(['type' => 'danger', 'message' => 'Error: ' . $e->getMessage()]);
}

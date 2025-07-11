<?php
session_start();
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <?php include 'includes/header.php'; ?>
    <title>Dashboard</title>
</head>

<body class="bg-dark">
    <div id="progress-bar" style="display: none;"></div>

    <?php include 'includes/sidebar.php'; ?>
    <?php include 'includes/navbar.php'; ?>

    <!-- Main content area -->
    <div class="content container-fluid" id="main-content">
    </div>

    <?php include 'includes/footer.php'; ?>

</body>

</html>
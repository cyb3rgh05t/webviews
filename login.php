<?php
// Start the session to capture any error message
session_start();
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <?php include 'includes/header.php'; ?>
    <title>Webviews Control Panel</title>
</head>

<body class="bg-dark text-white">
    <div class="container d-flex flex-column align-items-center justify-content-center vh-100">
    <!-- Logo centered above the card -->
    <img src="assets/images/logo.png" alt="StreamNet Logo" style="width: 500px; height: auto; margin-bottom: 50px;">
    
    <div class="card bg-dark text-white" style="width: 100%; max-width: 400px;">
        
        <div class="card-body">
            <form action="includes/authenticate.php" method="POST">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" class="form-control bg-dark text-white" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" class="form-control bg-dark text-white" id="password" name="password" required>
                </div>
                <button type="submit" class="btn btn-warning btn-block mt-3">Login</button>
            </form>
            <div id="notificationLogin" class="notification-login" style="display:none;"></div>
        </div>
    </div>
</div>
    <footer id="footer" class="footer-login">
    <div class="container text-center">
        <span>&copy; 2014 - <?php echo date("Y"); ?> StreamNet Club - All rights reserved.</span>
    </div>
</footer>
    <!-- Link to the external JavaScript file -->
    <script src="assets/js/notifications.js"></script>
</body>

</html>
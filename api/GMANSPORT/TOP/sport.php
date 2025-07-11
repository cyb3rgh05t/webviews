<?php
// sports.php

// Ensure no caching issues
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
header("Content-Type: text/html; charset=UTF-8");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sports Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        iframe {
            border: 1px solid #ccc; /* Smaller border */
            width: 100%;
            height: 100vh; /* Full height of the viewport */
        }
    </style>
</head>
<body>
    <div class="content">
        <!-- Embed sports-related content -->
        <iframe src="https://www.livescore.bz/en-gb/"></iframe>
    </div>
</body>
</html>

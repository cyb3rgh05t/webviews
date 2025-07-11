<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TMDb Backdrop</title>
    <link rel="stylesheet" href="../assets/css/backdrop_nc.css">
</head>

<body>
    <div class="container">
        <!-- Your slider content here -->
    </div>

    <!-- Load the PHP file via AJAX -->
    <script>
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'tmdbDrop.php', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // Handle the response here if needed
                console.log(xhr.responseText);
            }
        };
        xhr.send();
    </script>

    <!-- Include your JavaScript file for additional functionality -->
    <script src="../assets/js/tmdbDrop.js"></script>
</body>

</html>
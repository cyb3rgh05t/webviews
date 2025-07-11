<?php
// Connect to the SQLite database
$db = new SQLite3('../databases/backdrop.db');

// Query to retrieve the backdrop style from the 'api_key' table
$query = "SELECT backdrop_style FROM backdrops LIMIT 1";
$result = $db->querySingle($query);

// Close the database connection
$db->close();

// Determine which HTML content to display based on the retrieved backdrop style
if ($result == 'tmdb') {
    include 'tmdb_nc.php'; // Include content for TMDB backdrop
} else {
    include 'plex_nc.php'; // Include content for Plex backdrop (assuming this is defined)
}

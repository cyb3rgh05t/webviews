<?php
// Define the database file paths
$apiKeyDbFile = '../databases/apiKeys.db';
// Connect to the API key database
$apiKeyDb = new SQLite3($apiKeyDbFile);
// Retrieve the API key for global access in JavaScript
$apiKey = $apiKeyDb->querySingle("SELECT api_key FROM api_keys WHERE id = 1");
#
$sport = $_GET['sport'];  // Get the sport parameter from the client-side request
$apiUrl = "https://www.thesportsdb.com/api/v1/json/{$apiKey}/all_countries.php?s=" . urlencode($sport);

// Make the request to the external API
$response = file_get_contents($apiUrl);
if ($response === FALSE) {
    echo json_encode(['error' => 'Failed to fetch countries']);
    exit;
}

// Return the response data to the client
echo $response;

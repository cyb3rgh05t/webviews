<?php
// Define the database file paths
$apiKeyDbFile = '../databases/apiKeys.db';

// Connect to the API key database
$apiKeyDb = new SQLite3($apiKeyDbFile);

// Retrieve the API key for global access in JavaScript
$apiKey = $apiKeyDb->querySingle("SELECT api_key FROM api_keys WHERE id = 1");

// Log the API key to ensure it is correct
error_log("API Key retrieved: " . $apiKey);

// Define the URL to fetch sports data from the external API
$apiUrl = "https://www.thesportsdb.com/api/v1/json/{$apiKey}/all_sports.php";

// Make the request to the external API
$response = @file_get_contents($apiUrl);

// Log the raw response to check if the external request is working
error_log("Raw response from API: " . $response);

// If the API request failed, return an error
if ($response === FALSE) {
    error_log("Error: Failed to fetch sports data from API");
    echo json_encode(['error' => 'Failed to fetch sports data']);
    exit;
}

// Return the response data to the client
echo $response;

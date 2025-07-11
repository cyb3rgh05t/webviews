<?php
if (!isset($_GET['url'])) {
    die('URL not specified.');
}

$url = $_GET['url'];

// Validate the URL
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    die('Invalid URL.');
}

// Initialize a cURL session
$ch = curl_init($url);

// Set cURL options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

// Execute the cURL request
$response = curl_exec($ch);

// Check for errors
if ($response === false) {
    die('Error fetching the URL.');
}

// Get the content type
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

// Close the cURL session
curl_close($ch);

// Set the appropriate content type header
header('Content-Type: ' . $contentType);

// Output the response
echo $response;

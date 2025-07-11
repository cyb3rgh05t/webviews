<?php
// Combined Plex Backdrop Viewer Script
// Handles all functionality in a single file

// Check if the request is for media data only
if (isset($_GET['action']) && $_GET['action'] === 'media') {
    // Return the media data as JSON
    header('Content-Type: application/json');
    echo json_encode(fetchMediaLibrary());
    exit;
}

// Check if the request is for the proxy functionality
if (isset($_GET['proxy_url'])) {
    // Handle proxy request
    $url = $_GET['proxy_url'];

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
    exit;
}

// Error Logging Function
function logError($message, $context = [])
{
    $logEntry = json_encode([
        'timestamp' => date('Y-m-d H:i:s'),
        'message' => $message,
        'context' => $context
    ]) . PHP_EOL;

    file_put_contents('media_fetcher_error.log', $logEntry, FILE_APPEND);
}

// Safe Curl Request Wrapper
function safeCurlRequest($url, $headers = [], $method = 'GET', $postData = null)
{
    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => $headers
    ]);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($postData) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        }
    }

    $response = curl_exec($ch);

    if ($response === false) {
        $error = curl_error($ch);
        logError('Curl Request Failed', [
            'url' => $url,
            'error' => $error
        ]);
        curl_close($ch);
        throw new Exception("Curl request failed: $error");
    }

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        logError('HTTP Request Failed', [
            'url' => $url,
            'http_code' => $httpCode
        ]);
        throw new Exception("HTTP request failed with code $httpCode");
    }

    return $response;
}

// Fetch Plex Media TMDB ID
function fetchTmdbMediaId($id, $plexToken, $plexServerUrl)
{
    $url = "http://$plexServerUrl/library/metadata/$id?checkFiles=1&X-Plex-Token=$plexToken";

    try {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ["X-Plex-Token: $plexToken"],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ]);

        $response = curl_exec($curl);

        if ($response === false) {
            throw new Exception('Error fetching data from Plex server: ' . curl_error($curl));
        }
        curl_close($curl);

        $xml = simplexml_load_string($response);
        if ($xml === false) {
            throw new Exception('Error parsing XML response.');
        }

        // Iterate through the XML to find the TMDB ID
        foreach ($xml->Video->Guid as $guid) {
            $guidValue = (string) $guid['id'];
            if (preg_match('/tmdb:\/\/(\d+)/', $guidValue, $matches)) {
                return $matches[1]; // Return the TMDB ID
            }
        }

        return null; // Return null if no TMDB ID is found
    } catch (Exception $e) {
        logError('TMDB ID Fetch Failed', [
            'plex_id' => $id,
            'error' => $e->getMessage()
        ]);
        return null;
    }
}

// Fetch Media Logo from TMDb
function fetchTmdbMediaLogo($tmdb_id, $tmdbApi, $fallbackLogoUrl, $preferredLogoLanguages, $type = 'movie')
{
    $url = "https://api.themoviedb.org/3/{$type}/{$tmdb_id}?api_key={$tmdbApi}&append_to_response=images";

    try {
        $response = safeCurlRequest($url);
        $data = json_decode($response, true);

        // Check if data is empty or the required keys are missing
        if (empty($data) || !isset($data['images']) || !isset($data['images']['logos']) || empty($data['images']['logos'])) {
            return $fallbackLogoUrl;
        }

        // Filter logos by preferred languages
        $logos = $data['images']['logos'];
        $selectedLogo = null;

        // Iterate over the preferred languages in priority order
        foreach ($preferredLogoLanguages as $language) {
            foreach ($logos as $logo) {
                if ($logo['iso_639_1'] === $language) {
                    $selectedLogo = $logo;
                    break 2;
                }
            }
        }

        // If no logo matches the preferred languages, just take the first one
        if (!$selectedLogo && !empty($logos)) {
            $selectedLogo = $logos[0];
        }

        // Return the selected logo URL or the fallback
        return $selectedLogo
            ? "https://image.tmdb.org/t/p/original" . $selectedLogo['file_path']
            : $fallbackLogoUrl;
    } catch (Exception $e) {
        logError('Media Logo Fetch Failed', [
            'tmdb_id' => $tmdb_id,
            'type' => $type,
            'error' => $e->getMessage()
        ]);
        return $fallbackLogoUrl;
    }
}

// Fetch Media Poster from TMDb
function fetchTmdbMediaPoster($tmdb_id, $tmdbApi, $fallbackPosterUrl, $preferredPosterLanguages, $type = 'movie')
{
    $url = "https://api.themoviedb.org/3/{$type}/{$tmdb_id}?api_key={$tmdbApi}&append_to_response=images";

    try {
        $response = safeCurlRequest($url);
        $data = json_decode($response, true);

        // Check if data is empty or the required keys are missing
        if (empty($data) || !isset($data['images']) || !isset($data['images']['posters']) || empty($data['images']['posters'])) {
            return $fallbackPosterUrl;
        }

        // Filter posters by preferred languages
        $posters = $data['images']['posters'];
        $selectedPoster = null;

        // Iterate over the preferred languages in priority order
        foreach ($preferredPosterLanguages as $language) {
            foreach ($posters as $poster) {
                if ($poster['iso_639_1'] === $language) {
                    $selectedPoster = $poster;
                    break 2;
                }
            }
        }

        // If no poster matches the preferred languages, just take the first one
        if (!$selectedPoster && !empty($posters)) {
            $selectedPoster = $posters[0];
        }

        // Return the selected poster URL or the fallback
        return $selectedPoster
            ? "https://image.tmdb.org/t/p/original" . $selectedPoster['file_path']
            : $fallbackPosterUrl;
    } catch (Exception $e) {
        logError('Media Poster Fetch Failed', [
            'tmdb_id' => $tmdb_id,
            'type' => $type,
            'error' => $e->getMessage()
        ]);
        return $fallbackPosterUrl;
    }
}

// Fetch Media Backdrop from TMDb
function fetchTmdbMediaBackdrop($tmdb_id, $tmdbApi, $fallbackBackdropUrl, $preferredBackdropLanguages, $type = 'movie')
{
    $url = "https://api.themoviedb.org/3/{$type}/{$tmdb_id}?api_key={$tmdbApi}&append_to_response=images";

    try {
        $response = safeCurlRequest($url);
        $data = json_decode($response, true);

        // Check if data is empty or the required keys are missing
        if (empty($data) || !isset($data['images']) || !isset($data['images']['backdrops']) || empty($data['images']['backdrops'])) {
            return $fallbackBackdropUrl;
        }

        // Filter backdrops by preferred languages
        $backdrops = $data['images']['backdrops'];
        $selectedBackdrop = null;

        // Iterate over the preferred languages in priority order
        foreach ($preferredBackdropLanguages as $language) {
            foreach ($backdrops as $backdrop) {
                if ($backdrop['iso_639_1'] === $language) {
                    $selectedBackdrop = $backdrop;
                    break 2;
                }
            }
        }

        // If no backdrop matches the preferred languages, just take the first one
        if (!$selectedBackdrop && !empty($backdrops)) {
            $selectedBackdrop = $backdrops[0];
        }

        // Return the selected backdrop URL or the fallback
        return $selectedBackdrop
            ? "https://image.tmdb.org/t/p/original" . $selectedBackdrop['file_path']
            : $fallbackBackdropUrl;
    } catch (Exception $e) {
        logError('Media Backdrop Fetch Failed', [
            'tmdb_id' => $tmdb_id,
            'type' => $type,
            'error' => $e->getMessage()
        ]);
        return $fallbackBackdropUrl;
    }
}

// Fetch Media Details from TMDb with language fallback
function fetchTmdbMediaDetails($tmdb_id, $type, $tmdbApi, $config)
{
    // First, try the primary language
    $primaryData = fetchTmdbMediaDetailsInLanguage($tmdb_id, $type, $tmdbApi, $config['tmdbDetailsLanguage']);

    // Check if we need to fall back to the secondary language
    $needsFallback = false;

    // Check if overview is empty
    if (empty($primaryData['subtitle']) && $config['languageFallbackEnabled']) {
        $needsFallback = true;
    }

    // Check if title is empty
    if (empty($primaryData['tmdb_title']) && $config['languageFallbackEnabled']) {
        $needsFallback = true;
    }

    // If we need fallback data, fetch it
    if ($needsFallback) {
        $fallbackData = fetchTmdbMediaDetailsInLanguage($tmdb_id, $type, $tmdbApi, $config['fallbackLanguage']);

        // Merge fallback data only for missing fields
        if (empty($primaryData['subtitle'])) {
            $primaryData['subtitle'] = $fallbackData['subtitle'] ?? $config['fallbackSummary'];
        }

        if (empty($primaryData['tmdb_title'])) {
            $primaryData['tmdb_title'] = $fallbackData['tmdb_title'] ?? $config['fallbackTitle'];
        }
    }

    // Apply fallback text if still empty
    if (empty($primaryData['subtitle'])) {
        $primaryData['subtitle'] = $config['fallbackSummary'];
    }

    if (empty($primaryData['tmdb_title'])) {
        $primaryData['tmdb_title'] = $config['fallbackTitle'];
    }

    return $primaryData;
}

// Helper function to fetch TMDb details in a specific language
function fetchTmdbMediaDetailsInLanguage($tmdb_id, $type, $tmdbApi, $language)
{
    $url = "https://api.themoviedb.org/3/{$type}/{$tmdb_id}?api_key={$tmdbApi}&language={$language}";

    try {
        $response = safeCurlRequest($url);
        $data = json_decode($response, true);

        return [
            'subtitle' => $data['overview'] ?? '', // Plot summary
            'release_date' => $type === 'movie'
                ? ($data['release_date'] ?? '')
                : ($data['first_air_date'] ?? ''),
            'genres' => array_map(function ($genre) {
                return $genre['name'];
            }, $data['genres'] ?? []),
            'rating' => $data['vote_average'] ?? null,
            'tmdb_title' => $type === 'movie'
                ? ($data['title'] ?? '')
                : ($data['name'] ?? '')
        ];
    } catch (Exception $e) {
        logError('TMDb Media Details Fetch Failed', [
            'tmdb_id' => $tmdb_id,
            'type' => $type,
            'language' => $language,
            'error' => $e->getMessage()
        ]);

        return [
            'subtitle' => '',
            'release_date' => '',
            'genres' => [],
            'rating' => null,
            'tmdb_title' => ''
        ];
    }
}

// Fetch Media from Plex
function fetchPlexMediaItems($url, $plexToken, $plexServerUrl, $tmdbApi, $config, $type = 'movie')
{
    try {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ["X-Plex-Token: $plexToken"],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ]);

        $response = curl_exec($curl);

        if ($response === false) {
            throw new Exception('Error fetching data from Plex server: ' . curl_error($curl));
        }
        curl_close($curl);

        $xml = simplexml_load_string($response);
        if ($xml === false) {
            throw new Exception('Error parsing XML response.');
        }

        $items = [];
        $mediaElements = $type === 'movie' ? $xml->Video : $xml->Directory;

        foreach ($mediaElements as $media) {
            $id = (string) $media['ratingKey'];
            $tmdb = fetchTmdbMediaId($id, $plexToken, $plexServerUrl);

            if (!$tmdb) {
                continue; // Skip items without TMDB ID
            }

            // Fetch additional details from TMDb
            $tmdbDetails = fetchTmdbMediaDetails($tmdb, $type, $tmdbApi, $config);

            // Use TMDb title
            $title = $tmdbDetails['tmdb_title'];

            // Fetch images with appropriate fallbacks
            $logo = fetchTmdbMediaLogo($tmdb, $tmdbApi, $config['fallbackLogoUrl'], $config['preferredLogoLanguages'], $type);
            $thumb = fetchTmdbMediaPoster($tmdb, $tmdbApi, $config['fallbackPosterUrl'], $config['preferredPosterLanguages'], $type);
            $art = fetchTmdbMediaBackdrop($tmdb, $tmdbApi, $config['fallbackBackdropUrl'], $config['preferredBackdropLanguages'], $type);

            // Modified URL to use our own script with proxy parameter
            $url = "?proxy_url=" . urlencode("http://$plexServerUrl/web/index.html#!/server/$id/details?key=%2Flibrary%2Fmetadata%2F$id");

            $items[] = [
                "plex_id" => $id,
                "tmdb_id" => $tmdb,
                "logo" => $logo,
                "title" => $title,
                "subtitle" => $tmdbDetails['subtitle'],
                "image" => $art,
                "artWork" => $thumb,
                "url" => $url,
                "date" => $tmdbDetails['release_date'] ?? (string) $media['originallyAvailableAt'],
                "genres" => $tmdbDetails['genres'],
                "rating" => $tmdbDetails['rating']
            ];
        }

        return $items;
    } catch (Exception $e) {
        logError('Plex Media Fetch Failed', [
            'url' => $url,
            'type' => $type,
            'error' => $e->getMessage()
        ]);
        return [];
    }
}

// Media Library Fetching Function
function fetchMediaLibrary()
{
    // Increase maximum execution time
    set_time_limit(0);

    // Define cache settings
    $cache_folder = 'cache/';
    $cache_file = $cache_folder . 'plex_cache.json';
    $cache_duration = 24 * 60 * 60; // 24 hours

    // Create cache folder if it doesn't exist
    if (!file_exists($cache_folder)) {
        if (!mkdir($cache_folder, 0777, true)) {
            logError('Cache Folder Creation Failed');
            return [];
        }
    }

    try {
        // CONFIGURATION - Replace with your own values
        // ============================================
        // API Credentials
        $plexToken = 'x8yJUzJT69PjcK2ukb9s'; // Your Plex Token
        $plexServerUrl = '172.99.188.12:32400'; // e.g., '192.168.1.100:32400'
        $tmdbApi = 'e7d2628727fa893ec3692d18f8a4aec2'; // Your TMDb API Key

        // Language and Fallback Configuration
        $config = [
            // Primary language for TMDb details (plot, title, etc)
            'tmdbDetailsLanguage' => 'de-DE', // Language code for TMDb API (e.g., 'en-US', 'de-DE')

            // Language fallback settings
            'languageFallbackEnabled' => true, // Set to false to disable language fallback
            'fallbackLanguage' => 'en-US', // Fallback language if primary language has no data

            // Text fallbacks if no data is available in any language
            'fallbackTitle' => 'Unknown Title', // Used if no title is found in any language
            'fallbackSummary' => 'No description available.', // Used if no summary is found

            // Image fallbacks (with recommended dimensions)
            // Logo: Transparent PNG, typically 500px to 800px wide, variable height
            'fallbackLogoUrl' => 'https://app.streamnet.live/pics/streamnet_tv.png',

            // Poster: 2:3 ratio (e.g., 500x750px or 1000x1500px)
            'fallbackPosterUrl' => 'https://app.streamnet.live/pics/poster_placeholder.jpg',

            // Backdrop: 16:9 ratio (e.g., 1920x1080px or 3840x2160px for 4K)
            'fallbackBackdropUrl' => 'https://app.streamnet.live/pics/backdrop_placeholder.jpg',

            // Preferred languages for logos (in order of preference)
            // Use null for language-neutral images
            'preferredLogoLanguages' => ['de', 'en', 'fr', null],

            // Preferred languages for posters (in order of preference)
            'preferredPosterLanguages' => [null, 'en', 'de', 'fr'],

            // Preferred languages for backdrops (in order of preference)
            'preferredBackdropLanguages' => [null, 'en', 'de', 'fr']
        ];
        // ============================================

        // Check if cached data is still valid
        if (file_exists($cache_file) && time() - filemtime($cache_file) < $cache_duration) {
            // Use cached data
            $cached_data = file_get_contents($cache_file);
            $combined_data = json_decode($cached_data, true);
        } else {
            // URLs for different media sections
            $movies_url = "http://$plexServerUrl/library/sections/2/all?type=1&sort=originallyAvailableAt:desc&originallyAvailableAt>>=-1y&limit=20&X-Plex-Token=$plexToken";
            $moviesMarvel_url = "http://$plexServerUrl/library/sections/1/all?type=1&sort=originallyAvailableAt:desc&originallyAvailableAt>>=-1y&limit=2&X-Plex-Token=$plexToken";
            $moviesDc_url = "http://$plexServerUrl/library/sections/3/all?type=1&sort=originallyAvailableAt:desc&originallyAvailableAt>>=-1y&limit=2&X-Plex-Token=$plexToken";
            $moviesBond_url = "http://$plexServerUrl/library/sections/4/all?type=1&sort=originallyAvailableAt:desc&originallyAvailableAt>>=-1y&limit=1&X-Plex-Token=$plexToken";
            $moviesAnimation_url = "http://$plexServerUrl/library/sections/12/all?type=1&sort=originallyAvailableAt:desc&originallyAvailableAt>>=-1y&limit=3&X-Plex-Token=$plexToken";
            $series_url = "http://$plexServerUrl/library/sections/10/all?type=2&sort=originallyAvailableAt:desc&originallyAvailableAt>>=-1y&limit=10&X-Plex-Token=$plexToken";
            $seriesAnimation_url = "http://$plexServerUrl/library/sections/11/all?type=2&sort=originallyAvailableAt:desc&originallyAvailableAt>>=-2y&limit=2&X-Plex-Token=$plexToken";

            // Fetch media items from different categories
            $movies = fetchPlexMediaItems($movies_url, $plexToken, $plexServerUrl, $tmdbApi, $config, 'movie');
            $moviesMarvel = fetchPlexMediaItems($moviesMarvel_url, $plexToken, $plexServerUrl, $tmdbApi, $config, 'movie');
            $moviesDc = fetchPlexMediaItems($moviesDc_url, $plexToken, $plexServerUrl, $tmdbApi, $config, 'movie');
            $moviesBond = fetchPlexMediaItems($moviesBond_url, $plexToken, $plexServerUrl, $tmdbApi, $config, 'movie');
            $moviesAnimation = fetchPlexMediaItems($moviesAnimation_url, $plexToken, $plexServerUrl, $tmdbApi, $config, 'movie');
            $series = fetchPlexMediaItems($series_url, $plexToken, $plexServerUrl, $tmdbApi, $config, 'tv');
            $seriesAnimation = fetchPlexMediaItems($seriesAnimation_url, $plexToken, $plexServerUrl, $tmdbApi, $config, 'tv');

            // Combine and randomize media items
            $combined_data = array_merge(
                $movies,
                $moviesMarvel,
                $moviesDc,
                $moviesBond,
                $moviesAnimation,
                $series,
                $seriesAnimation
            );

            // Shuffle the combined data
            shuffle($combined_data);

            // Cache the data
            $encoded_data = json_encode($combined_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            if (file_put_contents($cache_file, $encoded_data) === false) {
                logError('Cache Write Failed');
            }
        }

        return $combined_data;
    } catch (Exception $e) {
        logError('Final Execution Error', ['message' => $e->getMessage()]);
        return [];
    }
}

// If not a special action, display the HTML page
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Plex Backdrops</title>
    <style>
        /* ======================================
       Base Styles and Reset
       ====================================== */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            /* Include padding and border in element's total width/height */
        }

        body {
            height: 100vh;
            /* Use viewport height for body */
            margin: 0;
            /* Remove default body margin */
            font-family: "Segoe UI", sans-serif;
            /* Set a default font */
            overflow: hidden;
            /* Hide any overflow content to prevent scrollbars */
            display: flex;
            background-repeat: no-repeat;
            background-position: center;
            background-size: cover;
            /* Default to cover */
            background-color: #141414;
            /* Fallback background color */
            justify-content: center;
            /* Center content horizontally */
            align-items: center;
            /* Center content vertically */
        }

        /* ======================================
           Container and Layout Styles
           ====================================== */
        .container {
            width: 100%;
            height: 100%;
            display: flex;
            position: fixed;
            overflow: hidden;
            justify-content: center;
            background-repeat: no-repeat;
            background-position: center;
            background-size: cover;
            /* Default to cover */
            background-color: #141414;
            /* Fallback background color */
        }

        .col,
        .row {
            flex: 1;
            /* Expand to fill available space */
            display: flex;
            flex-direction: column;
            overflow: hidden;
            /* Hide any overflow content to prevent scrollbars */
        }

        /* ======================================
           Navigation Controls
           ====================================== */
        #prev img,
        #next img {
            width: auto;
            /* Allow the width to adjust automatically */
            height: 100%;
            /* Set the height to 100% */
            max-height: none;
            /* Disable the max-height property */
            transform: scale(0.6);
            opacity: 0.5;
            transition: opacity 0.3s ease, filter 0.3s ease;
        }

        #prev:hover img,
        #next:hover img {
            filter: invert(100%);
            opacity: 0.75;
        }

        #prev:hover,
        #next:hover {
            background-color: rgba(0, 0, 0, 0.75);
            transition: background-color 0.3s ease;
        }

        #prev {
            left: 0;
            position: absolute;
            z-index: 10;
            cursor: pointer;
            height: 100%;
            display: flex;
            align-items: center;
        }

        #next {
            right: 0;
            position: absolute;
            z-index: 10;
            cursor: pointer;
            height: 100%;
            display: flex;
            align-items: center;
        }

        /* ======================================
           Dots Navigation
           ====================================== */
        #dots {
            width: 100%;
            height: 50px;
            position: absolute;
            z-index: 10;
            bottom: 0;
            display: flex;
            background-image: linear-gradient(to bottom,
                    rgba(0, 0, 0, 0),
                    rgba(0, 0, 0, 0.7));
            padding-bottom: 15px;
            justify-content: center;
            align-items: flex-end;
            visibility: hidden;
        }

        .dot-container {
            height: 50px;
            margin: 5px;
            cursor: pointer;
            display: flex;
            align-items: flex-end;
            transition: all 0.2s;
        }

        .dot-container:hover .dot {
            height: 50px;
            opacity: 1;
        }

        .dot {
            height: 0px;
            width: 0px;
            border: solid white 2.5px;
            background-color: rgba(226, 245, 236, 0.7);
            background-size: cover;
            background-position: center;
            opacity: 0.5;
            transition: all 0.05s, opacity 0.5s;
        }

        .dot.active {
            opacity: 1;
        }

        /* ======================================
           Visibility Classes
           ====================================== */
        .hidden {
            width: 0%;
            height: 0%;
        }

        .visible {
            width: 100%;
            height: 100%;
        }

        /* ======================================
           Animation Classes - Push and Pull
           ====================================== */
        /* Push Up/Down Animations */
        .pushUpDown:nth-child(odd) {
            transform: translateY(-100%);
            animation: pushDown 1s forwards;
            animation-fill-mode: forwards;
        }

        .pushUpDown:nth-child(even) {
            transform: translateY(100%);
            animation: pushUp 1s forwards;
            animation-fill-mode: forwards;
        }

        .pushUpDown div.content {
            width: 100%;
            height: 100%;
        }

        @keyframes pushDown {
            from {
                transform: translateY(-100%);
            }

            to {
                transform: translateY(0%);
            }
        }

        @keyframes pushUp {
            from {
                transform: translateY(100%);
            }

            to {
                transform: translateY(0%);
            }
        }

        /* Pull Up/Down Animations */
        .pullUpDown:nth-child(odd) {
            transform: translateY(-100%);
            animation: pullDown 1s forwards;
            animation-fill-mode: forwards;
        }

        .pullUpDown:nth-child(even) {
            transform: translateY(100%);
            animation: pullUp 1s forwards;
            animation-fill-mode: forwards;
        }

        .pullUpDown div.content {
            width: 100%;
            height: 100%;
        }

        .pullDown {
            animation: pullDown 1s forwards;
            animation-fill-mode: forwards;
        }

        @keyframes pullDown {
            from {
                transform: translateY(0%);
            }

            to {
                transform: translateY(100%);
            }
        }

        .pullUp {
            animation: pullUp 1s forwards;
            animation-fill-mode: forwards;
        }

        @keyframes pullUp {
            from {
                transform: translateY(0%);
            }

            to {
                transform: translateY(-100%);
            }
        }

        /* Left/Right Animations */
        .pushLeft {
            animation: pushLeft 1s;
            animation-fill-mode: forwards;
        }

        @keyframes pushLeft {
            from {
                transform: translateX(100%);
            }

            to {
                transform: translateX(0%);
            }
        }

        .pushRight {
            animation: pushRight 1s;
            animation-fill-mode: forwards;
        }

        @keyframes pushRight {
            from {
                transform: translateX(-100%);
            }

            to {
                transform: translateX(0%);
            }
        }

        .pullLeft {
            animation: pullLeft 1s;
            animation-fill-mode: forwards;
        }

        @keyframes pullLeft {
            from {
                transform: translateX(0%);
            }

            to {
                transform: translateX(-100%);
            }
        }

        .pullRight {
            animation: pullRight 1s;
            animation-fill-mode: forwards;
        }

        @keyframes pullRight {
            from {
                transform: translateX(0%);
            }

            to {
                transform: translateX(100%);
            }
        }

        /* ======================================
           Animation Classes - Scaling
           ====================================== */
        .bigger {
            animation: bigger 1s;
            animation-fill-mode: forwards;
        }

        @keyframes bigger {
            from {
                transform: scale(0.75);
            }

            to {
                transform: scale(1);
            }
        }

        .smaller {
            animation: smaller 1s;
            animation-fill-mode: forwards;
        }

        @keyframes smaller {
            from {
                transform: scale(1);
            }

            to {
                transform: scale(0.75);
            }
        }

        /* ======================================
           Animation Classes - Box Transformations
           ====================================== */
        .boxShrink {
            animation: boxShrink 0.5s;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
        }

        @keyframes boxShrink {
            from {
                width: 100%;
                height: 100%;
                opacity: 1;
            }

            to {
                width: 0%;
                height: 0%;
                opacity: 0.5;
            }
        }

        .boxEmerge {
            animation: boxEmerge 1s;
            animation-fill-mode: forwards;
        }

        @keyframes boxEmerge {
            from {
                width: 0%;
                height: 0%;
            }

            to {
                width: 100%;
                height: 100%;
            }
        }

        /* ======================================
           Animation Classes - Misc
           ====================================== */
        .slideCol {
            width: 0%;
            height: 100%;
            animation: slideCol 1s;
            animation-fill-mode: forwards;
        }

        @keyframes slideCol {
            from {
                width: 0%;
            }

            to {
                width: 100%;
            }
        }

        .fade {
            animation: fade 0.5s;
            animation-fill-mode: forwards;
        }

        @keyframes fade {
            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }
        }

        /* ======================================
           Slide Header Styles
           ====================================== */
        .slide-header {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            user-select: none;
            opacity: 0;
            cursor: pointer;
            width: 70%;
            height: 40%;
            box-sizing: border-box;
            background-color: rgba(0, 0, 0, 0.5);
            padding: 20px;
            border-radius: 10px;
            display: flex;
            z-index: 20;
            transition: all 0.5s;
            color: white;
            font-family: "Segoe UI", sans-serif;
            font-size: 1.5em;
            backdrop-filter: blur(5px);
        }

        .slide-header.in {
            animation: slideHeaderIn 1s 1s;
            animation-fill-mode: forwards;
        }

        .slide-header.out {
            animation: slideHeaderOut 0.2s;
            animation-fill-mode: forwards;
        }

        @keyframes slideHeaderIn {
            from {
                opacity: 0;
                transform: translate(-50%, -40%);
            }

            to {
                opacity: 1;
                transform: translate(-50%, -50%);
            }
        }

        @keyframes slideHeaderOut {
            from {
                opacity: 1;
                transform: translate(-50%, -50%);
            }

            to {
                opacity: 0;
                transform: translate(-50%, -60%);
            }
        }

        .header-text {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            flex: 1;
            overflow: hidden;
            justify-content: flex-start;
        }

        .logo {
            height: auto;
            max-height: 7vh;
            max-width: 60%;
            margin-bottom: 15px;
            /* Adjust space between logo and title */
            object-fit: contain;
        }

        .title-container {
            display: flex;
            align-items: center;
            width: 100%;
            justify-content: center;
        }

        .title-year {
            font-weight: bold;
            text-shadow: 0px 0px 5px #000;
            font-size: clamp(0.2em, 1.5vw, 4em);
            margin-bottom: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
        }

        .subtitle-wrapper {
            position: relative;
            width: 100%;
            flex: 1;
            overflow: hidden;
            margin-top: 10px;
        }

        .subtitle {
            font-weight: 400;
            font-size: clamp(0.2em, 1.2vw, 3em);
            color: #eee;
            text-shadow: 0px 0px 5px #000;
            padding: 0 15px;
            line-height: 1.4;
            position: relative;
            margin: 0;
            overflow: hidden;
        }

        .subtitle.scrolling {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            animation: autoscroll 30s linear infinite;
            animation-delay: 1s;
        }

        @keyframes autoscroll {
            0% {
                transform: translateY(0);
            }

            85% {
                transform: translateY(calc(-100% + 100px));
                /* Stop before completely scrolling out */
            }

            95%,
            100% {
                transform: translateY(0);
                /* Return to start */
            }
        }

        .poster {
            height: 100%;
            border-radius: 10px;
            align-self: flex-end;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
        }

        /* ======================================
           Media Queries
           ====================================== */
        /* Mobile (portrait) */
        @media only screen and (max-width: 480px) {
            .slide-header {
                width: 90%;
                height: 60%;
                padding: 10px;
            }

            .logo {
                max-height: 5vh;
            }

            .title-year {
                font-size: clamp(0.2em, 4vw, 2em);
            }

            .subtitle {
                font-size: clamp(0.2em, 3vw, 1.5em);
                line-height: 1.3;
            }

            .poster {
                max-height: 80%;
            }

            #prev,
            #next {
                width: 40px;
            }
        }

        /* Mobile (landscape) and small tablets */
        @media only screen and (min-width: 481px) and (max-width: 768px) {
            .slide-header {
                width: 85%;
                height: 45%;
            }

            .logo {
                max-height: 6vh;
            }

            .title-year {
                font-size: clamp(0.2em, 3vw, 3em);
            }

            #prev,
            #next {
                width: 45px;
            }
        }

        /* Tablets and small laptops */
        @media only screen and (min-width: 769px) and (max-width: 1024px) {
            .slide-header {
                width: 80%;
            }

            .logo {
                max-height: 7vh;
            }

            .title-year {
                font-size: clamp(0.2em, 2vw, 3.5em);
            }
        }

        /* Desktops and large laptops */
        @media only screen and (min-width: 1025px) and (max-width: 1440px) {
            .slide-header {
                width: 75%;
            }
        }

        /* Large desktop screens */
        @media only screen and (min-width: 1441px) and (max-width: 2560px) {
            .slide-header {
                width: 65%;
                height: 35%;
            }

            .logo {
                max-height: 8vh;
            }

            .title-year {
                font-size: clamp(0.2em, 1.8vw, 4.5em);
            }

            .subtitle {
                font-size: clamp(0.2em, 1.4vw, 3.5em);
                line-height: 1.4;
            }
        }

        /* 4K displays */
        @media only screen and (min-width: 2561px) {
            .slide-header {
                width: 60%;
                height: 30%;
            }

            .logo {
                max-height: 10vh;
                max-width: 50%;
            }

            .title-year {
                font-size: clamp(0.2em, 1.5vw, 5em);
                margin-bottom: 20px;
            }

            .subtitle {
                font-size: clamp(0.2em, 1.2vw, 4em);
                margin-left: 25px;
                margin-right: 25px;
            }

            .poster {
                border-radius: 15px;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <!-- Your slider content here -->
    </div>

    <script>
        var icons = {
            loading: "data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ic3Bpbm5lciIgd2lkdGg9IjY1cHgiIGhlaWdodD0iNjVweCIgdmlld0JveD0iMCAwIDY2IDY2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxzdHlsZT4KICAgIDwhW0NEQVRBWwogICAgICBAa2V5ZnJhbWVzIHJvdGF0b3IgewogICAgICAgIDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH0KICAgICAgICAxMDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMjcwZGVnKTsgfQogICAgICB9CiAgICAgIAogICAgICBAa2V5ZnJhbWVzIGNvbG9ycyB7CiAgICAgICAgMCUgeyBzdHJva2U6ICM0Mjg1RjQ7IH0KICAgICAgICAyNSUgeyBzdHJva2U6ICNERTNFMzU7IH0KICAgICAgICA1MCUgeyBzdHJva2U6ICNGN0MyMjM7IH0KICAgICAgICA3NSUgeyBzdHJva2U6ICMxQjlBNTk7IH0KICAgICAgICAxMDAlIHsgc3Ryb2tlOiAjNDI4NUY0OyB9CiAgICAgIH0KICAgICAgCiAgICAgIEBrZXlmcmFtZXMgZGFzaCB7CiAgICAgICAgMCUgeyBzdHJva2UtZGFzaG9mZnNldDogMTg3OyB9CiAgICAgICAgNTAlIHsKICAgICAgICAgIHN0cm9rZS1kYXNob2Zmc2V0OiA0Ni43NTsKICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDEzNWRlZyk7CiAgICAgICAgfQogICAgICAgIDEwMCUgewogICAgICAgICAgc3Ryb2tlLWRhc2hvZmZzZXQ6IDE4NzsKICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDQ1MGRlZyk7CiAgICAgICAgfQogICAgICB9CiAgICAgIAogICAgICAuc3Bpbm5lciB7CiAgICAgICAgYW5pbWF0aW9uOiByb3RhdG9yIDEuNHMgbGluZWFyIGluZmluaXRlOwogICAgICB9CgogICAgICAucGF0aCB7CiAgICAgICAgc3Ryb2tlLWRhc2hhcnJheTogMTg3OwogICAgICAgIHN0cm9rZS1kYXNob2Zmc2V0OiAwOwogICAgICAgIHRyYW5zZm9ybS1vcmlnaW46IGNlbnRlcjsKICAgICAgICBhbmltYXRpb246CiAgICAgICAgICBkYXNoIDEuNHMgZWFzZS1pbi1vdXQgaW5maW5pdGUsCiAgICAgICAgICBjb2xvcnMgNS42cyBlYXNlLWluLW91dCBpbmZpbml0ZTsKICAgICAgfQogICAgXV0+CiAgPC9zdHlsZT4KICA8Y2lyY2xlIGNsYXNzPSJwYXRoIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgY3g9IjMzIiBjeT0iMzMiIHI9IjMwIj48L2NpcmNsZT4KPC9zdmc+Cg==",
        };

        // Utility function to create elements with optional reference and content
        Element.prototype.createE = function(tag, referance, content) {
            var element = document.createElement(tag);

            if (referance && referance[0] === "#") {
                element.id = referance.replace("#", "");
            } else if (referance) {
                element.classList = referance;
            }

            if (content && tag.toUpperCase() === "IMG") {
                element.src = content;
            } else if (content) {
                element.innerHTML = content;
            }

            if (!this.doctype) {
                var final = this.appendChild(element);
            }

            return final || element;
        };

        var loop, columns, delay;

        var loading = document.body.createE("div", "container");
        loading.style.background = "url(" + icons.loading + ") no-repeat center";
        loading.style.backgroundSize = "48px";

        var prev = document.body.createE("div", "#prev");
        prev.setAttribute("onclick", "nextPrev(-1)");

        var next = document.body.createE("div", "#next");
        next.setAttribute("onclick", "nextPrev(1)");

        var dots = document.body.createE("div", "#dots");

        // Fetch movie data - modified to use our new endpoint
        fetch("?action=media")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                makeSlideshow(data);
            })
            .catch((error) => {
                console.error("Error fetching media:", error);
            });

        function makeSlideshow(input, n = input.length) {
            init(input, 12, 15000); // Initialize with default columns and delay
            downloadImage(input, n);

            async function downloadImage(input) {
                for (var i = 0; i < n; i++) {
                    await new Promise((resolve, reject) => {
                        var image = new Image();
                        image.src = input[i].image;
                        image.onload = () => {
                            createDot(input[i], i);
                            resolve();
                        };
                        image.onerror = () => {
                            createDot(input[i], i, true);
                            resolve();
                        };
                    });
                }
            }
        }

        function init(_input, _columns = 12, _delay = 15000) {
            input = _input;
            columns = _columns;
            delay = _delay;
        }

        function createDot(slide, index, err) {
            if (err) {
                slide.image = "404.png";
            }
            var dotContainer = dots.createE("div", "dot-container");
            var dot = dotContainer.createE("div", "dot");
            dot.style.backgroundImage = "url(" + slide.artWork + ")";
            dot.setAttribute("onclick", "showSlide(" + index + ")");

            if (index === 0) {
                slideshow(slide);
            }
        }

        function slideshow(slide) {
            var firstSlide = makeLayout(slide);
            visibleBox(firstSlide.boxes);
            document.getElementsByClassName("dot")[0].classList.add("active");

            loop = setTimeout(() => {
                nextPrev(1);
            }, delay);
        }

        function showSlide(n) {
            clearTimeout(loop);
            makeAnimation(input[n]);
            var allDots = document.getElementsByClassName("dot");
            for (var i = 0; i < allDots.length; i++) {
                allDots[i].classList.remove("active");
            }
            var dot = allDots[n];
            dot.classList.add("active");
            loop = setTimeout(() => {
                nextPrev(1);
            }, delay);
        }

        function nextPrev(n) {
            clearTimeout(loop);
            var allDots = document.getElementsByClassName("dot");
            for (var i = 0; i < allDots.length; i++) {
                var target = n + i;
                if (allDots[i].classList.contains("active")) {
                    allDots[i].classList.remove("active");
                    if (target >= allDots.length) {
                        target = 0;
                    } else if (target < 0) {
                        target = allDots.length - 1;
                    }
                    makeAnimation(input[target]);
                    allDots[target].classList.add("active");
                    break;
                }
            }
            loop = setTimeout(() => {
                nextPrev(1);
            }, delay);
        }

        function makeAnimation(slide) {
            removePrevious();
            var animation = [
                "pushUpDown(slide)",
                "pullUpDown(slide)",
                "pullDown(slide)",
                "pullUp(slide)",
                "boxEmerge(slide)",
                "boxEmergeReverse(slide)",
                "pushUp(slide)",
                "pushDown(slide)",
                "fade(slide)",
                "slideCol(slide)",
                "slideColReverse(slide)",
                'slideIn(slide, "Left")',
                'slideIn(slide, "Right")',
                'slideIn(slide, "Up")',
                'slideIn(slide, "Down")',
                'slideOut(slide, "Left")',
                'slideOut(slide, "Right")',
                'slideOut(slide, "Up")',
                'slideOut(slide, "Down")',
                'slideWith(slide, "Left")',
                'slideWith(slide, "Right")',
                'slideWith(slide, "Up")',
                'slideWith(slide, "Down")',
            ];

            var x = Math.floor(Math.random() * animation.length);
            eval(animation[x]);
        }

        function makeLayout(slide, out) {
            var oldContainer = document.getElementsByClassName("container");
            oldContainer = oldContainer[oldContainer.length - 1];

            if (out) {
                var oldVertical = oldContainer.getElementsByClassName("col");
                var oldBoxes = [];
                for (var i = 0; i < oldVertical.length; i++) {
                    oldVertical[i].className = "col";
                    var oldRows = oldVertical[i].getElementsByClassName("row");
                    var oldOneCol = [];
                    for (var j = 0; j < oldRows.length; j++) {
                        var content = oldRows[j].getElementsByClassName("content")[0];
                        content.className = "content visible";
                        oldOneCol.push(content);
                    }
                    oldBoxes.push(oldOneCol);
                }
                oldContainer.style.zIndex = 1;
            }

            var container = document.body.createE("div", "container");
            var boxes = [];
            var vertical = [];

            for (var i = 0; i < columns; i++) {
                vertical.push(container.createE("div", "col"));
            }

            var rows = Math.floor(window.innerHeight / vertical[0].offsetWidth);

            for (var i = 0; i < vertical.length; i++) {
                var horizontal = [];
                for (var j = 0; j < rows; j++) {
                    horizontal.push(vertical[i].createE("div", "row"));
                }
                var oneCol = [];
                for (var j = 0; j < horizontal.length; j++) {
                    oneCol.push(horizontal[j].createE("div", "content"));
                }
                boxes.push(oneCol);
                createBackground(oneCol, slide.image);
            }

            function createBackground(slices, image) {
                for (var i = 0; i < slices.length; i++) {
                    slices[i].style.backgroundImage = "url(" + image + ")";
                    positionBackground(slices[i]);
                }
            }

            createSlideHeader(
                slide.artWork,
                slide.logo,
                slide.title,
                slide.date,
                slide.subtitle,
                slide.url
            );

            if (out) {
                visibleBox(boxes);
            }

            return {
                vertical: oldVertical || vertical,
                boxes: oldBoxes || boxes,
                container: container,
                oldContainer: oldContainer,
            };
        }

        function positionBackground(slice) {
            slice.style.backgroundPosition = -slice.offsetLeft + "px " + -slice.offsetTop + "px";
            slice.style.backgroundSize = window.innerWidth + "px";
        }

        function visibleBox(boxes) {
            if (boxes[0][0]) {
                for (var i = 0; i < boxes.length; i++) {
                    for (var j = 0; j < boxes[i].length; j++) {
                        boxes[i][j].classList.add("visible");
                    }
                }
            } else {
                for (var i = 0; i < boxes.length; i++) {
                    boxes[i].classList.add("visible");
                }
            }
        }

        function removePrevious() {
            var containers = document.getElementsByClassName("container");
            if (containers.length >= 2) {
                containers[0].remove();
            }

            var slideHeader = document.querySelectorAll(".slide-header");
            if (slideHeader.length >= 2) {
                for (var i = 0; i < slideHeader.length; i++) {
                    slideHeader[i].remove();
                }
            } else if (slideHeader.length >= 1) {
                slideHeader[0].classList.add("out");
                slideHeader[0].classList.remove("in");
                setTimeout(() => {
                    slideHeader[0].remove();
                }, 500);
            }
        }

        async function timeline(boxes, className, colDelay, rowDelay) {
            colsAwait(boxes);
            async function colsAwait(boxes) {
                for (var i = 0; i < boxes.length; i++) {
                    if (colDelay)
                        await new Promise((resolve) => setTimeout(resolve, colDelay));
                    boxesAwait(boxes[i]);
                }
            }
            async function boxesAwait(boxes) {
                for (var i = 0; i < boxes.length; i++) {
                    if (rowDelay)
                        await new Promise((resolve) => setTimeout(resolve, rowDelay));
                    boxes[i].classList.add(className);
                }
            }
        }

        Array.prototype.boxReverse = function() {
            this.reverse();
            for (var i = 0; i < this.length; i++) {
                this[i].reverse();
            }
            return this;
        };

        window.addEventListener("resize", () => {
            var slices = document.querySelectorAll(".content");
            for (var i = slices.length - 1; i >= 0; i--) {
                positionBackground(slices[i]);
            }
        });

        function createSlideHeader(artwork, logo, title, date, subtitle, url) {
            // Extract the year from the date
            var year = date.split("-")[0];

            // Create slide header container
            var slideHeader = document.createElement("div");
            slideHeader.classList.add("slide-header");

            // Create header text container
            var headerText = document.createElement("div");
            headerText.classList.add("header-text");
            slideHeader.appendChild(headerText);

            // Create and append logo image within header text
            var logoImage = document.createElement("img");
            logoImage.src = logo;
            logoImage.alt = "Logo";
            logoImage.classList.add("logo");
            headerText.appendChild(logoImage);

            // Create title container element
            var titleContainer = document.createElement("div");
            titleContainer.classList.add("title-container");
            headerText.appendChild(titleContainer);

            // Create a single span element for the title and year
            var titleYearSpan = document.createElement("span");
            titleYearSpan.classList.add("title-year");

            // Set the title text
            titleYearSpan.textContent = title + " ";

            // Create an italic element for the year
            var yearItalic = document.createElement("em");
            yearItalic.textContent = `(${year})`;

            // Append the italic year to the title span
            titleYearSpan.appendChild(yearItalic);

            // Append the span to the container
            titleContainer.appendChild(titleYearSpan);

            // Create subtitle wrapper for auto-scrolling
            var subtitleWrapper = document.createElement("div");
            subtitleWrapper.classList.add("subtitle-wrapper");
            headerText.appendChild(subtitleWrapper);

            // Create and append subtitle element
            var subtitleElement = document.createElement("div");
            subtitleElement.classList.add("subtitle");
            subtitleElement.innerHTML = subtitle;
            subtitleWrapper.appendChild(subtitleElement);

            // Append artwork image
            var posterImage = document.createElement("img");
            posterImage.src = artwork;
            posterImage.alt = "Poster";
            posterImage.classList.add("poster");
            slideHeader.appendChild(posterImage);

            // Append slide header to document body
            document.body.appendChild(slideHeader);

            // Add animation class
            slideHeader.classList.add("in");

            // Check if subtitle text is taller than its container after animations complete
            setTimeout(function() {
                // Check if subtitle needs scrolling (content is taller than container)
                if (subtitleElement.scrollHeight > subtitleWrapper.clientHeight) {
                    subtitleElement.classList.add("scrolling");

                    // For safety, adjust the animation duration based on text length
                    var textLength = subtitle.length;
                    var duration = Math.max(20, Math.min(60, textLength / 10)); // Between 20-60 seconds
                    subtitleElement.style.animationDuration = duration + "s";
                }
            }, 2000); // Wait for slideHeaderIn animation to complete
        }

        // Animation functions
        async function pushUpDown(input) {
            var layout = makeLayout(input);
            var cols = layout.vertical;
            for (var i = 0; i < cols.length; i++) {
                await new Promise((resolve) => setTimeout(resolve, 50));
                visibleBox(layout.boxes[i]);
                cols[i].classList.add("pushUpDown");
            }
        }

        async function pullUpDown(input) {
            var layout = makeLayout(input, true);
            var cols = layout.vertical;
            for (var i = 0; i < cols.length; i++) {
                await new Promise((resolve) => setTimeout(resolve, 50));
                visibleBox(layout.boxes[i]);
                cols[i].classList.add("pullUpDown");
            }
        }

        async function pullDown(input) {
            var layout = makeLayout(input, true);
            var cols = layout.vertical;
            for (var i = 0; i < cols.length; i++) {
                await new Promise((resolve) => setTimeout(resolve, 75));
                cols[i].classList.add("pullDown");
            }
        }

        async function pullUp(input) {
            var layout = makeLayout(input, true);
            var cols = layout.vertical;
            for (var i = 0; i < cols.length; i++) {
                await new Promise((resolve) => setTimeout(resolve, 75));
                cols[i].classList.add("pullUp");
            }
        }

        async function boxShrink(input) {
            var layout = makeLayout(input, true);
            var boxes = layout.boxes;
            timeline(boxes, "boxShrink", 75, 75);
        }

        async function boxShrinkReverse(input) {
            var layout = makeLayout(input, true);
            var boxes = layout.boxes;
            boxes.boxReverse();
            timeline(boxes, "boxShrink", 75, 75);
        }

        async function boxEmerge(input) {
            var layout = makeLayout(input);
            var boxes = layout.boxes;
            timeline(boxes, "boxEmerge", 75, 75);
        }

        async function boxEmergeReverse(input) {
            var layout = makeLayout(input);
            var boxes = layout.boxes;
            boxes.boxReverse();
            timeline(boxes, "boxEmerge", 75, 75);
        }

        async function slideCol(input) {
            var layout = makeLayout(input);
            var boxes = layout.boxes;
            timeline(boxes, "slideCol", 75);
        }

        async function slideColReverse(input) {
            var layout = makeLayout(input);
            var boxes = layout.boxes;
            boxes.reverse();
            timeline(boxes, "slideCol", 75);
        }

        async function pushUp(input) {
            var layout = makeLayout(input);
            var cols = layout.vertical;
            for (var i = 0; i < cols.length; i++) {
                await new Promise((resolve) => setTimeout(resolve, 75));
                visibleBox(layout.boxes[i]);
                cols[i].classList.add("pushUp");
            }
        }

        async function pushDown(input) {
            var layout = makeLayout(input);
            var cols = layout.vertical;
            for (var i = 0; i < cols.length; i++) {
                await new Promise((resolve) => setTimeout(resolve, 75));
                visibleBox(layout.boxes[i]);
                cols[i].classList.add("pushDown");
            }
        }

        function fade(input) {
            var layout = makeLayout(input);
            var boxes = layout.boxes;
            visibleBox(boxes);
            var container = layout.container;
            container.classList.add("fade");
        }

        function slideIn(input, direction) {
            var layout = makeLayout(input);
            var boxes = layout.boxes;
            visibleBox(boxes);
            var container = layout.container;
            var oldContainer = layout.oldContainer;
            container.className = "container " + "push" + direction;
            oldContainer.className = "container smaller";
        }

        function slideOut(input, direction) {
            var layout = makeLayout(input, true);
            var container = layout.container;
            var oldContainer = layout.oldContainer;
            oldContainer.className = "container " + "pull" + direction;
            container.className = "container bigger";
        }

        function slideWith(input, direction) {
            var layout = makeLayout(input, true);
            var container = layout.container;
            var oldContainer = layout.oldContainer;
            oldContainer.className = "container " + "pull" + direction;
            container.className = "container " + "push" + direction;
        }
    </script>
</body>

</html>
<?php
// Comprehensive Media Fetcher - Plex and TMDb Integration

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
function fetchTmdbMediaLogo($tmdb_id, $tmdbApi, $fallbackLogoUrl, $type = 'movie')
{
    $url = "https://api.themoviedb.org/3/{$type}/{$tmdb_id}?api_key={$tmdbApi}&append_to_response=images";

    try {
        $response = safeCurlRequest($url);
        $data = json_decode($response, true);

        // Check if data is empty or the required keys are missing
        if (empty($data) || !isset($data['images']) || !isset($data['images']['logos'])) {
            return $fallbackLogoUrl;
        }

        // Filter logos by preferred languages
        $logos = $data['images']['logos'];
        $preferredLanguages = ['en', 'de', 'fr', null];
        $selectedLogo = null;

        // Iterate over the preferred languages in priority order
        foreach ($preferredLanguages as $language) {
            foreach ($logos as $logo) {
                if ($logo['iso_639_1'] === $language) {
                    $selectedLogo = $logo;
                    break 2;
                }
            }
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
function fetchTmdbMediaPoster($tmdb_id, $tmdbApi, $fallbackLogoUrl, $type = 'movie')
{
    $url = "https://api.themoviedb.org/3/{$type}/{$tmdb_id}?api_key={$tmdbApi}&append_to_response=images";

    try {
        $response = safeCurlRequest($url);
        $data = json_decode($response, true);

        // Check if data is empty or the required keys are missing
        if (empty($data) || !isset($data['images']) || !isset($data['images']['posters'])) {
            return $fallbackLogoUrl;
        }

        // Filter posters by preferred languages
        $posters = $data['images']['posters'];
        $preferredLanguages = [null, 'en', 'de', 'fr'];
        $selectedPoster = null;

        // Iterate over the preferred languages in priority order
        foreach ($preferredLanguages as $language) {
            foreach ($posters as $poster) {
                if ($poster['iso_639_1'] === $language) {
                    $selectedPoster = $poster;
                    break 2;
                }
            }
        }

        // Return the selected poster URL or the fallback
        return $selectedPoster
            ? "https://image.tmdb.org/t/p/original" . $selectedPoster['file_path']
            : $fallbackLogoUrl;
    } catch (Exception $e) {
        logError('Media Poster Fetch Failed', [
            'tmdb_id' => $tmdb_id,
            'type' => $type,
            'error' => $e->getMessage()
        ]);
        return $fallbackLogoUrl;
    }
}

// Fetch Media Backdrop from TMDb
function fetchTmdbMediaBackdrop($tmdb_id, $tmdbApi, $fallbackLogoUrl, $type = 'movie')
{
    $url = "https://api.themoviedb.org/3/{$type}/{$tmdb_id}?api_key={$tmdbApi}&append_to_response=images";

    try {
        $response = safeCurlRequest($url);
        $data = json_decode($response, true);

        // Check if data is empty or the required keys are missing
        if (empty($data) || !isset($data['images']) || !isset($data['images']['backdrops'])) {
            return $fallbackLogoUrl;
        }

        // Filter backdrops by preferred languages
        $backdrops = $data['images']['backdrops'];
        $preferredLanguages = [null, 'en', 'de', 'fr'];
        $selectedBackdrop = null;

        // Iterate over the preferred languages in priority order
        foreach ($preferredLanguages as $language) {
            foreach ($backdrops as $backdrop) {
                if ($backdrop['iso_639_1'] === $language) {
                    $selectedBackdrop = $backdrop;
                    break 2;
                }
            }
        }

        // Return the selected backdrop URL or the fallback
        return $selectedBackdrop
            ? "https://image.tmdb.org/t/p/original" . $selectedBackdrop['file_path']
            : $fallbackLogoUrl;
    } catch (Exception $e) {
        logError('Media Backdrop Fetch Failed', [
            'tmdb_id' => $tmdb_id,
            'type' => $type,
            'error' => $e->getMessage()
        ]);
        return $fallbackLogoUrl;
    }
}

// Fetch Media Details from TMDb
function fetchTmdbMediaDetails($tmdb_id, $type, $tmdbApi)
{
    $url = "https://api.themoviedb.org/3/{$type}/{$tmdb_id}?api_key={$tmdbApi}&language=de-DE";

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
function fetchPlexMediaItems($url, $plexToken, $plexServerUrl, $tmdbApi, $type = 'movie')
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
            $tmdbDetails = fetchTmdbMediaDetails($tmdb, $type, $tmdbApi);

            // Use only TMDb title
            $title = $tmdbDetails['tmdb_title'];

            $fallbackLogoUrl = 'https://app.streamnet.live/pics/streamnet_tv.png';
            $logo = fetchTmdbMediaLogo($tmdb, $tmdbApi, $fallbackLogoUrl, $type);
            $thumb = fetchTmdbMediaPoster($tmdb, $tmdbApi, $fallbackLogoUrl, $type);
            $art = fetchTmdbMediaBackdrop($tmdb, $tmdbApi, $fallbackLogoUrl, $type);

            $url = "https://webview.streamnet.live/api/proxy.php?url=" .
                urlencode("http://$plexServerUrl/web/index.html#!/server/$id/details?key=%2Flibrary%2Fmetadata%2F$id");

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
function fetchMediaLibrary($plexToken, $plexServerUrl, $tmdbApi)
{
    // URLs for different media sections
    $movies_url = "http://$plexServerUrl/library/sections/2/all?type=1&sort=originallyAvailableAt:desc&originallyAvailableAt>>=-1y&limit=20&X-Plex-Token=$plexToken";
    $moviesMarvel_url = "http://$plexServerUrl/library/sections/1/all?type=1&sort=originallyAvailableAt:desc&originallyAvailableAt>>=-1y&limit=2&X-Plex-Token=$plexToken";
    $moviesDc_url = "http://$plexServerUrl/library/sections/3/all?type=1&sort=originallyAvailableAt:desc&originallyAvailableAt>>=-1y&limit=2&X-Plex-Token=$plexToken";
    $moviesBond_url = "http://$plexServerUrl/library/sections/4/all?type=1&sort=originallyAvailableAt:desc&originallyAvailableAt>>=-1y&limit=1&X-Plex-Token=$plexToken";
    $moviesAnimation_url = "http://$plexServerUrl/library/sections/12/all?type=1&sort=originallyAvailableAt:desc&originallyAvailableAt>>=-1y&limit=3&X-Plex-Token=$plexToken";
    $series_url = "http://$plexServerUrl/library/sections/10/all?type=2&sort=originallyAvailableAt:desc&originallyAvailableAt>>=-1y&limit=10&X-Plex-Token=$plexToken";
    $seriesAnimation_url = "http://$plexServerUrl/library/sections/11/all?type=2&sort=originallyAvailableAt:desc&originallyAvailableAt>>=-2y&limit=2&X-Plex-Token=$plexToken";

    // Fetch media items from different categories
    $movies = fetchPlexMediaItems($movies_url, $plexToken, $plexServerUrl, $tmdbApi, 'movie');
    $moviesMarvel = fetchPlexMediaItems($moviesMarvel_url, $plexToken, $plexServerUrl, $tmdbApi, 'movie');
    $moviesDc = fetchPlexMediaItems($moviesDc_url, $plexToken, $plexServerUrl, $tmdbApi, 'movie');
    $moviesBond = fetchPlexMediaItems($moviesBond_url, $plexToken, $plexServerUrl, $tmdbApi, 'movie');
    $moviesAnimation = fetchPlexMediaItems($moviesAnimation_url, $plexToken, $plexServerUrl, $tmdbApi, 'movie');
    $series = fetchPlexMediaItems($series_url, $plexToken, $plexServerUrl, $tmdbApi, 'tv');
    $seriesAnimation = fetchPlexMediaItems($seriesAnimation_url, $plexToken, $plexServerUrl, $tmdbApi, 'tv');

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

    return $combined_data;
}

// Main Execution Script
function main()
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
            die('Failed to create cache folder');
        }
    }

    try {
        // Connect to the SQLite database to get credentials
        $db = new SQLite3('../databases/backdrop.db');
        $query = "SELECT token, url, key FROM backdrops LIMIT 1";
        $result = $db->query($query);
        $row = $result->fetchArray(SQLITE3_ASSOC);

        if (!$row) {
            throw new Exception("No database configuration found");
        }

        $plexToken = $row['token'];
        $plexServerUrl = $row['url'];
        $tmdbApi = $row['key'];
        $db->close();

        // Check if cached data is still valid
        if (file_exists($cache_file) && time() - filemtime($cache_file) < $cache_duration) {
            // Use cached data
            $cached_data = file_get_contents($cache_file);
            $combined_data = json_decode($cached_data, true);
        } else {
            // Fetch fresh data
            $combined_data = fetchMediaLibrary($plexToken, $plexServerUrl, $tmdbApi);

            // Cache the data
            $encoded_data = json_encode($combined_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            if (file_put_contents($cache_file, $encoded_data) === false) {
                logError('Cache Write Failed');
            }
        }

        // Output the data
        header("Content-Type: application/json");
        echo json_encode($combined_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    } catch (Exception $e) {
        logError('Final Execution Error', ['message' => $e->getMessage()]);
        http_response_code(500);
        echo json_encode(['error' => 'An unexpected error occurred', 'details' => $e->getMessage()]);
    }
}

// Run the main script
main();

// Updated debugging function
function debugMediaDetails($media_data)
{
    echo "<html><body>";
    foreach ($media_data as $item) {
        echo "<div style='border: 1px solid #ccc; margin: 10px; padding: 10px;'>";
        echo "<h2>Title: " . htmlspecialchars($item['title']) . "</h2>";
        echo "<p><strong>Subtitle:</strong> " . htmlspecialchars($item['subtitle']) . "</p>";
        echo "<p><strong>Date:</strong> " . htmlspecialchars($item['date']) . "</p>";
        echo "<p><strong>Genres:</strong> " . implode(', ', array_map('htmlspecialchars', $item['genres'])) . "</p>";
        echo "<p><strong>Rating:</strong> " . ($item['rating'] ? number_format($item['rating'], 1) : 'N/A') . "</p>";
        echo "<img src='" . htmlspecialchars($item['logo']) . "' style='max-width: 200px; max-height: 100px;'><br>";
        echo "<img src='" . htmlspecialchars($item['image']) . "' style='max-width: 400px; max-height: 200px;'><br>";
        echo "<img src='" . htmlspecialchars($item['artWork']) . "' style='max-width: 200px; max-height: 300px;'>";
        echo "</div>";
    }
    echo "</body></html>";
}

<?php
// Connect to the SQLite database
$db = new SQLite3('../databases/backdrop.db');

// Query to retrieve the API key and language from the 'api_key' table
$query = "SELECT key, language FROM backdrops LIMIT 1";
$result = $db->querySingle($query, true);  // true returns the result as an associative array

// Close the database connection
$db->close();

// Check if the API key was retrieved successfully
if ($result) {
    $api_key = $result['key'];
    $language = $result['language'];
} else {
    // Handle the case where the key or language is not found
    die('API key or language not found in the database.');
}

// Define the cache folder and file path
$cache_folder = 'cache/';
$cache_file = $cache_folder . 'tmdb_cache.json';

// Create the cache folder if it doesn't exist
if (!file_exists($cache_folder)) {
    mkdir($cache_folder, 0777, true);
}

// Cache validity duration (12 hours in seconds)
$cache_duration = 24 * 60 * 60;

// Check if cached data is still valid
if (file_exists($cache_file) && time() - filemtime($cache_file) < $cache_duration) {
    // Use cached data
    $cached_data = file_get_contents($cache_file);
    $combined_data = json_decode($cached_data, true);
} else {
    // Fetch movies data using cURL
    $movies_url = "https://api.themoviedb.org/3/trending/movie/week?api_key=$api_key&language=$language";
    $movies_curl = curl_init($movies_url);
    curl_setopt($movies_curl, CURLOPT_RETURNTRANSFER, true);
    $movies_response = curl_exec($movies_curl);
    curl_close($movies_curl);

    if ($movies_response === false) {
        die('Error fetching movies data');
    }

    $movies_data = json_decode($movies_response, true);

    // Fetch shows data using cURL
    $shows_url = "https://api.themoviedb.org/3/trending/tv/week?api_key=$api_key&language=$language";
    $shows_curl = curl_init($shows_url);
    curl_setopt($shows_curl, CURLOPT_RETURNTRANSFER, true);
    $shows_response = curl_exec($shows_curl);
    curl_close($shows_curl);

    if ($shows_response === false) {
        die('Error fetching shows data');
    }

    $shows_data = json_decode($shows_response, true);

    // Initialize combined data array
    $combined_data = [];

    // Alternate between adding one record from movies and one from shows
    $numMovies = count($movies_data['results']);
    $numShows = count($shows_data['results']);
    $maxCount = max($numMovies, $numShows);

    for ($i = 0; $i < $maxCount; $i++) {
        if ($i < $numMovies) {
            $movie = $movies_data['results'][$i];
            $movieId = $movie['id'];
            $backdrop_path = 'https://image.tmdb.org/t/p/original' . $movie['backdrop_path'];
            $poster_path = 'https://image.tmdb.org/t/p/original' . $movie['poster_path'];
            $title = $movie['title'];
            $subtitle = $movie['overview'];
            $date = $movie['release_date'];
            $url = 'https://www.themoviedb.org/movie/' . $movieId;
            $fallbackLogoUrl = 'https://app.streamnet.live/pics/streamnet_tv.png';
            $logo = fetchTmdbMoviesLogo($movieId, $api_key, $fallbackLogoUrl);

            $combined_data[] = array(
                "id" => $movieId,
                "image" => $backdrop_path,
                "artWork" => $poster_path,
                "logo" => $logo,
                "title" => $title,
                "subtitle" => $subtitle,
                "date" => $date,
                "url" => $url,
            );
        }

        if ($i < $numShows) {
            $show = $shows_data['results'][$i];
            $showId = $show['id'];
            $backdrop_path = 'https://image.tmdb.org/t/p/original' . $show['backdrop_path'];
            $poster_path = 'https://image.tmdb.org/t/p/original' . $show['poster_path'];
            $title = $show['name'];
            $subtitle = $show['overview'];
            $date = $show['first_air_date'];
            $url = 'https://www.themoviedb.org/tv/' . $showId;  // Corrected to /tv/
            $fallbackLogoUrl = 'https://app.streamnet.live/pics/streamnet_tv.png';
            $logo = fetchTmdbShowsLogo($showId, $api_key, $fallbackLogoUrl);

            $combined_data[] = array(
                "id" => $showId,
                "image" => $backdrop_path,
                "artWork" => $poster_path,
                "logo" => $logo,
                "title" => $title,
                "subtitle" => $subtitle,
                "date" => $date,
                "url" => $url
            );
        }
    }

    // Encode and store the combined data in the cache file without escaping slashes
    $encoded_data = json_encode($combined_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    file_put_contents($cache_file, $encoded_data);
}

// Set the appropriate header and echo the combined data as JSON
header("Content-Type: application/json");
echo json_encode($combined_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

// Function to fetch TMDb movie logo
function fetchTmdbMoviesLogo($movieId, $api_key, $fallbackLogoUrl)
{
    $url = "https://api.themoviedb.org/3/movie/$movieId?api_key=$api_key&append_to_response=images";

    // Initialize cURL session
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

    // Execute cURL request
    $response = curl_exec($curl);
    if ($response === false) {
        $error_message = 'Error fetching data from TMDb: ' . curl_error($curl);
        curl_close($curl);
        return $fallbackLogoUrl;
    }

    // Close cURL session
    curl_close($curl);

    // Decode JSON response
    $data = json_decode($response, true);

    // Check if data is empty or the required keys are missing
    if (empty($data) || !isset($data['images']) || !isset($data['images']['logos'])) {
        return $fallbackLogoUrl;
    }

    // Find the German or English logo
    $logos = $data['images']['logos'];
    $selectedLogo = null;

    foreach ($logos as $logo) {
        if ($logo['iso_639_1'] === 'de') {
            $selectedLogo = $logo;
            break;
        }
    }

    if (!$selectedLogo) {
        foreach ($logos as $logo) {
            if ($logo['iso_639_1'] === 'en') {
                $selectedLogo = $logo;
                break;
            }
        }
    }

    // Check if a logo was found
    if ($selectedLogo) {
        return "https://image.tmdb.org/t/p/original" . $selectedLogo['file_path'];
    } else {
        return $fallbackLogoUrl;
    }
}

// Function to fetch TMDb show logo
function fetchTmdbShowsLogo($showId, $api_key, $fallbackLogoUrl)
{
    $url = "https://api.themoviedb.org/3/tv/$showId?api_key=$api_key&append_to_response=images";

    // Initialize cURL session
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

    // Execute cURL request
    $response = curl_exec($curl);
    if ($response === false) {
        $error_message = 'Error fetching data from TMDb: ' . curl_error($curl);
        curl_close($curl);
        return $fallbackLogoUrl;
    }

    // Close cURL session
    curl_close($curl);

    // Decode JSON response
    $data = json_decode($response, true);

    // Check if data is empty or the required keys are missing
    if (empty($data) || !isset($data['images']) || !isset($data['images']['logos'])) {
        return $fallbackLogoUrl;
    }

    // Find the German or English logo
    $logos = $data['images']['logos'];
    $selectedLogo = null;

    foreach ($logos as $logo) {
        if ($logo['iso_639_1'] === 'de') {
            $selectedLogo = $logo;
            break;
        }
    }

    if (!$selectedLogo) {
        foreach ($logos as $logo) {
            if ($logo['iso_639_1'] === 'en') {
                $selectedLogo = $logo;
                break;
            }
        }
    }

    // Check if a logo was found
    if ($selectedLogo) {
        return "https://image.tmdb.org/t/p/original" . $selectedLogo['file_path'];
    } else {
        return $fallbackLogoUrl;
    }
}

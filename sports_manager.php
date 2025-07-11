<?php
// Include the database creation files
require 'config/apiKeys_db.php';
require 'config/sports_db.php';

// Function to return error messages directly as plain text
function jsonError($message)
{
    header('Content-Type: text/plain');
    echo $message;
    exit;
}

// Function to return success messages directly as plain text
function jsonSuccess($message)
{
    header('Content-Type: text/plain');
    echo $message;
    exit;
}

// Handle API key form submission via AJAX
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['api_key']) && isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
    $apiKey = $_POST['api_key'];

    // Insert or update the API key in the separate database
    $stmt = $apiKeyDb->prepare("INSERT INTO api_keys (id, api_key) VALUES (1, :api_key)
                                ON CONFLICT(id) DO UPDATE SET api_key = :api_key");
    $stmt->bindValue(':api_key', $apiKey, SQLITE3_TEXT);

    if ($stmt->execute()) {
        jsonSuccess('API Key saved successfully');
    } else {
        jsonError('Failed to save API key');
    }
}

// Retrieve the API key for global access in JavaScript
$apiKey = $apiKeyDb->querySingle("SELECT api_key FROM api_keys WHERE id = 1");

// Handle cache deletion via AJAX request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_cache']) && isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
    $cacheFilePath = './api/cache/sports_cache.json';
    if (file_exists($cacheFilePath)) {
        unlink($cacheFilePath);
        jsonSuccess('Cache file deleted successfully');
    } else {
        jsonError('Cache file does not exist');
    }
}

// Handle selection saving via AJAX request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($_GET) && isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
    $sport = $_POST['sport'] ?? '';
    $country = $_POST['country'] ?? '';
    $league = $_POST['league_name'] ?? '';
    $league_id = $_POST['league_id'] ?? '';

    if ($sport && $country && $league && $league_id) {
        if ($db) {
            $stmt = $db->prepare("INSERT INTO selections (sport, country, league, league_id) VALUES (:sport, :country, :league, :league_id)");
            $stmt->bindValue(':sport', $sport, SQLITE3_TEXT);
            $stmt->bindValue(':country', $country, SQLITE3_TEXT);
            $stmt->bindValue(':league', $league, SQLITE3_TEXT);
            $stmt->bindValue(':league_id', $league_id, SQLITE3_TEXT);

            if ($stmt->execute()) {
                jsonSuccess('Selection saved successfully');
            } else {
                jsonError('Failed to save selection');
            }
        } else {
            jsonError('Database connection error');
        }
    } else {
        jsonError('Error: All fields are required');
    }
}

// Handle AJAX requests to fetch selections
if (isset($_GET['action']) && $_GET['action'] === 'fetch_selections') {
    if ($db) {
        $result = $db->query("SELECT * FROM selections");
        include 'sports_table.php';
    } else {
        jsonError('Database connection error');
    }
    exit;
}

// Handle delete request via AJAX
if (isset($_GET['delete_id'])) {
    $delete_id = intval($_GET['delete_id']);
    if ($db) {
        $stmt = $db->prepare("DELETE FROM selections WHERE id = :id");
        $stmt->bindValue(':id', $delete_id, SQLITE3_INTEGER);

        if ($stmt->execute()) {
            jsonSuccess('Selection deleted successfully');
        } else {
            jsonError('Error: Failed to delete selection');
        }
    } else {
        jsonError('Database connection error');
    }
}

// Check if there is at least one saved selection to conditionally display the "Show Events" button
if ($db) {
    $hasSelections = $db->querySingle("SELECT COUNT(*) FROM selections") > 0;
} else {
    jsonError('Database connection error');
}

?>


<div class="container mt-4">
    <div class="card bg-dark">
        <div class="card-header text-white">
            <h5 class="mb-0">TheSportsDB API Key</h5>
            <div class="title-divider"></div>
        </div>
        <div class="card-body">
            <div id="notificationApi" class="notification" style="display:none;"></div>

            <form id="apiKeyForm" method="POST">
                <div class="form-group text-white">
                    <label for="api_key">API Key:</label>
                    <input type="text" class="form-control bg-dark text-white" id="api_key" name="api_key"
                        placeholder="Enter your API Key" value="<?php echo htmlspecialchars($apiKey); ?>" required>
                </div>
                <button type="button" class="btn btn-warning mt-3" onclick="saveApiKey()">Save API Key</button>

            </form>
        </div>
    </div>
</div>

<div class="container mt-4">
    <div class="card bg-dark">
        <div class="card-header text-white">
            <h5 class="mb-0">Sport Events </h5>
            <div class="title-divider"></div>
        </div>
        <div class="card-body">
            <div id="notification" class="notification" style="display:none;"></div>

            <!-- Form to save sport selection -->
            <form id="sportsForm" method="POST">
                <div class="form-group text-white">
                    <label for="sports">Select Sport:</label>
                    <select class="form-control bg-dark text-white" id="sports" name="sport" required>
                        <option value="">Loading Sports.....</option>
                    </select>
                </div>
                <div class="form-group text-white">
                    <label for="countries">Select Country:</label>
                    <select class="form-control bg-dark text-white" id="countries" name="country" disabled required>
                        <option value="">Loading Countries....</option>
                    </select>
                </div>
                <div class="form-group text-white">
                    <label for="leagues">Select League:</label>
                    <select class="form-control bg-dark text-white" id="leagues" name="league" disabled required>
                        <option value="">Loading Leagues....</option>
                    </select>
                </div>
                <input type="hidden" id="league_id" name="league_id" />
                <input type="hidden" id="league_name" name="league_name" />
                <button type="submit" class="btn btn-warning mt-3">Save Selection</button>
                <button type="button" class="btn btn-danger mt-3" onclick="deleteCache()">Delete Cache</button>
            </form>
        </div>
    </div>
</div>

<!-- Display saved selections -->
<div class="container mt-4" id="savedSelections">
    <?php
    $result = $db->query("SELECT * FROM selections");
    include 'sports_table.php';
    ?>
</div>
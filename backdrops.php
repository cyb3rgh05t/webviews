<?php
require_once 'config/backdrop_db.php';

// Fetch current settings from the database
$currentSettings = $db->query("SELECT * FROM backdrops WHERE id = 1");
$settings = $currentSettings->fetchArray(SQLITE3_ASSOC) ?? [];

// Set variables for current settings
$currentStyle = $settings['backdrop_style'] ?? '';
$currentUrl = $settings['url'] ?? '';
$currentToken = $settings['token'] ?? '';
$currentKey = $settings['key'] ?? '';
$currentLanguage = $settings['language'] ?? 'en-US';

// Handle AJAX request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
    header('Content-Type: application/json');

    $response = [
        'success' => false,
        'message' => 'Invalid request'
    ];

    // Process AJAX request based on POST data
    if (isset($_POST['delete_cache'])) {
        // Handle cache deletion
        $cacheFilePath1 = './api/cache/plex_cache.json';
        $cacheFilePath2 = './api/cache/tmdb_cache.json'; // Add the second cache file path

        $file1Deleted = false;
        $file2Deleted = false;

        if (file_exists($cacheFilePath1)) {
            unlink($cacheFilePath1);
            $file1Deleted = true;
        }

        if (file_exists($cacheFilePath2)) {
            unlink($cacheFilePath2);
            $file2Deleted = true;
        }

        if ($file1Deleted || $file2Deleted) {
            $response = [
                'success' => true,
                'message' => 'Cache file(s) deleted successfully',
                'details' => [
                    'file1_deleted' => $file1Deleted,
                    'file2_deleted' => $file2Deleted
                ]
            ];
        } else {
            $response = ['success' => false, 'message' => 'No cache files were found to delete'];
        }
    } elseif (isset($_POST['get_backdrop_style'])) {
        // Respond with current backdrop style settings
        $response = [
            'success' => true,
            'selected' => $currentStyle,
            'url' => $currentUrl,
            'token' => $currentToken,
            'key' => $currentKey,
            'language' => $currentLanguage
        ];
    } else {
        // Handle settings save
        $backdropStyle = $_POST['backdrop_style'] ?? '';
        $url = $_POST['url'] ?? '';
        $token = $_POST['token'] ?? '';
        $key = $_POST['key'] ?? '';
        $language = $_POST['language'] ?? '';

        if (!empty($backdropStyle)) {
            $stmt = $db->prepare("UPDATE backdrops SET backdrop_style = :backdrop_style, url = :url, token = :token, key = :key, language = :language WHERE id = 1");
            $stmt->bindValue(':backdrop_style', $backdropStyle, SQLITE3_TEXT);
            $stmt->bindValue(':url', $url, SQLITE3_TEXT);
            $stmt->bindValue(':token', $token, SQLITE3_TEXT);
            $stmt->bindValue(':key', $key, SQLITE3_TEXT);
            $stmt->bindValue(':language', $language, SQLITE3_TEXT);
            $stmt->execute();
            $response = ['success' => true, 'message' => 'Backdrop settings saved successfully'];
        } else {
            $response = ['success' => false, 'message' => 'Error: Backdrop style is required'];
        }
    }

    echo json_encode($response);
    $db->close();
    exit();
}

?>

<!-- HTML Content starts here (not part of the JSON response) -->
<div class="container mt-4">
    <div class="card bg-dark text-white">
        <div class="card-header">
            <h5 class="mb-0">Backdrop Style Settings</h5>
            <div class="title-divider"></div>
        </div>
        <div class="card-body">
            <?php if (!empty($currentStyle)): ?>
                <div class="notification notification-warning" role="alert">
                    The current backdrop style is <strong><?= strtoupper(htmlspecialchars($currentStyle)); ?></strong>.
                </div>
            <?php endif; ?>

            <div id="notification" class="notification" style="display:none;"></div>
            <form id="backdropForm" method="POST">
                <div class="mb-3">
                    <label class="form-label" for="backdrop_style">Choose your Backdrop Style</label>
                    <select class="form-control bg-dark text-white" id="backdrop_style" name="backdrop_style" data-selected="<?= htmlspecialchars($currentStyle); ?>" onchange="toggleBackdropSettings()">
                        <option value="tmdb" <?= ($currentStyle === 'tmdb') ? 'selected' : '' ?>>TMDB - Fetch Backdrops from TMDB</option>
                        <option value="plex" <?= ($currentStyle === 'plex') ? 'selected' : '' ?>>Plex - Fetch Backdrops from your Plex Media Server</option>
                    </select>
                </div>

                <!-- TMDB Settings -->
                <div id="tmdbSettings" style="display: none;">
                    <div class="mb-3">
                        <label class="form-label" for="key">TMDB API Key</label>
                        <input class="form-control" id="key" name="key" placeholder="TMDB API KEY" value="<?= htmlspecialchars($currentKey); ?>" type="text" />
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="language">Select TMDB Language</label>
                        <select class="form-control bg-dark text-white" id="language" name="language" data-select2-id="language">
                            <option value="en-US" <?= ($currentLanguage === 'en-US') ? 'selected' : '' ?>>English</option>
                            <option value="ar-AE" <?= ($currentLanguage === 'ar-AE') ? 'selected' : '' ?>>Arabic (United Arab Emirates)</option>
                            <option value="ar-SA" <?= ($currentLanguage === 'ar-SA') ? 'selected' : '' ?>>Arabic (Saudi Arabia)</option>
                            <option value="de-DE" <?= ($currentLanguage === 'de-DE') ? 'selected' : '' ?>>German (Germany)</option>
                            <option value="de-CH" <?= ($currentLanguage === 'de-CH') ? 'selected' : '' ?>>German (Switzerland)</option>
                            <option value="de-AT" <?= ($currentLanguage === 'de-AT') ? 'selected' : '' ?>>German (Austria)</option>
                            <option value="fr-FR" <?= ($currentLanguage === 'fr-FR') ? 'selected' : '' ?>>French (France)</option>
                            <option value="fr-CA" <?= ($currentLanguage === 'fr-CA') ? 'selected' : '' ?>>French (Canada)</option>
                            <option value="ms-MY" <?= ($currentLanguage === 'ms-MY') ? 'selected' : '' ?>>Malay (Malaysia)</option>
                            <option value="ms-SG" <?= ($currentLanguage === 'ms-SG') ? 'selected' : '' ?>>Malay (Singapore)</option>
                            <option value="zh-CN" <?= ($currentLanguage === 'zh-CN') ? 'selected' : '' ?>>Chinese (China)</option>
                            <option value="zh-HK" <?= ($currentLanguage === 'zh-HK') ? 'selected' : '' ?>>Chinese (Hong Kong)</option>
                            <option value="zh-TW" <?= ($currentLanguage === 'zh-TW') ? 'selected' : '' ?>>Chinese (Taiwan)</option>
                            <option value="pt-PT" <?= ($currentLanguage === 'pt-PT') ? 'selected' : '' ?>>Portuguese (Portugal)</option>
                            <option value="pt-BR" <?= ($currentLanguage === 'pt-BR') ? 'selected' : '' ?>>Portuguese (Brazil)</option>
                            <option value="es-ES" <?= ($currentLanguage === 'es-ES') ? 'selected' : '' ?>>Spanish (Spain)</option>
                            <option value="es-MX" <?= ($currentLanguage === 'es-MX') ? 'selected' : '' ?>>Spanish (Mexico)</option>
                        </select>
                    </div>
                </div>

                <!-- Plex Settings -->
                <div id="plexSettings" style="display: none;">
                    <div class="mb-3">
                        <label class="form-label" for="url">PLEX URL</label>
                        <input class="form-control" id="url" name="url" placeholder="IP:PORT" value="<?= htmlspecialchars($currentUrl); ?>" type="text" />
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="token">PLEX TOKEN</label>
                        <input class="form-control" id="token" name="token" placeholder="PLEX TOKEN" value="<?= htmlspecialchars($currentToken); ?>" type="text" />
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="key">TMDB API Key (used for Media Logo)</label>
                        <input class="form-control" id="key" name="key" placeholder="TMDB API KEY" value="<?= htmlspecialchars($currentKey); ?>" type="text" />
                    </div>
                </div>

                <div class="text-left">
                    <button class="btn btn-warning mt-3 d-inline me-2" type="submit">Save Settings</button>
                    <button class="btn btn-danger mt-3 d-inline me-2" type="button" onclick="deleteCache()">Delete Cache</button>

                </div>

            </form>
        </div>
    </div>
<div class="card bg-dark text-white mt-4">
    <div class="card-header">
        <h5 class="mb-0">Backdrop View Settings</h5>
        <div class="title-divider"></div>
    </div>

    <div class="container-fluid">
        <div class="row">
            <!-- First Card -->
            <div class="col-md-6 mb-4">
                <div class="card-body card-backdrop d-flex flex-column align-items-center">
                    <div class="mb-3 text-center">
                        <label class="form-label" for="inputField1">Movie/Show Card centered</label>
                    </div>
                    <div id="toast-container"></div>

                    <!-- Thumbnails Side by Side -->
                    <div class="d-flex flex-wrap justify-content-center align-items-center mb-3" style="width: 100%; gap: 10px;">
                        <img src="assets/images/backdrops/backdrop.jpg" alt="Thumbnail 1" style="max-width: 100%; max-height: 150px;" class="img-fluid rounded shadow-sm" />
                        <img src="assets/images/backdrops/backdrop_app.jpg" alt="Thumbnail 2" style="max-width: 100%; max-height: 150px;" class="img-fluid rounded shadow-sm" />
                    </div>

                    <!-- Buttons with Space in Between -->
                    <div class="d-flex mb-3" style="gap: 5px;">
                        <button class="btn btn-warning" onclick="copyToClipboard('inputField1')">Copy URL</button>
                        <button class="btn btn-success" type="button" onclick="window.open('/api/backdrop.php', '_blank')">Preview Backdrop</button>
                    </div>

                    <input class="form-control text-center" id="inputField1" value="https://webviews.streamnet.live/api/backdrop.php" type="text" readonly style="max-width: 500px;" />
                </div>
            </div>

            <!-- Repeat structure for additional cards -->

           <!-- Second Card -->
<div class="col-md-6 mb-4">
    <div class="card-body card-backdrop d-flex flex-column align-items-center">
        <div class="mb-3 text-center">
            <label class="form-label" for="inputField2">Movie/Show Card right centered</label>
        </div>
        <div id="toast-container"></div>

        <!-- Responsive Thumbnails Side by Side -->
        <div class="d-flex flex-wrap justify-content-center align-items-center mb-3" style="width: 100%; gap: 10px;">
            <img src="assets/images/backdrops/backdrop_v.jpg" alt="Thumbnail 1" class="img-fluid rounded shadow-sm" style="max-width: 100%; max-height: 150px;" />
            <img src="assets/images/backdrops/backdrop_app_v.jpg" alt="Thumbnail 2" class="img-fluid rounded shadow-sm" style="max-width: 100%; max-height: 150px;" />
        </div>

        <!-- Buttons with Space in Between -->
        <div class="d-flex mb-3" style="gap: 5px;">
            <button class="btn btn-warning" onclick="copyToClipboard('inputField2')">Copy URL</button>
            <button class="btn btn-success" type="button" onclick="window.open('/api/backdrop_v.php', '_blank')">Preview Backdrop</button>
        </div>

        <input class="form-control text-center" id="inputField2" value="https://webviews.streamnet.live/api/backdrop_v.php" type="text" readonly style="max-width: 500px;" />
    </div>
</div>


            <!-- Third Card -->
            <div class="col-md-6 mb-4">
                <div class="card-body card-backdrop d-flex flex-column align-items-center">
                    <div class="mb-3 text-center">
                        <label class="form-label" for="inputField3">Movie/Show Card hidden</label>
                    </div>
                    <div id="toast-container"></div>

                    <!-- Thumbnails Side by Side -->
                    <div class="d-flex flex-wrap justify-content-center align-items-center mb-3" style="width: 100%; gap: 10px;">
                        <img src="assets/images/backdrops/backdrop_nc.jpg" alt="Thumbnail 1" class="img-fluid rounded shadow-sm" style="max-width: 100%; max-height: 150px;" />
                        <img src="assets/images/backdrops/backdrop_nc.jpg" alt="Thumbnail 2" class="img-fluid rounded shadow-sm" style="max-width: 100%; max-height: 150px;" />
                    </div>

                    <!-- Buttons with Space in Between -->
                    <div class="d-flex mb-3" style="gap: 5px;">
                        <button class="btn btn-warning" onclick="copyToClipboard('inputField3')">Copy URL</button>
                        <button class="btn btn-success" type="button" onclick="window.open('/api/backdrop_nc.php', '_blank')">Preview Backdrop</button>
                    </div>

                    <input class="form-control text-center" id="inputField3" value="https://webviews.streamnet.live/api/backdrop_nc.php" type="text" readonly style="max-width: 500px;" />
                </div>
            </div>
        </div>
    </div>
</div>


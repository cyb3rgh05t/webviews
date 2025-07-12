<?php
session_start();
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit();
}

// Include the database configuration
require 'config/marquee_db.php';

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
    header('Content-Type: application/json');

    $response = [
        'success' => false,
        'message' => 'Invalid request'
    ];

    try {
        // Handle form submission
        $header_t = $_POST['header_t'] ?? '';
        $header_t_c = $_POST['header_t_c'] ?? '#ffffff';
        $header_b_c = $_POST['header_b_c'] ?? '#000000';
        $marquee_t_c = $_POST['marquee_t_c'] ?? '#000000';
        $marquee_b_c = $_POST['marquee_b_c'] ?? '#ffffff';
        $marquee_t = $_POST['marquee_t'] ?? '';

        // Validate that at least one field has content
        if (empty($header_t) && empty($marquee_t)) {
            $response = ['success' => false, 'message' => 'Either header text or marquee text must be provided'];
        } else {
            // Update the record
            $stmt = $db->prepare("UPDATE marquee SET 
                              header_t = :header_t,
                              header_t_c = :header_t_c,
                              header_b_c = :header_b_c,
                              marquee_t_c = :marquee_t_c,
                              marquee_b_c = :marquee_b_c,
                              marquee_t = :marquee_t
                              WHERE id = 1");

            $stmt->bindValue(':header_t', $header_t, SQLITE3_TEXT);
            $stmt->bindValue(':header_t_c', $header_t_c, SQLITE3_TEXT);
            $stmt->bindValue(':header_b_c', $header_b_c, SQLITE3_TEXT);
            $stmt->bindValue(':marquee_t_c', $marquee_t_c, SQLITE3_TEXT);
            $stmt->bindValue(':marquee_b_c', $marquee_b_c, SQLITE3_TEXT);
            $stmt->bindValue(':marquee_t', $marquee_t, SQLITE3_TEXT);

            if ($stmt->execute()) {
                $response = ['success' => true, 'message' => 'Marquee settings saved successfully'];
            } else {
                $response = ['success' => false, 'message' => 'Error: Failed to save marquee settings'];
            }
        }
    } catch (Exception $e) {
        $response = ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }

    echo json_encode($response);
    $db->close();
    exit();
}

// Fetch current data for display
$result = $db->query("SELECT * FROM marquee WHERE id = 1");
$res = $result->fetchArray(SQLITE3_ASSOC);

// If no data found, use defaults
if (!$res) {
    $res = [
        'header_t' => '',
        'header_t_c' => '#ffffff',
        'header_b_c' => '#000000',
        'marquee_t_c' => '#000000',
        'marquee_b_c' => '#ffffff',
        'marquee_t' => ''
    ];
}
?>

<!-- HTML Content starts here -->
<div class="container mt-4">
    <div class="card bg-dark text-white">
        <div class="card-header">
            <h5 class="mb-0">Scrolling Marquee Settings</h5>
            <div class="title-divider"></div>
        </div>
        <div class="card-body">
            <!-- Current Settings Display -->
            <?php if (!empty($res['header_t']) || !empty($res['marquee_t'])): ?>
                <div class="notification notification-warning" role="alert">
                    Marquee is currently configured with
                    <?php if (!empty($res['header_t'])): ?>
                        <strong>Header: "<?= htmlspecialchars($res['header_t']) ?>"</strong>
                    <?php endif; ?>
                    <?php if (!empty($res['header_t']) && !empty($res['marquee_t'])): ?> and <?php endif; ?>
                    <?php if (!empty($res['marquee_t'])): ?>
                        <strong>Message: "<?= htmlspecialchars($res['marquee_t']) ?>"</strong>
                    <?php endif; ?>
                </div>
            <?php endif; ?>

            <div id="notification" class="notification" style="display:none;"></div>

            <form id="marqueeForm" method="POST">
                <!-- Header Settings -->
                <div class="mb-4">


                    <div class="mb-3">
                        <label class="form-label" for="header_t">Header Text</label>
                        <input class="form-control bg-dark text-white"
                            id="header_t"
                            name="header_t"
                            value="<?= htmlspecialchars($res['header_t']) ?>"
                            type="text"
                            placeholder="Enter header text" />
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label" for="header_t_c">Header Text Color</label>
                                <input class="form-control"
                                    id="header_t_c"
                                    name="header_t_c"
                                    value="<?= htmlspecialchars($res['header_t_c']) ?>"
                                    type="color" />
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label" for="header_b_c">Header Background Color</label>
                                <input class="form-control"
                                    id="header_b_c"
                                    name="header_b_c"
                                    value="<?= htmlspecialchars($res['header_b_c']) ?>"
                                    type="color" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Marquee Settings -->
                <div class="mb-4">

                    <div class="mb-3">
                        <label class="form-label" for="marquee_t">Marquee Message</label>
                        <textarea rows="4"
                            class="form-control bg-dark text-white"
                            id="marquee_t"
                            name="marquee_t"
                            placeholder="Enter your marquee message here..."><?= htmlspecialchars($res['marquee_t']) ?></textarea>
                    </div>


                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label" for="marquee_t_c">Marquee Text Color</label>
                                <input class="form-control"
                                    id="marquee_t_c"
                                    name="marquee_t_c"
                                    value="<?= htmlspecialchars($res['marquee_t_c']) ?>"
                                    type="color" />
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label" for="marquee_b_c">Marquee Background Color</label>
                                <input class="form-control"
                                    id="marquee_b_c"
                                    name="marquee_b_c"
                                    value="<?= htmlspecialchars($res['marquee_b_c']) ?>"
                                    type="color" />
                            </div>
                        </div>
                    </div>


                </div>

                <!-- Live Preview Section -->
                <div class="mb-4">
                    <h6 class="text-warning mb-3">
                        <i class=""></i>Live Preview
                    </h6>
                    <div class="border rounded p-3" style="background-color: #f8f9fa;">
                        <div id="preview-container" style="display: flex; font-family: Arial, sans-serif;">
                            <span id="preview-header"
                                style="background: <?= htmlspecialchars($res['header_b_c']) ?>; 
                                         color: <?= htmlspecialchars($res['header_t_c']) ?>; 
                                         font-weight: bold; 
                                         padding: 0.5rem;
                                         display: flex;
                                         align-items: center;
                                         justify-content: center;
                                         min-width: 150px;">
                                <?= htmlspecialchars($res['header_t']) ?: 'Header Preview' ?>
                            </span>
                            <div id="preview-wrapper"
                                style="flex: 1; 
                                        padding: 0.5rem; 
                                        background: <?= htmlspecialchars($res['marquee_b_c']) ?>; 
                                        color: <?= htmlspecialchars($res['marquee_t_c']) ?>; 
                                        overflow: hidden;">
                                <marquee id="preview-marquee"
                                    behavior="scroll"
                                    direction="left"
                                    scrollamount="3">
                                    <?= htmlspecialchars($res['marquee_t']) ?: 'Marquee text will appear here...' ?>
                                </marquee>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="text-left">
                    <button class="btn btn-warning mt-3 d-inline me-2" type="submit">Save Settings</button>
                    <button class="btn btn-danger mt-3 d-inline me-2" type="button" onclick="resetForm()">Reset Marquee</button>

                </div>
            </form>
        </div>
    </div>

    <!-- API Information Card -->
    <div class="container-fluid mt-4">
        <div class="row justify-content-center">
            <div class="col-md-8 mb-4">
                <div class="card-body card-backdrop d-flex flex-column align-items-center">
                    <div class="mb-3 text-center">
                        <label class="form-label">Marquee API Endpoints</label>
                    </div>

                    <!-- JSON API Live Preview -->
                    <div class="d-flex flex-wrap justify-content-center align-items-center mb-3" style="width: 100%; gap: 10px;">
                        <div class="bg-secondary text-white p-3 rounded" style="width: 100%; max-height: 150px; overflow: auto; font-family: monospace; font-size: 11px;">
                            <div id="json-preview">
                                <strong>JSON Response Preview:</strong><br>
                                {<br>
                                &nbsp;&nbsp;"success": true,<br>
                                &nbsp;&nbsp;"data": {<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;"header_t": "<span id="json-header-text"><?= htmlspecialchars($res['header_t']) ?></span>",<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;"marquee_t": "<span id="json-marquee-text"><?= htmlspecialchars($res['marquee_t']) ?></span>",<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;"header_t_c": "<span id="json-header-color"><?= htmlspecialchars($res['header_t_c']) ?></span>",<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;...<br>
                                &nbsp;&nbsp;}<br>
                                }
                            </div>
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="d-flex mb-3" style="gap: 5px;">
                        <button class="btn btn-warning" onclick="copyToClipboard('marqueeDisplayUrl')">Copy Display URL</button>
                        <button class="btn btn-success" type="button" onclick="window.open('api/marquee_display.php', '_blank')">Preview Marquee</button>
                        <button class="btn btn-info" type="button" onclick="window.open('api/marquee.php', '_blank')">Test JSON API</button>
                    </div>

                    <!-- URLs Display -->
                    <div class="w-100" style="max-width: 600px;">
                        <div class="mb-2">
                            <small class="text-muted">Display URL (for embedding):</small>
                            <input class="form-control text-center"
                                id="marqueeDisplayUrl"
                                value="<?= $_SERVER['REQUEST_SCHEME'] ?>://<?= $_SERVER['HTTP_HOST'] ?><?= dirname($_SERVER['REQUEST_URI']) ?>/api/marquee_display.php"
                                type="text"
                                readonly />
                        </div>
                        <div>
                            <small class="text-muted">JSON API URL:</small>
                            <input class="form-control text-center"
                                id="marqueeApiUrl"
                                value="<?= $_SERVER['REQUEST_SCHEME'] ?>://<?= $_SERVER['HTTP_HOST'] ?><?= dirname($_SERVER['REQUEST_URI']) ?>/api/marquee.php"
                                type="text"
                                readonly />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- JavaScript for AJAX form submission and live preview -->
<script src="assets/js/marquee.js"></script>
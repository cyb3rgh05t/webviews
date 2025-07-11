<?php
session_start();
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit();
}

// Include the database configuration
require 'config/marquee_db.php';

// Handle form submission
if (isset($_POST['submit'])) {
    $header_t = $_POST['header_t'] ?? '';
    $header_t_c = $_POST['header_t_c'] ?? '#ffffff';
    $header_b_c = $_POST['header_b_c'] ?? '#000000';
    $marquee_t_c = $_POST['marquee_t_c'] ?? '#000000';
    $marquee_b_c = $_POST['marquee_b_c'] ?? '#ffffff';
    $marquee_t = $_POST['marquee_t'] ?? '';

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
        echo "<script>window.location.href='marquee.php?status=1'</script>";
    } else {
        echo "<script>alert('Error updating marquee settings.');</script>";
    }
}

// Fetch current data
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

<!-- Main content area -->
<div class="content container-fluid" id="main-content">
    <div class="row justify-content-center">
        <div class="col-md-8">

            <?php if (isset($_GET['status']) && $_GET['status'] == 1): ?>
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <strong>Success!</strong> Marquee settings updated successfully.
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            <?php endif; ?>

            <div class="card bg-dark text-white">
                <div class="card-header">
                    <h2 class="mb-0">
                        <i class="fas fa-bullhorn mr-2"></i> Scrolling Marquee Settings
                    </h2>
                </div>
                <div class="card-body">
                    <form method="post">

                        <!-- Header Settings -->
                        <h4 class="text-warning mb-3">Header Settings</h4>

                        <div class="form-group">
                            <label class="form-label">Header Name</label>
                            <input class="form-control bg-dark text-white"
                                name="header_t"
                                value="<?= htmlspecialchars($res['header_t']) ?>"
                                type="text"
                                placeholder="Enter header text" />
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Header Text Color</label>
                                    <input class="form-control"
                                        name="header_t_c"
                                        value="<?= htmlspecialchars($res['header_t_c']) ?>"
                                        type="color" />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Header Background Color</label>
                                    <input class="form-control"
                                        name="header_b_c"
                                        value="<?= htmlspecialchars($res['header_b_c']) ?>"
                                        type="color" />
                                </div>
                            </div>
                        </div>

                        <hr class="bg-light">

                        <!-- Marquee Settings -->
                        <h4 class="text-warning mb-3">Marquee Settings</h4>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Marquee Text Color</label>
                                    <input class="form-control"
                                        name="marquee_t_c"
                                        value="<?= htmlspecialchars($res['marquee_t_c']) ?>"
                                        type="color" />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Marquee Background Color</label>
                                    <input class="form-control"
                                        name="marquee_b_c"
                                        value="<?= htmlspecialchars($res['marquee_b_c']) ?>"
                                        type="color" />
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Marquee Message</label>
                            <textarea rows="6"
                                class="form-control bg-dark text-white"
                                name="marquee_t"
                                placeholder="Enter your marquee message here..."><?= htmlspecialchars($res['marquee_t']) ?></textarea>
                        </div>

                        <!-- Preview Section -->
                        <div class="form-group mt-4">
                            <h4 class="text-warning mb-3">Preview</h4>
                            <div class="border rounded p-3" style="background-color: #f8f9fa;">
                                <div id="header-preview"
                                    class="text-center p-2 mb-2 rounded"
                                    style="background-color: <?= htmlspecialchars($res['header_b_c']) ?>; color: <?= htmlspecialchars($res['header_t_c']) ?>;">
                                    <strong><?= htmlspecialchars($res['header_t']) ?: 'Header Preview' ?></strong>
                                </div>
                                <div id="marquee-preview"
                                    class="p-2 rounded overflow-hidden"
                                    style="background-color: <?= htmlspecialchars($res['marquee_b_c']) ?>; color: <?= htmlspecialchars($res['marquee_t_c']) ?>;">
                                    <div class="marquee-text">
                                        <?= htmlspecialchars($res['marquee_t']) ?: 'Marquee text will appear here...' ?>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="form-group text-center mt-4">
                            <button class="btn btn-warning btn-lg" name="submit" type="submit">
                                <i class="fas fa-save mr-2"></i> Save Settings
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Custom CSS for marquee animation -->
<style>
    .marquee-text {
        white-space: nowrap;
        animation: marquee 10s linear infinite;
    }

    @keyframes marquee {
        0% {
            transform: translateX(100%);
        }

        100% {
            transform: translateX(-100%);
        }
    }

    .card {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .form-control:focus {
        border-color: #ffc107;
        box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.25);
    }

    .text-warning {
        color: #ffc107 !important;
    }
</style>

<!-- Live Preview JavaScript -->
<script>
    // Update preview in real-time
    function updatePreview() {
        const headerText = document.querySelector('input[name="header_t"]').value || 'Header Preview';
        const headerTextColor = document.querySelector('input[name="header_t_c"]').value;
        const headerBgColor = document.querySelector('input[name="header_b_c"]').value;
        const marqueeText = document.querySelector('textarea[name="marquee_t"]').value || 'Marquee text will appear here...';
        const marqueeTextColor = document.querySelector('input[name="marquee_t_c"]').value;
        const marqueeBgColor = document.querySelector('input[name="marquee_b_c"]').value;

        const headerPreview = document.getElementById('header-preview');
        const marqueePreview = document.getElementById('marquee-preview');

        headerPreview.innerHTML = '<strong>' + headerText + '</strong>';
        headerPreview.style.color = headerTextColor;
        headerPreview.style.backgroundColor = headerBgColor;

        marqueePreview.querySelector('.marquee-text').textContent = marqueeText;
        marqueePreview.style.color = marqueeTextColor;
        marqueePreview.style.backgroundColor = marqueeBgColor;
    }

    // Add event listeners for real-time preview
    document.addEventListener('DOMContentLoaded', function() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', updatePreview);
        });
    });
</script>
<?php
// api/marquee_display.php
// Connect to the SQLite database
$db = new SQLite3('../databases/marquee.db');

// Query to retrieve marquee settings
$query = "SELECT * FROM marquee WHERE id = 1 LIMIT 1";
$result = $db->query($query);
$marqueeData = $result->fetchArray(SQLITE3_ASSOC);

// Close the database connection
$db->close();

// Set default values if no data found
if (!$marqueeData) {
    $marqueeData = [
        'header_t' => '',
        'header_t_c' => '#ffffff',
        'header_b_c' => '#000000',
        'marquee_t' => '',
        'marquee_t_c' => '#000000',
        'marquee_b_c' => '#ffffff'
    ];
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scrolling Marquee</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #000;
        }

        .marquee-container {
            width: 100%;
            position: relative;
        }

        .marquee-header {
            text-align: center;
            padding: 10px;
            font-weight: bold;
            font-size: 1.2em;
            background-color: <?= htmlspecialchars($marqueeData['header_b_c']) ?>;
            color: <?= htmlspecialchars($marqueeData['header_t_c']) ?>;
        }

        .marquee-wrapper {
            background-color: <?= htmlspecialchars($marqueeData['marquee_b_c']) ?>;
            color: <?= htmlspecialchars($marqueeData['marquee_t_c']) ?>;
            padding: 15px 0;
            overflow: hidden;
            white-space: nowrap;
            position: relative;
        }

        .marquee-text {
            display: inline-block;
            padding-left: 100%;
            animation: marquee 30s linear infinite;
            font-size: 1.1em;
        }

        @keyframes marquee {
            0% {
                transform: translate3d(0, 0, 0);
            }

            100% {
                transform: translate3d(-100%, 0, 0);
            }
        }

        /* Pause animation on hover */
        .marquee-wrapper:hover .marquee-text {
            animation-play-state: paused;
        }

        /* Hide if no content */
        .marquee-container.empty {
            display: none;
        }
    </style>
</head>

<body>
    <?php if (!empty($marqueeData['header_t']) || !empty($marqueeData['marquee_t'])): ?>
        <div class="marquee-container">
            <?php if (!empty($marqueeData['header_t'])): ?>
                <div class="marquee-header">
                    <?= htmlspecialchars($marqueeData['header_t']) ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($marqueeData['marquee_t'])): ?>
                <div class="marquee-wrapper">
                    <div class="marquee-text">
                        <?= htmlspecialchars($marqueeData['marquee_t']) ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    <?php else: ?>
        <div class="marquee-container empty">
            <!-- No content to display -->
        </div>
    <?php endif; ?>

    <script>
        // Auto refresh every 30 seconds to check for updates
        setTimeout(function() {
            window.location.reload();
        }, 30000);

        // Optional: Add keyboard controls
        document.addEventListener('keydown', function(e) {
            if (e.key === 'r' || e.key === 'R') {
                window.location.reload();
            }
        });
    </script>
</body>

</html>
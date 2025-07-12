<?php
// api/marquee_display.php
// Connect to the SQLite database
$db = new SQLite3('../databases/marquee.db');

// Query to retrieve marquee settings
$query = "SELECT * FROM marquee WHERE id = 1 LIMIT 1";
$result = $db->query($query);
$res = $result->fetchArray(SQLITE3_ASSOC);

// Close the database connection
$db->close();

// Set default values if no data found
if (!$res) {
    $res = [
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
        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }

        body {
            min-height: 100vh;
            font-family: "arial";
        }

        .container {
            display: flex;
        }

        .container p .container marquee {
            padding: 0;
        }

        .label {
            background: <?= htmlspecialchars($res['header_b_c']) ?>;
            color: <?= htmlspecialchars($res['header_t_c']) ?>;
            font-weight: bold;
            padding: 0.5rem;
        }

        marquee {
            flex: 1;
            padding: 0.5rem;
            background: <?= htmlspecialchars($res['marquee_b_c']) ?>;
            color: <?= htmlspecialchars($res['marquee_t_c']) ?>;
        }

        .text {
            padding: 0.5rem;
            animation: 10s marquee linear infinite;
            background: black;
        }

        @keyframes marquee {
            0% {
                transform: translateX(100%);
            }

            100% {
                transform: translateX(-100%);
            }
        }

        /* Responsive Design - keep horizontal layout */
        @media (max-width: 768px) {
            .container {
                flex-direction: row;
                /* Keep horizontal layout */
            }

            .label {
                font-size: 0.9rem;
                /* Smaller font on mobile */
                padding: 0.4rem;
                min-width: 80px;
                /* Ensure minimum width */
            }

            marquee {
                font-size: 0.9rem;
                /* Smaller font on mobile */
                padding: 0.4rem;
            }
        }

        @media (max-width: 480px) {
            .label {
                font-size: 0.8rem;
                padding: 0.3rem;
                min-width: 60px;
            }

            marquee {
                font-size: 0.8rem;
                padding: 0.3rem;
            }
        }

        /* Hide if no content */
        .container.empty {
            display: none;
        }
    </style>
</head>

<body>
    <?php if (!empty($res['header_t']) || !empty($res['marquee_t'])): ?>
        <div class="container">
            <span class="label"><?= htmlspecialchars($res['header_t']) ?></span>
            <marquee behavior="scroll" direction="left" scrollamount="3">
                <?= htmlspecialchars($res['marquee_t']) ?>
            </marquee>
        </div>
    <?php else: ?>
        <div class="container empty">
            <!-- Empty state - nothing to display -->
        </div>
    <?php endif; ?>
</body>

</html>
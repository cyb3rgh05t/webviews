<?php
// api/marquee.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Connect to the SQLite database
$db = new SQLite3('../databases/marquee.db');

try {
    // Query to retrieve marquee settings
    $query = "SELECT * FROM marquee WHERE id = 1 LIMIT 1";
    $result = $db->query($query);
    $marqueeData = $result->fetchArray(SQLITE3_ASSOC);

    if ($marqueeData) {
        // Return the data as JSON
        echo json_encode([
            'success' => true,
            'data' => [
                'header' => [
                    'text' => $marqueeData['header_t'],
                    'text_color' => $marqueeData['header_t_c'],
                    'background_color' => $marqueeData['header_b_c']
                ],
                'marquee' => [
                    'text' => $marqueeData['marquee_t'],
                    'text_color' => $marqueeData['marquee_t_c'],
                    'background_color' => $marqueeData['marquee_b_c']
                ]
            ]
        ]);
    } else {
        // Return default values if no data found
        echo json_encode([
            'success' => true,
            'data' => [
                'header' => [
                    'text' => '',
                    'text_color' => '#ffffff',
                    'background_color' => '#000000'
                ],
                'marquee' => [
                    'text' => '',
                    'text_color' => '#000000',
                    'background_color' => '#ffffff'
                ]
            ]
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

// Close the database connection
$db->close();

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
    $res = $result->fetchArray(SQLITE3_ASSOC);

    if ($res) {
        // Return the data in the format your application expects
        echo json_encode([
            'success' => true,
            'data' => [
                // Direct database values for easy use
                'header_t' => $res['header_t'],
                'header_t_c' => $res['header_t_c'],
                'header_b_c' => $res['header_b_c'],
                'marquee_t' => $res['marquee_t'],
                'marquee_t_c' => $res['marquee_t_c'],
                'marquee_b_c' => $res['marquee_b_c'],

                // Structured format for advanced usage
                'header' => [
                    'text' => $res['header_t'],
                    'text_color' => $res['header_t_c'],
                    'background_color' => $res['header_b_c']
                ],
                'marquee' => [
                    'text' => $res['marquee_t'],
                    'text_color' => $res['marquee_t_c'],
                    'background_color' => $res['marquee_b_c']
                ],

                // CSS-ready format for direct style injection
                'css_styles' => [
                    'header_style' => "background: {$res['header_b_c']}; color: {$res['header_t_c']}; font-weight: bold; padding: 0.5rem;",
                    'marquee_style' => "flex: 1; padding: 0.5rem; background: {$res['marquee_b_c']}; color: {$res['marquee_t_c']};"
                ],

                // HTML-ready format
                'html_ready' => [
                    'complete_html' => generateMarqueeHTML($res),
                    'css_only' => generateMarqueeCSS($res)
                ]
            ],
            'timestamp' => date('Y-m-d H:i:s'),
            'api_version' => '2.0'
        ], JSON_PRETTY_PRINT);
    } else {
        // Return default values if no data found
        $defaults = [
            'header_t' => '',
            'header_t_c' => '#ffffff',
            'header_b_c' => '#000000',
            'marquee_t' => '',
            'marquee_t_c' => '#000000',
            'marquee_b_c' => '#ffffff'
        ];

        echo json_encode([
            'success' => true,
            'data' => [
                'header_t' => $defaults['header_t'],
                'header_t_c' => $defaults['header_t_c'],
                'header_b_c' => $defaults['header_b_c'],
                'marquee_t' => $defaults['marquee_t'],
                'marquee_t_c' => $defaults['marquee_t_c'],
                'marquee_b_c' => $defaults['marquee_b_c'],
                'header' => [
                    'text' => $defaults['header_t'],
                    'text_color' => $defaults['header_t_c'],
                    'background_color' => $defaults['header_b_c']
                ],
                'marquee' => [
                    'text' => $defaults['marquee_t'],
                    'text_color' => $defaults['marquee_t_c'],
                    'background_color' => $defaults['marquee_b_c']
                ],
                'css_styles' => [
                    'header_style' => "background: {$defaults['header_b_c']}; color: {$defaults['header_t_c']}; font-weight: bold; padding: 0.5rem;",
                    'marquee_style' => "flex: 1; padding: 0.5rem; background: {$defaults['marquee_b_c']}; color: {$defaults['marquee_t_c']};"
                ],
                'html_ready' => [
                    'complete_html' => generateMarqueeHTML($defaults),
                    'css_only' => generateMarqueeCSS($defaults)
                ]
            ],
            'message' => 'No marquee data found, returning defaults',
            'timestamp' => date('Y-m-d H:i:s'),
            'api_version' => '2.0'
        ], JSON_PRETTY_PRINT);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s'),
        'api_version' => '2.0'
    ], JSON_PRETTY_PRINT);
}

// Close the database connection
$db->close();

/**
 * Generate complete HTML for marquee
 */
function generateMarqueeHTML($data)
{
    $headerText = htmlspecialchars($data['header_t']);
    $marqueeText = htmlspecialchars($data['marquee_t']);

    return '<div class="container">
        <span class="label">' . $headerText . '</span>
        <marquee behavior="scroll" direction="left" scrollamount="3">' . $marqueeText . '</marquee>
    </div>';
}

/**
 * Generate CSS for marquee styling
 */
function generateMarqueeCSS($data)
{
    return "
.container { display: flex; }
.label { 
    background: {$data['header_b_c']}; 
    color: {$data['header_t_c']}; 
    font-weight: bold; 
    padding: 0.5rem; 
}
marquee { 
    flex: 1; 
    padding: 0.5rem; 
    background: {$data['marquee_b_c']}; 
    color: {$data['marquee_t_c']}; 
}";
}

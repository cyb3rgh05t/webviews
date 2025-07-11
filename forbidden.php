<?php
// Enhanced security measures
error_reporting(0);
ini_set('display_errors', 0);

// Prevent information disclosure
header('X-Powered-By: Secure System');
header('HTTP/1.1 403 Forbidden');
header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Enhanced IP detection function
function getClientIP() {
    $ipSources = [
        'HTTP_CLIENT_IP',
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_FORWARDED',
        'HTTP_FORWARDED_FOR',
        'HTTP_FORWARDED',
        'REMOTE_ADDR'
    ];

    foreach ($ipSources as $key) {
        if (array_key_exists($key, $_SERVER)) {
            $ip = $_SERVER[$key];
            // Validate IP
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return 'Unknown';
}

// Enhanced browser and OS detection
function detectBrowser() {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    
    $browsers = [
        'Edg' => 'Microsoft Edge',
        'Chrome' => 'Google Chrome',
        'Firefox' => 'Mozilla Firefox',
        'Safari' => 'Apple Safari',
        'Opera' => 'Opera',
        'MSIE' => 'Internet Explorer',
        'Trident' => 'Internet Explorer'
    ];

    foreach ($browsers as $key => $name) {
        if (strpos($userAgent, $key) !== false) {
            return $name;
        }
    }
    return 'Unknown Browser';
}

function detectOS() {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    
    $osList = [
        'Windows NT 10.0' => 'Windows 10/11',
        'Windows NT 6.3' => 'Windows 8.1',
        'Windows NT 6.2' => 'Windows 8',
        'Windows NT 6.1' => 'Windows 7',
        'Macintosh' => 'macOS',
        'iPhone' => 'iOS',
        'iPad' => 'iPadOS',
        'Android' => 'Android',
        'Linux' => 'Linux'
    ];

    foreach ($osList as $key => $name) {
        if (strpos($userAgent, $key) !== false) {
            return $name;
        }
    }
    return 'Unknown OS';
}

// Enhanced logging
function logAccessAttempt($ip) {
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $ip,
        'browser' => detectBrowser(),
        'os' => detectOS(),
        'uri' => $_SERVER['REQUEST_URI'] ?? 'Unknown',
        'referrer' => $_SERVER['HTTP_REFERER'] ?? 'Direct Access'
    ];

    $logPath = dirname(__FILE__) . '/../secure_logs/access_denied.log';
    
    // Ensure log directory exists
    $logDir = dirname($logPath);
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0755, true);
    }

    // Log entry
    $logEntry = json_encode($logData) . "\n";
    @file_put_contents($logPath, $logEntry, FILE_APPEND | LOCK_EX);
}

// Detect and log IP
$clientIP = getClientIP();
logAccessAttempt($clientIP);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Access Denied</title>
    <style>
        :root {
            --bg-dark: #0a0a0a;
            --text-green: #00ff41;
            --text-white: #e0e0e0;
            --border-color: #00ff41;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Courier New', Courier, monospace;
        }
        body {
            background-color: var(--bg-dark);
            color: var(--text-green);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            line-height: 1.6;
        }
        .terminal {
            width: 100%;
            max-width: 600px;
            background-color: rgba(0,0,0,0.8);
            border: 2px solid var(--border-color);
            padding: 20px;
            box-shadow: 0 0 20px rgba(0,255,65,0.3);
        }
        .terminal-header {
            color: var(--text-green);
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 10px;
        }
        .terminal-body {
            color: var(--text-white);
        }
        .detail {
            margin-bottom: 10px;
        }
        .detail-label {
            color: var(--text-green);
            margin-right: 10px;
        }
        .blink {
            animation: blink 1s infinite;
        }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        .action-buttons {
            margin-top: 20px;
            display: flex;
            gap: 10px;
        }
        .btn {
            padding: 10px 15px;
            background-color: transparent;
            border: 1px solid var(--text-green);
            color: var(--text-green);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .btn:hover {
            background-color: var(--text-green);
            color: var(--bg-dark);
        }
        @media (max-width: 600px) {
            .terminal {
                margin: 0 10px;
            }
            .action-buttons {
                flex-direction: column;
            }
            .btn {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="terminal">
        <div class="terminal-header">
            <span class="blink">></span> ACCESS DENIED
        </div>
        <div class="terminal-body">
            <div class="detail">
                <span class="detail-label">[TIME]</span> 
                <?php echo date('Y-m-d H:i:s'); ?>
            </div>
            <div class="detail">
                <span class="detail-label">[IP]</span> 
                <?php echo htmlspecialchars($clientIP); ?>
            </div>
            <div class="detail">
                <span class="detail-label">[BROWSER]</span> 
                <?php echo htmlspecialchars(detectBrowser()); ?>
            </div>
            <div class="detail">
                <span class="detail-label">[OS]</span> 
                <?php echo htmlspecialchars(detectOS()); ?>
            </div>
            <div class="detail">
                <span class="detail-label">[STATUS]</span> 
                UNAUTHORIZED ACCESS ATTEMPT DETECTED
            </div>
        </div>
        <div class="action-buttons">
            <button class="btn" onclick="window.location.href='/login.php';">HOME</button>
            <button class="btn" onclick="history.back();">GO BACK</button>
        </div>
    </div>

    <script>
        console.warn('Unauthorized access attempt blocked.');
    </script>
</body>
</html>
<?php
// Terminate script execution
exit();
?>
<?php
date_default_timezone_set('Europe/Berlin');
$API_KEY = "222668";

$eventId = $_GET['id'] ?? '';
$showVideo = isset($_GET['show_video']);
if (!$eventId) {
    echo "No event specified.";
    exit;
}

// --- German Date/Time Helper Functions ---
function getGermanDayName($timestamp) {
    $days = [
        'Monday' => 'Montag',
        'Tuesday' => 'Dienstag', 
        'Wednesday' => 'Mittwoch',
        'Thursday' => 'Donnerstag',
        'Friday' => 'Freitag',
        'Saturday' => 'Samstag',
        'Sunday' => 'Sonntag'
    ];
    return $days[date('l', $timestamp)] ?? date('l', $timestamp);
}

function getGermanMonthName($timestamp) {
    $months = [
        'January' => 'Januar',
        'February' => 'Februar',
        'March' => 'März',
        'April' => 'April',
        'May' => 'Mai',
        'June' => 'Juni',
        'July' => 'Juli',
        'August' => 'August',
        'September' => 'September',
        'October' => 'Oktober',
        'November' => 'November',
        'December' => 'Dezember'
    ];
    return $months[date('F', $timestamp)] ?? date('F', $timestamp);
}

function formatGermanDate($timestamp) {
    $day = getGermanDayName($timestamp);
    $dayNum = date('j', $timestamp);
    $month = getGermanMonthName($timestamp);
    $year = date('Y', $timestamp);
    return "$day, $dayNum. $month $year";
}

// --- Caching ---
$safeEventId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $eventId);
$cacheDir = 'cache/event_details/';
if (!is_dir($cacheDir)) mkdir($cacheDir, 0755, true);
$cacheFile = $cacheDir . $safeEventId . '.json';
$cacheTime = 3600;

if (file_exists($cacheFile) && time() - filemtime($cacheFile) < $cacheTime) {
    $eventData = json_decode(file_get_contents($cacheFile), true);
} else {
    $url = "https://www.thesportsdb.com/api/v1/json/{$API_KEY}/lookupevent.php?id=" . urlencode($eventId);
    $json = @file_get_contents($url);
    $eventData = $json ? json_decode($json, true) : null;
    if ($eventData && !empty($eventData['events'])) {
        file_put_contents($cacheFile, json_encode($eventData));
    }
}

$event = $eventData['events'][0] ?? null;
if (!$event) {
    die("Event not found.");
}

// --- TV Channels ---
$channelData = @json_decode(file_get_contents("https://www.thesportsdb.com/api/v1/json/$API_KEY/lookuptv.php?id=$eventId"), true);
$channels = $channelData['tvevent'] ?? [];

// --- Event Timing ---
$eventDate = $event['dateEvent'] ?? $event['strDate'] ?? null;
$eventTime = $event['strTime'] ?? null;

$isLive = false;
$ended = false;
$startBerlin = null;

if ($eventDate && $eventTime) {
    // Convert from UTC to Berlin time
    $startUTC = strtotime("$eventDate $eventTime UTC");
    $startBerlin = $startUTC; // Since we set timezone to Europe/Berlin, this will be converted automatically
    $now = time();
    $liveDuration = 7200;

    if ($now >= $startUTC && $now <= $startUTC + $liveDuration) {
        $isLive = true;
    } elseif ($now > $startUTC + $liveDuration) {
        $ended = true;
    }
}

// --- Back URL ---
$backUrl = 'sport_guide.php?sport=' . urlencode($event['strSport']) . '&league=all';

// --- Video Embed ---
$videoEmbedUrl = null;
if (!empty($event['strVideo'])) {
    $videoUrl = $event['strVideo'];
    if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $videoUrl, $match)) {
        $youtubeId = $match[1];
        $videoEmbedUrl = "https://www.youtube.com/embed/" . $youtubeId;
    }
}

$banner = (!empty($event['strBanner'])) ? $event['strBanner'] : 
          ((!empty($event['strThumb'])) ? $event['strThumb'] : 
          'https://www.legrand.co.uk/modules/custom/legrand_ecat/assets/img/no-image.png');

// --- Helper Function for Channels ---
function getChannelLogosFromAPI($eventId, $fallbackText = '') {
    global $channels;
    if (!$channels) {
        return '<div class="no-channels">' . htmlspecialchars($fallbackText ?: 'Keine Übertragungsinformationen verfügbar.') . '</div>';
    }

    $output = '<div class="channel-list">';
    foreach ($channels as $channel) {
        $name = htmlspecialchars($channel['strChannel'] ?? 'Unbekannter Sender');
        $logo = htmlspecialchars($channel['strLogo'] ?? '');
        $output .= '<div class="channel-item">';
        if ($logo) {
            $output .= '<img src="' . $logo . '" alt="' . $name . '" class="channel-logo">';
        }
        $output .= '<span>' . $name . '</span>';
        $output .= '</div>';
    }
    $output .= '</div>';

    return $output;
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Event: <?= htmlspecialchars($event['strEvent']) ?></title>
    <style>
        body { background: #001f3f; color: #fff; font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: auto; background: #003366; padding: 20px; border-radius: 8px; }
        .banner { 
            width: 100%; 
            height: 180px; 
            border-radius: 6px; 
            margin-bottom: 20px; 
            background: #0c2548; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            overflow: hidden;
        }
        h1 { text-align: center; }
        h3 { text-align: center; font-size: 2em; margin: 10px 0; }
        .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 20px; }
        .detail-item { background: #004080; padding: 15px; border-radius: 4px; }
        .detail-item strong { color: #aad8ff; display: block; margin-bottom: 5px; text-transform: uppercase; font-size: 0.8em; }
        .description { margin-top: 20px; line-height: 1.6; background: #002952; padding: 15px; border-radius: 4px; }
        .actions { text-align: center; margin: 20px 0; display: flex; justify-content: center; gap: 15px; }
        .btn { display: inline-block; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; transition: background-color 0.2s; }
        .btn-back { background-color: #007bff; color: white; }
        .btn-highlights { background-color: #e50914; color: white; }
        .video-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; margin-bottom: 20px; border-radius: 6px; }
        .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

        /* Channel styling */
        .channel-list { margin-top: 15px; }
        .channel-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            background: #003366;
            padding: 8px 12px;
            border-radius: 6px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .channel-logo {
            width: 75px;
            height: 40px;
            object-fit: contain;
            background: #152238;
            border-radius: 4px;
            margin-right: 15px;
            border: 1px solid #0077cc;
        }
        .no-channels {
            margin-top: 20px;
            font-style: italic;
            color: #ff4444;
            font-weight: bold;
        }

        .ai-summary {
            margin-top: 20px;
            padding: 12px;
            background: #111;
            border-left: 4px solid #00cc66;
            font-size: 14px;
        }

        .ai-summary strong {
            color: #00ff99;
        }
    </style>
</head>
<body>

<div class="container">

    <?php if ($showVideo && $videoEmbedUrl): ?>
        <h1>Highlights</h1>
        <div class="video-container">
            <iframe src="<?= htmlspecialchars($videoEmbedUrl) ?>?autoplay=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
    <?php else: ?>
        <div class="banner">
            <?php if (!empty($banner) && $banner !== 'https://www.legrand.co.uk/modules/custom/legrand_ecat/assets/img/no-image.png'): ?>
                <img src="<?= htmlspecialchars($banner) ?>" alt="Event Banner" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <span style="color: #ccc; font-size: 18px; display: none;">Kein Event-Banner verfügbar</span>
            <?php else: ?>
                <span style="color: #ccc; font-size: 18px;">Kein Event-Banner verfügbar</span>
            <?php endif; ?>
        </div>
        <!-- Debug: Banner URL = "<?= htmlspecialchars($banner) ?>" -->
        <!-- Debug: strBanner = "<?= htmlspecialchars($event['strBanner'] ?? 'NULL') ?>" -->
        <!-- Debug: strThumb = "<?= htmlspecialchars($event['strThumb'] ?? 'NULL') ?>" -->
    <?php endif; ?>

    <h1><?= htmlspecialchars($event['strEvent']) ?></h1>
    <?php if (isset($event['intHomeScore'])): ?>
        <h3><?= htmlspecialchars($event['intHomeScore']) ?> - <?= htmlspecialchars($event['intAwayScore']) ?></h3>
    <?php endif; ?>

    <div class="actions">
        <a href="<?= htmlspecialchars($backUrl) ?>" class="btn btn-back">Zurück zum Guide</a>
        <?php if (!$showVideo && $videoEmbedUrl): ?>
            <a href="?id=<?= urlencode($eventId) ?>&show_video=1" class="btn btn-highlights">Highlights ansehen</a>
        <?php endif; ?>
    </div>

    <div class="details-grid">
        <div class="detail-item"><strong>Liga</strong> <?= htmlspecialchars($event['strLeague']) ?></div>
        <div class="detail-item"><strong>Sport</strong> <?= htmlspecialchars($event['strSport']) ?></div>
        <div class="detail-item"><strong>Datum</strong> <?= $eventDate ? formatGermanDate(strtotime($event['dateEvent'])) : 'Nicht verfügbar' ?></div>
        <div class="detail-item"><strong>Zeit (MEZ/MESZ)</strong> <?= $eventTime ? htmlspecialchars(date('H:i', strtotime($event['strTime'] . ' UTC'))) : 'Nicht verfügbar' ?></div>
        <div class="detail-item"><strong>Austragungsort</strong> <?= htmlspecialchars($event['strVenue']) ?></div>
        <div class="detail-item"><strong>Status</strong> <?= htmlspecialchars($event['strStatus']) ?></div>
    </div>

    <div class="detail-item" style="margin-top: 15px;">
        <strong>TV-Sender</strong>
        <?= getChannelLogosFromAPI($eventId, $event['strTVStation'] ?? '') ?>
    </div>

    <div class="description">
        <h2>Event-Zusammenfassung</h2>
        <?php if (!empty($event['strDescriptionEN'])): ?>
            <p><?= nl2br(htmlspecialchars($event['strDescriptionEN'])) ?></p>
        <?php else: ?>
            <p>Keine Beschreibung für dieses Event verfügbar.</p>
        <?php endif; ?>
    </div>

</div>
</body>
</html>
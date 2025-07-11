<?php
date_default_timezone_set('UTC');
$API_KEY = "222668"; // Your API Key
$cacheDir = 'cache/';
$sportsCacheFile = $cacheDir . 'sports.json';
$eventsCacheDir = $cacheDir . 'events/';
$cacheTime = 86400;      // 24 hours
$eventCacheTime = 21600; // 6 hours

// Ensure cache directories exist
if (!is_dir($cacheDir)) mkdir($cacheDir, 0755, true);
if (!is_dir($eventsCacheDir)) mkdir($eventsCacheDir, 0755, true);

/**
 * Generates HTML for TV channel logos. The API only provides text names,
 * so this function maps those names to known logo images.
 */

function getChannelLogos($tvStationString) {
    $logoMap = [
        'ESPN' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/ESPN_wordmark.svg/512px-ESPN_wordmark.svg.png',
        'Sky' => 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Sky_Sports_logo.svg/512px-Sky_Sports_logo.svg.png',
        'BT Sport' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/BT_Sport_logo.svg/440px-BT_Sport_logo.svg.png',
        'BBC' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/BBC_logo_2021.svg/512px-BBC_logo_2021.svg.png',
        'ITV' => 'https://upload.wikimedia.org/wikipedia/en/thumb/9/92/ITV_logo_2019.svg/512px-ITV_logo_2019.svg.png',
        'beIN' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Bein_Sports_logo.svg/512px-Bein_Sports_logo.svg.png',
        'TNT' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/TNT_Sports_logo.svg/512px-TNT_Sports_logo.svg.png',
        'Fox' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Fox_Sports_logo.svg/512px-Fox_Sports_logo.svg.png'
    ];
    $logosHtml = '';
    if (empty($tvStationString)) return '';
    $channels = preg_split('/[;,\/]/', $tvStationString);
    $foundLogos = [];
    foreach ($channels as $channel) {
        $channel = trim($channel);
        foreach ($logoMap as $name => $logoUrl) {
            if (stripos($channel, $name) !== false && !in_array($logoUrl, $foundLogos)) {
                $logosHtml .= '<img src="' . htmlspecialchars($logoUrl) . '" alt="' . htmlspecialchars($name) . '" title="' . htmlspecialchars($channel) . '" loading="lazy">';
                $foundLogos[] = $logoUrl;
            }
        }
    }
    if (empty($logosHtml)) {
        error_log("No matched logo for TV channel string: " . $tvStationString);
        $logosHtml .= '<div style="font-size:11px;color:#ccc;margin-top:4px;">TV: ' . htmlspecialchars($tvStationString) . '</div>';
    }
    return $logosHtml;
}

// Load sports list
if (file_exists($sportsCacheFile) && time() - filemtime($sportsCacheFile) < $cacheTime) {
    $sportsList = json_decode(file_get_contents($sportsCacheFile), true);
} else {
    $sportsList = json_decode(@file_get_contents("https://www.thesportsdb.com/api/v1/json/$API_KEY/all_sports.php") ?: '{"sports":[]}', true);
    file_put_contents($sportsCacheFile, json_encode($sportsList));
}
$availableSports = array_column($sportsList['sports'] ?? [], 'strSport');

// --- FILTERS ---
$selectedSport = $_GET['sport'] ?? 'all';
$selectedLeague = $_GET['league'] ?? 'all';

// Load leagues only if a specific sport is selected
$targetLeagues = [];
if ($selectedSport !== 'all') {
    $safeSportName = preg_replace('/[^a-zA-Z0-9]/', '', $selectedSport);
    $leagueCacheFile = $cacheDir . 'leagues_' . $safeSportName . '.json';
    if (file_exists($leagueCacheFile) && time() - filemtime($leagueCacheFile) < $cacheTime) {
        $leagueList = json_decode(file_get_contents($leagueCacheFile), true);
    } else {
        $url = "https://www.thesportsdb.com/api/v1/json/$API_KEY/search_all_leagues.php?s=" . urlencode($selectedSport);
        $leagueList = json_decode(@file_get_contents($url) ?: '{"countries":[]}', true);
        file_put_contents($leagueCacheFile, json_encode($leagueList));
    }
    $targetLeagues = array_column($leagueList['countries'] ?? [], 'strLeague');
    sort($targetLeagues);
}

// --- EVENT FETCHING ---
$allEvents = [];
$sportsToFetch = ($selectedSport === 'all') ? $availableSports : [$selectedSport];

// PERFORMANCE FIX: Load a smaller date window for "All Sports" to prevent timeouts.
$dateWindowStart = ($selectedSport === 'all') ? -1 : -2; // Past days
$dateWindowEnd = ($selectedSport === 'all') ? 2 : 7;   // Future days

foreach ($sportsToFetch as $sport) {
    for ($i = $dateWindowStart; $i < $dateWindowEnd; $i++) {
        $date = date('Y-m-d', strtotime("$i day"));
        $safeSportName = preg_replace('/[^a-zA-Z0-9]/', '', $sport);
        $cacheFile = $eventsCacheDir . $safeSportName . '_' . $date . '.json';

        if (file_exists($cacheFile) && time() - filemtime($cacheFile) < $eventCacheTime) {
            $data = json_decode(file_get_contents($cacheFile), true);
        } else {
            $url = "https://www.thesportsdb.com/api/v1/json/$API_KEY/eventsday.php?d=$date&s=".urlencode($sport);
            $json = @file_get_contents($url);
            $data = $json ? json_decode($json, true) : ['events' => []];
            file_put_contents($cacheFile, json_encode($data));
        }

        if (!empty($data['events'])) {
            foreach ($data['events'] as $event) {
                if ($selectedLeague === 'all' || $selectedLeague === $event['strLeague']) {
                    $event['matchDate'] = $date;
                    $event['strThumb'] = $event['strThumb'] ?? 'https://www.legrand.co.uk/modules/custom/legrand_ecat/assets/img/no-image.png';
                    $allEvents[] = $event;
                }
            }
        }
    }
}

// --- ADVANCED SORTING LOGIC ---
usort($allEvents, function($a, $b) {
    $now = time();
    $startTimeA = strtotime($a['matchDate'] . ' ' . $a['strTime']);
    $hasHighlightsA = !empty($a['strVideo']);
    $scoreA = 4; // Default: Upcoming
    if ($now > $startTimeA + 7200) $scoreA = 1; // Ended
    elseif ($now >= $startTimeA) $scoreA = 2; // Live
    elseif ($hasHighlightsA) $scoreA = 3; // Upcoming with Highlights

    $startTimeB = strtotime($b['matchDate'] . ' ' . $b['strTime']);
    $hasHighlightsB = !empty($b['strVideo']);
    $scoreB = 4; // Default: Upcoming
    if ($now > $startTimeB + 7200) $scoreB = 1; // Ended
    elseif ($now >= $startTimeB) $scoreB = 2; // Live
    elseif ($hasHighlightsB) $scoreB = 3; // Upcoming with Highlights

    if ($scoreA !== $scoreB) return $scoreA <=> $scoreB;
    if ($scoreA === 1) return $startTimeB <=> $startTimeA;
    return $startTimeA <=> $startTimeB;
});
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Premium Sports Guide</title>
<style>
  body {background:#001f3f;color:#fff;font-family:Arial,sans-serif;margin:0;padding:0;}
  header{background:#003366;padding:10px;text-align:center;}
  .filters-container{padding:10px;background:#002952;}
  .filters{margin:auto;max-width:800px;display:flex;justify-content:center;flex-wrap:wrap;gap:10px;}
  .filters select{padding:8px;font-size:14px;border-radius:4px;border:1px solid #888; background:#004080; color:white;}
  select:disabled { background: #555; cursor: not-allowed; }
  .status-filters {display:flex;justify-content:center;gap:10px;margin:10px 0;}
  .status-btn {background-color:#004080;color:white;padding:8px 15px;border:1px solid #0077cc;border-radius:5px;cursor:pointer;transition:background-color 0.2s; font-size:14px;}
  .status-btn.active {background-color:#0077cc;font-weight:bold;}
  .events{padding:10px;}
  .event-row{display:flex;flex-wrap:wrap;justify-content:center;gap:16px;}
  .event-card-wrapper { position: relative; width:260px; height:170px; display: block; }
  a.event-card-link {
    display:block; width:100%; height:100%;
    background-size:cover;background-position:center;
    border:2px solid #0077cc; /* Default: Upcoming */
    position:relative;border-radius:6px; box-shadow:0 4px 8px rgba(0,0,0,0.3);
    overflow:hidden; color:white;text-decoration:none; transition: all 0.2s;
  }
  a.event-card-link:hover { transform: scale(1.03); border-color:#00ffff; }
  .card-live a.event-card-link { border-color: #00ff00; }
  .card-ended a.event-card-link { border-color: #888; }
  .event-info {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% - 16px); /* Account for padding */
    height: calc(100% - 16px); /* Account for padding */
    padding: 8px;
    background: linear-gradient(to top, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.2) 100%);
    display: flex;
    flex-direction: column; 
    justify-content: space-between;
    align-items: center; 
    font-size: 14px; 
    font-weight: bold;
    text-align: center;
}
  .event-details { width: 100%; }
  .winner-name { color: #ffd700; font-weight: bold; }
  .channel-logos { margin-top: 5px; height: 22px; display: flex; justify-content: center; align-items: center; gap: 8px; }
  .channel-logos img { height: 18px; width: auto; background: white; padding: 2px 4px; border-radius: 3px; }
  .highlights-btn { display: inline-block; padding: 6px 12px; background-color: #e50914; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: bold; z-index: 20; }
</style>
</head>
<body>

<header><h1>Premium Sports Guide</h1></header>

<div class="filters-container">
    <div class="filters">
        <label>Sport:
            <select id="sport" onchange="updateFilters()">
                <option value="all" <?= $selectedSport === 'all' ? 'selected' : '' ?>>All Sports</option>
                <?php foreach ($availableSports as $s): ?>
                    <option value="<?=htmlspecialchars($s)?>" <?= $selectedSport === $s ? 'selected' : '' ?>><?=htmlspecialchars($s)?></option>
                <?php endforeach; ?>
            </select>
        </label>
        <label>League:
            <select id="league" onchange="updateFilters()" <?= $selectedSport === 'all' ? 'disabled' : '' ?>>
                <option value="all">All Leagues</option>
                <?php foreach ($targetLeagues as $l): ?>
                    <option value="<?=htmlspecialchars($l)?>" <?= $selectedLeague === $l ? 'selected' : '' ?>><?=htmlspecialchars($l)?></option>
                <?php endforeach; ?>
            </select>
        </label>
    </div>
    <div class="status-filters"> 
    <button class="status-btn active" onclick="filterEventsByStatus('all')">All</button> 
    <button class="status-btn" onclick="filterEventsByStatus('live')">Live</button> 
    <button class="status-btn" onclick="filterEventsByStatus('upcoming')">Upcoming</button> 
    <button class="status-btn" onclick="filterEventsByStatus('ended')">Ended</button>
    <button class="status-btn" onclick="window.location.href='sports_news.php'">Sports News</button>
    <button class="status-btn" onclick="window.location.href='football_tables.php'">Football Tables</button>
</div>
</div>

<section class="events" id="eventsSection">
<div class="event-row">
<?php if (empty($allEvents)): ?>
    <h2 style="text-align:center;width:100%;">No events found for the selected criteria.</h2>
<?php else:
    foreach ($allEvents as $e):
        $startUTC = strtotime($e['matchDate'].' '.$e['strTime']);
        $now = time();
        $isLive = ($now >= $startUTC && $now <= $startUTC + 7200);
        $ended = ($now > $startUTC + 7200);
        $hasHighlights = !empty($e['strVideo']);
        $statusClass = 'upcoming';
        if ($isLive) $statusClass = 'live';
        if ($ended) $statusClass = 'ended';

        $winner = null;
        if ($ended && isset($e['intHomeScore'], $e['intAwayScore']) && $e['intHomeScore'] !== $e['intAwayScore']) {
            if ((int)$e['intHomeScore'] > (int)$e['intAwayScore']) $winner = $e['strHomeTeam'];
            else $winner = $e['strAwayTeam'];
        }
        $eventTitle = htmlspecialchars($e['strEvent']);
        if ($winner) {
            $eventTitle = str_replace(htmlspecialchars($winner), '<span class="winner-name">' . htmlspecialchars($winner) . '</span>', $eventTitle);
        }
?>
    <div class="event-card-wrapper card-<?= $statusClass ?>" data-status="<?= $statusClass ?>">
      <a class="event-card-link" href="event.php?id=<?=urlencode($e['idEvent'])?>" target="_blank" style="background-image:url('<?=htmlspecialchars($e['strThumb'])?>')">
        <div class="event-info">
          <div class="event-details">
            <strong><?= $eventTitle ?></strong><br>
            <small><?=htmlspecialchars($e['strLeague'])?></small><br>
            <?php if ($isLive && isset($e['intHomeScore'])): ?>
              <span style="color:#00ff00;">LIVE â <?=$e['intHomeScore']?> : <?=$e['intAwayScore']?></span>
            <?php elseif ($ended && isset($e['intHomeScore'])): ?>
              <span style="color:#ccc;">Final: <?=$e['intHomeScore']?> : <?=$e['intAwayScore']?></span>
            <?php else: ?>
              <span style="color:#ffc107;"><?= date('D, M j', $startUTC) ?></span>
            <?php endif; ?>
            <?php if(!$ended && !empty($e['strTVStation'])): ?>
                <div class="channel-logos"><?= getChannelLogos($e['strTVStation']) ?></div>
            <?php endif; ?>
          </div>
          <div><span class="event-time" data-datetime="<?= date('c', $startUTC) ?>"></span></div>
        </div>
      </a>
      <?php if ($hasHighlights): ?>
        <a href="event.php?id=<?=urlencode($e['idEvent'])?>&show_video=1" class="highlights-btn" style="position:absolute; bottom:10px; right:10px;">See Highlights</a>
      <?php endif; ?>
    </div>
<?php endforeach; endif; ?>
</div>
</section>

<script>
function filterEventsByStatus(status) {
    document.querySelectorAll('.event-card-wrapper').forEach(card => {
        card.style.display = (status === 'all' || card.dataset.status === status) ? 'block' : 'none';
    });
    document.querySelectorAll('.status-btn').forEach(button => button.classList.remove('active'));
    document.querySelector(`.status-btn[onclick="filterEventsByStatus('${status}')"]`).classList.add('active');
}
function updateFilters() {
    const s = document.getElementById('sport').value;
    const l = (s !== 'all') ? document.getElementById('league').value : 'all';
    window.location.href = `sport_guide.php?sport=${encodeURIComponent(s)}&league=${encodeURIComponent(l)}`;
}
// Other JS functions (updateTimezone, updateTimes, DOMContentLoaded) are the same
// ...
</script>

</body>
</html>
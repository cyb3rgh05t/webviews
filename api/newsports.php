<?php
function fetch_and_process_content($url)
{
    $content = file_get_contents($url);

    $text_replacements = array(
        "../" => "https://www.thesportsdb.com/",
        "/images/icons/flags/" => "https://www.thesportsdb.com/images/icons/flags/",
        "/images/icons/calendar.png" => "https://www.thesportsdb.com/images/icons/calendar.png",
        "/images/icons/time.png" => "https://www.thesportsdb.com/images/icons/time.png"
    );

    $content = str_replace(array_keys($text_replacements), array_values($text_replacements), $content);
    $content = preg_replace('/(<img[^>]+)(>)/i', '$1 style="border-radius: 10px;"$2', $content);

    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML($content);
    libxml_use_internal_errors(false);

    $xpath = new DOMXPath($dom);
    $linkElements = $xpath->query('//a');
    foreach ($linkElements as $linkElement) {
        $linkElement->removeAttribute('href');
    }

    $tdElements = $xpath->query('//td');
    foreach ($tdElements as $tdElement) {
        $tdElement->setAttribute('style', 'text-align: left; vertical-align: top; width: 20%; color: white; text:bold 2px 2px 2px ;');
    }

    return $dom;
}

$premier_league_url = "https://www.thesportsdb.com/league/4328-English-Premier-League";
$english_league_championship_url = "https://www.thesportsdb.com/league/4329-English-League-Championship";
$nfl_url = "https://www.thesportsdb.com/league/4391-NFL";
$efl_trophy_url = "https://www.thesportsdb.com/league/4847-EFL-Trophy";
$efl_cup_url = "https://www.thesportsdb.com/league/4570-EFL-Cup";
$english_t20_blast_url = "https://www.thesportsdb.com/league/4463-English-t20-Blast";
$ipl_url = "https://www.thesportsdb.com/league/4460-Indian-Premier-League";

$premier_league_dom = fetch_and_process_content($premier_league_url);
$english_league_championship_dom = fetch_and_process_content($english_league_championship_url);
$nfl_dom = fetch_and_process_content($nfl_url);
$efl_trophy_dom = fetch_and_process_content($efl_trophy_url);
$efl_cup_dom = fetch_and_process_content($efl_cup_url);
$english_t20_blast_dom = fetch_and_process_content($english_t20_blast_url);
$ipl_dom = fetch_and_process_content($ipl_url);

echo "<!DOCTYPE html>
<html>
<head>
    <title>Sports Guide: Premier League, English League Championship, NFL, EFL Trophy, EFL Cup, English T20 Blast, and IPL</title>
    <style>
        body {
            background-image: url('https://as2.ftcdn.net/v2/jpg/04/17/36/11/1000_F_417361125_RnrhT3Np0zB0UpeD7QlwuOoyghEGGjBX.jpg');
            background-size: cover;
            background-repeat: no-repeat;
            background-attachment: fixed;
            font-family: Arial, sans-serif;
            color: white;
        }
        .container {
            width: 97%;
            margin: auto;
            overflow: hidden;
            background-color: rgba(0, 0, 0, 0.7);
            padding: 20px;
            border-radius: 10px;
        }
        .event {
            background-color: #fff;
            margin: 10px 0;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            color: black;
        }
        .event h2 {
            margin: 0;
            color: #333;
        }
        .event p {
            margin: 5px 0;
            color: #666;
        }
        .scrolling {
            position: fixed;
            bottom: 0;
            width: 100%;
            background-color: #000;
            color: #fff;
            text-align: center;
            padding: 10px 0;
            font-size: 1.2em;
            cursor: pointer;
        }
        .scroll-buttons {
            position: fixed;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
        }
        .scroll-buttons button {
            background-color: rgba(255, 255, 255, 0.7);
            border: none;
            padding: 5px;
            margin: 2.5px;
            cursor: pointer;
            border-radius: 5px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>Premier League Fixtures and Results</h1>";

$premier_league_table = $premier_league_dom->getElementsByTagName('table')->item(0);
if ($premier_league_table) {
    echo $premier_league_dom->saveHTML($premier_league_table);
} else {
    echo "<p>Premier League table not found.</p>";
}

echo "  <h1>English League Championship Fixtures and Results</h1>";

$english_league_championship_table = $english_league_championship_dom->getElementsByTagName('table')->item(0);
if ($english_league_championship_table) {
    echo $english_league_championship_dom->saveHTML($english_league_championship_table);
} else {
    echo "<p>English League Championship table not found.</p>";
}

echo "  <h1>NFL Fixtures and Results</h1>";

$nfl_table = $nfl_dom->getElementsByTagName('table')->item(0);
if ($nfl_table) {
    echo $nfl_dom->saveHTML($nfl_table);
} else {
    echo "<p>NFL table not found.</p>";
}

echo "  <h1>EFL Trophy Fixtures and Results</h1>";

$efl_trophy_table = $efl_trophy_dom->getElementsByTagName('table')->item(0);
if ($efl_trophy_table) {
    echo $efl_trophy_dom->saveHTML($efl_trophy_table);
} else {
    echo "<p>EFL Trophy table not found.</p>";
}

echo "  <h1>EFL Cup Fixtures and Results</h1>";

$efl_cup_table = $efl_cup_dom->getElementsByTagName('table')->item(0);
if ($efl_cup_table) {
    echo $efl_cup_dom->saveHTML($efl_cup_table);
} else {
    echo "<p>EFL Cup table not found.</p>";
}

echo "  <h1>English T20 Blast Fixtures and Results</h1>";

$english_t20_blast_table = $english_t20_blast_dom->getElementsByTagName('table')->item(0);
if ($english_t20_blast_table) {
    echo $english_t20_blast_dom->saveHTML($english_t20_blast_table);
} else {
    echo "<p>English T20 Blast table not found.</p>";
}

echo "  <h1>Indian Premier League (IPL) Fixtures and Results</h1>";

$ipl_table = $ipl_dom->getElementsByTagName('table')->item(0);
if ($ipl_table) {
    echo $ipl_dom->saveHTML($ipl_table);
} else {
    echo "<p>IPL table not found.</p>";
}

echo "  </div>
    <div class='scrolling' onclick='openTelegram()'>🅿🆁🅾🅼🅰🆇</div>
    <div class='scroll-buttons'>
        <button onclick='scrollUp()'>Scroll Up</button>
        <button onclick='scrollDown()'>Scroll Down</button>
        <button onclick='speedUp()'>Speed Up</button>
        <button onclick='slowDown()'>Slow Down</button>
        <button onclick='toggleAutoScroll()'>Toggle Auto Scroll</button>
    </div>
    <script>
    let scrollSpeed = 0.4; // Adjust this value to control the initial scrolling speed
    let scrollTop = 0;
    let autoScroll = true;

    function scroll() {
        if (autoScroll) {
            scrollTop += scrollSpeed;

            if (scrollTop >= document.body.scrollHeight - window.innerHeight) {
                scrollTop = 0;
            }

            window.scrollTo(0, scrollTop);
        }
        requestAnimationFrame(scroll);
    }

    function scrollUp() {
        window.scrollBy(0, -50);
    }

    function scrollDown() {
        window.scrollBy(0, 50);
    }

    function speedUp() {
        scrollSpeed += 0.2;
    }

    function slowDown() {
        if (scrollSpeed > 0.2) {
            scrollSpeed -= 0.2;
        }
    }

    function toggleAutoScroll() {
        autoScroll = !autoScroll;
    }

    function openTelegram() {
        window.open('https://t.me/BA1N5', '_blank');
    }

    function checkScriptIntegrity() {
        const linkElement = document.querySelector('.scrolling');
        if (linkElement && linkElement.getAttribute('onclick') === 'openTelegram()') {
            console.log('Script integrity verified');
        } else {
            console.error('Script integrity compromised');
            // Stop further script execution
            document.body.innerHTML = '<h1>Script integrity compromised. The page is no longer functional.</h1>';
        }
    }

    // Check script integrity on load
    window.addEventListener('load', () => {
        setTimeout(scroll, 1000);
        checkScriptIntegrity();
    });

    // WebSocket setup
    const socket = new WebSocket('ws://localhost:8080');

    socket.addEventListener('message', function (event) {
        const message = event.data;

        if (message === 'stop') {
            autoScroll = false;
        } else if (message === 'start') {
            autoScroll = true;
        } else if (message === 'up') {
            scrollUp();
        } else if (message === 'down') {
            scrollDown();
        } else if (message === 'speedup') {
            speedUp();
        } else if (message === 'slowdown') {
            slowDown();
        }
    });

    socket.addEventListener('open', function (event) {
        console.log('Connected to WebSocket server');
    });

    socket.addEventListener('close', function (event) {
        console.log('Disconnected from WebSocket server');
    });

    socket.addEventListener('error', function (event) {
        console.error('WebSocket error:', event);
    });
    </script>
</body>
</html>";

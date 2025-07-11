<?php
function fetch_and_process_content($url) {
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
        $tdElement->setAttribute('style', 'text-align: center; vertical-align: top; width: 5%; color: white; text:bold 2px 2px 2px ;');
    }

    return $dom;
}

 // Add sports links below

$sport1 = "https://www.thesportsdb.com/browse_events/?s=Soccer";
$sport2 = "https://www.thesportsdb.com/browse_events/?s=Fighting";
$sport3 = "https://www.thesportsdb.com/browse_events/?s=Basketball";
$sport4 = "https://www.thesportsdb.com/browse_events/?s=American-Football";

$sport1_dom = fetch_and_process_content($sport1);
$sport2_dom = fetch_and_process_content($sport2);
$sport3_dom = fetch_and_process_content($sport3);
$sport4_dom = fetch_and_process_content($sport4);

echo "<!DOCTYPE html>
<html>
<head>
    <title>Sports Guide: G-MAN TV Sports</title>
    <style>
        body {
            background-color:#003E7C;
            font-family: Arial, sans-serif;
            color: white;
        }
        .container {
            width: 96%;
            margin: auto;
            overflow: hidden;
            background-color: rgba(0, 0, 0, 0.7);
            padding: 20px;
            border-radius: 20px;
        }
        .event {
            background-color: #fff;
            margin: 10px 0;
            padding: 10px;
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
            top: 0;
            width: 100%;
            background-color: #000;
            color: #94f;
            text-align: center;
            padding: 10px 0;
            font-size: 1.2em;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1> Motorsport</h1>";

$sport1 = $sport1_dom->getElementsByTagName('table')->item(0);
if ($sport1)
{
    echo $sport1_dom->saveHTML($sport1);
} else {
    echo "<p>No  Events.</p>";
}

echo "  <h1>Fighting</h1>";

$sport2 = $sport2_dom->getElementsByTagName('table')->item(0);
if ($sport2) {
    echo $sport2_dom->saveHTML($sport2);
    
} else {
    echo "<p>No Events</p>";
}

echo "  <h1>BasketBall</h1>";

$sport3 = $sport3_dom->getElementsByTagName('table')->item(0);
if ($sport3) {
    echo $sport3_dom->saveHTML($sport3);
} else {
    echo "<p>No Events</p>";
}

echo "  <h1>American Football</h1>";

$sport4 = $sport4_dom->getElementsByTagName('table')->item(0);
if ($sport4) {
    echo $sport4_dom->saveHTML($sport4);
} else {
    echo "<p>No Events</p>";
}

echo "  </div>
    <div class='scrolling'>G-Mans SportX</div>
    <script>
    const scrollSpeed = 0.4; // Adjust this value to control the scrolling speed
    let scrollTop = 0;

    function scroll() {
        scrollTop += scrollSpeed;

        if (scrollTop >= document.body.scrollHeight - window.innerHeight) {
            scrollTop = 0;
        }

        window.scrollTo(0, scrollTop);
        requestAnimationFrame(scroll);
    }

    // Start scrolling after a 1-second delay
    window.addEventListener('load', () => {
        setTimeout(scroll, 1000);
    });
    </script>
</body>
</html>";
?>

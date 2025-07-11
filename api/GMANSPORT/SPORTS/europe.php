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

$sport1 = "https://www.thesportsdb.com/league/4480-UEFA-Champions-League";
$sport2 = "https://www.thesportsdb.com/league/4481-UEFA-Europa-League";
$sport3 = "https://www.thesportsdb.com/league/5071-UEFA-Conference-League";
$sport4 = "";

$sport1_dom = fetch_and_process_content($sport1);
$sport2_dom = fetch_and_process_content($sport2);
$sport3_dom = fetch_and_process_content($sport3);
$sport4_dom = fetch_and_process_content($sport4);

echo "<!DOCTYPE html>
<html>
<head>
    <title> G-MANS SPORTX FIXTURES</title>
    <style>
        body 
        
         {
            background-image: url('https://g-manmods.co.uk/GMANSPORT/images/uefa.jpg');
            background-size: cover;
            background-repeat: no-repeat;
            background-attachment: fixed;
            font-family: Arial, sans-serif;
            color: #07D8FF;
            
        }
        
        
        .container {
            width: 96%;
            margin: auto;
            overflow: hidden;
            background-color: rgba(0, 0, 0, 0.5);
            padding: 20px;
            border-radius: 20px;
        }
        .event {
            background-color: #000CB7;
            margin: 10px 0;
            padding: 10px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            color: white;
        }
        .event h2 {
            margin: 0;
            color: #000CB7;
        }
        .event p {
            margin: 5px 0;
            color: #000CB7;
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
    
    
    
        <h1>UEFA-Champions-League Fixtures and Results</h1>";
        
       
         
$sport1 = $sport1_dom->getElementsByTagName('table')->item(0);
if ($sport1)
{
    echo $sport1_dom->saveHTML($sport1);
} else {
    echo "<p>UEFA-Champions-League not found.</p>";
}



echo "  <h1>UEFA-Europa-League Fixtures and Results</h1>";

$sport2 = $sport2_dom->getElementsByTagName('table')->item(0);
if ($sport2) {
    echo $sport2_dom->saveHTML($sport2);
    
} else {
    echo "<p>UEFA-Europa-League not found</p>";
}



echo "  <h1>UEFA-Conference-League</h1>";

$sport3 = $sport3_dom->getElementsByTagName('table')->item(0);
if ($sport3) {
    echo $sport3_dom->saveHTML($sport3);
} else {
    echo "<p>UEFA-Conference-League not found.</p>";
}



echo "  <h1>League Two</h1>";

$sport4 = $sport4_dom->getElementsByTagName('table')->item(0);
if ($sport4) {
    echo $sport4_dom->saveHTML($sport4);
} else {
    echo "<p> table not found.</p>";
}



echo "    

    
   <script>
        let scrollSpeed = 0.4; // Adjust this value to control the scrolling speed
        let scrollTop = 0;
        let isManualScroll = false;
        let autoScrollTimeout;

        function scroll() {
            if (!isManualScroll) {
                scrollTop += scrollSpeed;
                if (scrollTop >= document.body.scrollHeight - window.innerHeight) {
                    scrollTop = 0;
                }
                window.scrollTo(0, scrollTop);
            }
            requestAnimationFrame(scroll);
        }

        function resetAutoScroll() {
            isManualScroll = false;
            clearTimeout(autoScrollTimeout);
            autoScrollTimeout = setTimeout(() => {
                isManualScroll = false;
            }, 2000);
        }

        window.addEventListener('load', () => {
            setTimeout(scroll, 1000);
        });

        window.addEventListener('scroll', () => {
            isManualScroll = true;
            scrollTop = window.scrollY;
            resetAutoScroll();
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowUp') {
                isManualScroll = true;
                scrollTop = Math.max(0, scrollTop - 50); // Adjust this value to control manual scroll speed
                window.scrollTo(0, scrollTop);
                resetAutoScroll();
            } else if (event.key === 'ArrowDown') {
                isManualScroll = true;
                scrollTop = Math.min(document.body.scrollHeight - window.innerHeight, scrollTop + 50); // Adjust this value to control manual scroll speed
                window.scrollTo(0, scrollTop);
                resetAutoScroll();
            }
        });
    </script
</body>
</html>";
?>

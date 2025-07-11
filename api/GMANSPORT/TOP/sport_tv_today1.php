<?php

$url = 'https://www.thesportsdb.com/browse_tv.php';
$data = file_get_contents($url);
preg_match_all('/<table.*?>(.*?)<\/table>/si', $data, $matches); 
$table = $matches[0][0];
$content = preg_replace('/(<a href=.*?>)/', '<a>', $table);
echo '<style>td{ color: white; text-align:left;} table{background-color: rgba(0, 0, 0, 0.5);} scroll{autoscroll=1}  </style>';
echo str_replace(
    array("../",
		  "/images/icons/time.png",
		  "/images/icons/calendar.png",
		  "/images/noneWide-medium.jpg"
		  ),
    array("https://www.thesportsdb.com/",
		  "https://www.thesportsdb.com/images/icons/time.png" , 
		  "https://www.thesportsdb.com/images/icons/calendar.png" , 
		  "https://www.thesportsdb.com/images/noneWide-medium.jpg"
		  ),
	  
    $content
    

    
);

echo "<script>
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

    // Start scrolling after a 5-second delay
    window.addEventListener('load', () => {
        setTimeout(scroll, 5000);
    });
</script>";

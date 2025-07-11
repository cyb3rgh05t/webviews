<html>

<head>
	<meta name="viewport" content='width=device-width, initial-scale=1.0,text/html,charset=utf-8'>
	<style>
     body {
		margin: 0;
		/* Reset default margin */
	}
	iframe {
		display: ;
		background: transparent;
		border: none;
		height: 600vh;
		width: 100vw;
	}
	
	</style>
</head>

<body>
<?php
$url = "https://rebrands.sytes.net/IBOHAX3.5/TEST/api/sport.php";
?>

<iframe id="iframe" src="<?=$url?>" frameborder="0" scrolling="auto"></iframe>

echo "

<div class='scrolling'>G-Mans SportX</div>


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
</html>
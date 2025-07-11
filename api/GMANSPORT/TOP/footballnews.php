<!DOCTYPE html>
<html lang="en">
<head>
<link rel="shortcut icon" href=".img/logo.png" type="image/x-icon">
<title>G-MAN ᴇᴠᴇɴᴛ ʟɪsᴛɪɴɢs</title>
</head>
<body style="background-color: #001932">

<div class="fwp-embed" data-background-color="#00274e" data-color="#f9fafa" data-font-family="Chakra Petch" data-border-color="#e3bc23" data-heading-color="#6daef3" data-hover-background-color="#144471" data-url="news"></div>


<script src="https://www.footballwebpages.co.uk/embed.js" defer></script>


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

   
    
<script src="https://www.footballwebpages.co.uk/embed.js" defer></script>
</body>
</html>
<!DOCTYPE html>
<html lang="en">
<head>
<link rel="shortcut icon" href=".img/logo.png" type="image/x-icon">
<title>G-MAN ᴇᴠᴇɴᴛ ʟɪsᴛɪɴɢs</title>
  <style>
        /* Hide the message from Football Web Pages */
        .fwp-embed a[href*="footballwebpages.co.uk"] {
            display: none;
        }
    </style>
</head>
<body style="background-color: #001932">

<div class="fwp-embed" data-background-color="#06325f" data-color="#ffffff" data-font-family="Chakra Petch" data-border-color="#00274e" data-heading-color="#e5ba1e" data-hover-background-color="#5e78b3" data-goal-background-color="#fc03c6" data-half-time-full-time-background-color="#1010ea" data-info-background-color="#659dd2" data-url="premier-league/vidiprinter"></div>



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
    </script>
   
    
<script src="https://www.footballwebpages.co.uk/embed.js" defer></script>
</body>
</html>
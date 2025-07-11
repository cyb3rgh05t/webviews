<!DOCTYPE html>

<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>English leagues</title>
    <style>
        body {
            background-image: url('https://g-manmods.co.uk/GMANSPORT/images/footyfixtures2.jpg');
            background-size: cover;
            background-repeat: no-repeat;
            background-attachment: fixed;
            font-family: Arial, sans-serif;
            color: white;
            font-size: 85%; /* Reduce text size to 30% */
        }
        .container {
            width: 95%; /* Reduce margin to 50% */
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
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.9);
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
    <div class="container">
	<div class="fwp-embed" data-background-color="#00274e" data-color="#ffffff" data-font-family="Chakra Petch" data-border-color="#001932" data-heading-color="#ecbb09" data-hover-background-color="#5d79b1" data-url="premier-league/league-table"></div>
<div class="fwp-embed "data-background-color="#00274e" data-color="#ffffff" data-font-family="Chakra Petch" data-border-color="#001932" data-heading-color="#ecbb09" data-hover-background-color="#5d79b1" data-url="championship/league-table"></div>
<div class="fwp-embed" data-background-color="#00274e" data-color="#ffffff" data-font-family="Chakra Petch" data-border-color="#001932" data-heading-color="#ecbb09" data-hover-background-color="#5d79b1"data-url="league-one/league-table"></div>
<div class="fwp-embed" data-background-color="#00274e" data-color="#ffffff" data-font-family="Chakra Petch" data-border-color="#001932" data-heading-color="#ecbb09" data-hover-background-color="#5d79b1"data-url="league-two/league-table"></div>
	
	
	
    </div>
	
	
<script src="https://www.footballwebpages.co.uk/embed.js" defer></script>
   
    <div class="scroll-buttons">
        <button onclick="scrollUp()">Scroll Up</button>
        <button onclick="scrollDown()">Scroll Down</button>
        <button onclick="speedUp()">Speed Up</button>
        <button onclick="slowDown()">Slow Down</button>
        <button onclick="toggleAutoScroll()">Toggle Auto Scroll</button>
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

    // Start scrolling after a 1-second delay
    window.addEventListener('load', () => {
        setTimeout(scroll, 1000);
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

</body></html>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sports Dashboard</title>
    <style>
        
    
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #001f3f; /* Navy blue background for body */
            color: white;
            display: flex;
            height: 100vh;
            overflow: hidden;
        }
        .sidebar {
            width: 140px;
            background-color: #003366; /* Darker navy blue for sidebar */
            padding: 5px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        .icon-container {
            width: 100%;
            text-align: center;
            margin: 1px 0;
            cursor: pointer;
        }
        .sidebar img {
            width: 130px;
            height: 40px;
            
            
        }
        .icon-label {
            margin-top: 1px;
            font-size: 0px;
        }
        .content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            padding: 20px;
            background-color: #00274d; /* Slightly lighter navy blue for content area */
        }
        .header {
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #001933; /* Dark navy blue for header */
            padding: 0 5px;
        }
        .header img {
            height: 70px;
            width: 150px;
            cursor: pointer;
        }
        .webviews {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            margin-top: 10px;
            background-color: #001933; /* Consistent with header color */
            position: relative; /* Ensure splash image can be positioned absolutely */
        }
        .webview {
            flex-grow: 1;
            margin: 5px 0;
            background-color: #001933; /* Consistent with header color */
            border: 1px solid #001933;
            overflow: hidden;
            display: none; /* Hidden by default */
        }
        .webview iframe {
            width: 100%;
            height: 100%;
            background-color: #001933; /* Consistent with header color */
            border: 1px solid #001933;
        }
        .home-page {
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute; /* Position splash absolutely within the webviews section */
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 1;
        }
        .home-page img {
            max-width: 100%;
            max-height: 100%;
        }
    </style>
    <script>
        function loadContent(webviewId, url) {
            document.querySelector('.home-page').style.display = 'none'; // Hide the splash image
            document.querySelectorAll('.webview').forEach(view => {
                view.style.display = 'none'; // Hide all webviews
                view.querySelector('iframe').src = ''; // Clear the src attribute
            });
            const webview = document.getElementById(webviewId);
            webview.querySelector('iframe').src = url;
            webview.style.display = 'flex'; // Show the selected webview
        }

        function goHome() {
            document.querySelector('.home-page').style.display = 'flex'; // Show the splash image
            document.querySelectorAll('.webview').forEach(view => {
                view.style.display = 'none'; // Hide all webviews
                view.querySelector('iframe').src = ''; // Clear the src attribute
            });
        }
    </script>
</head>
<body>

    <div class="sidebar">
        
         <div class="icon-container" onclick="loadContent('webview18', 'https://g-manmods.co.uk/GMANSPORT/SPORTS/europe.php')">
            <img src="https://g-manmods.co.uk/GMANSPORT/images/aueaf1.png" alt="Icon 14">
            <div class="icon-label">UEFA Fixtures</div>
        </div>
        <div class="icon-container" onclick="loadContent('webview1', 'https://g-manmods.co.uk/GMANSPORT/SPORTS/fixtures.php')">
            <img src="https://g-manmods.co.uk/GMANSPORT/images/aef1.png" alt="Icon 1">
            <div class="icon-label">Football Fixtures</div>
        </div>
        <div class="icon-container" onclick="loadContent('webview2', 'https://g-manmods.co.uk/GMANSPORT/SPORTS/tables.php')">
            <img src="https://g-manmods.co.uk/GMANSPORT/images/aet1.png" alt="Icon 2">
            <div class="icon-label">Lge.Tables</div>
        </div>
        <div class="icon-container" onclick="loadContent('webview3', 'https://g-manmods.co.uk/GMANSPORT/SPORTS/scorerseng.php')">
            <img src="https://g-manmods.co.uk/GMANSPORT/images/aes1.png" alt="Icon 3">
            <div class="icon-label">Scorers English</div>
        </div>
        <div class="icon-container" onclick="loadContent('webview4', 'https://g-manmods.co.uk/GMANSPORT/SPORTS/vidprint.php')">
            <img src="https://g-manmods.co.uk/GMANSPORT/images/avp1.png" alt="Icon 5">
            <div class="icon-label">Vidiprinter</div>
        </div>
        <div class="icon-container" onclick="loadContent('webview5', 'https://g-manmods.co.uk/GMANSPORT/SPORTS/topgames.php')">
            <img src="https://g-manmods.co.uk/GMANSPORT/images/atg1.png" alt="Icon 6">
            <div class="icon-label">Top Games</div>
        </div>
        <div class="icon-container" onclick="loadContent('webview6', 'https://g-manmods.co.uk/GMANSPORT/SPORTS/scotishfixtures.php')">
            <img src="https://g-manmods.co.uk/GMANSPORT/images/asf1.png" alt="Icon 11">
            <div class="icon-label">Scottish Fixtures</div>
        </div>
        <div class="icon-container" onclick="loadContent('webview7', 'https://g-manmods.co.uk/GMANSPORT/SPORTS/scottables.php')">
            <img src="https://g-manmods.co.uk/GMANSPORT/images/ast1.png" alt="Icon 12">
            <div class="icon-label">Scottish Tables</div>
        </div>
        <div class="icon-container" onclick="loadContent('webview8', 'https://g-manmods.co.uk/GMANSPORT/SPORTS/scotishscorers.php')">
            <img src="https://g-manmods.co.uk/GMANSPORT/images/ass1.png" alt="Icon 13">
            <div class="icon-label">Scorers Scottish Lge</div>
        </div>
        <div class="icon-container" onclick="loadContent('webview9', 'https://g-manmods.co.uk/GMANSPORT/SPORTS/rugby.php')">
            <img src="https://g-manmods.co.uk/GMANSPORT/images/arugby1.png" alt="Icon 6">
            <div class="icon-label">Rugby</div>
        </div>
        <div class="icon-container" onclick="loadContent('webview10', 'https://g-manmods.co.uk/GMANSPORT/SPORTS/usasports.php')">
            <img src="https://g-manmods.co.uk/GMANSPORT/images/ausa1.png" alt="Icon 6">
            <div class="icon-label">USA Sports</div>
        </div>
        
        
    
        
        <!-- Add more sections as needed -->
    </div>

    <div class="content">
        <div class="header">
            <a href="https://g-manmods.co.uk/GMANSPORT/TOP/sport_top.php#" onclick="loadContent('webview13', 'https://g-manmods.co.uk/GMANSPORT/TOP/sport_top.php'); return false;"> 
                <img src="https://g-manmods.co.uk/GMANSPORT/images/tte.png" alt="Logo 1">
            </a>
            <a href="https://g-manmods.co.uk/GMANSPORT/TOP/sport_tv_today.php#" onclick="loadContent('webview14', 'https://g-manmods.co.uk/GMANSPORT/TOP/sport_tv_today.php'); return false;"> 
                <img src="https://g-manmods.co.uk/GMANSPORT/images/sotv.png" alt="Logo 2">
            </a>
            <a href="https://g-manmods.co.uk/GMANSPORT/TOP/sport.php#" onclick="loadContent('webview15', 'https://g-manmods.co.uk/GMANSPORT/TOP/sport.php'); return false;"> 
                <img src="https://g-manmods.co.uk/GMANSPORT/images/uktvs.png" alt="Logo 3">
            </a>
            <a href="https://g-manmods.co.uk/GMANSPORT/TOP/footballnews.php#" onclick="loadContent('webview16', 'https://g-manmods.co.uk/GMANSPORT/TOP/footballnews.php'); return false;"> 
                <img src="https://g-manmods.co.uk/GMANSPORT/images/fn.png" alt="Logo 5">
            </a>
            <a href="https://g-manmods.co.uk/GMANSPORT/TOP/trial.php#" onclick="loadContent('webview17', 'https://g-manmods.co.uk/GMANSPORT/TOP/trial.php'); return false;"> 
                <img src="https://g-manmods.co.uk/GMANSPORT/images/as.png" alt="Logo 6">
            </a>
        </div>
        <div class="webviews">
            <div class="home-page">
                <img src="https://g-manmods.co.uk/GMANSPORT/images/bg3.jpg" alt="Splash Image">
            </div>
            <div class="webview" id="webview1"><iframe src=""></iframe></div>
            <div class="webview" id="webview2"><iframe src=""></iframe></div>
            <div class="webview" id="webview3"><iframe src=""></iframe></div>
            <div class="webview" id="webview4"><iframe src=""></iframe></div>
            <div class="webview" id="webview5"><iframe src=""></iframe></div>
            <div class="webview" id="webview6"><iframe src=""></iframe></div>
            <div class="webview" id="webview7"><iframe src=""></iframe></div>
            <div class="webview" id="webview8"><iframe src=""></iframe></div>
            <div class="webview" id="webview9"><iframe src=""></iframe></div>
            <div class="webview" id="webview10"><iframe src=""></iframe></div>
            <div class="webview" id="webview11"><iframe src=""></iframe></div>
            <div class="webview" id="webview12"><iframe src=""></iframe></div>
            <div class="webview" id="webview13"><iframe src=""></iframe></div>
            <div class="webview" id="webview14"><iframe src=""></iframe></div>
            <div class="webview" id="webview15"><iframe src=""></iframe></div>
            <div class="webview" id="webview16"><iframe src=""></iframe></div>
            <div class="webview" id="webview17"><iframe src=""></iframe></div>
            <div class="webview" id="webview18"><iframe src=""></iframe></div>
        </div>
    </div>

</body>
</html>

<style>
.containerFrame {width: 100%;}
 .frameData {width: 100%;}
 .hosting{margin:20px;
 font-size:70%;
 padding:6px;
 border:1px solid #17628b;
 margin-bottom:10px;}
 .hosting a{font-weight:bold;color:#17628b;}
 .dataList{padding:20px;}
 </style>
 <script>
 var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
 var eventer = window[eventMethod];
 var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
 eventer(messageEvent,
 function(e) { if(typeof e.data == "number" && e.data > 100) document.getElementById("outputFrame")
 .height = e.data + "px";},
 false);
 </script>
 <iframe class="frameData"
 id="outputFrame"
 src="https://sport-tv-guide.live/sportwidget/5d0f15e711a7?time_zone=&fc=2,15,101&time12=0&sports=15,39,40,1&bg=1717a9&bgs=e0602e&grp=1&sd=0&lng=1" 
 style="position:relative;border:none;
" frameborder="0">
</iframe>
<div style="padding:5px;
text-align:center;
font-size:10px">Powered by <a href="https://sport-tv-guide.live">Live Sports TV Guide</a></div>
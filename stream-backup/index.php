<!DOCTYPE html>
<html>
  <head>
    <title>RPi Cam Preview</title>
    <script src="stream.js"></script>
  </head>
  <body onload="setTimeout('init();', 100);" style="margin:0;">
    <center>
      <div><img id="mjpeg_dest" style="width:100%;"/></div>
    </center>
 </body>
</html>
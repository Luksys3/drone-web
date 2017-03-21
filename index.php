<?php
// Function to get the client IP address
function get_client_ip() {
    $ipaddress = '';
    if (getenv('HTTP_CLIENT_IP'))
        $ipaddress = getenv('HTTP_CLIENT_IP');
    else if(getenv('HTTP_X_FORWARDED_FOR'))
        $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
    else if(getenv('HTTP_X_FORWARDED'))
        $ipaddress = getenv('HTTP_X_FORWARDED');
    else if(getenv('HTTP_FORWARDED_FOR'))
        $ipaddress = getenv('HTTP_FORWARDED_FOR');
    else if(getenv('HTTP_FORWARDED'))
       $ipaddress = getenv('HTTP_FORWARDED');
    else if(getenv('REMOTE_ADDR'))
        $ipaddress = getenv('REMOTE_ADDR');
    else
        $ipaddress = 'UNKNOWN';
    return $ipaddress;
}


if(get_client_ip() != '78.62.212.41'){
	//die();
}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Drone</title>
	<link rel="stylesheet" href="leaflet/leaflet.css" />
	<link rel="stylesheet" href="bootstrap/4.0.0-alpha.6/css/bootstrap.min.css">
	<link rel="stylesheet" href="style.css">
</head>
<body>
	<div id="control_map" style="float:left;"></div>
	<div style="padding: 20px 20px;overflow:hidden;">
		<div>
			<label for="altitude">Point altitude:</label>
			<input type="text" id="altitude" name="altitude"/>
		</div>
		<hr/>
		<div>
			<label for="takeoff_altitude">TakeOff altitude:</label>
			<input type="text" id="takeoff_altitude" name="takeoff_altitude"/>
		<div>
		</div>
			<label for="rtl">RTL:</label>
			<input type="checkbox" id="rtl" name="rtl"/>
		</div>
		<button id="add_mission">Add mission</button><br/><br/>
		<button id="upload_button">Upload</button>
		
		<hr/>
		<button id="force_land">Force land</button><br/>
		<button id="force_rtl">Force RTL</button>
		<div>
			<label for="airspeed">Air speed:</label>
			<input type="text" id="airspeed" name="airspeed"/>
			<button id="airspeed_button">Set</button>
		</div>
		<button id="clear_missions">Clear missions</button>
		
		<hr/>
		<!--<button id="test">Test</button>-->
		<button id="path_points_button">Path points</button>
		<button id="logs_button">Log</button>
		<div class="tabs">
			<div id="path_points_tab">
				<div id="point_moving_arrows_template" style="display:none;">
					<span class="moving_arrows">
						<span class="arrow" move="up">/\</span> 
						<span class="arrow" move="down">\/</span>
					</span>
				</div>
			</div>
			<div id="logs_tab" style="display:none;">
				<button id="add_log">Add log(for debugging)</button><br/>
				<span id="clear_logs" class="link_style">Clear log</span>
				<div class="logs_tab_inner">
					<ul class="logs_data" data-field="logs"></ul>
				</div>
			</div>
		</div>
	</div>
	<!--<button id="clear_path">Clear path</button>-->
	
	<script src="jquery/jquery.min.js"></script>
	<script src="bootstrap/4.0.0-alpha.6/js/bootstrap.min.js"></script>
	<script src="leaflet/leaflet.js"></script>
	
	<script src='https://unpkg.com/leaflet.gridlayer.googlemutant@latest/Leaflet.GoogleMutant.js'></script>
	<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAjqVF4rbv21aS0adfVTfz86C2eveGdnmQ" async defer></script>
	
	<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.3/socket.io.js"></script>
	
	<script src="js/main.js"></script>
</body>
</html>
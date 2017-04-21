var socket;

// ---- Connect ----
socket = io.connect(server_ip);
socket.on('connect', function(){
	addLog('Client has connected to the server!');
	connected = true;
	changeButtons(connected, armed);
	socket.emit('get_config');
	socket.emit('get_data');
});

// ---- Print logs from server ----
socket.on('response',function(data) {
	addLog(data['data'], true);
});

// ---- Get config ----
socket.on('config_response', function(data){
	getSettings(data);
});

// ---- Update information
socket.on('gyro_info', function(data){
	//$('#info_pitch').html(data['pitch']);
	//$('#info_roll').html(data['roll']);
	//$('#info_yaw').html(data['yaw']);
});

socket.on('battery_info', function(data){
	$('#info_battery').html(data["voltage"]);
	$('#info_battery_per').html(data["level"]);
});

socket.on('location_info', function(data){

	droneLat = data['lat'];
	droneLng = data['lng'];

	$('#info_lat').html(data['lat']);
	$('#info_lng').html(data['lng']);
	$('#info_alt').html(data['alt']);

    var newLatLng = new L.LatLng(data['lat'], data['lng']);
	controlMap.panTo(newLatLng);
    try {
		droneMarker.setLatLng(newLatLng);
	} catch(e) { }
	droneLatLng = L.latLng(droneLat, droneLng);
	updatePath();
});

socket.on('speed_info', function(data){
	$('#info_speed_air').html(data['airspeed'].toFixed(2));
	$('#info_speed_ground').html(data['groundspeed'].toFixed(2));
});

socket.on('mode_info', function(data){
	$('#info_mode').html(data);	
});

socket.on('velocity_info', function(data){
	$('#info_speed_x').html(data['x'].toFixed(2));
	$('#info_speed_y').html(data['y'].toFixed(2));
	$('#info_speed_z').html(data['z'].toFixed(2));
});

socket.on('armed_info', function(data){
	if(data){
		$('#info_armed').html('ARMED');
	}
	else{
		$('#info_armed').html('DISARMED');
	}
});

// ---- Handle disconnection ----
socket.on('disconnected',function() {
	addLog('Disconnected from server!');
	connected = false;
	changeButtons(connected, armed);
});

var socket;

// ---- Connect ----
socket = io.connect(server_ip);
socket.on('connect', function(){
	addLog('Client has connected to the server!');
	connected = true;
	changeButtons(connected, armed);
});

// ---- Print logs from server ----
socket.on('response',function(data) {
	addLog(data['data'], true);
});


// ---- Update information
socket.on('gyro', function(data){
	//$('#info_pitch').html(data['pitch']);
	//$('#info_roll').html(data['roll']);
	//$('#info_yaw').html(data['yaw']);
});

socket.on('battery', function(data){
	$('#info_battery').html(data);
});

socket.on('location', function(data){

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

// ---- Handle disconnection ----
socket.on('disconnected',function() {
	addLog('Disconnected from server!');
	connected = false;
	changeButtons(connected, armed);
});

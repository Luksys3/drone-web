var socket;

// ---- Connect ----
socket = io.connect(server_ip);
socket.on('connect', function(){
	addLog('Client has connected to the server!');
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
	$('#info_battery').html(data["voltage"]);
	$('#info_battery_per').html(data["level"]);
	$('#info_speed_air').html(data['airspeed'].toFixed(2));
	$('#info_speed_ground').html(data['groundspeed'].toFixed(2));
	$('#info_mode').html(data["mode"]);
	$('#info_speed_x').html(data['x'].toFixed(2));
	$('#info_speed_y').html(data['y'].toFixed(2));
	$('#info_speed_z').html(data['z'].toFixed(2));
	if(data["armed"]){
		$('#info_armed').html('ARMED');
	}
	else{
		$('#info_armed').html('DISARMED');
	}
	armed = data["armed"]
	changeButtons(connected, armed);

	requestAnimationFrame(function() {
			moveTo(data["compass"]);
	});
	requestAnimationFrame(function() {
			_render(data);
	});
});

// ---- Handle disconnection ----
socket.on('vehicle_success',function(data) {
	if(data)
		socket.emit('get_data');
	connected = data
	if(data){
		$("#arm").removeAttr('disabled');
	}
	else{
		$("#arm").attr("disabled", true);
	}
	changeButtons(data, armed);
});

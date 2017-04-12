var controlMapEl = $('#control_map');
var uploadBtn = $('#upload_button');
var addMissionTakeoffBtn = $('#add_mission_takeoff');
var addMissionRtlBtn = $('#add_mission_rtl');
var takeOffAltEl = $('#takeoff_altitude');
var clearMissions = $('#clear_missions');
var pathPointsContainter = $('#path_points_tab');
var logsContainer = $('#logs_tab');
var logsInner = $('#logs_tab .logs_tab_inner');
var logsEl = $('[data-field=logs]');
var clearLogsBtn = $('#clear_logs');

var pointMovingArrows = $('#point_moving_arrows_template');
pointMovingArrows.remove();

window.missions = [];
var droneMarker;

changeButtons(connected, armed);
var droneLatLng = L.latLng(droneLat, droneLng);
droneLatLng.name = 'drone';

// Create map
controlMapEl.on('contextmenu', event => event.preventDefault());
var controlMap = L.map('control_map').setView([droneLat, droneLng], 17);

L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
	maxZoom: 20,
	subdomains:['mt0','mt1','mt2','mt3']
}).addTo(controlMap);

droneMarker = L.circle([droneLat, droneLng], {
	color: '#F44336',
	fillColor: '#F44336',
	fillOpacity: 1,
	radius: 1.7
}).addTo(controlMap);

// On map click add new point
var popup = L.popup();

controlMap.on('click', function(e){
	popup
        .setLatLng(e.latlng)
        .setContent("<form id='alt-map'><input type='number' id='alt' class='form-control' style='border: 1px dashed black !important; width: 200px' placeholder='Choose altitude' /></form>")
        .openOn(controlMap);

	$('#alt').focus();
	window.latlng = e.latlng;

	$("#alt-map").submit(function(e){
		e.preventDefault();
		var point = window.latlng;
		var alt = $("#alt").val();
		if(alt == '')
			point.alt = 5;
		else
			point.alt = alt;
		point.name = 'fly_to';
		addPointToPath(point);
		controlMap.closePopup();
	});

	addLog('Fly to location mission added;');

});

var path = L.polyline([]).addTo(controlMap);
var pathPoints=false, pathPointsCircle=[];
var lastPoint, rtlLine=false;
var pointsCircles = [];

pathPointsContainter.text('');
pathPointsContainter.append('<ul>');
pathPointsContainter.find('ul').append('<li><i class="fa fa-play-circle green" aria-hidden="true"></i> Launches from ('+ droneLat +', '+ droneLat +')</li>');

uploadBtn.on('click', function(){
	upload();
	addLog('Missions uploaded to the server;');
});

addMissionTakeoffBtn.on('click', function(){
	var takeOffAlt = 0;
	if( takeOffAltEl.val() == '' )
		takeOffAlt = 5;
	else
		takeOffAlt = takeOffAltEl.val();

	window.missions.push({
		name: 'takeoff',
		alt: Number(takeOffAlt),
	});

	updatePath();
	takeOffAltEl.val('');
	addLog('Take off mission added;');
});

// TODO: change to armedLocation
addMissionRtlBtn.on('click', function(){
	var rtlId = makeid();
	window.missions.push({
		id: rtlId,
		lat: droneLat,
		lng: droneLng,
		name: 'rtl'
	});

	var rtlObj = L.latLng(droneLat, droneLng);
	rtlObj.name = 'rtl';
	rtlObj.id = rtlId;

	if(pathPoints != false)
		pathPoints.push( rtlObj );
	else {
		pathPoints = [];
		pathPoints.push( rtlObj );
	}
	updatePath();
	addLog('Return to launch mission added;');
});

$('#add_mission_change_alt').on('click', function(){
	var alt = $('#change_altitude').val();

	if(isNaN(alt) || alt == '')
		alt = 5;

	window.missions.push({
		name: 'change_alt',
		alt: alt
	});
	updatePath();
	$('#change_altitude').val('');
	addLog('Change altitude mission added;');
});

$('#mission_land').on('click', function(){
	window.missions.push({
		name: 'land'
	});
	updatePath();
	addLog('Land mission added;');
});

clearMissions.on('click', function(){
	socket.emit('clear_missions');
	pathPoints = false;
	window.missions = [];
	updatePath();
	addLog('Clearing all the missions;');
});

clearLogsBtn.on('click', function(){
	logsEl.html('');
	firstLog = true;
});

// ----- DIRECT -----

$(document).on("click", "#force_land", function(event){
	socket.emit('force_land');
	iziToast.show({
    	title: 'FORCE_LAND was emmited to the server!',
		color: 'green'
	});
	addLog('Doing FORCE_LAND;');
});

$(document).on("click", "#force_rtl", function(event){
	socket.emit('force_rtl');
	iziToast.show({
    	title: 'FORCE_RTL was emmited to the server!',
		color: 'green'
	});
	addLog('Doing FORCE_RTL;');
});

$(document).on("click", "#force_auto_mode", function(event){
	socket.emit('vehicle_auto');
	iziToast.show({
    	title: 'VEHICLE_AUTO was emmited to the server!',
		color: 'green'
	});
	addLog('Doing VEHICLE_AUTO;');
});

$(document).on("click", "#force_guided_mode", function(event){
	socket.emit('vehicle_guided');
	iziToast.show({
    	title: 'VEHICLE_GUIDED was emmited to the server!',
		color: 'green'
	});
	addLog('Doing VEHICLE_GUIDED;');
});

$(document).on("click", "#force_loiter", function(event){
	socket.emit('force_loiter');
	iziToast.show({
    	title: 'FORCE_LOITER was emmited to the server!',
		color: 'green'
	});
	addLog('Doing FORCE_LOITER;');
});

$(document).on("click", "#connect", function(event){
	if(connected){
		socket.emit('vehicle_disconnect');
		socket.disconnect();
		iziToast.show({
			title: 'Disconecting from the server!',
			color: 'red'
		});
		addLog('Disconnecting from the server;');
		connected = false;
	} else {
		socket = io.connect(server_ip);
		socket.emit('vehicle_connect');
		iziToast.show({
			title: 'Connecting to the server!',
			color: 'yellow'
		});
		addLog('Connecting to the server;');
		connected = true;
	}
	changeButtons(connected, armed);
});

$(document).on("click", "#arm", function(event){
	if(armed){
		socket.emit('disarm');
		socket.disconnect();
		iziToast.show({
			title: 'Disarming the vehicle!',
			color: 'red'
		});
		addLog('Disarming;');
		armed = false;
	} else {
		socket = io.connect(serverIP);
		socket.emit('arm');
		iziToast.show({
			title: 'Arming the vehicle!',
			color: 'yellow'
		});
		addLog('Arming;');
		armed = true;
	}
	changeButtons(connected, armed);
});

// ----- END -----

$("#modal").iziModal({
	title: 'Advanced options',
	headerColor: '#263238',
	width: '644px'
});

$('#settings').on('click', function(e){
	e.preventDefault();
	$('#modal').iziModal('open', this);
});
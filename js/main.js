var controlMapEl = $('#control_map');
var uploadBtn = $('#upload_button');
var addMissionTakeoffBtn = $('#add_mission_takeoff');
var addMissionRtlBtn = $('#add_mission_rtl');
var takeOffAltEl = $('#takeoff_altitude');
var forceLand = $('#force_land');
var forceRtl = $('#force_rtl');
var clearMissions = $('#clear_missions');
var pathPointsContainter = $('#path_points_tab');
var logsContainer = $('#logs_tab');
var logsInner = $('#logs_tab .logs_tab_inner');
var logsEl = $('[data-field=logs]');
var clearLogsBtn = $('#clear_logs');

var pointMovingArrows = $('#point_moving_arrows_template');
pointMovingArrows.remove();

window.missions = [];
var droneLat, droneLng;

// Socket connection
var socket = io.connect('http://localhost:8001');
socket.on('response',function() {
	addLog('Client has connected to the server!');
});

socket.on('disconnected',function() {
	addLog('Disconnected from server!');
});

droneLat = 54.554699;
droneLng = 23.334518;

// Create map
controlMapEl.on('contextmenu', event => event.preventDefault());
var controlMap = L.map('control_map').setView([droneLat, droneLng], 17);

L.tileLayer('http://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey={apikey}', {
	maxZoom: 22,
	apikey: '643948fbea8e4ebfa11bdf726b0ff88d'
}).addTo(controlMap);

var droneMarker = L.circle([droneLat, droneLng], {
	color: '#F44336',
	fillColor: '#F44336',
	fillOpacity: 1,
	radius: 1.7
}).addTo(controlMap);


// On map click add new point
var popup = L.popup({
	closeButton: false
});

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
});

addMissionRtlBtn.on('click', function(){
	window.missions.push({
		lat: droneLat,
		lng: droneLng,
		name: 'rtl'
	});

	pathPoints.push({
		lat: droneLat,
		lng: droneLng,
		name: 'rtl'
	});
	updatePath();
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
});

forceLand.on('click', function(){
	socket.emit('force_land');
	console.log('force_land');
});

forceRtl.on('click', function(){
	socket.emit('force_rtl');
	console.log('force_rtl');
});

clearMissions.on('click', function(){
	socket.emit('clear_missions');
	addLog('Clearing missions!');
});

clearLogsBtn.on('click', function(){
	logsEl.html('');
	firstLog = true;
});

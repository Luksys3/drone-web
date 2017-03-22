var controlMapEl = $('#control_map');
var clearPathButton = $('#clear_path');
var altitudeEl = $('#altitude');
var rtlEl = $('#rtl');
var uploadBtn = $('#upload_button');
var addMissionTakeoffBtn = $('#add_mission_takeoff');
var addMissionRtlBtn = $('#add_mission_rtl');
var takeOffAltEl = $('#takeoff_altitude');
var forceLand = $('#force_land');
var forceRtl = $('#force_rtl');
var airSpeedEl = $('#airspeed');
var airSpeedBtn = $('#airspeed_button');
var clearMissions = $('#clear_missions');

var pathPointsBtn = $('#path_points_button');
var logsBtn = $('#logs_button');
var pathPointsContainter = $('#path_points_tab');
var logsContainer = $('#logs_tab');
var logsInner = $('#logs_tab .logs_tab_inner');
var logsEl = $('[data-field=logs]');
var clearLogsBtn = $('#clear_logs');

var takeOffAlt='', rtl=false;

var pointMovingArrows = $('#point_moving_arrows_template');
pointMovingArrows.remove();

// Socket connection
var socket = io.connect('http://localhost:8001');
socket.on('connect',function() {
	console.log('Client has connected to the server!');
});
socket.on('disconnected',function() {
	console.log('Disconnected from server!');
});

// Get logs
socket.on("response", function(log){
	addLog( log["data"] );
});

// Drone coordinates
var droneLat = 54.554699;
var droneLng = 23.334518;

controlMapEl.on('contextmenu', event => event.preventDefault());
var controlMap = L.map('control_map').setView([droneLat, droneLng], 17);


var roads = L.gridLayer.googleMutant({
	type: 'hybrid' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
}).addTo(controlMap);

var droneMarker = L.circle([droneLat, droneLng], {
	color: 'red',
	fillColor: 'red',
	fillOpacity: 1,
	radius: 1.7
}).addTo(controlMap);


controlMap.on('click', function(e){
	var point = e.latlng;
	point.alt = getAltitude();
	point.name = 'fly_to';
	addPointToPath(point);
});


var path = L.polyline([[droneLat, droneLng]]).addTo(controlMap);
var pathPoints=false, pathPointsCircle=[];
var lastPoint, rtlLine=false;
var pointsCircles = [];


pathPointsContainter.text('');
pathPointsContainter.append('<ul>');
pathPointsContainter.find('ul').append('<li>Drone - ('+ droneLat +', '+ droneLat +')</li>');
	


clearPathButton.on('click', function(){
	updatePath();
});

uploadBtn.on('click', function(){
	upload();
});


addMissionTakeoffBtn.on('click', function(){
	var validation = true;
	if( takeOffAltEl.val() == '' ){
		addRedBorder(takeOffAltEl);
		validation = false;
	}else{
		removeRedBorder(takeOffAltEl);
	}
	
	if( validation === true ){
		/*pathPoints.push(
			{
				'name':'takeoff',
				'lng':-1,
				'lat':-1,
				'alt':parseInt(takeOffAlt)
			}
		);
		updatePath();*/
		takeOffAlt = takeOffAltEl.val();
		// Add Takeoff
		console.log('Mission Takeoff( '+ takeOffAlt +' ) added.');
	}
});

addMissionRtlBtn.on('click', function(){
	rtl = rtlEl.is(":checked");
	/*if(rtl === true){
		drawRltLine();
		rtl = 1;
	}else{
		rtl = 0;
		if(rtlLine !== false){
			controlMap.removeLayer(rtlLine);
		}
	}*/
	
	takeOffAlt = takeOffAltEl.val();
	// Add RTL
	console.log('Mission RTL added.');
});
forceLand.on('click', function(){
	socket.emit('force_land');
	console.log('force_land');
});
forceRtl.on('click', function(){
	socket.emit('force_rtl');
	console.log('force_rtl');
});
airSpeedBtn.on('click', function(){
	var validation = true;
	if( airSpeedEl.val() == '' ){
		addRedBorder(airSpeedEl);
		validation = false;
	}else{
		removeRedBorder(airSpeedEl);
	}
	
	if(validation === true){
		socket.emit('set_airspeed', {airspeed: parseInt(airSpeedEl.val())});
		console.log('set_airspeed: '+ parseInt(airSpeedEl.val()));
	}
});
clearMissions.on('click', function(){
	socket.emit('clear_missions');
	console.log('clear_missions');
});


pathPointsBtn.on('click', function(){
	logsContainer.hide();
	pathPointsContainter.fadeIn();
});
logsBtn.on('click', function(){
	pathPointsContainter.hide();
	logsContainer.fadeIn();
});


/* For debugging */
$('#add_log').on('click', function(){
	addLog('Drone mission failed.');
});
/* #For debugging */

clearLogsBtn.on('click', function(){
	logsEl.html('');
	firstLog = true;
});























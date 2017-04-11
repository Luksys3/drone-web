var controlMapEl = $('#control_map');
var clearPathButton = $('#clear_path');
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
var pathPointsContainter = $('#path_points_tab');

var logsBtn = $('#logs_button');
var logsContainer = $('#logs_tab');
var logsInner = $('#logs_tab .logs_tab_inner');
var logsEl = $('[data-field=logs]');
var clearLogsBtn = $('#clear_logs');
var takeOffAlt='', rtl=false;

var pointMovingArrows = $('#point_moving_arrows_template');
pointMovingArrows.remove();

window.missions = [];

// Socket connection
var socket = io.connect('http://localhost:8001');
socket.on('response',function(data) {
	addLog('Client has connected to the server!');
});

socket.on('disconnected',function() {
	addLog('Disconnected from server!');
});

// Drone coordinates
var droneLat = 54.554699;
var droneLng = 23.334518;

controlMapEl.on('contextmenu', event => event.preventDefault());

// Create map
var controlMap = L.map('control_map').setView([droneLat, droneLng], 17);

L.tileLayer('http://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey={apikey}', {
	maxZoom: 22,
	apikey: '643948fbea8e4ebfa11bdf726b0ff88d'
}).addTo(controlMap);

// Draw drone position on map
var droneMarker = L.circle([droneLat, droneLng], {
	color: 'red',
	fillColor: 'red',
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
        .setContent("<form id='alt-map'><input type='number' id='alt' class='form-control' style='border: 1px dashed black !important; width: 200px' placeholder='Choose altitude' autofocus/></form>")
        .openOn(controlMap);

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


var path = L.polyline([[droneLat, droneLng]]).addTo(controlMap);
var pathPoints=false, pathPointsCircle=[];
var lastPoint, rtlLine=false;
var pointsCircles = [];


pathPointsContainter.text('');
pathPointsContainter.append('<ul>');
pathPointsContainter.find('ul').append('<li><i class="fa fa-play-circle green" aria-hidden="true"></i> Launches from ('+ droneLat +', '+ droneLat +')</li>');
	
function removePathPoint(point, pointCircle){
	controlMap.removeLayer(pointCircle);
	pathPoints = jQuery.grep(pathPoints, function(value) {
		return value.lat != point.lat && value.lng != point.lng;
	});
	window.missions = jQuery.grep(window.missions, function(value) {
		return value != point;
	});
	
	updatePath();
}

function updatePath(){
	controlMap.removeLayer(path);
	
	$.each(pathPointsCircle, function(){
		controlMap.removeLayer(this);
	});
	
	pathPointsContainter.text('');
	pathPointsContainter.append('<ul>');
	pathPointsContainter.find('ul').append('<li><i class="fa fa-play-circle green" aria-hidden="true"></i> Launches from ('+ droneLat +', '+ droneLat +')</li>');
	$.each(window.missions, function(index, point){
		//if(index != 0){
			if( point.name == 'fly_to' ){
				pointsCircles[index] = L.circle(point, {
					color: 'yellow',
					fillColor: 'yellow',
					fillOpacity: 1,
					radius: 2
				}).addTo(controlMap).bringToBack();
				
				pathPointsCircle.push(pointsCircles[index]);
				
				pointsCircles[index].on('mouseup', function(e){
					if(e.originalEvent.button == 2){
						removePathPoint(point, pointsCircles[index]);
					}
				});
			}
			
			var moving_arrows = pointMovingArrows.clone();
			moving_arrows.find('.arrow').attr('id', index);
			
			if( index == 0 ) moving_arrows.find('[move=up].arrow').remove();
			if( window.missions.length-1 == index ) moving_arrows.find('[move=down].arrow').remove();
			
			var moving_arrows_html = moving_arrows.html();
				
			if( point.name == 'fly_to' ){
				var x = pathPointsContainter.find('ul').append('<li id='+ index +'>' + moving_arrows_html + (index + 1) +' ('+ point.lat.toString().substring(0, 10) +', '+ point.lng.toString().substring(0, 10) +', '+ point.alt +')</li>');
			}else if( point.name == 'takeoff' ){
				var x = pathPointsContainter.find('ul').append('<li id='+ index +'>' + moving_arrows_html + (index + 1) +' - '+ point.name +'('+ point.alt +')</li>');
			}else if( point.name == 'rtl' ){
				var x = pathPointsContainter.find('ul').append('<li id='+ index +'>' + moving_arrows_html + (index + 1) +' - '+ point.name +'('+ point.alt +')</li>');
			}
			
			pathPointsContainter.find('ul #'+ index).unbind('mouseover');
			pathPointsContainter.find('ul #'+ index).on('mouseover', function(){
				pointsCircles[index].setStyle( {color:'orange'} );
				pointsCircles[index].setStyle( {fillColor:'orange'} );
			});
			pathPointsContainter.find('ul #'+ index).unbind('mouseout');
			pathPointsContainter.find('ul #'+ index).on('mouseout', function(){
				pointsCircles[index].setStyle( {color:'yellow'} );
				pointsCircles[index].setStyle( {fillColor:'yellow'} );
			});
			
			
			
			
		/*}else{
			pathPointsContainter.find('ul').append('<li><i class="fa fa-play-circle green" aria-hidden="true"></i> Launches from ('+ droneLat +', '+ droneLat +')</li>');
		}*/
	});

	/*var pointsToDraw = deepCopy(pathPoints);
	pointsToDraw = jQuery.grep(pointsToDraw, function(value, i) {
		if( i==0 ) return true;
		return value.name == 'fly_to';
	});*/

	path = L.polyline(pathPoints, {
		color: 'blue'
	}).addTo(controlMap).bringToBack();
	
	
	
	var movingArrowEl = $('.moving_arrows .arrow');
	movingArrowEl.unbind('click');
	movingArrowEl.on('click', function(){
		var el = $(this);
		if( el.attr('move') == 'up' ) dir = -1;
		else if( el.attr('move') == 'down' ) dir = 1;
		
		var id = parseInt( el.attr('id') );
		var value = window.missions[id+dir];
		
		window.missions[id+dir] = window.missions[id];
		window.missions[id] = value;

		currentPoint = window.missions[id];
		nextPoint = window.missions[id+dir];
		var currentPointId;

		$.each(pathPoints, function(index, point){
			if( currentPoint.lat == point.lat && currentPoint.lng == point.lng ){
				currentPointId = index;
			}
		});
		
		pathPoints[currentPointId+dir] = pathPoints[currentPointId];
		pathPoints[currentPointId] = value;
		
		updatePath();
	});
}

clearPathButton.on('click', function(){
	updatePath();
});

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
});

addMissionRtlBtn.on('click', function(){
	window.missions.push({
		name: 'rtl'
	});

	pathPoints.push({lat: droneLat, lng: droneLng});
	updatePath();
});

forceLand.on('click', function(){
	socket.emit('force_land');
	console.log('force_land');
});
forceRtl.on('click', function(){
	socket.emit('force_rtl');
	console.log('force_rtl');
});


$('#takeoff').on('click', function(){
	socket.emit('force_rtl');
	
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
	addLog('Clearing missions!');
});

clearLogsBtn.on('click', function(){
	logsEl.html('');
	firstLog = true;
});
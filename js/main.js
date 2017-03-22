var controlMapEl = $('#control_map');
var clearPathButton = $('#clear_path');
var altitudeEl = $('#altitude');
var rtlEl = $('#rtl');
var uploadBtn = $('#upload_button');
var addMissionBtn = $('#add_mission');
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
	
function addPointToPath(point){
	pathPoints = path._latlngs;
	pathPoints.push(point);
	
	updatePath();
}

function removePathPoint(point, pointCircle){
	controlMap.removeLayer(pointCircle);
	pathPoints = jQuery.grep(pathPoints, function(value) {
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
	$.each(pathPoints, function(index){
		var point = this;
		if(index != 0){
			//if( point.name == 'fly_to' ){
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
			//}
			
			var moving_arrows = pointMovingArrows.clone();
			moving_arrows.find('.arrow').attr('id', index);
			
			if( index == 1 ) moving_arrows.find('[move=up].arrow').remove();
			if( pathPoints.length-1 == index ) moving_arrows.find('[move=down].arrow').remove();
			
			var moving_arrows_html = moving_arrows.html();
				
			/*if( point.name == 'fly_to' ){
				console.log(point.name);*/
				var x = pathPointsContainter.find('ul').append('<li id='+ index +'>' + moving_arrows_html + (index) +' - ('+ point.lat +', '+ point.lng +', '+ point.alt +')</li>');
			/*}else if( point.name == 'takeoff' ){
				var x = pathPointsContainter.find('ul').append('<li id='+ index +'>' + moving_arrows_html + (index) +' - '+ point.name +'('+ point.alt +')</li>');
			}else if( point.name == 'rtl' ){
				var x = pathPointsContainter.find('ul').append('<li id='+ index +'>' + moving_arrows_html + (index) +' - '+ point.name +'('+ point.alt +')</li>');
			}*/
			
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
			
			
			
			
			
		}else{
			pathPointsContainter.find('ul').append('<li>Drone - ('+ point.lat +', '+ point.lng +')</li>');
		}
	});

	/*var pointsToDraw = deepCopy(pathPoints);
	pointsToDraw = jQuery.grep(pointsToDraw, function(value, i) {
		if( i==0 ) return true;
		return value.name == 'fly_to';
	});*/
	path = L.polyline(pathPoints).addTo(controlMap).bringToBack();
	
	
	if(rtl.checked === true){
		drawRltLine();
	}
	
	var movingArrowEl = $('.moving_arrows .arrow');
	movingArrowEl.unbind('click');
	movingArrowEl.on('click', function(){
		var el = $(this);
		if( el.attr('move') == 'up' ) dir = -1;
		else if( el.attr('move') == 'down' ) dir = 1;
		
		var id = parseInt( el.attr('id') );
		var value = pathPoints[id+dir];
		
		pathPoints[id+dir] = pathPoints[id];
		pathPoints[id] = value;
		
		updatePath();
	});
}

clearPathButton.on('click', function(){
	updatePath();
});

function getAltitude(){
	var val = altitudeEl.val();
	if(val == ''){
		return 0;
	}else{
		return parseInt(val);
	}
}

/*rtlEl.on('change', function(){
	if(rtlEl.is(":checked") === true){
		drawRltLine();
	}else{
		if(rtlLine !== false){
			controlMap.removeLayer(rtlLine);
		}
	}
});*/

function drawRltLine(){
	if(rtlLine !== false){
		controlMap.removeLayer(rtlLine);
	}
	
	if(pathPoints !== false){
		lastPoint = pathPoints[pathPoints.length-1];
		var points = [[droneLat, droneLng], lastPoint];
		rtlLine = L.polyline(points, {
			color: 'orange',
			opacity: 0.7
		}).addTo(controlMap).bringToBack();
	}
}

uploadBtn.on('click', function(){
	upload();
});

addMissionBtn.on('click', function(){
	var validation = true;
	if( takeOffAltEl.val() == '' ){
		addRedBorder(takeOffAltEl);
		validation = false;
	}else{
		removeRedBorder(takeOffAltEl);
	}
	
	if( validation === true ){
		rtl = rtlEl.is(":checked");
		if(rtl === true){
			drawRltLine();
			rtl = 1;
		}else{
			rtl = 0;
			if(rtlLine !== false){
				controlMap.removeLayer(rtlLine);
			}
		}
		
		
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
		alert('Mission added!');
	}
});

function addRedBorder(el){
	el.addClass('border-red');
}
function removeRedBorder(el){
	el.removeClass('border-red');
}

function upload(){
	var points = pathPoints.slice();
	points.splice(0,1);
	
	var data=[];
	
	data.push(	
		{
			'name':'takeoff',
			'lng':-1,
			'lat':-1,
			'alt':parseInt(takeOffAlt)
		}
	);
	
	var data = data.concat(points);
	
	data.push(
		{
			'name':'rtl',
			'lng':-1,
			'lat':-1,
			'alt':rtl
		}
	);
	
	var mission = { 'Mission':data.slice() };
	
	if( takeOffAlt === '' ){
		alert('Please set take off altitude.');
	}else{
		socket.emit('mission', mission);
		
		alert('Uploaded!');
	}
}


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

var firstLog = true;
function addLog(log){
	var scrollBottom = false;
	var bottomScrollPos = logsEl.height() - logsInner.height();
	if( bottomScrollPos == logsInner.scrollTop() ) scrollBottom=true;
	
	var dt = new Date();
	var time = dt.getHours() +':'+ dt.getMinutes() +':'+ dt.getSeconds();
	logsEl.append('<li>['+ time +']:  '+ log +'</li>');
	
	bottomScrollPos = logsEl.height() - logsInner.height();
	if( bottomScrollPos > 0){
		if( scrollBottom || firstLog ){
			logsInner.scrollTop(bottomScrollPos);
			firstLog = false;
		}
	}
}





















function addPointToPath(point, color=''){
	pathPoints = path._latlngs;
	pathPoints.push(point);
	window.missions.push({
		name: point.name,
		lat: point.lat,
		lng: point.lng,
		alt: Number(point.alt),
	});
	updatePath();
}

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
	if( pathPoints !== false ) pathPoints.unshift([droneLat, droneLng]);

	$.each(pathPointsCircle, function(){
		controlMap.removeLayer(this);
	});

	pathPointsContainter.text('');
	pathPointsContainter.append('<ul>');
	pathPointsContainter.find('ul').append('<li><i class="fa fa-play-circle green" aria-hidden="true"></i> Launches from ('+ droneLat +', '+ droneLat +')</li>');
	$.each(window.missions, function(index, point){
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
				var x = pathPointsContainter.find('ul').append('<li id='+ index +'>' + moving_arrows_html + (index + 1) +'. Go to ('+ point.lat.toString().substring(0, 10) +', '+ point.lng.toString().substring(0, 10) +', '+ point.alt +')</li>');
			} else if( point.name == 'takeoff' ){
				var x = pathPointsContainter.find('ul').append('<li id='+ index +'>' + moving_arrows_html + (index + 1) +'. Take off with altitude ' + point.alt + '</li>');
			} else if( point.name == 'rtl' ){
				var x = pathPointsContainter.find('ul').append('<li id='+ index +'>' + moving_arrows_html + (index + 1) +'. Return to launch</li>');
			} else if( point.name == 'change_alt' ){
				var x = pathPointsContainter.find('ul').append('<li id='+ index +'>' + moving_arrows_html + (index + 1) +'. Change altitude to ' + point.alt + '</li>');
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

	});

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

		currentPoint = window.missions[id];
		nextPoint = window.missions[id+dir];
		var value;

		if( (currentPoint.name == 'fly_to' || currentPoint.name == 'rtl') && (nextPoint.name == 'fly_to' || nextPoint.name == 'rtl') ){
			var currentPointId;
			
			$.each(pathPoints, function(index, point){
				console.log(index);
				if( currentPoint.lat == point.lat && currentPoint.lng == point.lng ){
					console.log('name: ', currentPoint.name);
					if( currentPoint.name == 'fly_to' || currentPoint.name == 'rtl' ){
						currentPointId = index;
						//return false;
					}
				}
			});

			value = pathPoints[currentPointId+dir];
			pathPoints[currentPointId+dir] = pathPoints[currentPointId];
			pathPoints[currentPointId] = value;
		}

		value = window.missions[id+dir];
		window.missions[id+dir] = window.missions[id];
		window.missions[id] = value;

		updatePath();
	});
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

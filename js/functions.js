function addPointToPath(point){
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

	if( pathPoints != false)
		if( pathPoints[0].lat != droneLat && pathPoints[0].lng != droneLng ) pathPoints.unshift(droneLatLng);

	$.each(pathPointsCircle, function(){
		controlMap.removeLayer(this);
	});

	pathPointsContainter.text('');
	pathPointsContainter.append('<ul>');
	pathPointsContainter.find('ul').append('<li><i class="fa fa-play-circle green" aria-hidden="true"></i> Launches from ('+ droneLat +', '+ droneLng +')</li>');
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
			} else if( point.name == 'land' ){
				var x = pathPointsContainter.find('ul').append('<li id='+ index +'>' + moving_arrows_html + (index + 1) +'. Lands on the current possition</li>');
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

		if( (currentPoint.name === 'fly_to' || currentPoint.name === 'rtl') && (nextPoint.name == 'fly_to' || nextPoint.name == 'rtl') ){
			var currentPointId;
			$.each(pathPoints, function(index, point){
				if( index != 0 ){
					if( currentPoint.lat == point.lat && currentPoint.lng == point.lng ){
						currentPointId = index;
						if( currentPoint.name == 'rtl' && currentPoint.id === point.id ){
							currentPointId = index;
							return false;
						}
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
	socket.emit('mission', window.missions);
	addLog('Mission uploaded!');
}

var firstLog = true;
function addLog(log, server = false){
	var scrollBottom = false;
	var bottomScrollPos = logsEl.height() - logsInner.height();
	if( bottomScrollPos == logsInner.scrollTop() ) scrollBottom=true;

	var dt = new Date();
	var time = dt.getHours() +':'+ dt.getMinutes() +':'+ dt.getSeconds();
	if(!server)
		logsEl.append('<li>['+ time +']:  '+ log +'</li>');
	else
		logsEl.append('<li style="color: #FFCDD2;">['+ time +']:  '+ log +'</li>');

	bottomScrollPos = logsEl.height() - logsInner.height();
	if( bottomScrollPos > 0){
		if( scrollBottom || firstLog ){
			logsInner.scrollTop(bottomScrollPos);
			firstLog = false;
		}
	}
}

function makeid(len=5){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function changeButtons(connected, armed){
	if(connected){
		$('#connect').html('Disconnect');
		$('#connect').attr('style', 'background-color: #B71C1C !important');
	} else {
		$('#connect').html('Connect');
		$('#connect').attr('style', 'background-color: #004D40 !important');

	}

	if(armed){
		$('#arm').html('Disarm');
		$('#arm').attr('style', 'background-color: #B71C1C !important');
	} else {
		$('#arm').html('Arm');
		$('#arm').attr('style', 'background-color: #004D40 !important');

	}
}

function getSettings( settings ){
	var settingsCon = $('#set #settings');
	settingsCon.text('');
	$.each(settings, function(i, set){
		var inputEl = ''+
			'<div class="input-group setting" setting-name="'+ set.name +'" style="padding-top: 5px;" val-type="'+ set.type +'">'+
				'<div class="input-group-addon no-border-radius" style="border-left:0;">'+ set.name +'</div>';
		if( set.type == 'number' ){
			inputEl += '<input type="number" class="form-control no-border-radius" name="'+ set.name +'" value="'+ set.value +'"></div>';
		}else if( set.type == 'string' ){
			inputEl += '<input type="text" class="form-control no-border-radius" name="'+ set.name +'" value="'+ set.value +'"></div>';
		}else if( set.type == 'bool' ){
			var checkedTrue = (set.value == true) ? 'checked' : '';
			var checkedFalse = (set.value == false) ? 'checked' : '';
			
			inputEl += ''+
					'<input type="radio" class="form-control no-border-radius" id="radio-true-'+ set.name +'" name="radio-'+ set.name +'" value="True" '+ checkedTrue +'>'+
					'<label for="radio-true-'+ set.name +'">True</label>'+
					'<input type="radio" class="form-control no-border-radius" id="radio-false-'+ set.name +'" name="radio-'+ set.name +'" value="False" '+ checkedFalse +'>'+
					'<label for="radio-false-'+ set.name +'">False</label>'+
				'</div>';
		}else{
			console.log('Err: undefined setting type - '. set.type);
		}
		
		settingsCon.append( inputEl );
	});
}

function updateSettings( settings ){
	socket.emit('config_post', settings);
	addLog('Settings has been updated.');
}

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
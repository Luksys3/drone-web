$('#hub').append('<div id="compass"></div>');
var div = $('#compass').get(0);

var divRect = div.getBoundingClientRect(),
    ctx, x, i, needle;

var length = 24;
var headings = ['N', 'E', 'S', 'W'];
var visibleWidth = divRect.width;
var canvas = document.createElement('canvas');
canvas.width = visibleWidth * 2;
canvas.height = divRect.height;
canvas.style.position = 'absolute';

function moveTo(angle) {
    var offset;
    while (angle > 180) {
        angle -= 360;
    }
    while (angle < -180) {
        angle += 360;
    }
    offset = - angle * (visibleWidth / 360);
    offset -= (visibleWidth / 2);
    // '-webkit-transform'
    window.requestAnimationFrame(function () {
        canvas.style.webkitTransform = 'translateX(' + offset + 'px)';
    });
};

socket.on('compass', function(angle) {
    requestAnimationFrame(function() {
        moveTo(angle);
    });
});

div.style.overflow = 'hidden';

ctx = canvas.getContext('2d');

x = 0;
ctx.textAlign = 'center';
for (i = 0; i < 36 * 2; i += 1.5) {
    ctx.beginPath();
    ctx.moveTo(x, 0);

    if (i % 9 === 0) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold';
        ctx.fillText(headings[i / 9 % 4], x, 24);
        ctx.strokeStyle = 'white';
        ctx.lineTo(x, 10);
        ctx.lineWidth = 2;
    } else if (i % 3 === 0) {
        ctx.fillStyle = '#CCC';
        ctx.font = 'normal';
        ctx.fillText(i % 36, x, 24);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.lineTo(x, 7);
    } else {
        ctx.strokeStyle = 'white';
        ctx.lineTo(x, 5);
        ctx.lineWidth = 0.5;
    }
    ctx.stroke();
    x += visibleWidth / length;
}
div.appendChild(canvas);

needle = document.createElement('canvas');
needle.width = 15;
needle.height = 15;
needle.style.top = 0;

needle.style.left = Math.floor(visibleWidth / 2 - needle.width / 2) + 'px';
needle.style.position = 'absolute';
ctx = needle.getContext('2d');
ctx.fillStyle = 'red';
ctx.moveTo(0, 0);
ctx.lineTo(Math.ceil(needle.width / 2), needle.height);
ctx.lineTo(needle.width, 0);
ctx.lineTo(0, 0);
ctx.fill();
div.appendChild(needle);
moveTo(0);

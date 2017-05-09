/*
 * This is heavily based on the JS from https://github.com/bjnortier/autopilot
 * by Benjamin Nortier.
 *
 * Original License:
 *
 * Copyright (c) 2010 Benjamin Nortier
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 */

var AH,
    skyColor = '#33f',
    earthColor = '#992',
    frontCameraFovY = 70,
    majorWidth = 100,
    minorWidth = 60,
    zeroWidth = 200,
    zeroGap = 20,
    radialLimit = 60,
    tickRadius = 10,
    radialRadius = 178,
    speedIndicatorHeight = 250,
    speedIndicatorWidth = 60,
    zeroPadding = 100,
    speedAltOpacity = 0.2,
    pixelsPer10Kmph = 50,
    minorTicksPer10Kmph = 5,
    speedWarningWidth = 10,
    yellowBoundarySpeed = 100,
    redBoundarySpeed = 130,
    altIndicatorHeight = 250,
    altIndicatorWidth = 50,
    majorTickWidth = 10,
    minorTickWidth = 5,
    pixelsPer100Ft = 50,
    minorTicksPer100Ft = 5;

_roll = 0;
_pitch = 0;
_altitude = 0;
_speed = 0;

setValues = function(values) {
    _roll = values.roll;
    _pitch = values.pitch;
    _altitude = values.altitude;
    _speed = values.speed;
};

function drawHorizon() {
    var pitchPixels, i, pitchAngle;
    _ctx.save();
    _ctx.translate(
        _ctx.canvas.width / 2,
        _ctx.canvas.height / 2
    );

    _ctx.rotate(-_roll);
    pitchPixels = _pitch / (Math.PI * 2) * 360 * pixelsPerDeg;
    _ctx.translate(0, pitchPixels);

    /*
    _ctx.fillStyle = skyColor;
    _ctx.fillRect(-10000, -10000, 20000, 10000);
    _ctx.fillStyle = earthColor;
    _ctx.fillRect(-10000, 0, 20000, 10000);
    */

    // horizon
    _ctx.strokeStyle = '#fff';
    _ctx.fillStyle = 'white';
    _ctx.lineWidth = 2;

    _ctx.beginPath();
    _ctx.moveTo(-10000, 0);
    _ctx.lineTo(20000, 0);
    _ctx.stroke();

    _ctx.beginPath();
    _ctx.arc(
        0, -pitchPixels, radialRadius,
        0, Math.PI * 2,
        false /* anti-clockwise */
    );
    _ctx.closePath();
    _ctx.clip();

    _ctx.beginPath();
    for (i = -18; i <= 18; ++i) {
        pitchAngle = i / 2 * 10;
        if (i !== 0) {
            if (i % 2 === 0) {
                _ctx.moveTo(
                    -majorWidth / 2,
                    -pixelsPerDeg * pitchAngle
                );
                _ctx.lineTo(
                    +majorWidth / 2,
                    -pixelsPerDeg * pitchAngle
                );

                _ctx.fillText(
                    pitchAngle,
                    -majorWidth / 2 - 20,
                    -pixelsPerDeg * 10 / 2 * i
                );
                _ctx.fillText(
                    pitchAngle,
                    majorWidth / 2 + 10,
                    -pixelsPerDeg * 10 / 2 * i
                );
            } else {
                _ctx.moveTo(
                    -minorWidth / 2,
                    -pixelsPerDeg * pitchAngle
                );
                _ctx.lineTo(
                    +minorWidth / 2,
                    -pixelsPerDeg * pitchAngle
                );
            }
        }
    }
    _ctx.closePath();
    _ctx.stroke();

    _ctx.restore();
};


function drawZero() {
    var i;

    _ctx.save();
    _ctx.translate(
        _ctx.canvas.width / 2,
        _ctx.canvas.height / 2
    );

    _ctx.strokeStyle = 'yellow';
    _ctx.lineWidth = 2;

    _ctx.beginPath();
    _ctx.moveTo(-zeroWidth / 2, 0);
    _ctx.lineTo(-zeroGap / 2, 0);
    _ctx.moveTo(+zeroWidth / 2, 0);
    _ctx.lineTo(+zeroGap / 2, 0);

    _ctx.moveTo(-zeroGap / 2, zeroGap / 2);
    _ctx.lineTo(0, 0);
    _ctx.lineTo(+zeroGap / 2, zeroGap / 2);

    _ctx.stroke();

    // The radial roll indicator
    _ctx.beginPath();
    _ctx.arc(
        0, 0, radialRadius,
        -Math.PI / 2 - Math.PI * radialLimit / 180,
        -Math.PI / 2 + Math.PI * radialLimit / 180,
        false /* anti-clockwise */
    );
    _ctx.stroke();

    for (i = -4; i <= 4; ++i) {
        _ctx.moveTo(
            (radialRadius - tickRadius) * Math.cos(
                -Math.PI / 2 + i * 15 / 180 * Math.PI
            ),
            (radialRadius - tickRadius) * Math.sin(
                -Math.PI / 2 + i * 15 / 180 * Math.PI
            )
        );
        _ctx.lineTo(
            radialRadius * Math.cos(-Math.PI / 2 + i * 15 / 180 * Math.PI),
            radialRadius * Math.sin(-Math.PI / 2 + i * 15 / 180 * Math.PI)
        );
    }
    _ctx.stroke();

    _ctx.restore();
};

function drawRoll() {
    _ctx.save();
    _ctx.translate(
        _ctx.canvas.width / 2,
        _ctx.canvas.height / 2
    );
    _ctx.rotate(-_roll);

    _ctx.fillStyle = 'white';
    _ctx.lineWidth = 2;

    _ctx.beginPath();
    _ctx.moveTo(0, -radialRadius);
    _ctx.lineTo(-5, -radialRadius + 10);
    _ctx.lineTo(+5, -radialRadius + 10);
    _ctx.closePath();
    _ctx.fill();

    var readableRollAngle = Math.round(_roll / Math.PI / 2 * 360) % 360;
    if (readableRollAngle > 180) {
        readableRollAngle = readableRollAngle - 360;
    }

    _ctx.fillRect(-20, -radialRadius + 9, 40, 16);

    _ctx.font = '12px Arial';
    _ctx.fillStyle = 'black';
    _ctx.fillText(readableRollAngle, -7, -radialRadius + 22);

    _ctx.restore();
};


function drawSpeed() {
    var yellowBoundaryY, redBoundaryY, yOffset, from, to, i, j;

    _ctx.save();
    _ctx.translate(
        _ctx.canvas.width / 2,
        _ctx.canvas.height / 2
    );
    _ctx.translate(
        -zeroWidth / 2 - zeroPadding - speedIndicatorWidth,
        0
    );

    _ctx.fillStyle = 'rgba(0,0,0,' + speedAltOpacity + ')';
    _ctx.strokeStyle = 'white';
    _ctx.lineWidth = 2;

    _ctx.strokeRect(
        0, -speedIndicatorHeight / 2,
        speedIndicatorWidth, speedIndicatorHeight
    );

    _ctx.fillRect(
        0, -speedIndicatorHeight / 2,
        speedIndicatorWidth, speedIndicatorHeight
    );

    _ctx.restore();

    _ctx.save();
    _ctx.translate(
        _ctx.canvas.width / 2,
        _ctx.canvas.height / 2
    );
    _ctx.translate(
        -zeroWidth / 2 - zeroPadding - speedIndicatorWidth,
        0
    );

    _ctx.rect(
        0, -speedIndicatorHeight / 2,
        speedIndicatorWidth, speedIndicatorHeight
    );
    _ctx.clip();

    yellowBoundaryY = -(-_speed + yellowBoundarySpeed) / 10 * pixelsPer10Kmph;
    redBoundaryY = -(-_speed + redBoundarySpeed) / 10 * pixelsPer10Kmph;

    _ctx.fillStyle = 'yellow';
    _ctx.fillRect(
        speedIndicatorWidth - speedWarningWidth, yellowBoundaryY,
        speedWarningWidth, redBoundaryY - yellowBoundaryY
    );

    _ctx.fillStyle = 'red';
    _ctx.fillRect(
        speedIndicatorWidth - speedWarningWidth, redBoundaryY,
        speedWarningWidth, -speedIndicatorHeight / 2 - redBoundaryY
    );

    _ctx.fillStyle = 'green';
    _ctx.fillRect(
        speedIndicatorWidth - speedWarningWidth, yellowBoundaryY,
        speedWarningWidth, +speedIndicatorHeight / 2 - yellowBoundaryY
    );

    yOffset = _speed / 10 * pixelsPer10Kmph;

    // The unclipped ticks to be rendered.
    // We render 100kmph either side of the center to be safe
    from = -Math.floor(_speed / 10)  - 10;
    to = Math.ceil(_speed / 10)  + 10;

    for (i = from; i < to; ++i) {

        _ctx.moveTo(
            speedIndicatorWidth - speedWarningWidth,
            -i * pixelsPer10Kmph + yOffset
        );
        _ctx.lineTo(
            speedIndicatorWidth - speedWarningWidth - majorTickWidth,
            -i * pixelsPer10Kmph + yOffset
        );

        for (j = 1; j < minorTicksPer10Kmph; ++j) {
            _ctx.moveTo(
                speedIndicatorWidth - speedWarningWidth,
                -i * pixelsPer10Kmph - j * pixelsPer10Kmph /
                    minorTicksPer10Kmph + yOffset
            );
            _ctx.lineTo(
                speedIndicatorWidth - speedWarningWidth - minorTickWidth,
                -i * pixelsPer10Kmph - j * pixelsPer10Kmph /
                    minorTicksPer10Kmph + yOffset
            );
        }
        _ctx.font = '12px Arial';
        _ctx.fillStyle = 'white';
        _ctx.fillText(i * 10, 20, -i * pixelsPer10Kmph + yOffset + 4);
    }
    _ctx.strokeStyle = 'white';
    _ctx.lineWidth = 2;
    _ctx.stroke();

    _ctx.beginPath();
    _ctx.moveTo(
        speedIndicatorWidth - speedWarningWidth - minorTickWidth, 0
    );
    _ctx.lineTo(
        speedIndicatorWidth - speedWarningWidth - minorTickWidth * 2, -5
    );
    _ctx.lineTo(
        speedIndicatorWidth - speedWarningWidth - minorTickWidth * 2, -10
    );
    _ctx.lineTo(0, -10);
    _ctx.lineTo(0, 10);
    _ctx.lineTo(
        speedIndicatorWidth - speedWarningWidth - minorTickWidth * 2, 10
    );
    _ctx.lineTo(
        speedIndicatorWidth - speedWarningWidth - minorTickWidth * 2, 5
    );
    _ctx.closePath();

    _ctx.fill();
    _ctx.strokeStyle = 'black';
    _ctx.fillStyle = 'black';
    _ctx.fillText(Math.round(_speed * 100) / 100, 15, 4.5, altIndicatorHeight);

    _ctx.restore();
};

function drawAltitude() {
    var yOffset, from, to, i, j;

    _ctx.save();
    _ctx.translate(
        _ctx.canvas.width / 2,
        _ctx.canvas.height / 2
    );
    _ctx.translate(
        zeroWidth / 2 + zeroPadding,
        0
    );

    _ctx.fillStyle = 'rgba(0,0,0,' + speedAltOpacity + ')';
    _ctx.strokeStyle = 'white';
    _ctx.lineWidth = 2;

    _ctx.fillRect(
        0, -altIndicatorHeight / 2,
        altIndicatorWidth, altIndicatorHeight
    );
    _ctx.strokeRect(
        0, -altIndicatorHeight / 2,
        altIndicatorWidth, altIndicatorHeight
    );

    _ctx.restore();

    _ctx.save();
    _ctx.translate(
        _ctx.canvas.width / 2,
        _ctx.canvas.height / 2
    );
    _ctx.translate(
        zeroWidth / 2 + zeroPadding,
        0
    );

    _ctx.rect(
        0, -altIndicatorHeight / 2,
        altIndicatorWidth, altIndicatorHeight
    );
    _ctx.clip();

    yOffset = _altitude / 20 * pixelsPer100Ft;

    // The unclipped ticks to be rendered. We render 500ft either side of
    // the center to be safe
    from = Math.floor(_altitude / 20)  - 5;
    to = Math.ceil(_altitude / 20)  + 5;

    for (i = from; i < to; ++i) {
        _ctx.moveTo(0, -i * pixelsPer100Ft + yOffset);
        _ctx.lineTo(majorTickWidth, -i * pixelsPer100Ft + yOffset);

        for (j = 1; j < minorTicksPer100Ft; ++j) {
            _ctx.moveTo(
                0,
                -i * pixelsPer100Ft - j * pixelsPer100Ft /
                    minorTicksPer100Ft + yOffset
            );
            _ctx.lineTo(
                minorTickWidth,
                -i * pixelsPer100Ft -
                    j * pixelsPer100Ft / minorTicksPer100Ft +
                    yOffset
            );
        }

        _ctx.font = '12px Arial';
        _ctx.fillStyle = 'white';
        _ctx.fillText(i * 20, 15, -i * pixelsPer100Ft + yOffset + 4);
    }

    _ctx.strokeStyle = 'white';
    _ctx.lineWidth = 2;
    _ctx.stroke();

    _ctx.restore();

    _ctx.save();
    _ctx.translate(
        _ctx.canvas.width / 2,
        _ctx.canvas.height / 2
    );
    _ctx.translate(
        zeroWidth / 2 + zeroPadding,
        0
    );

    _ctx.strokeStyle = 'white';
    _ctx.lineWidth = 2;

    _ctx.font = '12px Arial';
    _ctx.fillStyle = 'white';
    _ctx.fillOpacity = 1.0;

    _ctx.beginPath();
    _ctx.moveTo(minorTickWidth, 0);
    _ctx.lineTo(minorTickWidth * 2, -5);
    _ctx.lineTo(minorTickWidth * 2, -10);
    _ctx.lineTo(altIndicatorWidth, -10);
    _ctx.lineTo(altIndicatorWidth, 10);
    _ctx.lineTo(minorTickWidth * 2, 10);
    _ctx.lineTo(minorTickWidth * 2, 5);
    _ctx.closePath();

    _ctx.fill();
    _ctx.strokeStyle = 'black';
    _ctx.fillStyle = 'black';
    _ctx.fillText(
        Math.round(_altitude * 200) / 200,
        15, 4.5, altIndicatorHeight
    );

    _ctx.restore();
};


function _draw() {
    var width = $('#hub').innerWidth();
    var height = $('#hub').innerHeight();
    _ctx.canvas.width = width
    _ctx.canvas.height = height
    pixelsPerDeg = height / (frontCameraFovY / 2);
    _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
    drawHorizon();
    drawZero();
    drawRoll();
    drawSpeed();
    drawAltitude();
};

function _draw_h(w, h) {
    var width = w;
    var height = h;
    _ctx.canvas.width = width
    _ctx.canvas.height = height
    pixelsPerDeg = height / (frontCameraFovY / 2);
    _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
    drawHorizon();
    drawZero();
    drawRoll();
    drawSpeed();
    drawAltitude();
};


_render = function(data) {
    _roll = data['roll'],
    _pitch = data['pitch'],
    _altitude = data['alt'],
    _speed = data['airspeed']

    _draw();
}

// ---- ENDS HERE

// Add required UI elements
$("#hub").append('<canvas id="horizon" width="640" height="360"></canvas>');
_ctx = $("#horizon").get(0).getContext('2d');

// Bind on window events to resize
$(window).resize(function(event) {
    _draw();
});

_draw();

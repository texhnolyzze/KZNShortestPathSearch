var map = document.getElementById("map");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.lineWidth = 5.0;

var X = 0;
var Y = 1;

var MIN_PIN_RAD = 3;
var ZOOM_IN = 1.05;
var ZOOM_OUT = 0.95;

var pinRadius = MIN_PIN_RAD;

var graph = null;
var vertices = null;

var Index = 0;
var SelectedVertices = [null, null];
var capturedNodeID = -1;

var path = null;

$.getJSON("https://raw.githubusercontent.com/texhnolyzze/KZNShortestPathSearch/master/src/data/graph.json", function(data) {graph = data;});
$.getJSON("https://raw.githubusercontent.com/texhnolyzze/KZNShortestPathSearch/master/src/data/vertices.json", function(data) {vertices = data;});

var camera = new Camera2D(map.width, map.height, map.width, map.height);

function repaint() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(map, camera.x(), camera.y(), camera.w(), camera.h(), 0, 0, canvas.width, canvas.height);
	for (var i = 0; i < vertices.length; i++) {
		var v = vertices[i];
		if (camera.isVisible(v[X], v[Y])) {
			if (SelectedVertices[0] === i) 
				DrawPin(v, "#ff0000", pinRadius);
			else if (SelectedVertices[1] === i) 
				DrawPin(v, "#00ff00", pinRadius);
			else
				DrawPin(v, "#0000ff", pinRadius);
		}
	}
	if (capturedNodeID !== -1)
		DrawPin(vertices[capturedNodeID], "#ff69b4", 2 * pinRadius);
	if (path !== null) 
		DrawPath(path, "#000000");
	if (Index !== 0) 
		DrawButton(button);
}

function GetDrawCoords(v) {
	return [
		((v[X] - camera.x()) / camera.w()) * canvas.width, 
		((v[Y] - camera.y()) / camera.h()) * canvas.height
	];
}

function DrawPin(v, color, pinRadius) {
	ctx.fillStyle = color;
	var r = GetDrawCoords(v);
	ctx.beginPath();
	ctx.arc(r[X], r[Y], pinRadius, 0, 2 * Math.PI);
	ctx.fill();
}

function DrawPath(path, color) {
	ctx.strokeStyle = color;
	var i = path.length - 1;
	var r = GetDrawCoords(vertices[path[i--]]);
	ctx.beginPath();
	ctx.moveTo(r[X], r[Y]);
	for (; i >= 0; i--) {
		var v = path[i];
		r = GetDrawCoords(vertices[v]);
		ctx.lineTo(r[X], r[Y]);
	}
	ctx.stroke();
}

function DrawButton(button) {
	ctx.fillStyle = button.color;
	var x = button.x;
	var y = button.y;
	var w = button.w;
	var h = button.h;
	if (button.captured) {
		x = x - w * (1 / 2);
		y = y - h * (1 / 2);
		w = 2 * w;
		h = 2 * h;
	}
	ctx.fillRect(x, y, w, h);
	ctx.fillStyle = button.fontColor;
	ctx.font = button.font;
	ctx.textAlign = "center";
	ctx.fillText(button.label, x + w / 2, y + h / 1.4);
}

function w(v1, v2) {
	var r1 = vertices[v1];
	var r2 = vertices[v2];
	var dx = r2[X] - r1[X];
	var dy = r2[Y] - r1[Y];
	return Math.sqrt(dx * dx + dy * dy);
}

function h(v1, v2) {
	return w(v1, v2);
}

function GetMapCoordsOfMouseEvent(event) {
	return [
		camera.x() + ((event.pageX - canvas.offsetLeft) / canvas.width) * camera.w(),
		camera.y() + ((event.pageY - canvas.offsetTop) / canvas.height) * camera.h()
	];
}

var trackMouse = false;
var prevCoords = {x: -1.0, y: -1.0};

var button = {
	x: canvas.width / 2 - 150 / 2, y: 25, w: 100, h: 15, 
	color: "#0000ff80", fontColor: "#ffffff", font: "14px Georgia", 
	label: "", 
	captured: false
};

$(document).ready(function() {
	repaint();
    $(canvas).bind('mousewheel DOMMouseScroll', function(event) {
		if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
			camera.zoom(ZOOM_IN);
			pinRadius *= ZOOM_IN;
		} else {
			camera.zoom(ZOOM_OUT);
			pinRadius = Math.max(pinRadius * ZOOM_OUT, MIN_PIN_RAD);
		}
		repaint();
		return false;
	});
	canvas.onclick = function(event) {
		if (trackMouse)
			return;
		var x = event.pageX - canvas.offsetLeft;
		var y = event.pageY - canvas.offsetTop;
		if (x >= button.x && x < button.x + button.w && y >= button.y && y < button.y + button.h) {
			Index = 0;
			path = null;
			SelectedVertices[0] = null;
			SelectedVertices[1] = null;
		} else {
			x = camera.x() + (x / canvas.width) * camera.w();
			y = camera.y() + (y / canvas.height) * camera.h();
			if (Index !== 2) {
				for (var i = 0; i < vertices.length; i++) {
					var v = vertices[i];
					var dx = x - v[X];
					var dy = y - v[Y];
					if (Math.sqrt(dx * dx + dy * dy) < pinRadius) {
						if (SelectedVertices[0] === i)
							break;
						SelectedVertices[Index++] = i;
						if (Index === 2) {
							path = AStarPathSearch(graph, w, h, SelectedVertices[0], SelectedVertices[1]);
							button.label = "NEW PATH";
							break;
						} else
							button.label = "CANCEL";
					}
				}
			}
		}
		repaint();
	};
	canvas.onmouseup = function(event) {trackMouse = false;};
	canvas.onmousedown = function(event) {
		trackMouse = true;
		prevCoords.x = event.pageX - canvas.offsetLeft;
		prevCoords.y = event.pageY - canvas.offsetTop;
	};
	canvas.onmousemove = function(event) {
		capturedNodeID = -1;
		button.captured = false;
		var x = event.pageX - canvas.offsetLeft;
		var y = event.pageY - canvas.offsetTop;
		if (trackMouse) {
			var r = [prevCoords.x - x, prevCoords.y - y];
			camera.move(r[X], r[Y]);
			prevCoords.x = x;
			prevCoords.y = y;
		} else {
			var mouseMapCoords = GetMapCoordsOfMouseEvent(event);
			for (var i = 0; i < vertices.length; i++) {
				var v = vertices[i];
				var dx = mouseMapCoords[X] - v[X];
				var dy = mouseMapCoords[Y] - v[Y];
				if (Math.sqrt(dx * dx + dy * dy) < pinRadius) {
					capturedNodeID = i;
					break;
				}
			}
			if (capturedNodeID === -1) {
				if (x >= button.x && x < button.x + button.w && y >= button.y && y < button.y + button.h) 
					button.captured = true;
			}
		}
		repaint();
	};
});
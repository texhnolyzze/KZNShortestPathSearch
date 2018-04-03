var map = document.getElementById("map");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

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

var path = null;

$.getJSON("data/graph.json", function(data) {graph = data;});
$.getJSON("data/vertices.json", function(data) {vertices = data;});

var camera = new Camera2D(map.width, map.height, map.width, map.height);

function repaint() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(map, camera.x(), camera.y(), camera.w(), camera.h(), 0, 0, canvas.width, canvas.height);
	for (var i = 0; i < vertices.length; i++) {
		var v = vertices[i];
		if (camera.isVisible(v[X], v[Y])) {
			if (SelectedVertices[0] === i) 
				DrawPin(v, "#ff0000");
			else if (SelectedVertices[1] === i) 
				DrawPin(v, "#00ff00");
			else
				DrawPin(v, "#0000ff");
		}
	}
	if (path !== null) 
		DrawPath(path, "#000000");
}

function GetDrawCoords(v) {
	return [
		((v[X] - camera.x()) / camera.w()) * canvas.width, 
		((v[Y] - camera.y()) / camera.h()) * canvas.height
	];
}

function DrawPin(v, color) {
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

function UpdateRel() {
	rel.x = camera.w() / canvas.width;
	rel.y = camera.h() / canvas.height;
}

var trackMouse = false;
var prevCoords = {x: -1.0, y: -1.0};

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
					if (Index === 2) 
						path = AStarPathSearch(graph, w, h, SelectedVertices[0], SelectedVertices[1]);
					break;
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
		if (trackMouse) {
			var x = event.pageX - canvas.offsetLeft;
			var y = event.pageY - canvas.offsetTop;
			var r = [prevCoords.x - x, prevCoords.y - y];
			camera.move(r[X], r[Y]);
			prevCoords.x = x;
			prevCoords.y = y;
		}
		repaint();
	};
});
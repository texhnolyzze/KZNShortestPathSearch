function Camera2D(width, height, maxw, maxh) {
	
    var w = width;
    var h = height;

    var v = {x: 0, y: 0};

    this.move = function(dx, dy) {
        v.x += dx;
        v.y += dy;
        clamp();
    };

    this.zoom = function(z) {
        w *= (1 / z);
        h *= (1 / z);
        if (z < 1) { //zoom out
            w = Math.min(w, width);
            h = Math.min(h, height);
        }
		clamp();
    };

    this.x = function() {return v.x;};
    this.y = function() {return v.y;};
    this.w = function() {return w;};
    this.h = function() {return h;};
    this.isVisible = function(x, y) {return x >= v.x && x < v.x + w && y >= v.y && y < v.y + h;};

    function clamp() {
        if (v.x + w > maxw)
            v.x = maxw - w;
        else if (v.x < 0)
            v.x = 0;
        if (v.y + h > maxh)
            v.y = maxh - h;
        else if (v.y < 0)
            v.y = 0;
    };
	
}
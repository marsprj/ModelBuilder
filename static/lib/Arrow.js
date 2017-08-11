/**
 * 连接线
 * @param startx {float}
 * @param starty {float}
 * @param endx {float}
 * @param endy {float}
 */
"use strict";
var Arrow = function(r, startx, starty, endx, endy){

	this._r = r;
	//Position of Arrow
	this._startx = startx;
	this._starty = starty;
	this._endx   = endx;
	this._endy   = endy;
	this._mind	 = 5;
	this._id = null;
	if( (Math.abs(startx-endx) + Math.abs(starty-endy))<4){
		endx += 2;
		endy += 2;
	}

	//style of arrow
	this._stroke = {
		color: "#585872",
		width : 2,
		linecap : "round"
	};
	this._arrow_end = "classic-wide-long";

	this._line = null;

	if(this.length()>this._mind){
		this._line = this.createArrow();
	}

}

Arrow.prototype.update = function(startx, starty, endx, endy){

	this._startx = startx;
	this._starty = starty;
	this._endx   = endx;
	this._endy   = endy;

	if(this.length()>this._mind){
		if(this._line){
			this.updateArrow();
		}
		else{
			this._line = this.createArrow();
		}
	}
	else{
		if(this._line){
			this._line.remove()
			this._line = null;
		}
	}

	// _path = "M{sx} {sy}L{ex} {ey}"
	// 				.replace("{sx}", this._startx)
	// 				.replace("{sy}", this._starty)
	// 				.replace("{ex}", this._endx)
	// 				.replace("{ey}", this._endy);
	// //console.log(_path);
	// this._line.attr({
	// 			path: _path
	// 		});
}

Arrow.prototype.offsetStart = function(dx, dy){

	this._startx += dx;
	this._starty += dy;

	if(this.length()>this._mind){
		if(this._line){
			this.updateArrow();
		}
		else{
			this._line = this.createArrow();
		}
	}
	else{
		if(this._line){
			this._line.remove()
			this._line = null;
		}
	}

	// _path = "M{sx} {sy}L{ex} {ey}"
	// 				.replace("{sx}", this._startx)
	// 				.replace("{sy}", this._starty)
	// 				.replace("{ex}", this._endx)
	// 				.replace("{ey}", this._endy);
	// //console.log(_path);
	// this._line.attr({
	// 			path: _path
	// 		});
}

Arrow.prototype.offsetEnd = function(dx, dy){

	this._endx   += dx;
	this._endy   += dy;

	if(this.length()>this._mind){
		if(this._line){
			this.updateArrow();
		}
		else{
			this._line = this.createArrow();
		}
	}
	else{
		if(this._line){
			this._line.remove()
			this._line = null;
		}
	}

	// _path = "M{sx} {sy}L{ex} {ey}"
	// 				.replace("{sx}", this._startx)
	// 				.replace("{sy}", this._starty)
	// 				.replace("{ex}", this._endx)
	// 				.replace("{ey}", this._endy);
	// //console.log(_path);
	// this._line.attr({
	// 			path: _path
	// 		});
}

Arrow.prototype.length = function(){
	return Math.sqrt(Math.pow((this._startx-this._endx),2) + Math.pow((this._starty-this._endy),2));
}

Arrow.prototype.createArrow = function(){
	var _path = "M{sx} {sy}L{ex} {ey}"
					.replace("{sx}", this._startx)
					.replace("{sy}", this._starty)
					.replace("{ex}", this._endx)
					.replace("{ey}", this._endy);


	var line = this._r.path(_path)
						.attr({
							"stroke" : this._stroke.color,
							"stroke-width" : this._stroke.width,
							"stroke-linecapstring" : this._stroke.linecap,
							"arrow-end" : this._arrow_end
						});
	if(this._id){
		line.id = this._id;
		line.node.raphaelid = this._id;
	}
	return line;
}

Arrow.prototype.updateArrow = function(){
	if(!this._line){
		return;
	}
	var _path = "M{sx} {sy}L{ex} {ey}"
					.replace("{sx}", this._startx)
					.replace("{sy}", this._starty)
					.replace("{ex}", this._endx)
					.replace("{ey}", this._endy);

	this._line.attr({
				path: _path
			});
}


Arrow.prototype.remove = function(){
	if(this._line){
		this._line.remove();
	}
}



Arrow.prototype.getID = function(){
	if(this._line){
		return this._line.id;
	}else{
		return null;
	}
}

Arrow.prototype.setID = function(id) {
	this._id = id;
	if(this._line){
		this._line.id = this._id;
		this._line.node.raphaelid = this._id;
	}
}

Arrow.prototype.setAttr = function (key, value) {
	if(this._line){
		this._line.attr(key,value);
	}
}

Arrow.prototype.toFront = function () {
	if(this._line){
		this._line.toFront();
	}
}


Arrow.prototype.getDistance = function (x, y) {
	Math.ESPLON = 0.000001;
	var x0 = this._startx;
	var y0 = this._starty;
	var x1 = this._endx;
	var y1 = this._endy;
	var d = 0;
	if(Math.abs(x0-x1)<Math.ESPLON){
		// vertical
		var miny = y0 < y1 ? y0 : y1;
		var maxy = y0 > y1 ? y0 : y1;
		if((y>miny)&&(y<maxy)){
			d = Math.abs(x-x0);
		}
		else if(y<miny){
			d = Math.sqrt(Math.pow(x-x0, 2)+Math.pow(y-miny, 2));
		}
		else if(y>maxy){
			d = Math.sqrt(Math.pow(x-x0, 2)+Math.pow(y-maxy, 2));
		}
	}
	else if(Math.abs(y0-y1)<Math.ESPLON){
		// horizonal
		var minx = x0 < x1 ? x0 : x1;
		var maxx = x0 > x1 ? x0 : x1;
		if((x>minx)&&(x<maxx)){
			d = Math.abs(y-y0);
		}
		else if(x<minx){
			d = Math.sqrt(Math.pow(y-y0, 2)+Math.pow(x-minx, 2));
		}
		else if(x>maxx){
			d = Math.sqrt(Math.pow(y-y0, 2)+Math.pow(x-maxx, 2));
		}
	}
	else{
		var k_1  = -(x1-x0) / (y1-y0);
		var k_0 = -1 / k_1;
		var b_0 = y0 - k_0 * x0;
		var b_1 = y  - k_1 * x;

		var k_v = (k_1 - k_0);
		var xx  = (b_0 - b_1) / k_v;
		var yx  = k_1 * xx + b_1;

		var minx = x0 < x1 ? x0 : x1;
		var maxx = x0 > x1 ? x0 : x1;
		if(((xx>minx) && (xx<maxx)) || ((yx>miny) && (yx<maxy))){
			d = Math.sqrt(Math.pow(y-yx, 2)+Math.pow(x-xx, 2));
		}
		else{
			var d0 = Math.sqrt(Math.pow(y0-yx, 2)+Math.pow(x0-xx, 2));
			var d1 = Math.sqrt(Math.pow(y1-yx, 2)+Math.pow(x1-xx, 2));
			d = d0 < d1 ? d0 : d1;
		}
	}
	return d;
}

/**
 * 连接线
 * @param startx {float}
 * @param starty {float}
 * @param endx {float}
 * @param endy {float}
 */
var Arrow = function(r, startx, starty, endx, endy){

	this._r = r;
	//Position of Arrow
	this._startx = startx;
	this._starty = starty;
	this._endx   = endx;
	this._endy   = endy;
	this._mind	 = 5;
	if( (Math.abs(startx-endx) + Math.abs(starty-endy))<4){
		endx += 2;
		endy += 2;
	}

	//style of arrow
	this._stroke = {
		color: "#0000FF",
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
	

	return this._r.path(_path)
						.attr({
							"stroke" : this._stroke.color,
							"stroke-width" : this._stroke.width,
							"stroke-linecapstring" : this._stroke.linecap,
							"arrow-end" : this._arrow_end
						});	
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

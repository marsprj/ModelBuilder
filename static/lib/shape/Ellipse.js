var Ellipse = function(r, xmin, ymin, width, height){

	Shape.apply(this, arguments);

	this._r = r;
	this._type = "data";
	this._xmin = xmin;
	this._xmax = xmin + width;
	this._ymin = ymin;
	this._ymax = ymin + height;

	this._centerx = (xmin + this._xmax) / 2;
	this._centery = (ymin + this._ymax) / 2;
	this._a = Math.abs(this._xmax - xmin) / 2;
	this._b = Math.abs(this._ymax - ymin) / 2;

	this._snaps = [];
	this._snapxy= [];
	this._snap_highlight = null;
	this._snap_r= 3;

	this._shape = this._r.ellipse(this._centerx, this._centery, this._a, this._b);
	this._shape.attr(
		"fill", "#0f0",
		"stroke", "#fff"
	);
	this._id = this._shape.id;

	var cx = this._shape.attr("cx");
	console.log(cx);
}

extend(Ellipse, Shape);

Ellipse.prototype.echo = function(){
	alert("Ellipse");
}

Ellipse.prototype.getSnapPos = function(){
	var sx = Math.abs(this._xmax - this._xmin) / 6;
	var sy = Math.abs(this._ymax - this._ymin) / 6;
	var y1 = this.getEllipseY(this._xmin + sx*1);
	var y2 = this.getEllipseY(this._xmin + sx*2);
	var y3 = this.getEllipseY(this._xmin + sx*3);
	var y4 = this.getEllipseY(this._xmin + sx*4);
	var y5 = this.getEllipseY(this._xmin + sx*5);

	return [
		//{ x: 	this._xmin		 ,	y: 	this._ymin},
		{ x: 	this._xmin		 ,	y: 	this._centery},
		{ x: 	this._xmin + sx*1,	y: 	this._centery - y1},
		{ x: 	this._xmin + sx*1,	y: 	this._centery + y1},

		{ x: 	this._xmin + sx*2,	y: 	this._centery - y2},
		{ x: 	this._xmin + sx*2,	y:  this._centery + y2},

		{ x: 	this._xmin + sx*3,	y: 	this._centery - y3},
		{ x: 	this._xmin + sx*3,	y:  this._centery + y3},
		
		{ x: 	this._xmin + sx*4,	y: 	this._centery - y4},
		{ x: 	this._xmin + sx*4,	y:  this._centery + y4},

		{ x: 	this._xmin + sx*5,	y: 	this._centery - y5},
		{ x: 	this._xmin + sx*5,	y:  this._centery + y5},

		{ x: 	this._xmax		 ,	y: 	this._centery},

	];
}

Ellipse.prototype.getEllipseY = function(x){
	return Math.sqrt(( 1- Math.pow(((x-this._centerx)/this._a), 2) ) * Math.pow(this._b, 2));
}

Ellipse.prototype.moveTo = function(x, y){
	if(this._shape){
		this._shape.attr({
			cx : x,
			cy : y
		});
		var bbox = this._shape.getBBox();
		this._xmin = bbox.x;
		this._ymin = bbox.y;
		this._xmax = bbox.x + bbox.width;
		this._ymax = bbox.y + bbox.height;
	}

	if(this._text){
		var cx = (this._xmin + this._xmax) / 2;
		var cy = (this._ymin + this._ymax) / 2;
		this._text.attr({
			x : cx,
			y : cy
		});	
	}
}

Ellipse.prototype.offset = function(dx, dy){
	//移动Node本身
	if(this._shape){
		var ox = this._shape.attr("cx");
		var oy = this._shape.attr("cy");

		this._shape.attr({
			cx : ox + dx,
			cy : oy + dy
 		});
		var bbox = this._shape.getBBox();
		this._xmin = bbox.x;
		this._ymin = bbox.y;
		this._xmax = bbox.x + bbox.width;
		this._ymax = bbox.y + bbox.height;

		this._centerx = (this._xmin + this._xmax) / 2;
		this._centery = (this._ymin + this._ymax) / 2;
		this._a = Math.abs(this._xmax - this._xmin) / 2;
		this._b = Math.abs(this._ymax - this._ymin) / 2;
	}
	//移动文字
	if(this._text){
		var cx = (this._xmin + this._xmax) / 2;
		var cy = (this._ymin + this._ymax) / 2;
		this._text.attr({
			x : cx,
			y : cy
		});	
	}
}
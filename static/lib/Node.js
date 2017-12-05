function extend(c, p) {

	var F = function(){};
	F.prototype = p.prototype;
	c.prototype = new F();
	c.prototype.constructor = c;
	c.uber = p.prototype;
}

var WIDGET_TYPE = {
	DATA : "data",
	FUNC : "function"
}

var NODE_TYPE = {
	DATA : "data",
	FUNC : "function"
}


var Node = function(r){

	this._r = r;
	this._type = WIDGET_TYPE.DATA;
	this._name = "";
	this._shape = null;
	this._isDraggable = false;
}

Node.prototype.setName = function(name){
	this._name = name;
	this.showText();
}

Node.prototype.getName = function(){
	return this._name;
}

Node.prototype.draggable = function(){

	if(this._isDraggable){
		return;
	}

	var ex=0, ey=0;
	var that = this;
	var start = function(){
		ex=0, ey=0;
		this.attr({"stroke-width":5});
	};
	var move = function(dx, dy){
		if(that._shape){
			that.offset(dx-ex, dy-ey);
		}
		ex = dx;
		ey = dy;
	}
	var end = function(){
		this.attr({"stroke-width":1});
	}

	if(this._shape){
		var element = this._shape.getElement();
		if(element){
			element.drag(move, start, end);
			this._isDraggable = true;
		}
	}
}

Node.prototype.showText = function(){
	var text = this._shape.showText(this._name);
	var id = this.getID();
	text.data("nodeid",id);
}

Node.prototype.undrag = function(){
	this._isDraggable = false;
	if(this._shape){
		this._shape.undrag();
	}
}

Node.prototype.getType = function(){
	return this._type;
}

Node.prototype.setID = function(id){
	this._id = id;
	if(this._shape){
		this._shape.setID(id);
	}
}

Node.prototype.getID = function(){
	return this._id ? this._id : "";
}


Node.prototype.findSnap = function(x, y){
	return this._shape ? this._shape.findSnap(x, y) : null;
}

Node.prototype.getSnapPos = function(){
	return this._shape ? this._shape.getSnapPos() : [];
}

Node.prototype.startSnapping = function(){
	if(this._shape){
		this._shape.startSnapping();
	}
}

Node.prototype.stopSnapping = function(){
	if(this._shape){
		this._shape.stopSnapping();
	}
}

Node.prototype.export = function(){
	return "";
}

Node.prototype.remove = function(){
	if(this._shape){
		this._shape.remove();
		this._shape.hideSnap();
	}
}

Node.prototype.startConnecting = function(onSelectChanged){
	var that = this;
	var oncallback = function(obj){
		if(onSelectChanged){
			onSelectChanged( obj ? that : null);
		}
	}
	if(this._shape){
		this._shape.startConnecting(oncallback);
	}
}

Node.prototype.stopConnecting = function(){
	if(this._shape){
		this._shape.stopConnecting();
	}
}

Node.prototype.hideSnap = function(){
	if(this._shape){
		this._shape.hideSnap();
	}
}

Node.prototype.onClick = function(){

}

Node.prototype.getFillColor = function(){
	if(this._shape){
		return  this._shape.getFillColor();
	}
}

Node.prototype.blink = function(){
	if(this._blink_int){
		return;
	}
	var time = 200;
	var fillColor = this.getFillColor();
	this._blink_color = fillColor;

	this._shape.animate({"fill":"#fff"},time);

	var i = 0;
	var that = this;
	this._blink_int = setInterval(function(){
		var obj = null;
		if(i % 2 == 1){
			obj = {
				"fill": "#fff"
			};
		}else{
			obj = {
				"fill":fillColor
			};
		}
		that._shape.animate(obj,time);
		i++;
	},time);
}

Node.prototype.stopBlink = function(){
	if(this._blink_int){
		window.clearInterval(this._blink_int);
		this._shape.stop();
		this._shape.setAttr("fill",this._blink_color);
		this._blink_int = null;
		this._blink_color = null;
	}
}


Node.prototype.getCenter = function(){
	if(this._shape){
		return this._shape.getCenter();
	}
	return null;
}

Node.prototype.setShapeAttr =function(key,value){
	if(this._shape){
		this._shape.setAttr(key,value);
	}
}

Node.prototype.toFront = function () {
	if(this._shape){
		this._shape.toFront();
	}
}

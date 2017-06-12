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
	};
	var move = function(dx, dy){
		if(that._shape){			
			//that._shape.offset(dx-ex, dy-ey);
			that.offset(dx-ex, dy-ey);
		}
		ex = dx;
		ey = dy;
	}
	var end = function(){

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
	// var id = this.getID();
	// var text = this._name + "\r\n" + id;
	// this._shape.showText(text);
	this._shape.showText(this._name);
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

Node.prototype.getID = function(){
	return this._shape ? this._shape.getID() : "";
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
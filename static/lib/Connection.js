/**
 * 连接线
 * @param startx {float}
 * @param starty {float}
 * @param endx {float}
 * @param endy {float}
 */
var Connection = function(r, startx, starty, endx, endy){

	this._id = "";
	this._r = r;
	this._arrow = new Arrow(r, startx, starty, endx, endy);

	this._from = null;	//Node
	this._to   = null;	//Node
}

Connection.prototype.getID = function(){
	return this._id;
}

Connection.prototype.setEnds = function(from, to){
	this._from = from;
	this._to   = to;
	this._id = this._from.getID() + "-" + this._to.getID();
	this._arrow.setID(this._id);
}

Connection.prototype.setFrom = function(from){
	this._from = from;
}

Connection.prototype.getFrom = function(){
	return this._from;
}

Connection.prototype.setTo = function(to){
	this._to = to;
}

Connection.prototype.getTo = function(){
	return this._to;
}

Connection.prototype.update = function(startx, starty, endx, endy){

	if(this._arrow){
		this._arrow.update(startx, starty, endx, endy);
	}
}

Connection.prototype.offsetStart = function(dx, dy){

	if(this._arrow){
		this._arrow.offsetStart(dx, dy);
	}
}

Connection.prototype.offsetEnd = function(dx, dy){

	if(this._arrow){
		this._arrow.offsetEnd(dx, dy);
	}
}

Connection.prototype.remove = function(){
	if(this._arrow){
		this._arrow.remove();
	}
}

Connection.prototype.export = function(){

	var from = this._from ? this._from.getID() : "";
	var to   = this._to   ? this._to.getID()   : "";

	return {
		from : from,
		to 	 : to
	}
}

/**
 * 设置箭头的属性
 */
Connection.prototype.setArrowAttr = function (key, value) {
	if(this._arrow){
		this._arrow.setAttr(key,value);
	}
}

Connection.prototype.toFront = function () {
	if(this._arrow){
		this._arrow.toFront();
	}
}

Connection.prototype.clear = function () {
	if(this._from){
		if(this._from instanceof  DataNode){
			this._from.setToEdge(null);
		}else if(this._from instanceof  FuncNode){
			this._from.setOutputEdge(null);
		}
	}

	if(this._to){
		if(this._to instanceof  DataNode){
			this._to.setFromEdge(null);
		}else if(this._to instanceof FuncNode){
			this._to.removeInputEdge(this);
		}
	}
}

Connection.prototype.getDistance = function (x, y) {
	if(this._arrow){
		return this._arrow.getDistance(x,y);
	}else{
		return null;
	}
}

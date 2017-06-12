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

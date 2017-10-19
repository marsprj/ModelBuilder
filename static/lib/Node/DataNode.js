var DataNode = function(r, xmin, ymin, width, height){

	Node.apply(this, arguments);

	this._r = r;
	this._type = "data";
	this._name = "data";
	this._path = "/";

	this._shape = new Ellipse(r, xmin, ymin, width, height);
	this._id = this._shape.getID();

	this._from = null;
	this._to   = null;
}

extend(DataNode, Node);

DataNode.prototype.setPath = function(path){

	this._path = path;
	var text = "";
	var sep = path.lastIndexOf("/");
	if(sep>=0){
		text = path.substring(sep+1);
	}
	if(text == ""){
		text = "data";
	}
	this.setName(text);
	if(this._path == "/"){
		this.setShapeAttr("fill","#eef7ff");
	}else{
		this.setShapeAttr("fill","#95d5ee");
	}
}

DataNode.prototype.getPath = function(){
	return this._path;
}

DataNode.prototype.setFromEdge = function(from){
	this._from = from;
}

DataNode.prototype.getFromEdge = function(){
	return this._from;
}

DataNode.prototype.getFrom = function(){
	if(this._from){
		return this._from.getFrom();
	}
	return null;
}

DataNode.prototype.setToEdge = function(to){
	this._to = to;
}

DataNode.prototype.getToEdge = function(){
	return this._to;
}

DataNode.prototype.getTo = function(){
	if(this._to){
		return this._to.getTo();
	}
	return null;
}

DataNode.prototype.offset = function(dx, dy){
	if(this._shape){
		this._shape.offset(dx, dy);
	}
	var connManager = new ConnectionManager();
	if(this._from){
		var points = connManager.getClosePoints(this._from.getFrom(),this);
		this._from.update(points[0].x,points[0].y,points[1].x,points[1].y);
	}
	if(this._to){
		var points = connManager.getClosePoints(this,this._to.getTo());
		this._to.update(points[0].x,points[0].y,points[1].x,points[1].y);
	}
}

DataNode.prototype.scale = function(sx,sy){
	if(this._shape){
		this._shape.scale(sx,sy);
	}
}

DataNode.prototype.export = function(){
	return {
		id : this._id,
		path : this._path
	};
}


DataNode.prototype.onClick = function(){
	var that = this;
	if(this._from){
		var dlg = new FileDialog(this.getPath(),"new", function(){
			that.setPath(this.getFilePath());
		});
	}else{
		var dlg = new FileDialog(this.getPath(),"choose", function(){
			that.setPath(this.getFilePath());
		});
	}
	dlg.show();
}

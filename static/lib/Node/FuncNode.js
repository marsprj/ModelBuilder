var FuncNode = function(r, xmin, ymin, width, height){

	Node.apply(this, arguments);

	this._r = r;
	this._type = "function";
	this._name = "function";

	this._inputs = [];	//Connection;
	this._output = null;

	this._shape = new Rect(r, xmin, ymin, width, height);
	this._id = this._shape.getID();

	var that = this;
}

extend(FuncNode, Node);

FuncNode.prototype.addInputEdge = function(input){
	if(input){
		this._inputs.push(input);
	}
}

FuncNode.prototype.getInputs = function(){
	var inputs = [];
	this._inputs.forEach(function(e){
		var from = e.getFrom();
		if(from){
			inputs.push(from);
		}
	})

	return inputs;
}

FuncNode.prototype.getOutputEdge = function(i){
	if( (i>0) || (i<this._inputs.length)){
		return this._inputs[i];
	}
	return null;
}

FuncNode.prototype.getInputsEdge = function(){
	return this._inputs;
}

FuncNode.prototype.setOutputEdge = function(output){
	this._output = output;
}

FuncNode.prototype.getOutputEdge = function(){
	return this._output;
}

FuncNode.prototype.getOutput = function(){
	if(this._output){
		return this._output.getTo();
	}
	return null;
}

FuncNode.prototype.export = function(){
}

FuncNode.prototype.setParms = function(){
}

FuncNode.prototype.offset = function(dx, dy){
	if(this._shape){
		this._shape.offset(dx, dy);
	}
	var connManager = new ConnectionManager();
	var that = this;
	this._inputs.forEach(function(c){
		var points = connManager.getClosePoints(c.getFrom(),that);
		c.update(points[0].x,points[0].y,points[1].x,points[1].y);
	})
	if(this._output){
		var points = connManager.getClosePoints(that,this._output.getTo());
		this._output.update(points[0].x,points[0].y,points[1].x,points[1].y);
	}
}

FuncNode.prototype.scale = function(sx,sy){
	if(this._shape){
		this._shape.scale(sx,sy);
	}
}

FuncNode.prototype.removeInputEdge = function (connection) {
	for(var i = 0; i < this._inputs.length;++i){
		if(this._inputs[i] == connection){
			this._inputs.splice(i,1);
			return;
        }
    }
}

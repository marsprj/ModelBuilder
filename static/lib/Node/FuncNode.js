var FuncNode = function(r, xmin, ymin, width, height){

	Node.apply(this, arguments);

	this._r = r;
	this._type = "function";
	this._name = "function";

	this._inputs = [];	//Connection;
	this._output = null;

	this._shape = new Rect(r, xmin, ymin, width, height);

	var that = this;
	// this._shape.dblclick(function(){
	// 	alert(that._name);
	// });
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
	// var obj = {
	// 	name : "Fusion",
	// 	inputs : [{
	// 		id : "vyzhx"	//DataNode节点ID
	// 	}],
	// 	output : {
	// 		id : "5brwc"	//DataNode节点ID
	// 	}
	// 	params : [{			//参数集合
	// 		key: "radius",
	// 		value : 4.5
	// 	}]
	// }

	// return obj;
}

FuncNode.prototype.offset = function(dx, dy){
	if(this._shape){
		this._shape.offset(dx, dy);
	}

	this._inputs.forEach(function(c){
		c.offsetEnd(dx, dy);
	})
	if(this._output){
		this._output.offsetStart(dx, dy);
	}
}
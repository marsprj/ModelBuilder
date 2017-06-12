var NodeManager = function(){

	this._instance = null;
	this._nodes = [];
}

NodeManager.prototype.createDataNode = function(r, xmin, ymin, width, height){

	var node = new DataNode(r, xmin, ymin, width, height);	
	node.showText();

	this._nodes.push(node);
	return node;
}

NodeManager.prototype.createFuncNode = function(type, r, xmin, ymin, width, height, round){

	var node = null;
	switch(type){
		case FUNCTION_TYPE.Stretch:{
			node = new Stretch(r, xmin, ymin, width, height, round);
		}
		break;
		case FUNCTION_TYPE.Fusion:{
			node = new Fusion(r, xmin, ymin, width, height, round);
		}
		break;
	}
	node.showText();

	this._nodes.push(node);
	return node;
}


NodeManager.prototype.createStretchNode = function(r, xmin, ymin, width, height, round){

	var node = new FStretch(r, xmin, ymin, width, height, round);
	node.showText();
	this._nodes.push(node);
	return node;
}


NodeManager.prototype.getNodeById = function(id){
	var len = this._nodes.length;
	for(var i=0; i<len; i++){
		var wid = this._nodes[i].getID();
		
		if(this._nodes[i].getID() == id){
			return this._nodes[i];
		}
	}

	return null;
}

NodeManager.prototype.getDataNodes = function(){
	var nodes = [];
	this._nodes.forEach(function(n){
		if(n.getType() == NODE_TYPE.DATA){
			nodes.push(n);
		}
	})

	return nodes;
}


NodeManager.prototype.getFuncNodes = function(){
	var nodes = [];
	this._nodes.forEach(function(n){
		if(n.getType() == NODE_TYPE.FUNC){
			nodes.push(n);
		}
	})

	return nodes;
}

NodeManager.prototype.getFuncNode = function(){
	var count = this._nodes.length;
	for(var i=0; i<count; i++){
		if(this._nodes[i].getType() == NODE_TYPE.FUNC){
			return this._nodes[i];
		}
	}
		
	return null;
}

NodeManager.prototype.getNodes = function(){
	return this._nodes;
}

NodeManager.prototype.clear = function(){
	this._nodes.forEach(function(n){
		n.remove();
	});
	this._nodes.length = 0;
}

NodeManager.getInstance = function(){
	if(this._instance==null){
		this._instance = new NodeManager();
	}
	return this._instance;
}

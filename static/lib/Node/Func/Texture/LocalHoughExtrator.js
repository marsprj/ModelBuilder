/**
 * Hough线提取
 */
var LocalHoughExtrator = function(){
	FuncNode.apply(this, arguments);

	this._name = "LocalHoughExtrator";

	this._inputsNumber = 1;

	this._radius = 30;

	this._overlap = 10;

	this._numberOfLines = 1;

	this._threshold = 50;

}

extend(LocalHoughExtrator, FuncNode);


LocalHoughExtrator.prototype.setParms = function(parms){
	if(!parms){
		return;
	}

	for(var i = 0; i < parms.length; ++i){
		var key = parms[i].key;
		var value = parms[i].value;
		if(key === "radius"){
			this._radius = value;
		}else if (key === "overlap") {
			this._overlap = value;
		}else if (key === "numberOfLines") {
			this._numberOfLines = value;
		}else if (key === "threshold") {
			this._threshold = value;
		}
	}
};

LocalHoughExtrator.prototype.export = function(){
	var obj = {
		id : this.getID(),
		name : this._name,
		inputs : [
		],
		output : {
			id : ""
		},
		parms :[
		]
	}

	var inputs = this.getInputs();
	if(inputs){
		inputs.forEach(function(v){
			if(v){
				obj.inputs.push({
					id : v.getID()
				});

				var inJson = {
					key: "",
					value :"in=[" + v.getID() + "]"
				}
				obj.parms.push(inJson);
			}
		});
	}
	var output = this.getOutput();
	if(output){
		obj.output.id = output.getID()

		var outJson = {
			key : "",
			value : "[out]"
		};
		obj.parms.push(outJson);
	}

	obj.parms.push({
		key : "radius",
		value : this._radius
	},{
		key : "overlap",
		value : this._overlap
	},{
		key : "numberOfLines",
		value : this._numberOfLines
	},{
		key : "threshold",
		value : this._threshold
	});

	return obj;
}

LocalHoughExtrator.prototype.onClick = function(){
	var inputs = [];
	var output;
	if(this._inputs){
		for(var i=0; i<this._inputs.length; i++){
			var conn_in = this._inputs[i];
			if(conn_in){
				var from = conn_in.getFrom();
				if(from){
					inputs[i] = from.getPath();
				}
			}
		}
	}
	if(this._output){
		var conn_out = this._output;
		if(conn_out){
			var to = conn_out.getTo();
			if(to){
				output = to.getPath();
			}
		}
	}


	if(inputs.length != this._inputsNumber){
		alert("请设置" + this._inputsNumber + "个输入节点")
		return;
	}

	if(!this._output){
		alert("请设置一个输出节点");
		return;
	}

	var that = this;

	var parms = [{
		name : "radius",
		value : this._radius
	},{
		name : "overlap",
		value : this._overlap
	},{
		name : "numberOfLines",
		value : this._numberOfLines
	},{
		name : "threshold",
		value : this._threshold
	}];
	var dlg = new LocalHoughExtratorDialog(inputs, output,parms, function(){	//onOK
		that.updateInputNode(0,dlg.getInput(0));
		that.updateOutputNode(dlg.getOutput());
		that.updateParms(dlg.getParms());
	});
	dlg.show();
};

LocalHoughExtrator.prototype.updateParms = function(parms){
	if(!parms){
		return;
	}
	for(var i = 0; i < parms.length; ++i){
		var name = parms[i].name;
		var value = parms[i].value;
		if(name == "radius"){
			this._radius = value;
		}else if (name == "overlap") {
			this._overlap = value;
		}else if (name == "numberOfLines") {
			this._numberOfLines = value;
		}else if (name == "threshold") {
			this._threshold = value;
		}
	}
};
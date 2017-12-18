/**
 * 连通域分割
 */
var ConnectedSegment = function(){
	FuncNode.apply(this, arguments);

	this._name = "ConnectedSegment";

	this._inputsNumber = 1;

	this._seedX = 110;

	this._seedY = 38;

	this._lowerThreshold = 50;

	this._upperThreshold = 100;

}

extend(ConnectedSegment, FuncNode);

ConnectedSegment.prototype.setParms = function(parms){
	if(!parms){
		return;
	}

	for(var i = 0; i < parms.length; ++i){
		var key = parms[i].key;
		var value = parms[i].value;
		if(key === "seedX"){
			this._seedX = value;
		}else if (key === "seedY") {
			this._seedY = value;
		}else if (key === "lowerThreshold") {
			this._lowerThreshold = value;
		}else if (key === "upperThreshold") {
			this._upperThreshold = value;
		}
	}
};

ConnectedSegment.prototype.export = function(){
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
		key : "seedX",
		value : this._seedX
	},{
		key : "seedY",
		value : this._seedY
	},{
		key : "lowerThreshold",
		value : this._lowerThreshold
	},{
		key : "upperThreshold",
		value : this._upperThreshold
	});

	return obj;
}

ConnectedSegment.prototype.onClick = function(isPathEdit){
	var inputs = [];
	var output;
	$(".tooltip").remove();
	if(this._inputs){
		for(var i=0; i<this._inputs.length; i++){
			var conn_in = this._inputs[i];
			if(conn_in){
				var from = conn_in.getFrom();
				if(from){
					var inputFrom = from.getFrom();
					var asOutput = false;
					if(inputFrom){
						asOutput = true;
					}

					inputs.push({
						"path" : from.getPath(),
						"asOutput" : asOutput
					});
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
		var tootip = new Tooltip({
			target : "svg rect[id='" + this.getID() + "']",
			text: "请设置" + this._inputsNumber + "个输入节点"
		});
		return;
	}

	if(!this._output){
		var tootip = new Tooltip({
			target : "svg rect[id='" + this.getID() + "']",
			text: "请设置一个输出节点"
		});
		return;
	}

	var that = this;

	var parms = [{
		name : "seedX",
		value : this._seedX
	},{
		name : "seedY",
		value : this._seedY
	},{
		name : "lowerThreshold",
		value : this._lowerThreshold
	},{
		name : "upperThreshold",
		value : this._upperThreshold
	}];
	var dlg = new ConnectedSegmentDialog(inputs, output,parms, function(){	//onOK
		that.updateInputNode(0,dlg.getInput(0));
		that.updateOutputNode(dlg.getOutput());
		that.updateParms(dlg.getParms());
	},isPathEdit);
	dlg.show();
};

ConnectedSegment.prototype.updateParms = function(parms){
	if(!parms){
		return;
	}
	for(var i = 0; i < parms.length; ++i){
		var name = parms[i].name;
		var value = parms[i].value;
		if(name == "seedX"){
			this._seedX = value;
		}else if (name == "seedY") {
			this._seedY = value;
		}else if (name == "lowerThreshold") {
			this._lowerThreshold = value;
		}else if (name == "upperThreshold") {
			this._upperThreshold = value;
		}
	}
};
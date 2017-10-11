/**
 * Radio线检测
 */
var RadioLineDetector = function(){
	FuncNode.apply(this, arguments);

	this._name = "RadioLineDetector";

	this._inputsNumber = 1;

	this._length = 5;

	this._width = 1;

}

extend(RadioLineDetector, FuncNode);


RadioLineDetector.prototype.setParms = function(parms){
	if(!parms){
		return;
	}

	for(var i = 0; i < parms.length; ++i){
		var key = parms[i].key;
		var value = parms[i].value;
		if(key === "length"){
			this._length = value;
		}else if (key === "width") {
			this._width = value;
		}
	}
};

RadioLineDetector.prototype.export = function(){
	var obj = {
		id : this.getID(),
		name : this._name,
		inputs : [
		],
		output : {
			id : ""
		},
		outputs : [
		],
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
	}

	var outputs = this.getOutputs();
	if(outputs){
		outputs.forEach(function(v){
			if(v){
				obj.outputs.push({
					id : v.getID()
				});

				var inJson = {
					key: "",
					value :"out=[" + v.getID() + "]"
				}
				obj.parms.push(inJson);
			}
		});
	}	

	obj.parms.push({
		key : "length",
		value : this._length
	},{
		key : "width",
		value : this._width
	});

	return obj;
}

RadioLineDetector.prototype.onClick = function(){
	var inputs = [], outputs = [];
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

	if(this._outputs){
		for(var i = 0; i < this._outputs.length;++i){
			var conn_out = this._outputs[i];
			if(conn_out){
				var to = conn_out.getTo();
				if(to){
					outputs.push(to.getPath());
				}
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
		name : "length",
		value : this._length
	},{
		name : "width",
		value : this._width
	}];
	var dlg = new RadioLineDetectorDialog(inputs, outputs,parms, function(){	//onOK
		that.updateInputNode(0,dlg.getInput(0));
		that.updateOutputsNode(dlg.getOutputs());
		that.updateParms(dlg.getParms());
	});
	dlg.show();
};

RadioLineDetector.prototype.updateParms = function(parms){
	if(!parms){
		return;
	}
	for(var i = 0; i < parms.length; ++i){
		var name = parms[i].name;
		var value = parms[i].value;
		if(name == "length"){
			this._length = value;
		}else if (name == "width") {
			this._width = value;
		}
	}
};

RadioLineDetector.prototype.updateOutputsNode = function(outputsPath){
	for(var i = 0; i < outputsPath.length; ++i){
		var output = this._outputs[i];
		var path = outputsPath[i];
		if(output && path){
			var to = output.getTo();
			if(to){
				to.setPath(path);
			}
		}
	}
};
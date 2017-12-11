var Threshold = function(){
	FuncNode.apply(this, arguments);

	this._name = "Threshold";

	this._inputsNumber = 1;

	// 默认二值化
	this._lower = 0;

	this._upper = 128;

	this._insideValue = 0;

	this._outsideValue = 255;
}

extend(Threshold, FuncNode);

Threshold.prototype.setParms = function(parms){
	if(!parms){
		return;
	}

	for(var i = 0; i < parms.length; ++i){
		var key = parms[i].key;
		var value = parms[i].value;
		if(key === "lower"){
			this._lower = value;
		}else if (key === "upper") {
			this._upper = value;
		}else if (key === "inside") {
			this._insideValue = value;
		}else if(key === "outside"){
			this._outsideValue = value;
		}
	}
};

Threshold.prototype.export = function(){
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
		key : "lower",
		value : this._lower
	},{
		key : "upper",
		value : this._upper
	},{
		key : "inside",
		value : this._insideValue
	},{
		key : "outside",
		value : this._outsideValue
	});

	return obj;
};

Threshold.prototype.onClick = function(isPathEdit){
	var inputs = [];
	var output;
	$(".tooltip").remove();
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
		name : "lower",
		value : this._lower
	},{
		name : "upper",
		value : this._upper
	},{
		name : "inside",
		value : this._insideValue
	},{
		name : "outside",
		value : this._outsideValue
	}];
	var dlg = new ThresholdDialog(inputs, output,parms, function(){	//onOK
		that.updateInputNode(0,dlg.getInput(0));
		that.updateOutputNode(dlg.getOutput());
		that.updateParms(dlg.getParms());
	},isPathEdit);
	dlg.show();
}


Threshold.prototype.updateParms = function(parms){
	if(!parms){
		return;
	}
	for(var i = 0; i < parms.length; ++i){
		var name = parms[i].name;
		var value = parms[i].value;
		if(name == "lower"){
			this._lower = value;
		}else if(name == "upper"){
			this._upper = value;
		}else if (name == "inside") {
			this._insideValue = value;
		}else if (name == "outside") {
			this._outsideValue = value;
		}
	}
};
/**
 * 平滑滤波
 */
var Smoothing = function(){
	FuncNode.apply(this, arguments);

	this._name = "Smoothing";

	this._inputsNumber = 1;

	this._outPixel = "float";

	this._smooth_type = "anidif";

	this._radius = 2;
}

extend(Smoothing, FuncNode);

Smoothing.prototype.setParms = function(parms){
	if(!parms){
		return;
	}

	for(var i = 0; i < parms.length; ++i){
		var key = parms[i].key;
		var value = parms[i].value;
		if(key === "-type"){
			this._smooth_type = value;
		}else if(key === "-out"){
			value = value.replace("[out]","").trim();
			this._outPixel = value;
		}else if (key === "-type.mean.radius") {
			this._radius = value;
		}else if (key === "-type.gaussian.radius") {
			this._radius = value;
		}
	}
};

Smoothing.prototype.export = function(){
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
					key: "-in",
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
			key : "-out",
			value : "[out] " + this._outPixel
		};
		obj.parms.push(outJson);
	}

	obj.parms.push({
		key : "-type",
		value : this._smooth_type
	});

	if(this._smooth_type == "mean"){
		obj.parms.push({
			key : "-type.mean.radius",
			value : this._radius
		});
	}else if(this._smooth_type == "gaussian"){
		obj.parms.push({
			key : "-type.gaussian.radius",
			value : this._radius
		});
	}
	return obj;
}

Smoothing.prototype.onClick = function(){
	var inputs = [];
	var output;
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
		alert("请设置" + this._inputsNumber + "个输入节点")
		return;
	}

	if(!this._output){
		alert("请设置一个输出节点");
		return;
	}

	var that = this;

	var parms = [{
			name : "pixel",
			value : this._outPixel
		},{
			name: "type",
			value : this._smooth_type
		}];
	if(this._smooth_type == "mean" || this._smooth_type == "gaussian"){
		parms.push({
			name : "radius",
			value : this._radius
		});
	}
	var dlg = new SmoothingDialog(inputs, output,parms, function(){	//onOK
		that.updateInputNode(0,dlg.getInput(0));
		that.updateOutputNode(dlg.getOutput());
		that.updateParms(dlg.getParms());
	});
	dlg.show();
};

Smoothing.prototype.updateParms = function(parms){
	if(!parms){
		return;
	}
	for(var i = 0; i < parms.length; ++i){
		var name = parms[i].name;
		var value = parms[i].value;
		if(name == "pixel"){
			this._outPixel = value;
		}else if(name == "type"){
			this._smooth_type = value;
		}else if (name == "radius") {
			this._radius = value;
		}
	}
};
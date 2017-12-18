/**
 * Harris特征点检测
 */
var HarrisDetector = function(){
	FuncNode.apply(this, arguments);

	this._name = "HarrisDetector";

	this._inputsNumber = 1;

	this._sigmaD = 1.5;

	this._sigmal = 2;

	this._alpha = 0.1;
}

extend(HarrisDetector, FuncNode);


HarrisDetector.prototype.setParms = function(parms){
	if(!parms){
		return;
	}

	for(var i = 0; i < parms.length; ++i){
		var key = parms[i].key;
		var value = parms[i].value;
		if(key === "sigmaD"){
			this._sigmaD = value;
		}else if (key === "sigmal") {
			this._sigmal = value;
		}else if (key === "alpha") {
			this._alpha = value;
		}
	}
};

HarrisDetector.prototype.export = function(){
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
		key : "sigmaD",
		value : this._sigmaD
	},{
		key : "sigmal",
		value : this._sigmal
	},{
		key : "alpha",
		value : this._alpha
	});

	return obj;
}

HarrisDetector.prototype.onClick = function(isPathEdit){
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
		name : "sigmaD",
		value : this._sigmaD
	},{
		name : "sigmal",
		value : this._sigmal
	},{
		name : "alpha",
		value : this._alpha
	}];
	var dlg = new HarrisDetectorDialog(inputs, output,parms, function(){	//onOK
		that.updateInputNode(0,dlg.getInput(0));
		that.updateOutputNode(dlg.getOutput());
		that.updateParms(dlg.getParms());
	},isPathEdit);
	dlg.show();
};

HarrisDetector.prototype.updateParms = function(parms){
	if(!parms){
		return;
	}
	for(var i = 0; i < parms.length; ++i){
		var name = parms[i].name;
		var value = parms[i].value;
		if(name == "sigmaD"){
			this._sigmaD = value;
		}else if (name == "sigmal") {
			this._sigmal = value;
		}else if (name == "alpha") {
			this._alpha = value;
		}
	}
};
/**
 * 云检测
 */
var CloudDetection = function(){
	FuncNode.apply(this, arguments);

	this._name = "CloudDetection";

	this._inputsNumber = 1;

	this._firstP = 553;

	this._secondP = 467;

	this._thirdP = 734;

	this._fourthP = 581;

	this._variance = 0.4;

	this._minThreshold = 0.6;

	this._maxThreshold = 1.0;

}

extend(CloudDetection, FuncNode);


CloudDetection.prototype.setParms = function(parms){
	if(!parms){
		return;
	}

	for(var i = 0; i < parms.length; ++i){
		var key = parms[i].key;
		var value = parms[i].value;
		if(key === "firstP"){
			this._firstP = value;
		}else if (key === "secondP") {
			this._secondP = value;
		}else if (key === "thirdP") {
			this._thirdP = value;
		}else if (key === "fourthP") {
			this._fourthP = value;
		}else if (key === "variance") {
			this._variance = value;
		}else if (key === "minThreshold") {
			this._minThreshold = value;
		}else if (key === "maxThreshold") {
			this._maxThreshold = value;
		}
	}
};

CloudDetection.prototype.export = function(){
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
		key : "firstP",
		value : this._firstP
	},{
		key : "secondP",
		value : this._secondP
	},{
		key : "thirdP",
		value : this._thirdP
	},{
		key : "fourthP",
		value : this._fourthP
	},{
		key : "variance",
		value : this._variance
	},{
		key : "minThreshold",
		value : this._minThreshold
	},{
		key : "maxThreshold",
		value : this._maxThreshold
	});

	return obj;
}

CloudDetection.prototype.onClick = function(isPathEdit){
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
		name : "firstP",
		value : this._firstP
	},{
		name : "secondP",
		value : this._secondP
	},{
		name : "thirdP",
		value : this._thirdP
	},{
		name : "fourthP",
		value : this._fourthP
	},{
		name : "variance",
		value : this._variance
	},{
		name : "minThreshold",
		value : this._minThreshold
	},{
		name : "maxThreshold",
		value : this._maxThreshold
	}];
	var dlg = new CloudDetectionDialog(inputs, output,parms, function(){	//onOK
		that.updateInputNode(0,dlg.getInput(0));
		that.updateOutputNode(dlg.getOutput());
		that.updateParms(dlg.getParms());
	},isPathEdit);
	dlg.show();
};

CloudDetection.prototype.updateParms = function(parms){
	if(!parms){
		return;
	}
	for(var i = 0; i < parms.length; ++i){
		var name = parms[i].name;
		var value = parms[i].value;
		if(name == "firstP"){
			this._firstP = value;
		}else if (name == "secondP") {
			this._secondP = value;
		}else if (name == "thirdP") {
			this._thirdP = value;
		}else if (name == "fourthP") {
			this._fourthP = value;
		}else if (name == "variance") {
			this._variance = value;
		}else if (name == "minThreshold") {
			this._minThreshold = value;	
		}else if (name == "maxThreshold") {
			this._maxThreshold = value;
		}
	}
};
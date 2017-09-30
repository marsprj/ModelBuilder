/**
 * ROI裁剪
 */
var ROIExtract = function(){
	FuncNode.apply(this, arguments);

	this._name = "ROIExtract";

	this._inputsNumber = 1;

	this._startX = 0;

	this._startY = 0;

	this._sizeX = 100;

	this._sizeY = 100;

}

extend(ROIExtract, FuncNode);

ROIExtract.prototype.setParms = function(parms){
	if(!parms){
		return;
	}

	for(var i = 0; i < parms.length; ++i){
		var key = parms[i].key;
		var value = parms[i].value;
		if(key === "startX"){
			this._startX = value;
		}else if (key === "startY") {
			this._startY = value;
		}else if (key === "sizeX") {
			this._sizeX = value;
		}else if (key === "sizeY") {
			this._sizeY = value;
		}
	}
};

ROIExtract.prototype.export = function(){
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
		key : "startX",
		value : this._startX
	},{
		key : "startY",
		value : this._startY
	},{
		key : "sizeX",
		value : this._sizeX
	},{
		key : "sizeY",
		value : this._sizeY
	});

	return obj;
}

ROIExtract.prototype.onClick = function(){
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
		name : "startX",
		value : this._startX
	},{
		name : "startY",
		value : this._startY
	},{
		name : "sizeX",
		value : this._sizeX
	},{
		name : "sizeY",
		value : this._sizeY
	}];
	var dlg = new ROIExtractDialog(inputs, output,parms, function(){	//onOK
		that.updateInputNode(0,dlg.getInput(0));
		that.updateOutputNode(dlg.getOutput());
		that.updateParms(dlg.getParms());
	});
	dlg.show();
};

ROIExtract.prototype.updateParms = function(parms){
	if(!parms){
		return;
	}
	for(var i = 0; i < parms.length; ++i){
		var name = parms[i].name;
		var value = parms[i].value;
		if(name == "startX"){
			this._startX = value;
		}else if (name == "startY") {
			this._startY = value;
		}else if (name == "sizeX") {
			this._sizeX = value;
		}else if (name == "sizeY") {
			this._sizeY = value;
		}
	}
};
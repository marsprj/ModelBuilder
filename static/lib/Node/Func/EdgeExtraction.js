var EdgeExtraction =  function(){
	FuncNode.apply(this, arguments);

	this._name = "EdgeExtraction";

	this._inputsNumber = 1;

	this._outPixel = "float";

	this._filter = "gradient";
}

extend(EdgeExtraction, FuncNode);

EdgeExtraction.prototype.setParms = function(parms){
	if(!parms){
		return;
	}

	for(var i = 0; i < parms.length; ++i){
		var key = parms[i].key;
		var value = parms[i].value;
		if(key === "-filter"){
			this._filter = value;
		}else if(key === "-out"){
			value = value.replace("[out]","").trim();
			this._outPixel = value;
		}
	}
};

EdgeExtraction.prototype.export = function(){
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
		key : "-filter",
		value : this._filter
	});
	return obj;
}

EdgeExtraction.prototype.updateInputNode = function(path){

	var conn = this._inputs[0];
	var from = conn.getFrom();
	if(from){
		from.setPath(path);
	}
}

EdgeExtraction.prototype.updateOutputNode = function(path){

	if(this._output){
		var to = this._output.getTo();
		if(to){
			to.setPath(path);
		}
	}
}


EdgeExtraction.prototype.updateParms = function(parms){
	if(!parms){
		return;
	}

	for(var i = 0; i < parms.length; ++i){
		var name = parms[i].name;
		var value = parms[i].value;
		if(name == "pixel"){
			this._outPixel = value;
		}else if(name == "filter"){
			this._filter = value;
		}
	}
};

EdgeExtraction.prototype.onClick = function(){
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
			name : "pixel",
			value : this._outPixel
		},{
			name: "filter",
			value : this._filter
		}];
	var dlg = new EdgeExtractionDialog(inputs, output,parms, function(){	//onOK
		that.updateInputNode(dlg.getInput(0));
		that.updateOutputNode(dlg.getOutput());
		that.updateParms(dlg.getParms());
	});
	dlg.show();
};
/**
 * 灰度共生矩阵
 */
var Texture = function(){
	FuncNode.apply(this, arguments);

	this._name = "Texture";

	this._inputsNumber = 1;

	this._radius = 2;

	this._xoffset = 1;

	this._yoffset = 1;
}

extend(Texture, FuncNode);


Texture.prototype.setParms = function(parms){
	if(!parms){
		return;
	}

	for(var i = 0; i < parms.length; ++i){
		var key = parms[i].key;
		var value = parms[i].value;
		if(key === "radius"){
			this._radius = value;
		}else if (key === "xoffset") {
			this._xoffset = value;
		}else if (key === "yoffset") {
			this._yoffset = value;
		}
	}
};

Texture.prototype.export = function(){
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
		key : "xoffset",
		value : this._xoffset
	},{
		key : "yoffset",
		value : this._yoffset
	});

	return obj;
}

Texture.prototype.onClick = function(isPathEdit){
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
		name : "radius",
		value : this._radius
	},{
		name : "xoffset",
		value : this._xoffset
	},{
		name : "yoffset",
		value : this._yoffset
	}];
	var dlg = new TextureDialog(inputs, output,parms, function(){	//onOK
		that.updateInputNode(0,dlg.getInput(0));
		that.updateOutputNode(dlg.getOutput());
		that.updateParms(dlg.getParms());
	},isPathEdit);
	dlg.show();
};

Texture.prototype.updateParms = function(parms){
	if(!parms){
		return;
	}
	for(var i = 0; i < parms.length; ++i){
		var name = parms[i].name;
		var value = parms[i].value;
		if(name == "radius"){
			this._radius = value;
		}else if (name == "xoffset") {
			this._xoffset = value;
		}else if (name == "yoffset") {
			this._yoffset = value;
		}
	}
};
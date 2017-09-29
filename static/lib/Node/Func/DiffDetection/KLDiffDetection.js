/**
 * 基于Kullback-Leibler距离检测
 */
var KLDiffDetection = function(){

	FuncNode.apply(this, arguments);

	this._name = "KLDiffDetection";

	// 输入个数
	this._inputsNumber = 2;

	this._radius = 3;

}

extend(KLDiffDetection, FuncNode);


KLDiffDetection.prototype.setParms = function(parms){
	if(!parms){
		return;
	}

	for(var i = 0; i < parms.length; ++i){
		var key = parms[i].key;
		var value = parms[i].value;
		if(key === "radius"){
			this._radius = value;
		}
	}
};

KLDiffDetection.prototype.export = function(){
	var obj = {
		id : this.getID(),
		name : this._name,
		inputs : [
		],
		output : {
			id : ""
		},
		parms:[
		]
	}

	var inputs = this.getInputs();
	if(inputs){
		inputs.forEach(function(v,index){
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
	});

	return obj;
}


KLDiffDetection.prototype.onClick = function(){
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
		}];
	var dlg = new KLDiffDetectionDialog(inputs, output, parms, function(){	//onOK
		that.updateInputNode(0,this.getInput(0));
		that.updateInputNode(1,this.getInput(1));
		that.updateOutputNode(this.getOutput());
		that.updateParms(dlg.getParms());
	});
	dlg.show();

}


KLDiffDetection.prototype.updateParms = function(parms){
	if(!parms){
		return;
	}

	for(var i = 0; i < parms.length; ++i){
		var name = parms[i].name;
		var value = parms[i].value;
		if(name == "radius"){
			this._radius = value;
		}
	}
};
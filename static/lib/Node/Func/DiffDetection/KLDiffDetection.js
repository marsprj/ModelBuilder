/**
 * 基于Kullback-Leibler距离检测
 */
var KLDiffDetection = function(){

	FuncNode.apply(this, arguments);

	this._name = "KLDiffDetection";

	// 输入个数
	this._inputsNumber = 2;

	this._winSize = 3;

}

extend(KLDiffDetection, FuncNode);


KLDiffDetection.prototype.setParms = function(parms){
	if(!parms){
		return;
	}

	for(var i = 0; i < parms.length; ++i){
		var key = parms[i].key;
		var value = parms[i].value;
		if(key === "winSize"){
			this._winSize = value;
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
		key : "winSize",
		value : this._winSize
	});

	return obj;
}


KLDiffDetection.prototype.onClick = function(isPathEdit){
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
			name : "winSize",
			value : this._winSize
		}];
	var dlg = new KLDiffDetectionDialog(inputs, output, parms, function(){	//onOK
		that.updateInputNode(0,this.getInput(0));
		that.updateInputNode(1,this.getInput(1));
		that.updateOutputNode(this.getOutput());
		that.updateParms(dlg.getParms());
	},isPathEdit);
	dlg.show();

}


KLDiffDetection.prototype.updateParms = function(parms){
	if(!parms){
		return;
	}

	for(var i = 0; i < parms.length; ++i){
		var name = parms[i].name;
		var value = parms[i].value;
		if(name == "winSize"){
			this._winSize = value;
		}
	}
};
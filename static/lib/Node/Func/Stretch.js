var Stretch = function(){

	FuncNode.apply(this, arguments);

	this._name = "Stretch";

	this._inputsNumber = 1;
}

extend(Stretch, FuncNode);

Stretch.prototype.updateInputNode = function(path){

	var conn = this._inputs[0];
	var from = conn.getFrom();
	if(from){
		from.setPath(path);
	}
}

Stretch.prototype.updateOutputNode = function(path){

	if(this._output){
		var to = this._output.getTo();
		if(to){
			to.setPath(path);
		}
	}
}

Stretch.prototype.export = function(){
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
			}
		});
	}
	var output = this.getOutput();
	if(output){
		obj.output.id = output.getID()
	}
	return obj;
}


Stretch.prototype.onClick = function(){
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
	var parms = [];
	var dlg = new StretchDialog(inputs, output, parms,function(){	//onOK
		that.updateInputNode(dlg.getInput(0));
		that.updateOutputNode(dlg.getOutput());
	});
	dlg.show();
}

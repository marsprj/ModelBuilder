var Stretch = function(){

	FuncNode.apply(this, arguments);

	this._name = "Stretch";

	var that = this;

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
		}
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
	var input, output;
	if(this._inputs){
		var conn_in = this._inputs[0];
		if(conn_in){
			var from = conn_in.getFrom();
			if(from){
				input = from.getPath();
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

	var that = this;
	var dlg = new StretchDialog(input, output, function(){	//onOK
		that.updateInputNode(dlg.getInput());
		that.updateOutputNode(dlg.getOutput());
	});
	dlg.show();
}

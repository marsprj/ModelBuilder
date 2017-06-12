var Fusion = function(){

	FuncNode.apply(this, arguments);

	this._name = "Fusion";

	var that = this;
	this._shape.dblclick(function(){

		var inputs = [null, null];
		var outout;
		if(that._inputs){
			for(var i=0; i<that._inputs.length; i++){
				var conn_in = that._inputs[i];
				if(conn_in){
					var from = conn_in.getFrom();
					if(from){
						inputs[i] = from.getPath();
					}
				}
			}	
		}
		if(that._output){
			var conn_out = that._output;
			if(conn_out){
				var to = conn_out.getTo();
				if(to){
					output = to.getPath();
				}
			}	
		}

		var dlg = new FusionDialog(inputs, output, function(){	//onOK
			// alert(dlg.getInput());
			// alert(dlg.getOutput());
			alert("OK");
		});
		dlg.show();
	});
}

extend(Fusion, FuncNode);

Fusion.prototype.updateInputNode1 = function(path){

	var conn = this._inputs[0];
	if(conn){
		var from = conn.getFrom();
		if(from){
			from.setPath(path);
		}
	}
}

Fusion.prototype.updateInputNode2 = function(path){

	var conn = this._inputs[1];
	if(conn){
		var from = conn.getFrom();
		if(from){
			from.setPath(path);
		}	
	}
	
}


Fusion.prototype.export = function(){
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
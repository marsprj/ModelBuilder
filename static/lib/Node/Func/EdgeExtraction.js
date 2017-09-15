var EdgeExtraction =  function(){
	FuncNode.apply(this, arguments);

	this._name = "EdgeExtraction";

	this._inputsNumber = 1;

	this._outPixel = "float";

	this._filter = "gradient";
}

extend(EdgeExtraction, FuncNode);


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
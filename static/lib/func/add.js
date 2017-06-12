var Add = function(a, b){

	this._inputs.push(a);
	this._inputs.push(b);
	this._input_count = 2;
}

extend(Add, Func)


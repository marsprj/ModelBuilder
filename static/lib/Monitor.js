var Monitor = function(){
	this._status = "off";
	this._data = [];
	this._pid = 0;
}

Monitor.prototype.load = function(obj){
	if(!obj){
		return;
	}
	if(obj.status){
		this._status = obj.status;
	}
	
	if(obj.pid){
		this._pid = obj.pid;
	}
	
	if(obj.data){
		this._data = obj.data;
	}
};

Monitor.prototype.export = function(){
	var obj = {
		status : this._status,
		pid : this._pid,
		data : this._data
	};

	return obj;
};


Monitor.prototype.clear = function(){
	this._status = "off";
	this._pid = 0;
	this._data = [];
};

Monitor.prototype.setMonitorID = function(IDs){
	var data = [];
	for(var i = 0; i < IDs.length;++i){
		var n = null;
		var id = IDs[i];
		for(var j = 0; j < this._data.length;++j){
			var d = this._data[j];
			if(d.id == id){
				n = d;
				break;
			}
		}
		if(!n){
			data.push({
				id : id,
				path : "",
				prefix : ""
			});
		}else{
			data.push(d);
		}
	}
	this._data = data;
};

Monitor.prototype.getStatus = function(){
	return this._status;
};

Monitor.prototype.getData = function(){
	return this._data;
};

Monitor.prototype.setData = function(data){
	if(data){
		for(var i = 0; i < this._data.length;++i){
			var d = this._data[i];
			var id = d.id;
			var choose = null;
			for(var j = 0; j < data.length;++j){
				var n = data[i];
				if(n.id == id){
					choose = n;
					break;
				}
			}
			if(choose){
				d.prefix = choose.prefix;
				d.path = choose.path;
			}
		}
	}
};
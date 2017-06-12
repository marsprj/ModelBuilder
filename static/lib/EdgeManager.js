var ConnectionManager = function(){

	this._instance = null;
	this._connections = [];
}

ConnectionManager.prototype.getConnectionById = function(id){
	var len = this._connections.length;
	for(var i=0; i<len; i++){
		if(this._connections[i]._id == id){
			return this._connections[i];
		}
	}

	return null;
}

ConnectionManager.prototype.add = function(connection){
	if(!connection){
		return false;
	}

	this._connections.push(connection);

	return true;
}

ConnectionManager.prototype.createConnection = function(r, from, to){
	if(!from && !to){
		return null;
	}

	var f_snaps = from.getSnapPos();
	var t_snaps = to.getSnapPos();
	var f_n = f_snaps.length;
	var t_n = t_snaps.length;

	var mind = 1000000;

	var f=0, t=0;
	var f_p, t_p, d;
	for(var i=0; i<f_n; i++){
		f_p = f_snaps[i];
		for(var j=0; j<t_n; j++){
			t_p = t_snaps[j];

			d = Math.pow((f_p.x-t_p.x), 2) + Math.pow((f_p.y-t_p.y), 2);
			if(d < mind){
				mind=d;	f=i;	t=j;
			}
		}
	}

	var cs = f_snaps[f];
	var ce = t_snaps[t];

	var connection = new Connection(r, cs.x, cs.y, ce.x, ce.y);

	connection.setFrom(from);
	connection.setTo(to);

	this._connections.push(connection);
	return connection;
}

ConnectionManager.prototype.getConnections = function(){
	return this._connections;
}

ConnectionManager.prototype.makeID = function(from, to){
	if(from && to){
		return from.getID() + "-" + to.getID();
	}
	return null;
}

ConnectionManager.prototype.clear = function(){
	this._connections.forEach(function(c){
		c.remove();
	})

	this._connections.length = 0;
}

ConnectionManager.getInstance = function(){
	if(this._instance==null){
		this._instance = new ConnectionManager();
	}
	return this._instance;
}

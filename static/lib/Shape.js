var Shape = function(r){
	this._r = r;
	this._shape = null;	//Raphael.Element
	this._text  = null;

	this._xmin = 0;
	this._ymin = 0;
	this._xmax = 0;
	this._ymax = 0;

	this._snap_hover_in = null;
	this._snap_hover_out = null;

	var that = this;
	var connection = null;
	//@deprecated
	// this._connection_listener = {
	// 	in : function(evt){		//hover in
	// 		var container = $("#canvas");
	// 		var manager = NodeManager.getInstance();
	// 		//var from = that;
	// 		var from = manager.getNodeById(that.getID());

	// 		var onmousemove = function(evt){
	// 			console.log("[moving]:"+that._shape.id);
	// 			//获取鼠标处的Element
	// 			var target = that._r.getElementByPoint(evt.pageX, evt.pageY);
	// 			console.log("1");
	// 			//(target);
	// 			if(target){
	// 				console.log("2");
	// 				if(from.getID() == target.id){
	// 					console.log("3");
	// 					//起点和终点是一个Node
	// 					connection.update(start_x, start_y, evt.offsetX, evt.offsetY);	
	// 				}
	// 				else{
	// 					console.log("4");
	// 					//获取Element所对应的Node
	// 					var to = manager.getNodeById(target.id);
	// 					if(to){
	// 						console.log("5");
	// 						if(from.getType() != to.getType()){
	// 							//相同类型的Node不允许相连，例如两个Data连接起来没有意义
	// 							//寻找snap
	// 							console.log("6");
	// 							var pos = to.findSnap(evt.offsetX, evt.offsetY);
	// 							if(pos){
	// 								console.log("7");
	// 								//如果找到snap，则返回该snap的坐标，箭头自动连接到该snap
	// 								connection.update(start_x, start_y, pos.x, pos.y);	
	// 							}
	// 							else{
	// 								console.log("8");
	// 								//否则，则用鼠标点出的坐标更新箭头。
	// 								connection.update(start_x, start_y, evt.offsetX, evt.offsetY);	
	// 							}
	// 						}
	// 						else{
	// 							console.log("9");
	// 							connection.update(start_x, start_y, evt.offsetX, evt.offsetY);		
	// 						}	
	// 					}
	// 				}
					
	// 			}
	// 			else{
	// 				console.log("10");
	// 				connection.update(start_x, start_y, evt.offsetX, evt.offsetY);	
	// 			}				
	// 		}

	// 		var onmouseup = function(evt){
	// 			//重置连接状态为NONE
	// 			g_connect_state = CONNECT_STATE.NONE;
	// 			connection.remove();

	// 			var target = that._r.getElementByPoint(evt.pageX, evt.pageY);
	// 			if(target){
					
	// 				var to = manager.getNodeById(target.id);
	// 				if(from.getType() != to.getType()){
	// 					var conManager = ConnectionManager.getInstance()
	// 					var id = conManager.makeID(from,to);
	// 					console.log("[connection]:"+id);
	// 					var f  = conManager.getConnectionById(id);
	// 					if(f){
	// 						alert("连接已经存在，不能重复添加");
	// 					}
	// 					else{
	// 						var end_x = evt.offsetX;
	// 						var end_y = evt.offsetY;
	// 						var pos = to.findSnap(evt.offsetX, evt.offsetY);
	// 						if(pos){
	// 							end_x = pos.x;
	// 							end_y = pos.y;
	// 						}
	// 						connection = new Connection(that._r, start_x, start_y, end_x, end_y);
	// 						connection.setEnds(from,to);	
	// 						conManager.add(connection);

	// 					}
	// 				}
	// 			}
	// 			else{
	// 				connection.remove();
	// 			}

	// 			console.log("[up]:"+that._shape.id);
	// 			container.unbind("mousedown",   onmousedown);
	// 			container.unbind("mousemove", onmousemove);
	// 			container.unbind("mouseup",   onmouseup);
	// 		}

	// 		var onmousedown = function(evt){

	// 			console.log("[down]:"+that._shape.id);

	// 			g_connect_state = CONNECT_STATE.CONNECTING;
	// 			// start_x = evt.offsetX;
	// 			// start_y = evt.offsetY;
	// 			var pos = that.findSnap(evt.offsetX, evt.offsetY);
	// 			start_x = pos.x;
	// 			start_y = pos.y;
	// 			connection = new Connection(that._r, start_x, start_y, start_x, start_y);

	// 			//注册鼠标移动事件
	// 			container.on("mousemove", onmousemove);
	// 			container.on("mouseup", onmouseup);
	// 		}

	// 		switch(g_state)
	// 		{
	// 			case STATE.CONNECT:{
	// 				if(g_connect_state!=CONNECT_STATE.CONNECTING){
	// 					g_connect_state = CONNECT_STATE.READY;
	// 					console.log("[input]: connect ready");

	// 					//注册鼠标事件，之调用一次。
	// 					// container.one("mousedown", onmousedown);
	// 					// container.one("mouseup", onmouseup);
	// 					container.on("mousedown", onmousedown);
	// 					//container.on("mouseup", onmouseup);
	// 				}
	// 			}
	// 			break;
	// 		}
	// 	},
	// 	out : function(evt){		//hover out
	// 		that.hideSnap();
	// 	}
	// }
}

Shape.prototype.hover_in = function(){
	this.showSnap();
}

Shape.prototype.hover_out = function(){
	this.hideSnap();
}

Shape.prototype.showSnap = function(){

}

Shape.prototype.hideSnap = function(){
	
}

Shape.prototype.getID = function(){
	return this._shape ? this._shape.id : "";
}

Shape.prototype.getElement = function(){
	return this._shape;
}

Shape.prototype.draggable = function(){
	if(this._shape){
		this._shape.draggable();
	}
}

Shape.prototype.undrag = function(){
	if(this._shape){
		this._shape.undrag();
	}
}

Shape.prototype.getSnapPos = function(){
	
}

Shape.prototype.showSnap = function(){
	this._snapxy = this.getSnapPos();
	
	var that = this;
	this._snaps.length = 0;
	this._snapxy.forEach(function(s){
		var c = that._r.circle(s.x, s.y, that._snap_r).attr({
				"fill" : "#FFF",
				"stroke" : "#0F0"
			});		
		that._snaps.push(c);
	});
}

Shape.prototype.hideSnap = function(){
	if(this._snap_highlight){
		this._snap_highlight.remove();
	}
	this._snaps.forEach(function(s){
		s.remove();
	})
	this._snaps.length = 0;
}

Shape.prototype.showText = function(text){	
	var cx = (this._xmin + this._xmax) / 2;
	var cy = (this._ymin + this._ymax) / 2;
	if(this._text){
		this._text.remove();
	}
	this._text = this._r.text(cx, cy, text);
}

Shape.prototype.findSnap = function(x, y){
	var threhold = 20;

	var length = this._snapxy.length;
	var dist = 0;
	var mind = 10000000;
	var index = -1;
	for(var i=0; i<length; i++){
		var xy = this._snapxy[i];
		dist = Math.abs(xy.x-x) + Math.abs(xy.y-y);
		if(dist<mind){
			index = i;
			mind = dist;
		}
	}

	//if((index<0) ||(mind>threhold)){
	// if((index<0) ||(mind>threhold)){
	// 	if(this._snap_highlight){
	// 		this._snap_highlight.remove();
	// 	}
	// 	return undefined;
	// }

	if(this._snap_highlight){
		this._snap_highlight.remove();
	}
	var s = this._snapxy[index];
	this._snap_highlight = this._r.circle(s.x, s.y, this._snap_r).attr({
				"fill" : "#00F",
				"stroke" : "#0F0"
			});	

	return {
		x : s.x,
		y : s.y
	};
}

Shape.prototype.startSnapping = function(){
	var that = this;
	// var onmousemove = function(evt){
	// 	var index = that.findSnap(evt.offsetX, evt.offsetY);
	// 	if(index){
	// 		console.log("[snap]:" + index);
	// 	}
	// }
	this._snap_hover_in = function(evt){		//hover in
			that.showSnap();

			// var container = $("#canvas");
			// container.on("mousemove", onmousemove);

	};

	this._snap_hover_out = function(evt){		//hover out
		that.hideSnap();
		// var container = $("#canvas");
		// container.unbind("mousemove", onmousemove);
	}

	this._shape.hover(
		this._snap_hover_in,
		this._snap_hover_out
	);
}

Shape.prototype.stopSnapping = function(){
	this._shape.unhover(
		this._snap_hover_in,
		this._snap_hover_out
	);
}

Shape.prototype.startConnecting = function(onSelectChanged){
	var that = this;
	this._shape.hover(
		function(){
			if(onSelectChanged){
				onSelectChanged(that);
			}
		},
		function(){
			if(onSelectChanged){
				onSelectChanged(null);
			}
		});
	// this._shape.hover(
	// 	that._connection_listener.in,
	// 	that._connection_listener.out
	// );
}


// Shape.prototype.startConnection = function(){
// 	var that = this;
// 	this._shape.hover(
// 		function(evt){		//hover in
// 			var container = $("#canvas");
// 			var manager = NodeManager.getInstance();
// 			//var from = that;
// 			var from = manager.getNodeById(that.getID());

// 			var onmousemove = function(evt){
// 				//获取鼠标处的Element
// 				var target = that._r.getElementByPoint(evt.pageX, evt.pageY);
// 				console.log(target);
// 				if(target){
// 					console.log("...............")
// 					//获取Element所对应的Node
// 					var to = manager.getNodeById(target.id);
// 					if(to){
// 						if(from.getType() != to.getType()){
// 							//相同类型的Node不允许相连，例如两个Data连接起来没有意义
// 							//寻找snap
// 							var pos = to.findSnap(evt.offsetX, evt.offsetY);
// 							if(pos){
// 								//如果找到snap，则返回该snap的坐标，箭头自动连接到该snap
// 								connection.update(start_x, start_y, pos.x, pos.y);	
// 							}
// 							else{
// 								//否则，则用鼠标点出的坐标更新箭头。
// 								connection.update(start_x, start_y, evt.offsetX, evt.offsetY);	
// 							}
// 						}
// 						else{
// 							connection.update(start_x, start_y, evt.offsetX, evt.offsetY);		
// 						}	
// 					}
// 				}
// 				else{
// 					connection.update(start_x, start_y, evt.offsetX, evt.offsetY);	
// 				}				
// 			}

// 			var onmouseup = function(evt){
// 				//重置连接状态为NONE
// 				g_connect_state = CONNECT_STATE.NONE;
// 				connection.remove();

// 				var target = that._r.getElementByPoint(evt.pageX, evt.pageY);
// 				if(target){
					
// 					var to = manager.getNodeById(target.id);
// 					if(from.getType() != to.getType()){
// 						var conManager = ConnectionManager.getInstance()
// 						var id = conManager.makeID(from,to);
// 						var f  = conManager.getConnectionById(id);
// 						if(f){
// 							alert("连接已经存在，不能重复添加");
// 						}
// 						else{
// 							var end_x = evt.offsetX;
// 							var end_y = evt.offsetY;
// 							var pos = to.findSnap(evt.offsetX, evt.offsetY);
// 							if(pos){
// 								end_x = pos.x;
// 								end_y = pos.y;
// 							}
// 							connection = new Connection(that._r, start_x, start_y, end_x, end_y);
// 							connection.setEnds(from,to);	
// 							conManager.add(connection);

// 						}
// 					}
// 				}
// 				else{
// 					connection.remove();
// 				}

// 				console.log("mouse up");
// 				container.unbind("mousemove", onmousemove);
// 			}

// 			var onmousedown = function(evt){

// 				g_connect_state = CONNECT_STATE.CONNECTING;
// 				// start_x = evt.offsetX;
// 				// start_y = evt.offsetY;
// 				var pos = that.findSnap(evt.offsetX, evt.offsetY);
// 				start_x = pos.x;
// 				start_y = pos.y;
// 				connection = new Connection(that._r, start_x, start_y, start_x, start_y);

// 				//注册鼠标移动事件
// 				container.on("mousemove", onmousemove);
// 				console.log("mouse down");
// 			}

// 			switch(g_state)
// 			{
// 				case STATE.CONNECT:{
// 					if(g_connect_state!=CONNECT_STATE.CONNECTING){
// 						g_connect_state = CONNECT_STATE.READY;
// 						console.log("[input]: connect ready");

// 						//注册鼠标事件，之调用一次。
// 						container.one("mousedown", onmousedown);
// 						container.one("mouseup", onmouseup);
// 					}
// 				}
// 				break;
// 			}
// 		},
// 		function(evt){		//hover out
// 			that.hideSnap();
// 		}
// 	);
// }

// Shape.prototype.stopConnecting = function(){
// 	var that = this;
// 	this._shape.unhover(
// 		that._connection_listener.in,
// 		that._connection_listener.ou,
// 	);
// }

Shape.prototype.dblclick = function(f){
	if(this._shape){
		this._shape.dblclick(f);
	}
}

Shape.prototype.remove = function(){
	if(this._shape){
		this._shape.remove();
	}
	if(this._text){
		this._text.remove();	
	}
}
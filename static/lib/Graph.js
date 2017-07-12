var GRAPH_STATE = {
	ADDDATA : "addData",
	ADDFUNC : "addfunc",
	NONE : "none"
}

var FUNCTION_TYPE = {
	Stretch : "Stretch",
	Fusion  : "Fusion"
}

var Graph = function(container_id){

	this._container_id = container_id;
	this._width = $("#" + this._container_id).width();
	this._height = $("#" + this._container_id).height();
	this._r = Raphael(this._container_id, this._width, this._height);

	this._state = GRAPH_STATE.NONE;
	this._dragging = false;

	this._workflow = [];

	this._selected_node = null;
	this._start_node = null;
	this._end_node = null;
	this._connection = null;
	this._conn_start = {
		x : 0,
		y : 0
	};
	this._conn_end = {
		x : 0,
		y : 0
	};

	this._onmousedown = null;
	this._onmousemove = null;
	this._onmouseup   = null;

	this._nodeManager = new NodeManager();
	this._connManager = new ConnectionManager();

	// 选择的节点或者线段
	this._selected = null;

	this.initCanvasEvent();

	var that = this;
	this._onNodeSelectChanged = function(node){
		that._selected_node = node;
		
		console.log("[nde]:" + (node ? node.getID() : "nothing"));
	};
}

Graph.prototype.initCanvasEvent = function(){
	var graph = this;
	$("#" + this._container_id).dblclick(function(evt){
		var x = evt.offsetX;
		var y = evt.offsetY;
		var target = graph._r.getElementByPoint(evt.pageX,evt.pageY);
		if(target){
			var node = graph._nodeManager.getNodeById(target.id);
			if(node){
				node.onClick();
			}
		}
		else{
			//var nodeManager = NodeManager.getInstance();
			switch(g_graph.getState()){
				case GRAPH_STATE.ADDDATA:{
					var node = graph.createDatumNode(x, y);
				}
				break;
				case GRAPH_STATE.ADDFUNC:{
					if(g_func_type){
						var node = graph.createFuncNode(g_func_type, x, y);	
					}
					
				}
			}
		}
	})


	$("#" + this._container_id).click(function(evt){
		var x = evt.offsetX;
		var y = evt.offsetY;
		var target = graph._r.getElementByPoint(evt.pageX,evt.pageY);
		if(graph._selected){
			if(graph._selected instanceof Node){
				graph._selected._shape._shape.attr({"stroke-width":1});
			}else if(graph._selected instanceof Connection){
				graph._selected._arrow._line.attr({"stroke-width":2});
			}
		}
		if(target){
			var node = graph._nodeManager.getNodeById(target.id);
			if(node){
				node._shape._shape.attr({"stroke-width":3});
				graph._selected = node;
			}

			var connection = graph._connManager.getConnectionById(target.id);
			if(connection){
				connection._arrow._line.attr({"stroke-width":5});
				graph._selected = connection;
			}
		}else{
			graph._selected = null;
		}
	});
}


Graph.prototype.getState = function(){
	return this._state;
}

Graph.prototype.setState = function(state){
	this._state = state;
}

Graph.prototype.setName = function(name){
	this._name = name;
}

Graph.prototype.setDescription = function(description){
	this._descripiton = description;
}

/*
 * 序列化workflow，形成可以执行的
 */
Graph.prototype.serialize = function(){
	var tail = this.findLastFunction();
	//由最后一个FuncNode向上回溯

	this._workflow = [tail];	
	this.populateParentFunc(tail, this._workflow);
}

Graph.prototype.load = function(json){

	var model = JSON.parse(json);

	if(!model){
		return false;
	}

	this.setName(model.name);
	this.setDescription(model.description);

	var findNodeByID = function(data, funcs, id){
		var target = null;
		var count = data.length;
		for(var i=0; i<count; i++){
			var n = data[i];
			if(n.id == id){
				target = n;
				break;
			}
		}
		if(target){
			return target;
		}

		var count = funcs.length;
		for(var i=0; i<count; i++){
			var n = funcs[i];
			if(n.id == id){
				target = n;
				break;
			}
		}

		return target;
	}

	this.clear();
	var graph = this;
	var centerx = Math.round(this._width/2 + 0.5);
	var centery = Math.round(this._height/2 + 0.5); 
	model.data.forEach(function(d){
		d.node = graph.createDatumNode(50, 50, 100, 50);
		d.node.setPath(d.path);
		d.node.setID(d.id);
	});

	model.functions.forEach(function(f){
		f.node = graph.createFuncNode(f.name, 50, 50, 100, 50);
		f.node.setID(f.id);
	});

	model.connections.forEach(function(c){
		var from = findNodeByID(model.data, model.functions, c.from);
		var to   = findNodeByID(model.data, model.functions, c.to);
		if(from && to){
			graph.createEdge(from.node, to.node);
		}
	});


	// level 是横向的级别,每一个funNode都算一个级别
	// rowCount是纵向的级别
	var level = 0;
	var rowCount = 0;
	var functions = this._nodeManager.getFuncNodes();
	functions.forEach(function(f){
		var fLevel = 1;
		var inputs = f.getInputs();
		inputs.forEach(function(i){
			var inputLevel = 1;
			var from = i.getFrom();
			if(from){		
				return;
			}
			var next = f;
			while(true){
				var output = next.getOutput();
				if(output&&output.getTo()){
					inputLevel += 1;
					next = output.getTo(); 
				}else{
					break;
				}
			}
			fLevel = fLevel< inputLevel ? inputLevel : fLevel;
		});
		if(inputs.length > 1){
			rowCount += inputs.length;
		}
		level = level < fLevel ? fLevel : level;
	});

	// 一个块的大小
	var blockWidth = 150,blockHeight = 100,connWidth = 50;

	var validWidth = level * blockWidth*2 + blockWidth;
	var validHeight = rowCount * blockHeight;


	var scale = 1;
 	if(validWidth > this._width || validHeight > this._height){
 		var scaleX = this._width / validWidth;
 		var scaleY = this._height / validHeight;
 		var scale = scaleY > scaleX ? scaleX : scaleY;
 		blockWidth = blockWidth * scale;
 		blockHeight = blockHeight * scale;
 		validWidth = validWidth * scale;
 		validHeight = validHeight * scale;
 		connWidth = connWidth*scale;
 	}
	


	// 先处理尾节点
	var tail = this.findLastFunction();
	if(tail){
		var tailOffset_x = blockWidth*2* (level-1)+blockWidth + centerx - validWidth/2 - (blockWidth/scale - blockWidth)/4 + connWidth/4;
		var tailOffset_y = blockHeight*rowCount /2 -connWidth + centery - validHeight/2;
		tail.offset(tailOffset_x,tailOffset_y);
		if(scale != 1){
			tail.scale(scale,scale);
		}

		var output = tail.getOutput();
		if(output){
			output.offset(tailOffset_x + blockWidth,tailOffset_y);
			if(scale != 1){
				output.scale(scale,scale);
			}
		}
	}	

	var graph = this;
	// 调整方法节点和节点前的输入，并进行递归，直到前面没有输入
	function repositionFunNode(node,offsetX,offsetY,level){
		if(node == null || offsetX == null || offsetY == null || level == null){
			return;
		}
		var inputs = node.getInputs();
		if(inputs == null){
			return;
		}

		// 上下输入节点间的间隙
		var rowDelta = rowCount * blockHeight  / inputs.length/level;
		var first = offsetY -  rowDelta* (inputs.length-1)/2;
		offsetX -= blockWidth;
		for(var i = 0;  i < inputs.length;++i){
			var inputOffsetY = first + i*rowDelta;
			var input = inputs[i];
			input.offset(offsetX,inputOffsetY);
			if(scale != 1){
				input.scale(scale,scale);
			}

			var funFrom = input.getFrom();
			if(funFrom){
				var funOffsetX = offsetX - blockWidth;
				funFrom.offset(funOffsetX,inputOffsetY);
				if(scale != 1){
					funFrom.scale(scale,scale);
				}
				repositionFunNode(funFrom,funOffsetX,inputOffsetY,level + 1);
			}
		}
	}

	repositionFunNode(tail,tailOffset_x,tailOffset_y,1);

	return true;
}

Graph.prototype.export = function(){
	
	var tail = this.findLastFunction();
	
	var model = {
		name : this._name,
		description : this._descripiton,
		functions : [
		],
		data : [
		],
		connections:[
		]
	}

	var functions = this._nodeManager.getFuncNodes();
	functions.forEach(function(f){
		var obj = f.export();
		model.functions.push(obj);
	});

	var data = this._nodeManager.getDataNodes();
	data.forEach(function(d){
		var obj = d.export();
		model.data.push(obj);
	})

	var connections = this._connManager.getConnections();
	connections.forEach(function(c){
		var obj = c.export();
		model.connections.push(obj);
	})

	return JSON.stringify(model);
}

// Graph.prototype.export = function(){
	
// 	this.serialize();

// 	var wf = [];

// 	for(var i=this._workflow.length-1; i>=0; i--){
// 		var node = this._workflow[i];		
// 		var func = {
// 			id : node.getID(),
// 			type : node.getType(),
// 			name : node.getName(),
// 			inputs : [],
// 			output : null
// 		}
// 		var inputs = node.getInputs();
// 		inputs.forEach(function(n){
// 			var inp = {
// 				id : n.getID(),
// 				type : n.getType(),
// 				name : node.getName(),
// 			}
// 			func.inputs.push(inp);
// 		})
// 		var output = node.getOutput();
// 		if(output){
// 			var oup = {
// 				id : output.getID(),
// 				type : output.getType(),	
// 				name : node.getName(),
// 			}
// 			func.output = oup;	
// 		}
// 		wf.push(func);
// 	}

// 	return JSON.stringify(wf);
// }

Graph.prototype.populateParentFunc = function(func, stack){
	var that = this;
	var inputs = func.getInputs();
	inputs.forEach(function(datum){
		var from_func = datum.getFrom();
		if(from_func){
			stack.push(from_func);
			that.populateParentFunc(from_func, stack);
		}
	})
}

Graph.prototype.getWorkflowText = function(){
	var text = "";
	for(var i=this._workflow.length-1; i>=0; i--){
		text += this._workflow[i].getID();
		if(i>0){
			text += " --> ";
		}
	}
	return text;
}

Graph.prototype.draggable = function(){

	this._dragging = true;

	// var edges = this.getEdges();
	// edges.forEach(function(e){
	// 	e.draggable();
	// })

	var data = this.getData();
	data.forEach(function(d){
		d.draggable();
	})

	var funcs = this.getFunctions();
	funcs.forEach(function(f){
		f.draggable();
	})
}

Graph.prototype.undrag = function(){
	this._dragging = false;

	// var edges = this.getEdges();
	// edges.forEach(function(e){
	// 	e.undrag();
	// })

	var data = this.getData();
	data.forEach(function(d){
		d.undrag();
	})

	var funcs = this.getFunctions();
	funcs.forEach(function(f){
		f.undrag();
	})
}

Graph.prototype.getEdges = function(){
	//var edgeManager = ConnectionManager.getInstance();
	//return edgeManager.getConnections();
	return this._connManager.getConnections();
}

Graph.prototype.createDatumNode = function(centerx, centery, width, height){

	var w = width  ?  width : 100;
	var h = height ? height :  50;
	var xmin = centerx - w / 2;
	var ymin = centery - h / 2;

	//var nodeManager = NodeManager.getInstance();
	//var datum = nodeManager.createDataNode(this._r, xmin, ymin, w, h);
	var datum = this._nodeManager.createDataNode(this._r, xmin, ymin, w, h);

	if(this._dragging){
		datum.draggable();
	}

	return datum;
}

Graph.prototype.getData = function(){
	// var datumManager = NodeManager.getInstance();
	// return datumManager.getNodes();
	//var nodeManager = NodeManager.getInstance();
	return this._nodeManager.getDataNodes();
}

Graph.prototype.createFuncNode = function(type, centerx, centery, width, height){

	var w = width  ?  width : 100;
	var h = height ? height :  50;
	var xmin = centerx - w / 2;
	var ymin = centery - h / 2;

	//var nodeManager = NodeManager.getInstance();
	//var func = nodeManager.createFuncNode(type, this._r, xmin, ymin, w, h);
	var func = this._nodeManager.createFuncNode(type, this._r, xmin, ymin, w, h);

	if(this._dragging){
		func.draggable();
	}
	return func;
}

// Graph.prototype.createFuncNode = function(type, centerx, centery, width, height){

// 	var w = width  ?  width : 100;
// 	var h = height ? height :  50;
// 	var xmin = centerx - w / 2;
// 	var ymin = centery - h / 2;

// 	var nodeManager = NodeManager.getInstance();
// 	var func = nodeManager.createFuncNode(type, this._r, xmin, ymin, w, h);
// 	return func;
// }

// Graph.prototype.createStretchNode = function(centerx, centery, width, height){

// 	var w = width  ?  width : 100;
// 	var h = height ? height :  50;
// 	var xmin = centerx - w / 2;
// 	var ymin = centery - h / 2;

// 	var nodeManager = NodeManager.getInstance();
// 	var func = nodeManager.createStretchNode(this._r, xmin, ymin, w, h);
// 	return func;
// }

Graph.prototype.getFunctions = function(){
	// var funcManager = FuncManager.getInstance();
	// return funcManager.getNodes();
	//var nodeManager = NodeManager.getInstance();
	//return nodeManager.getFuncNodes();
	return this._nodeManager.getFuncNodes();
}

Graph.prototype.createEdge = function(from, to){
	//var edgeManager = ConnectionManager.getInstance();
	//var edge = edgeManager.createConnection(this._r, from, to);
	var edge = this._connManager.createConnection(this._r, from, to);

	switch(from.getType()){
		case NODE_TYPE.DATA:{
			from.setToEdge(edge);
		}
		break;
		case NODE_TYPE.FUNC:{
			from.setOutputEdge(edge);
		}
		break;
	}

	switch(to.getType()){
		case NODE_TYPE.DATA:{
			to.setFromEdge(edge);
		}
		break;
		case NODE_TYPE.FUNC:{
			to.addInputEdge(edge);
		}
		break;	
	}
	return edge;
}

Graph.prototype.clear = function(){	
	this._connManager.clear();
	this._nodeManager.clear();
}

Graph.prototype.startSnapping = function(){
	//var nodeManger = NodeManager.getInstance();
	//var nodes = nodeManger.getNodes();
	var nodes = this._nodeManager.getNodes();
	nodes.forEach(function(n){
		n.startSnapping();
		//n.startConnecting();
	})
}

Graph.prototype.stopSnapping = function(){
	//var nodeManger = NodeManager.getInstance();
	//var nodes = nodeManger.getNodes();
	var nodes = this._nodeManager.getNodes();
	nodes.forEach(function(n){
		n.stopSnapping();
		//n.stopConnecting();
	})	
}

// Graph.prototype.startConnecting = function(){

// 	var that = this;
// 	var nodeManger = NodeManager.getInstance();
// 	var nodes = nodeManger.getNodes();
// 	nodes.forEach(function(n){
// 		n.startSnapping();
// 		n.startConnecting(that._onNodeSelectChanged);
// 	})
// }

// Graph.prototype.stopConnecting = function(){
// 	var nodeManger = NodeManager.getInstance();
// 	var nodes = nodeManger.getNodes();
// 	nodes.forEach(function(n){
// 		n.stopConnecting();
// 		n.stopSnapping();
// 	})	
// }

Graph.prototype.startConnecting = function(){
	// this.startSnapping();
	// start node connecting
	var that = this;
	//var nodeManger = NodeManager.getInstance();
	//var nodes = nodeManger.getNodes();
	var nodes = this._nodeManager.getNodes();
	nodes.forEach(function(n){
		n.startSnapping();
		n.startConnecting(that._onNodeSelectChanged);
	})

	this._onmousedown = function(evt){
		console.log("[graph]:down");
		if(!that._start_node){
			var node = that.getSelectedNode();
			if(node){
				that._start_node = node;			
				that._conn_start = node.findSnap(evt.offsetX, evt.offsetY);
				that._conn_end   = that._conn_start;
				that._connection = new Connection(that._r, that._conn_start.x, that._conn_start.y
														 , that._conn_end.x,   that._conn_end.y);
			}
		}
			
	};

	this._onmousemove = function(evt){
		console.log("[graph]:move");

		if(that._start_node){
			var node = that.getSelectedNode();
			if(node){
				//捕捉到终点
				if(node.getID() == that._start_node.getID()){
					that._connection.update(that._conn_start.x, that._conn_start.y, 
											evt.offsetX, 		evt.offsetY);
				}
				else{
					that._conn_end = node.findSnap(evt.offsetX, evt.offsetY);
					that._end_node = node;
					that._connection.update(that._conn_start.x, that._conn_start.y,
										    that._conn_end.x,   that._conn_end.y);
				}
			}
			else{
				//未捕捉到终点
				if(that._connection){
					that._connection.update(that._conn_start.x, that._conn_start.y, 
											evt.offsetX, 		evt.offsetY);	
				}
			}
		}
	};

	this._onmouseup = function(evt){
		if(that._start_node){
			var node = that.getSelectedNode();
			if(node){
				if(node.getID() == that._start_node.getID()){
					that._connection.remove();
					that._connection = null;
				}
				else if(node.getType() == that._start_node.getType()){
					// 同一类型的连接没有意义
					that._connection.remove();
					that._connection = null;

				}
				else{
					that._connection.remove();
					that._end_node = node;				
					
					//var conManager = ConnectionManager.getInstance();
					//var id = conManager.makeID(that._start_node, that._end_node);
					//var c = conManager.getConnectionById(id);
					//
					var id = that._connManager.makeID(that._start_node, that._end_node);
					var c = that._connManager.getConnectionById(id);
					if(c){
						alert("连接已经存在，不能重复添加");
					}
					else{
						that._conn_end = node.findSnap(evt.offsetX, evt.offsetY);
						that._connection = new Connection(that._r, that._conn_start.x, that._conn_start.y
														 	 	 , that._conn_end.x,   that._conn_end.y);
						that._connection.setEnds(that._start_node, that._end_node);
						that._connManager.add(that._connection);
						switch(that._start_node.getType()){
							case NODE_TYPE.DATA:{
								that._start_node.setToEdge(that._connection);
							}
							break;
							case NODE_TYPE.FUNC:{
								that._start_node.setOutputEdge(that._connection);
							}
							break;
						}
						switch(that._end_node.getType()){
							case NODE_TYPE.DATA:{
								that._end_node.setFromEdge(that._connection);
							}
							break;
							case NODE_TYPE.FUNC:{
								that._end_node.addInputEdge(that._connection);
							}
							break;	
						}
						that._start_node.hideSnap();
						that._end_node.hideSnap();
					}
				}
			}else{
				that._connection.remove();
				that._connection = null;
			}
		}
		that._connection = null;
		that._start_node = null;
		that._end_node   = null;
	};

	// add event listener
	$("#"+this._container_id).on("mousedown", this._onmousedown);
	$("#"+this._container_id).on("mousemove", this._onmousemove);
	$("#"+this._container_id).on("mouseup",   this._onmouseup);
}

Graph.prototype.stopConnecting = function(){
	// this.stopSnapping();
	// stop node connecting
	//var nodeManger = NodeManager.getInstance();
	//var nodes = nodeManger.getNodes();
	var nodes = this._nodeManager.getNodes();
	nodes.forEach(function(n){
		n.stopConnecting();
		n.stopSnapping();
	})

	//unbind listener
	$("#"+this._container_id).unbind("mousedown", this._onmousedown);
	$("#"+this._container_id).unbind("mousemove", this._onmousemove);
	$("#"+this._container_id).unbind("mouseup",   this._onmouseup);	
}

Graph.prototype.onMouseDown = function(evt){
	console.log("[graph]:down");

	var node = this.getSelectedNode();
	if(node){
		this._start_node = node;
		this._conn_start = node.findSnap(evt.offsetX, evt.offsetY);
		this._connection = new Connection(this._r, this._conn_start.x, this._conn_start.y
												 , this._conn_end.x,   this._conn_end.y);
	}
}

Graph.prototype.onMouseMove = function(evt){
	console.log("[graph]:move");

	var node = this.getSelectedNode();
	if(node){
		//捕捉到终点
	}
	else{
		//未捕捉到终点
		if(this._connection){
			this._connection.update(this._conn_start.x, this._conn_start.y, 
									evt.offsetX, evt.offsetY);	
		}
	}
}

Graph.prototype.onMouseUp = function(evt){
	console.log("[graph]:up");
}

// Graph.prototype.onNodeSelectChanged = function(node){
// 	this._selected_node = node;
	
// 	console.log("[nde]:" + (node ? node.getID() : "nothing"));
// }

Graph.prototype.getSelectedNode = function(){
	return this._selected_node;
}

Graph.prototype.findLastFunction = function(){
	var last = null;
	var funcs = this.getFunctions();

	if(funcs.length==0){
		// Graph上没有function节点
		return null;
	}

	var last = funcs[0];
	while(true){
		var output = last.getOutput();
		console.log(last.getID());
		if(!output){
			break;
		}
		else{
			var to = output.getTo();	// get to node
			if(!to){				
				break;
			}
			else{
				last = to;
			}
		}
	}

	return last;
}

// 是否可以编辑
Graph.prototype.setEditable = function(isEditable){
	var backdrop = "backdrop";
	$("#" + backdrop).remove();
	if(!isEditable){
		$("#" + backdrop).remove();
		var backdropHtml = "<div id='" + backdrop + "' style='position: absolute;top: 0px;"
		+	"bottom: 0px;right: 0px;left: 0px;z-index: 1000;'></div>";
		$("#" + this._container_id).after(backdropHtml);
		g_graph.undrag();
		g_graph.stopConnecting();
	}
}

// 设置大小
Graph.prototype.setSize = function(width,height){
	if(width == null || height == null){
		return;
	}

	this._width = width;
	this._height = height;

	this._r.setSize(width,height);

	this.load(this.export());
}

Graph.prototype.getWidth = function(){
	return this._width;
}

Graph.prototype.getHeight = function(){
	return this._height;
}

/**
 * 删除节点或者连接线
 */
Graph.prototype.remove = function(){
	if(!this._selected){
		alert("请选择一个节点或者连接线");
		return;
	}

	var that = this;
	if(this._selected instanceof Node){
		var id = this._selected.getID();
		this._nodeManager.removeNodeByID(id);
		if(this._selected instanceof FuncNode){
			var inputsConn = this._selected.getInputsEdge();
			inputsConn.forEach(function(c){
				var id = c.getID();
				that._connManager.removeConnectionByID(id);
			});

			var outputConn = this._selected.getOutputEdge();
			if(outputConn){
				that._connManager.removeConnectionByID(outputConn.getID());
			}
		}else if(this._selected instanceof DataNode){
			var fromConn = this._selected.getFromEdge();
			if(fromConn){
				this._connManager.removeConnectionByID(fromConn.getID());
			}
			var toConn = this._selected.getToEdge();
			if(toConn){
				this._connManager.removeConnectionByID(toConn.getID());
			}
		}
	}

	if(this._selected instanceof Connection){
		var id = this._selected.getID();
		this._connManager.removeConnectionByID(id);
	}
}

/**
 * 校验
 */
Graph.prototype.verify = function(){
	// 校验节点
	var data = this.getData();
	for(var i = 0; i < data.length;++i){
		var d = data[i];
		if(!d.getPath() || d.getName() == "data"){
			d.blink();
			setTimeout(function(){
				d.stopBlink();
			},2000);
			return "请设置节点的路径和名称";
		}
	}

	return "success";
}

Graph.prototype.getNodeById = function(id){
	return this._nodeManager.getNodeById(id);
}
var DataNode = function(r, xmin, ymin, width, height){

	Node.apply(this, arguments);

	this._r = r;
	this._type = "data";
	this._name = "data";
	this._path = "/";

	this._shape = new Ellipse(r, xmin, ymin, width, height);
	this._id = this._shape.getID();

	this._from = null;
	this._to   = null;
}

extend(DataNode, Node);

DataNode.prototype.setPath = function(path){

	this._path = path;
	var text = "";
	var sep = path.lastIndexOf("/");
	if(sep>=0){
		text = path.substring(sep+1);
	}
	if(text == ""){
		text = "data";
	}
	this.setName(text);
	if(this._path == "/"){
		this.setShapeAttr("fill","#eef7ff");
	}else{
		this.setShapeAttr("fill","#95d5ee");
	}
}

DataNode.prototype.getPath = function(){
	return this._path;
}

DataNode.prototype.setFromEdge = function(from){
	this._from = from;
}

DataNode.prototype.getFromEdge = function(){
	return this._from;
}

DataNode.prototype.getFrom = function(){
	if(this._from){
		return this._from.getFrom();
	}
	return null;
}

DataNode.prototype.setToEdge = function(to){
	this._to = to;
}

DataNode.prototype.getToEdge = function(){
	return this._to;
}

DataNode.prototype.getTo = function(){
	if(this._to){
		return this._to.getTo();
	}
	return null;
}

DataNode.prototype.offset = function(dx, dy){
	if(this._shape){
		this._shape.offset(dx, dy);
	}
	var connManager = new ConnectionManager();
	if(this._from){
		var points = connManager.getClosePoints(this._from.getFrom(),this);
		this._from.update(points[0].x,points[0].y,points[1].x,points[1].y);
	}
	if(this._to){
		var points = connManager.getClosePoints(this,this._to.getTo());
		this._to.update(points[0].x,points[0].y,points[1].x,points[1].y);
	}
}

DataNode.prototype.scale = function(sx,sy){
	if(this._shape){
		this._shape.scale(sx,sy);
	}
}

DataNode.prototype.export = function(){
	return {
		id : this._id,
		path : this._path
	};
}


DataNode.prototype.onClick = function(){
	var that = this;
	if(this._from){
		this._createInput();
	}else if(this._to){
		var dlg = new FileDialog(this.getPath(),"choose", function(){
			that.setPath(this.getFilePath());
		});
		dlg.show();
	}else{
		var tootip = new Tooltip({
			target : "svg ellipse[id='" + this.getID() + "']",
			text: "请连接该节点"
		});
	}
}


// 创建输入框
DataNode.prototype._createInput = function(){
	if(this._input){
		return;
	}
	var container = this._r.canvas.parentNode;
	var text = this._shape.getText();
	var bbox = text.getBBox();
	var width = bbox.width;
	var height = bbox.height;
	width = Math.ceil(width)+6;


	var x = container.offsetLeft + text.attrs.x - width/2;
	var y = container.offsetTop + text.attrs.y - height/2;

	x  = Math.ceil(x);

	var styles = {
		"position" : "absolute",
		"background" : "none",
		"width" : width + "px",
		"height" : height+ "px" ,
		"left" : x + "px",
		"top" : y + "px"
	};


	var aFontAttributes = ['font', 'font-family', 'font-size', 'font-style', 'font-weight', 'font-variant'/*, 'line-height'*/];
	for(var i = 0, length = aFontAttributes.length; i < length; i++){
		var attribute = aFontAttributes[i];

		if(text.attrs[attribute] != undefined){
			styles[attribute] = text.attrs[attribute];
		}

		if(text.node.style[attribute] != undefined){
			styles[attribute] = text.node.style[attribute];
		}
	}

	var sStyles = '';
	for(var z in styles){
		sStyles += z + ':' + styles[z] + ';';
	}

	var input = document.createElement("input");
	input.value = text.attrs.text;
	input.setAttribute("style", sStyles);
	input.setAttribute("rows","1");
	input.className = "svg-input";

	var that = this;
	var onKeyDown = function(event){

		var tmp               = document.createElement("span");
		var text              = that._input.value;
		tmp.setAttribute('style', that._input.style.cssText);
		tmp.style.height      = null;
		tmp.style.width       = null;
		tmp.style.visibility  = 'hidden';
		tmp.innerHTML         = text.split('\n').join('<br />');

		that._input.parentNode.appendChild(tmp);

		var left = that._input.style.left;
		left = parseFloat(left.slice(0,left.lastIndexOf("px")));
		var width = that._input.style.width;
		width = parseFloat(width.slice(0,width.lastIndexOf("px")));

		that._input.style.width = (tmp.offsetWidth+6) + "px";
		that._input.style.height = tmp.offsetHeight + "px";
		that._input.style.left = (left + (width - tmp.offsetWidth-6)/2) + "px";

		tmp.parentNode.removeChild(tmp);
		var keyCode = event.keyCode;
		if(keyCode  == 13){
			that._removeInput();
		}

	}
	input.addEventListener('keyup', onKeyDown);
	this._inputOnKeyDown = onKeyDown;

	text.hide();
	container.appendChild(input);
	

	input.setSelectionRange(0,input.value.length);
	input.focus();

	var onBlur = function(event){
		that._removeInput();
	}
	input.addEventListener('blur', onBlur);
	this._inputOnBlur = onBlur;

	this._input = input;
};


// 删除输入框，保存输入值
DataNode.prototype._removeInput = function(){

	if(!this._input){
		return;
	}
	var value = this._input.value;
	if(value == ""){
		var tootip = new Tooltip({
			target : ".svg-input",
			text: "请输入有效的输出文件"
		});
		this._input.focus();
		return;
	}
	var nameReg =  /^.+\.(?:jpg|jpeg|png|tif|tiff)$/;
	if(!nameReg.test(value)){
		var tootip = new Tooltip({
			target : ".svg-input",
			text: "请输入有效的后缀名"
		});
		this._input.focus();
		return;
	}


	this._shape.showText(this._input.value);
	this.setPath("/" + this._input.value);
	this._input.removeEventListener('keyup',this._inputOnKeyDown,false);
	this._input.removeEventListener('blur',this._inputOnBlur,false);
	this._input.parentNode.removeChild(this._input);
	this._input = null;
};

// 清空
DataNode.prototype.remove = function(){
	Node.prototype.remove.apply(this, arguments);
	if(this._input){
		
		this._input.removeEventListener('keyup',this._inputOnKeyDown,false);
		this._input.removeEventListener('blur',this._inputOnBlur,false);
		this._input.parentNode.removeChild(this._input);
		this._input = null;
		$(".tooltip").remove();
	}
};
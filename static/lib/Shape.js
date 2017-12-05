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
	this._text_out = null;

	var that = this;
	var connection = null;
}

// Shape.prototype.hover_in = function(){
// 	this.showSnap();
// }
//
// Shape.prototype.hover_out = function(){
// 	this.hideSnap();
// }


Shape.prototype.getID = function(){
	if(this._shape){
		if(this._shape.node){
			this._shape.node.setAttribute("id",this._shape.id);
		}
		return this._shape.id;
	}else{
		return "";
	}
}

Shape.prototype.setID = function(id){
	if(this._shape){
		this._shape.id = id;
		if(this._shape.node){
			this._shape.node.raphaelid = id;
			this._shape.node.setAttribute("id",id);
		}
	}

	if(this._text){
		this._text.data("nodeid",id);
	}
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
	if(this._snaps.length != 0){
		this.hideSnap();
	}
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
	this._text.attr({ "font-size": 12, "font-family": "Microsoft YaHei"});
	this._text.node.style.cursor = "default"
	return this._text;
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

	if(this._snap_highlight){
		// this._snap_highlight.remove();
		this._snap_highlight.attr({
				"fill" : "#FFF",
				"stroke" : "#0F0"
			});
	}

	var s = this._snapxy[index];

	this._snap_highlight = this._snaps[index].attr({
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

	this._snap_hover_in = function(evt){		//hover in

		if(that._onSelectedChanged){
			that._onSelectedChanged(that);
		}
		that.showSnap();

		// 判断周边的snap离开的状态
		that._snaps.forEach(function(s){
			var mouseout = function(e){
				if(!that._shape.isPointInside(e.layerX,e.layerY)){
					that.hideSnap();
					if(that._onSelectedChanged){
						that._onSelectedChanged(null);
					}
				}
			};
			s.hover(null,mouseout);
		});
	};

	this._snap_hover_out = function(evt){		//hover out
		// 判断是不是被其它上层的元素遮盖
		var bbox = that._shape.getBBox();
		var xmin = bbox.x,
			ymin = bbox.y,
			xmax = bbox.x2,
			ymax = bbox.y2;
		var x = evt.layerX, y = evt.layerY;
		var inShape = false;
		if(x < xmax && x > xmin && y < ymax && y > ymin){
			var elements = that._shape.paper.getElementsByPoint(x,y);
			elements.forEach(function(e){
				if(e.id == that.getID()){
					// 证明鼠标还在该图形上，但是被其它的元素遮挡了
					inShape = true;
					return;
				}
			});
		}

		// 无遮挡，则删除snap
		if(!inShape){
			that.hideSnap();
			if(that._onSelectedChanged){
				that._onSelectedChanged(null);
			}
		}
	}

	this._shape.hover(
		this._snap_hover_in,
		this._snap_hover_out
	);

	this._text_out = function(evt){
		if(!that._shape.isPointInside(evt.layerX,evt.layerY)){
			that.hideSnap();
			if(that._onSelectedChanged){
				that._onSelectedChanged(null);
			}
		}
	};

	this._text.hover(null,this._text_out);
}

Shape.prototype.stopSnapping = function(){
	this._shape.unhover(
		this._snap_hover_in,
		this._snap_hover_out
	);

	this._text.unhover(null,this._text_out);
}

Shape.prototype.startConnecting = function(onSelectChanged){
	this._onSelectedChanged = onSelectChanged;
}

Shape.prototype.stopConnecting = function(){
	this._onSelectedChanged = null;
}

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


Shape.prototype.getFillColor = function(){
	if(this._shape){
		return this._shape.attrs.fill;
	}
	return null;
}

Shape.prototype.animate = function(obj,time){
	if(this._shape){
		this._shape.animate(obj,time);
	}
}

Shape.prototype.stop = function(){
	if(this._shape){
		this._shape.stop();
	}
}


Shape.prototype.setAttr = function(key,value){
	if(this._shape){
		this._shape.attr(key,value);
	}
}


Shape.prototype.toFront = function () {
	if(this._shape){
		this._shape.toFront();
	}
	if(this._text){
		this._text.toFront();
	}
}



Shape.prototype.getText = function(){
	return this._text;
};
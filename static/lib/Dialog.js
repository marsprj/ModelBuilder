var Dialog = function(){

	this._ok = false;
	this._win = this.create();

	this.initDialogEvents();
}

Dialog.prototype.show = function(){
	$(this._win).css("display", "block");
}

Dialog.prototype.close = function(){
	$(this._win).css("display", "none");
}

Dialog.prototype.destory = function(){
	$(this._win).remove();
}

Dialog.prototype.initDialogEvents = function(){
	this.initCloseEvent();
	this.initOkEvent();
	this.initDragEvent();
}

Dialog.prototype.isOK = function(){
	return this._ok;
}

Dialog.prototype.initDragEvent = function () {
	var titleBar = this._win.find(".titlebar")[0];
	var dlg = this;
	var onMouseDown = function (e) {
		var o_x = e.layerX;
		var o_y = e.layerY;
		var onMouseMove = function (e) {
			var s_x = e.layerX - o_x;
			var s_y = e.layerY - o_y;

			var top = dlg._win.offset().top;
			var left = dlg._win.offset().left;

			left += s_x;
			top += s_y;
			dlg._win.css("left",left + "px").css("top",top + "px");

        }
        var onMouseUp = function (e) {
			titleBar.removeEventListener("mousemove",onMouseMove);
			titleBar.removeEventListener("mouseup",onMouseUp);
        }

		titleBar.addEventListener("mousemove",onMouseMove);
		titleBar.addEventListener("mouseup",onMouseUp);
		dlg._onmousemove = onMouseMove;
		dlg._onmouseup = onMouseUp;

    }

    titleBar.addEventListener("mousedown",onMouseDown);

	titleBar.addEventListener("mouseout",function() {
		titleBar.removeEventListener("mousemove",dlg._onmousemove);
		titleBar.removeEventListener("mouseup",dlg._onmouseup);
    })
}

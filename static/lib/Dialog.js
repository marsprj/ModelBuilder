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
	$("body")[0].removeEventListener("mousedown",this._onmousedown);
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
	var body = $("body")[0];
	var dlg = this;
	var onMouseDown = function (e) {
		var o_x = e.clientX;
		var o_y = e.clientY;
		var onMouseMove = function (e) {
			var s_x = e.clientX - o_x;
			var s_y = e.clientY - o_y;

			var top = dlg._win.offset().top;
			var left = dlg._win.offset().left;

			left += s_x;
			top += s_y;
			o_x = e.clientX;
			o_y = e.clientY;
			dlg._win.css("left",left + "px").css("top",top + "px");

        }
        var onMouseUp = function (e) {
			body.removeEventListener("mousemove",onMouseMove);
			body.removeEventListener("mouseup",onMouseUp);
        }

		body.addEventListener("mousemove",onMouseMove);
		body.addEventListener("mouseup",onMouseUp);
		dlg._onmousemove = onMouseMove;
		dlg._onmouseup = onMouseUp;

    }

    body.addEventListener("mousedown",onMouseDown);
    dlg._onmousedown = onMouseDown;

}
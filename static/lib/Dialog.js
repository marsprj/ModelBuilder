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
	//this.initFolderEvent();
	this.initCloseEvent();
	this.initOkEvent();
}

Dialog.prototype.isOK = function(){
	return this._ok;
}
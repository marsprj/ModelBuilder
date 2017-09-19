var FunDialog = function(inputs,output,parms,onOK){
	Dialog.apply(this, arguments);

	this.setInputs(inputs);

	this.setOutput(output);

	this.setParms(parms);

	this.initFolderEvent();

	this._onOK = onOK;
}


extend(FunDialog, Dialog);

FunDialog.prototype.setParms = function(parms){
};

/**
 * 关闭事件
 */
FunDialog.prototype.initCloseEvent = function(){
	var dlg = this;
	this._win.find(".dialog_exit:first").click(function(){
		dlg.destory();
	});

	this._win.find("#dlg_btn_exit:first").click(function(){
		dlg.destory();
	});
}

/**
 * 确定修改节点值
 */
FunDialog.prototype.initOkEvent = function(){
	var dlg = this;

	this._win.find("#dlg_btn_ok:first").click(function(){

		dlg._win.find(".dialog-input").each(function(index, el) {
			dlg._inputs[index] = $(this).val();			
		});

		dlg._output = dlg._win.find(".dialog-output").val();
		dlg.destory();

		if(dlg._onOK){
			dlg._onOK();
		}
	});
}

/**
 * 文件对话框设置文件
 */
FunDialog.prototype.initFolderEvent = function(){
	var dlg = this;

	this._win.find(".dialog_folder,.open-file").click(function(){
		var prev = $(this).prev();
		var inputEle = prev.children();
		if(inputEle.hasClass('dialog-input')){
			var inputs = dlg._win.find(".dialog-input");
			var index = inputEle.index(inputs);			

			var file_dlg = new FileDialog(dlg._inputs[index],"choose", function(){
				var file_path = this.getFilePath();
				inputEle.attr("value", file_path);
				dlg._inputs[index] = file_path;
			});
			file_dlg.show();
		}else if(inputEle.hasClass('dialog-output')){
			var file_dlg = new FileDialog(dlg._output,"new", function(){
				var file_path = this.getFilePath();
				inputEle.attr("value", file_path);
				dlg._output = file_path;
			});
			file_dlg.show();
		}
	});

};

/**
 * 从节点设置输入
 */
FunDialog.prototype.setInputs = function(inputs){
	if(!inputs || !$.isArray(inputs)){
		this._inputs = [];
		return;
	}

	this._inputs = inputs;

	var dlg = this;
	this._win.find(".dialog-input").each(function(index, el) {
		var input = dlg._inputs[index]; 
		$(this).attr("value",input);
	});
};

/**
 * 从节点设置输出
 */
FunDialog.prototype.setOutput = function(output){
	if(!output){
		this._output = null;
	}

	this._output = output;

	var dlg = this;
	this._win.find(".dialog-output").each(function(index, el) {
		var output = dlg._output;
		$(this).attr("value",output);
	});
};

FunDialog.prototype.getInput = function(index){
	return this._inputs[index];
};

FunDialog.prototype.getOutput = function(){
	return this._output
};
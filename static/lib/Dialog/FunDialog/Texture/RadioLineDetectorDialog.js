var RadioLineDetectorDialog = function(){
	this._funName = "LocalHoughExtrator";
	FunDialog.apply(this, arguments);
}

extend(RadioLineDetectorDialog, FunDialog);

RadioLineDetectorDialog.prototype.create = function(){
	var html =   '<div class="func_dialog dialog">'
			+'<div class="titlebar">'
			+'	<div class="dialog_title">Radio线提取</div>'
			+'	<div class="dialog_exit"></div>'
			+'</div>'
			+'<div class="dialog_main">'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">输入影像:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left item-input">'
			+'				<input type="text" class="dialog-input">'
			+'			</div>'
			+'			<div class="f-left open-file" title="选择文件">'
			+'				……'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">线图像:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left item-input">'
			+'				<input type="text" class="dialog-output f-left">'
			+'			</div>'
			+'			<div class="f-left open-file">'
			+'				……'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">线方向图像:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left item-input">'
			+'				<input type="text" class="dialog-output f-left">'
			+'			</div>'
			+'			<div class="f-left open-file">'
			+'				……'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">长度:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left length-div">'
			+'				<input type="text" class="f-left parms input-60" parm="length">'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">宽度:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left width-div">'
			+'				<input type="text" class="f-left parms input-60" parm="width">'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'</div>'
			+'<div class="dialog_bottom">'
			+'	<ul>'
			+'		<li>'
			+'			<a href="javascript:void(0)" id="dlg_btn_ok">确定</a>'
			+'		</li>'
			+'		<li>'
			+'			<a href="javascript:void(0)" id="dlg_btn_exit">取消</a>'
			+'		</li>'
			+'	</ul>'
			+'</div>';
	$(".func_dialog").remove();
	var dlg = $(html);
	$('body').append(dlg);

	return dlg;
}

RadioLineDetectorDialog.prototype.verify = function(){

	this._win.find("input").removeClass("error");
	var floatReg =  /^[0-9.]*$/;
	var value = this._win.find(".length-div input");
	if(!floatReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .length-div input",
			text : "请输入有效的长度值"
		});
		value.addClass('error');
		return false;
	}

	var value = this._win.find(".width-div input");
	if(!floatReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .width-div input",
			text : "请输入有效的宽度值"
		});
		value.addClass('error');
		return false;
	}

	return true;
};


/**
 * 从节点设置输出
 */
RadioLineDetectorDialog.prototype.setOutput = function(outputs){
	if(!outputs){
		this._outputs = null;
	}

	this._outputs = outputs;

	var dlg = this;
	this._win.find(".dialog-output").each(function(index, el) {
		var output = dlg._outputs[index];
		$(this).attr("value",output);
	});

};

/**
 * 文件对话框设置文件
 */
RadioLineDetectorDialog.prototype.initFolderEvent = function(){
	var dlg = this;

	if(this._isPathEdit){
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
				var outputs = dlg._win.find(".dialog-output");
				var index = inputEle.index(outputs);
				var index = outputs.index(inputEle);			
				var file_dlg = new FileDialog(dlg._outputs[index],"new", function(){
					var file_path = this.getFilePath();
					inputEle.attr("value", file_path);
					dlg._outputs[index] = file_path;
				});
				file_dlg.show();
			}
		});
		this._win.find(".dialog-input,.dialog-output").removeAttr("disabled");
	}else{
		this._win.find(".dialog-input,.dialog-output").attr("disabled","disabled");
	}
};

RadioLineDetectorDialog.prototype.getOutputs = function(){
	return this._outputs;
};



/**
 * 确定修改节点值
 */
RadioLineDetectorDialog.prototype.initOkEvent = function(){
	var dlg = this;

	this._win.find("#dlg_btn_ok:first").click(function(){

		var result = dlg.verify();
		if(!result){
			return;
		}
		dlg._win.find(".dialog-input").each(function(index, el) {
			dlg._inputs[index] = $(this).val();			
		});

		dlg._win.find(".dialog-output").each(function(index, el) {
			dlg._outputs[index] = $(this).val();			
		});

		dlg.destory();

		if(dlg._onOK){
			dlg._onOK();
		}
	});
}
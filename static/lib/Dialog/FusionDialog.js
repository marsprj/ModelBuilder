var FusionDialog = function(inputs, outout, onOK){

	Dialog.apply(this, arguments);

	this.setInputs(inputs);
	this.setOutput(output);
	this.setOutput(output);

	this.initFolderEvent();

	this._onOK = onOK;
}

extend(FusionDialog, Dialog)

// FusionDialog.prototype.initEvents = function(){
	
// 	//打开文件的点击事件
// 	this.initFolderEvent();
// 	this.initCloseEvent();
// 	this.initOkEvent();
// }


FusionDialog.prototype.setInputs = function(inputs){
	if(!inputs){
		return;
	}

	switch(inputs.length){
		case 0:{
			this.setInput1(null);
			this.setInput2(null);

		}
		case 1:{
			this.setInput1(inputs[0]);
			this.setInput2(null);
		}
		default:{
			this.setInput1(inputs[0]);
			this.setInput2(inputs[1]);
		}
	}
}

FusionDialog.prototype.setInput1 = function(input){
	this._input1 = input ? input : "/";
	this._win.find('#fusion_input_1').attr("value", input);
}

FusionDialog.prototype.setInput2 = function(input){
	this._input2 = input ? input : "/";
	this._win.find('#fusion_input_2').attr("value", input);
}

FusionDialog.prototype.setOutput = function(output){
	this._output = output;
	this._win.find('#fusion_output').attr("value", output);
}

FusionDialog.prototype.initFolderEvent = function(){

	var dlg = this;
	this._win.find(".dialog_folder").each(function(){
		$(this).click(function(){
			$(this).prev().find('.dialog_input').each(function(){
				//设置输入影像数据路径的值
				//$(this).attr("value", "/raster/001.tif");
				var input_box = this;
				var file_dlg = new FileDialog();
				file_dlg.onOK(function(){
					var file_path = file_dlg.getFilePath();
					$(input_box).attr("value", file_path);
				});
				file_dlg.show();
			})

			$(this).prev().find('.dialog_output').each(function(){
				//设置输入影像数据路径的值
				var input_box = this;
				var file_dlg = new FileDialog();
				file_dlg.onOK(function(){
					var file_path = file_dlg.getFilePath();
					$(input_box).attr("value", file_path);
				});
				file_dlg.show();
			})
		});
	})	
}

FusionDialog.prototype.initCloseEvent = function(){
	var dlg = this;
	this._win.find(".dialog_exit:first").click(function(){
		dlg.destory();
	});

	this._win.find("#dlg_btn_exit:first").click(function(){
		dlg.destory();
	});
}

FusionDialog.prototype.initOkEvent = function(){
	var dlg = this;
	
	this._win.find("#dlg_btn_ok:first").click(function(){
		dlg._input  = dlg._win.find(".dialog_input:first").attr("value");
		dlg._output = dlg._win.find(".dialog_output:first").attr("value");
		dlg.destory();

		if(dlg._onOK){
			dlg._onOK();
		}
	});
}


FusionDialog.prototype.getInput = function(){
	return this._input;
}

FusionDialog.prototype.getOutput = function(){
	return this._output;
}

FusionDialog.prototype.create = function(){
	var html =   "<div class='func_dialog'>"
			+"<div class='titlebar'>"
			+"	<div class='dialog_title'>融合</div>"
			+"	<div class='dialog_exit'></div>"
			+"</div>"
			+"<div class='dialog_main'>"
			+"	<div class='dialog_item'>"
			+"		<div>"
			+"			<div class='dialog_item_icon'></div>"
			+"			<div class='dialog_item_title'>输入影像:</div>"
			+"		</div>"
			+"		<div>"
			+"			<div style='float:left;'><input type='text' id='fusion_input_1' class='dialog_input'></div>"
			+"			<div class='dialog_folder'></div>"
			+"		</div>"
			+"	</div>"
			+"	<div class='dialog_item'>"
			+"		<div>"
			+"			<div class='dialog_item_icon'></div>"
			+"			<div class='dialog_item_title'>输入影像:</div>"
			+"		</div>"
			+"		<div>"
			+"			<div style='float:left;'><input type='text' id='fusion_input_2' class='dialog_input'></div>"
			+"			<div class='dialog_folder'></div>"
			+"		</div>"
			+"	</div>"
			+"	<div class='dialog_item'>"
			+"		<div>"
			+"			<div class='dialog_item_icon'></div>"
			+"			<div class='dialog_item_title'>输出影像:</div>"
			+"		</div>"
			+"		<div>"
			+"			<div style='float:left;'><input type='text' id='fusion_output' class='dialog_output'></div>"
			+"			<div class='dialog_folder'></div>"
			+"		</div>"
			+"	</div>"
			+"</div>"
			+"<div class='dialog_bottom'>"
			+"	<ul>"
			+"		<li>"
			+"			<a href='javascript:void(0)' id='dlg_btn_ok'>确定</a>"
			+"		</li>"
			+"		<li>"
			+"			<a href='javascript:void(0)' id='dlg_btn_exit'>取消</a>"
			+"		</li>"
			+"	</ul>"
			+"</div>";
			
	var dlg = $(html);
	$('body').append(dlg);
	return dlg;
}
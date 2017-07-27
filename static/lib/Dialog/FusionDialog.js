var FusionDialog = function(inputs, outout, onOK){

	Dialog.apply(this, arguments);

	this.setInputs(inputs);
	this.setOutput(output);
	this.setOutput(output);

	this.initFolderEvent();

	this._onOK = onOK;
}

extend(FusionDialog, Dialog)


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
				var id = $(this).attr("id");
				var input_box = this;
				if(id == "fusion_input_1"){
					var file_dlg = new FileDialog(dlg._input1,"choose", function(){
						var file_path = this.getFilePath();
						$(input_box).attr("value", file_path);
						dlg._input1 = file_path;
					});
					file_dlg.show();
				}else if(id == "fusion_input_2"){
					var file_dlg = new FileDialog(dlg._input2,"choose", function(){
						var file_path = this.getFilePath();
						$(input_box).attr("value", file_path);
						dlg._input2 = file_path;
					});
					file_dlg.show();
				}
			})

			$(this).prev().find('.dialog_output').each(function(){
				//设置输入影像数据路径的值
				var input_box = this;
				var file_dlg = new FileDialog(dlg._output,"new", function(){
					var file_path = this.getFilePath();
					$(input_box).attr("value", file_path);
					dlg._output = file_path;
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
		dlg._input1  = dlg._win.find("#fusion_input_1").val();
		dlg._input2  = dlg._win.find("#fusion_input_2").val();
		dlg._output = dlg._win.find(".dialog_output:first").val();
		dlg.destory();

		if(dlg._onOK){
			dlg._onOK();
		}
	});
}


FusionDialog.prototype.getInput1 = function(){
	return this._input1;
}
FusionDialog.prototype.getInput2 = function () {
	return this._input2;
}

FusionDialog.prototype.getOutput = function(){
	return this._output;
}

FusionDialog.prototype.create = function(){
	var html =   "<div class='func_dialog dialog'>"
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
	$(".func_dialog").remove();
	var dlg = $(html);
	$('body').append(dlg);
	return dlg;
}
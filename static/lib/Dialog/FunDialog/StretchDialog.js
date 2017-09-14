var StretchDialog = function(inputs,output,onOK){
	FunDialog.apply(this, arguments);
}

extend(StretchDialog, FunDialog);

StretchDialog.prototype.create = function(){
	var html =   "<div class='func_dialog dialog'>"
			+"<div class='titlebar'>"
			+"	<div class='dialog_title'>拉伸</div>"
			+"	<div class='dialog_exit'></div>"
			+"</div>"
			+"<div class='dialog_main'>"
			+"	<div class='dialog_item'>"
			+"		<div>"
			+"			<div class='dialog_item_icon'></div>"
			+"			<div class='dialog_item_title'>输入影像:</div>"
			+"		</div>"
			+"		<div>"
			+"			<div style='float:left;'><input type='text' class='dialog-input'></div>"
			+"			<div class='dialog_folder'></div>"
			+"		</div>"
			+"	</div>"
			+"	<div class='dialog_item'>"
			+"		<div>"
			+"			<div class='dialog_item_icon'></div>"
			+"			<div class='dialog_item_title'>输出影像:</div>"
			+"		</div>"
			+"		<div>"
			+"			<div style='float:left;'><input type='text' class='dialog-output'></div>"
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
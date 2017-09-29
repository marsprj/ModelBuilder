var BinaryThresholdDialog = function(){
	this._funName = "BinaryThreshold";
	FunDialog.apply(this, arguments);
}

extend(BinaryThresholdDialog, FunDialog);

BinaryThresholdDialog.prototype.create = function(){
	var html =   '<div class="func_dialog dialog">'
			+'<div class="titlebar">'
			+'	<div class="dialog_title">灰度二值化</div>'
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
			+'		<div class="f-left item-title">输出影像:</div>'
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
			+'		<div class="f-left item-title">阈值:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left lower-div">'
			+'				<input type="text" class="f-left parms input-60" parm="lower">'
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

BinaryThresholdDialog.prototype.verify = function(){

	this._win.find("input").removeClass("error");
	var valueReg =  /^[0-9]*$/;
	var lower = this._win.find(".lower-div input");
	if(!valueReg.test(lower.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .lower-div input",
			text : "请输入有效的下限值"
		});
		lower.addClass('error');
		return false;
	}

	if(lower.val() < 0 || lower.val() > 255){
		var tooltip = new Tooltip({
			target : ".func_dialog .lower-div input",
			text : "数值范围0~255"
		});
		lower.addClass('error');
		return false;
	}

	return true;
};
var ConnectedSegmentDialog = function(){
	this._funName = "ConnectedSegment";
	FunDialog.apply(this, arguments);
}

extend(ConnectedSegmentDialog, FunDialog);

ConnectedSegmentDialog.prototype.create = function(){
	var html =   '<div class="func_dialog dialog">'
			+'<div class="titlebar">'
			+'	<div class="dialog_title">连通域分割</div>'
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
			+'		<div class="f-left item-title">种子点:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left seedX-div">'
			+'				<div class="f-left item-title title-50">X：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="seedX">'
			+'			</div>'
			+'			<div class="f-left seedY-div">'
			+'				<div class="f-left item-title title-50">Y：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="seedY">'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">灰度阈值:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left lowerThreshold-div">'
			+'				<div class="f-left item-title title-50">lower：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="lowerThreshold">'
			+'			</div>'
			+'			<div class="f-left upperThreshold-div">'
			+'				<div class="f-left item-title title-50">upper：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="upperThreshold">'
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

ConnectedSegmentDialog.prototype.verify = function(){

	this._win.find("input").removeClass("error");
	var valueReg =  /^[0-9]*$/;;
	var value = this._win.find(".seedX-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .seedX-div input",
			text : "请输入有效的种子点X坐标"
		});
		value.addClass('error');
		return false;
	}

	var value = this._win.find(".seedY-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .seedY-div input",
			text : "请输入有效的种子点Y坐标"
		});
		value.addClass('error');
		return false;
	}

	var value = this._win.find(".lowerThreshold-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .lowerThreshold-div input",
			text : "请输入有效的最小灰度阈值"
		});
		value.addClass('error');
		return false;
	}	

	var value = this._win.find(".upperThreshold-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .upperThreshold-div input",
			text : "请输入有效的最大灰度阈值"
		});
		value.addClass('error');
		return false;
	}

	return true;
};
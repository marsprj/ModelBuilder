var ROIExtractDialog = function(){
	this._funName = "ROIExtract";
	FunDialog.apply(this, arguments);
}

extend(ROIExtractDialog, FunDialog);

ROIExtractDialog.prototype.create = function(){
	var html =   '<div class="func_dialog dialog">'
			+'<div class="titlebar">'
			+'	<div class="dialog_title">ROI裁剪</div>'
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
			+'		<div class="f-left item-title">起点坐标:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left startX-div">'
			+'				<div class="f-left item-title title-50">X：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="startX">'
			+'			</div>'
			+'			<div class="f-left startY-div">'
			+'				<div class="f-left item-title title-50">Y：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="startY">'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">矩形大小</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left sizeX-div">'
			+'				<div class="f-left item-title title-50">X：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="sizeX">'
			+'			</div>'
			+'			<div class="f-left sizeY-div">'
			+'				<div class="f-left item-title title-50">Y：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="sizeY">'
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

ROIExtractDialog.prototype.verify = function(){

	this._win.find("input").removeClass("error");
	var valueReg =  /^[0-9]*$/;;
	var value = this._win.find(".startX-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .startX-div input",
			text : "请输入有效的起点X坐标"
		});
		value.addClass('error');
		return false;
	}

	var value = this._win.find(".startY-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .startY-div input",
			text : "请输入有效的起点Y坐标"
		});
		value.addClass('error');
		return false;
	}

	var value = this._win.find(".sizeX-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .sizeX-div input",
			text : "请输入有效的矩形宽度"
		});
		value.addClass('error');
		return false;
	}	

	var value = this._win.find(".sizeY-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .sizeY-div input",
			text : "请输入有效的矩形高度"
		});
		value.addClass('error');
		return false;
	}

	return true;
};
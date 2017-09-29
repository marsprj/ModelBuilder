var LocalHoughExtratorDialog = function(){
	this._funName = "LocalHoughExtrator";
	FunDialog.apply(this, arguments);
}

extend(LocalHoughExtratorDialog, FunDialog);

LocalHoughExtratorDialog.prototype.create = function(){
	var html =   '<div class="func_dialog dialog">'
			+'<div class="titlebar">'
			+'	<div class="dialog_title">Hough 线提取</div>'
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
			+'		<div class="f-left item-title">参数:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left radius-div">'
			+'				<div class="f-left item-title title-50">半径：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="radius">'
			+'			</div>'
			+'			<div class="f-left overlap-div">'
			+'				<div class="f-left item-title title-50">重叠：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="overlap">'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">&nbsp;</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left numberOfLines-div">'
			+'				<div class="f-left item-title title-50">线条数：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="numberOfLines">'
			+'			</div>'
			+'			<div class="f-left threshold-div">'
			+'				<div class="f-left item-title title-50">阈值：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="threshold">'
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

LocalHoughExtratorDialog.prototype.verify = function(){

	this._win.find("input").removeClass("error");
	var valueReg =  /^[0-9]*$/;;
	var value = this._win.find(".radius-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .radius-div input",
			text : "请输入有效的半径值"
		});
		value.addClass('error');
		return false;
	}

	var value = this._win.find(".overlap-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .overlap-div input",
			text : "请输入有效的重叠值"
		});
		value.addClass('error');
		return false;
	}

	var value = this._win.find(".numberOfLines-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .numberOfLines-div input",
			text : "请输入有效的线条数"
		});
		value.addClass('error');
		return false;
	}	

	var value = this._win.find(".threshold-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .threshold-div input",
			text : "请输入有效的阈值"
		});
		value.addClass('error');
		return false;
	}

	return true;
};
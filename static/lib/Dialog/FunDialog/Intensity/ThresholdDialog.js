var ThresholdDialog = function(){
	this._funName = "Threshold";
	FunDialog.apply(this, arguments);
}

extend(ThresholdDialog, FunDialog);

ThresholdDialog.prototype.create = function(){
	var html =   '<div class="func_dialog dialog">'
			+'<div class="titlebar">'
			+'	<div class="dialog_title">阈值分割</div>'
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
			+'				<input type="text" class="dialog-output f-left" style="width:240px;">'
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
			+'				<div class="f-left item-title title-50">下限：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="lower">'
			+'			</div>'
			+'			<div class="f-left upper-div">'
			+'				<div class="f-left item-title title-50">上限：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="upper">'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">像素:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left inside-div">'
			+'				<div class="f-left item-title title-50">阈值内：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="inside">'
			+'			</div>'
			+'			<div class="f-left outside-div">'
			+'				<div class="f-left item-title title-50">阈值外：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="outside">'
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


ThresholdDialog.prototype.setParms = function(parms){
	if(!parms){
		return;
	}
	for(var i = 0; i < parms.length;++i){
		var item = parms[i];
		var name = item.name;
		var value = item.value;

		this._win.find(".parms[parm='" + name +"']").each(function(){
			if(this instanceof HTMLSelectElement){
				$(this).find("option[value='" + value + "']").prop('selected', true);
			}else if (this instanceof HTMLInputElement) {
				$(this).val(value);
			}
		})
	}

};


ThresholdDialog.prototype.getParms = function(){
	var parms = [];
	var parmsElement = this._win.find(".parms");
	parmsElement.each(function(index, el) {
		var parm = $(this).attr("parm");
		if(this instanceof HTMLSelectElement){
			var value = $(this).val();
			parms.push({
				name : parm,
				value : value
			});
		}else if (this instanceof HTMLInputElement) {
			var value = $(this).val();
			parms.push({
				name : parm,
				value : value
			});
		}
	});
	return parms;
}

ThresholdDialog.prototype.verify = function(){

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

	var upper = this._win.find(".upper-div input");
	if(!valueReg.test(upper.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .upper-div input",
			text : "请输入有效的上限值"
		});
		upper.addClass('error');
		return false;
	}

	if(upper.val() < 0 || upper.val() > 255){
		var tooltip = new Tooltip({
			target : ".func_dialog .upper-div input",
			text : "数值范围0~255"
		});
		upper.addClass('error');
		return false;
	}

	var inside = this._win.find(".inside-div input");
	if(!valueReg.test(inside.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .inside-div input",
			text : "请输入有效的阈值内像素值"
		});
		inside.addClass('error');
		return false;
	}

	if(inside.val() < 0 || inside.val() > 255){
		var tooltip = new Tooltip({
			target : ".func_dialog .inside-div input",
			text : "数值范围0~255"
		});
		inside.addClass('error');
		return false;
	}

	
	var outside = this._win.find(".outside-div input");
	if(!valueReg.test(outside.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .outside-div input",
			text : "请输入有效的阈值外像素值"
		});
		outside.addClass('error');
		return false;
	}

	if(outside.val() < 0 || outside.val() > 255){
		var tooltip = new Tooltip({
			target : ".func_dialog .outside-div input",
			text : "数值范围0~255"
		});
		outside.addClass('error');
		return false;
	}
	return true;
};
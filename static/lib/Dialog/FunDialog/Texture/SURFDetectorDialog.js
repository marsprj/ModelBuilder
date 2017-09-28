var SURFDetectorDialog = function(){
	this._funName = "SURFDetector";
	FunDialog.apply(this, arguments);
}

extend(SURFDetectorDialog, FunDialog);

SURFDetectorDialog.prototype.create = function(){
	var html =   '<div class="func_dialog dialog">'
			+'<div class="titlebar">'
			+'	<div class="dialog_title">SURF特征点检测</div>'
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
			+'		<div class="f-left item-title">octaves:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left octaves-div">'
			+'				<input type="text" class="f-left parms input-60" parm="octaves">'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">scales:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left scales-div">'
			+'				<input type="text" class="f-left parms input-60" parm="scales">'
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

SURFDetectorDialog.prototype.setParms = function(parms){
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


SURFDetectorDialog.prototype.getParms = function(){
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

SURFDetectorDialog.prototype.verify = function(){

	this._win.find("input").removeClass("error");
	var valueReg =  /^[0-9.]*$/;
	var value = this._win.find(".octaves-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .octaves-div input",
			text : "请输入有效的octaves值"
		});
		value.addClass('error');
		return false;
	}

	var value = this._win.find(".scales-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .scales-div input",
			text : "请输入有效的scales值"
		});
		value.addClass('error');
		return false;
	}

	return true;
};
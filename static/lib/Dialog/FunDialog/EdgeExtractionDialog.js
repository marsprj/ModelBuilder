var EdgeExtractionDialog = function(inputs,output,onOK){
	this._funName = "EdgeExtraction";
	FunDialog.apply(this, arguments);
}

extend(EdgeExtractionDialog, FunDialog);

EdgeExtractionDialog.prototype.create = function(){
	var html =   '<div class="func_dialog dialog">'
			+'<div class="titlebar">'
			+'	<div class="dialog_title">边缘检测</div>'
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
			+'				<div class="f-left">'
			+'					<select class="output-pixel parms" parm="pixel">'
			+'					</select>'
			+'				</div>'
			+'			</div>'
			+'			<div class="f-left open-file">'
			+'				……'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">滤波器:</div>'
			+'		<div class="f-left item-content">'
			+'			<select class="parms" parm="filter">'
			+'			</select>'
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


	var that = this;
	$(".func_dialog").find(".parms").each(function(index, el) {
		var parm = $(this).attr("parm");
		var parmHtml = '';
		var values = getFunParm(that._funName,parm);
		for(var i = 0; i < values.length;++i){
			parmHtml += '<option value="' + values[i].value + '">' + values[i].name + '</option>'
		}

		$(this).html(parmHtml);
	});

	return dlg;
}


EdgeExtractionDialog.prototype.setParms = function(parms){
	if(!parms){
		return;
	}
	for(var i = 0; i < parms.length;++i){
		var item = parms[i];
		var name = item.name;
		var value = item.value;

		this._win.find(".parms[parm='" + name +"'] option[value='" + value + "']")
			.prop('selected', true);
	}

};


EdgeExtractionDialog.prototype.getParms = function(){
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
		}
	});
	return parms;
}

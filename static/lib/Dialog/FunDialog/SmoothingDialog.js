var SmoothingDialog = function(){
	this._funName = "Smoothing";
	FunDialog.apply(this, arguments);

	this.initRadiusEvent();
}

extend(SmoothingDialog, FunDialog);

SmoothingDialog.prototype.create = function(){
	var html =   '<div class="func_dialog dialog">'
			+'<div class="titlebar">'
			+'	<div class="dialog_title">平滑滤波</div>'
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
			+'			<select class="parms f-left smooth-type" parm="type">'
			+'			</select>'
			+'			<div class="f-left type-radius-div" style="margin-left: 32px;">'
			+'				<div class="f-left item-title">卷积半径：</div>'
			+'				<input type="text" class="type-radius f-left parms" value="2" parm="radius">'
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


SmoothingDialog.prototype.initRadiusEvent = function(){
	var that = this;
	this._win.find(".smooth-type").change(function(event) {
		var type = $(this).val();
		var div = that._win.find(".type-radius-div");
		if(type == "anidif"){
			div.hide();
		}else {
			div.show();
		}
	});	
};

SmoothingDialog.prototype.setParms = function(parms){
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

	var smoothType = this._win.find(".smooth-type").val();
	var div = this._win.find(".type-radius-div");
	if(smoothType == "anidif"){
		div.hide();
	}else{
		div.show();
	}
};


SmoothingDialog.prototype.getParms = function(){
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



SmoothingDialog.prototype.verify = function(){
	this._win.find("input").removeClass("error");
	var smoothType = this._win.find(".smooth-type").val();
	var input = this._win.find('.type-radius');
	var valueReg =  /^[0-9]*$/;

	if((smoothType == "mean" || smoothType == "gaussian") && !valueReg.test(input.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .type-radius",
			text : "请输入有效的卷积半径"
		});
		input.addClass('error');
		return false;
	}
	return true;
};
var HarrisDetectorDialog = function(){
	this._funName = "HarrisDetector";
	FunDialog.apply(this, arguments);
}

extend(HarrisDetectorDialog, FunDialog);

HarrisDetectorDialog.prototype.create = function(){
	var html =   '<div class="func_dialog dialog">'
			+'<div class="titlebar">'
			+'	<div class="dialog_title">Harris特征点检测</div>'
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
			+'		<div class="f-left item-title">sigmaD:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left sigmaD-div">'
			+'				<input type="text" class="f-left parms input-60" parm="sigmaD">'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">sigmal:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left sigmal-div">'
			+'				<input type="text" class="f-left parms input-60" parm="sigmal">'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">alpha:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left alpha-div">'
			+'				<input type="text" class="f-left parms input-60" parm="alpha">'
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

HarrisDetectorDialog.prototype.setParms = function(parms){
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


HarrisDetectorDialog.prototype.getParms = function(){
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

HarrisDetectorDialog.prototype.verify = function(){

	this._win.find("input").removeClass("error");
	var valueReg =  /^[0-9.]*$/;
	var value = this._win.find(".sigmaD-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .sigmaD-div input",
			text : "请输入有效的sigmaD值"
		});
		value.addClass('error');
		return false;
	}

	var value = this._win.find(".sigmal-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .sigmal-div input",
			text : "请输入有效的sigmal值"
		});
		value.addClass('error');
		return false;
	}


	var value = this._win.find(".alpha-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .alpha-div input",
			text : "请输入有效的alpha值"
		});
		value.addClass('error');
		return false;
	}	

	return true;
};
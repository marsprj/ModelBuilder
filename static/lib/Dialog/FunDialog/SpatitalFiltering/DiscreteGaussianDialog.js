var DiscreteGaussianDialog = function(){
	this._funName = "DiscreteGaussian";
	FunDialog.apply(this, arguments);
}

extend(DiscreteGaussianDialog, FunDialog);

DiscreteGaussianDialog.prototype.create = function(){
	var html =   '<div class="func_dialog dialog">'
			+'<div class="titlebar">'
			+'	<div class="dialog_title">高斯平滑</div>'
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
			+'		<div class="f-left item-title">方差:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left variance-div">'
			+'				<input type="text" class="f-left parms" parm="variance">'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">核宽度:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left maxKernelWidth-div">'
			+'				<input type="text" class="f-left parms" parm="maxKernelWidth">'
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


DiscreteGaussianDialog.prototype.setParms = function(parms){
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


DiscreteGaussianDialog.prototype.getParms = function(){
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

DiscreteGaussianDialog.prototype.verify = function(){

	this._win.find("input").removeClass("error");
	var valueReg =  /^[0-9]*$/;
	var variance = this._win.find(".variance-div input");
	if(!valueReg.test(variance.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .variance-div input",
			text : "请输入有效的方差"
		});
		variance.addClass('error');
		return false;
	}


	var maxKernelWidth = this._win.find(".maxKernelWidth-div input");
	if(!valueReg.test(maxKernelWidth.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .maxKernelWidth-div input",
			text : "请输入有效的核宽度"
		});
		maxKernelWidth.addClass('error');
		return false;
	}

	return true;
};
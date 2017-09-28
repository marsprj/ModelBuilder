var CloudDetectionDialog = function(){
	this._funName = "CloudDetection";
	FunDialog.apply(this, arguments);
}

extend(CloudDetectionDialog, FunDialog);

CloudDetectionDialog.prototype.create = function(){
	var html =   '<div class="func_dialog dialog">'
			+'<div class="titlebar">'
			+'	<div class="dialog_title">云检测</div>'
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
			+'		<div class="f-left item-title">像素:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left firstP-div">'
			+'				<div class="f-left item-title title-50">第一：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="firstP">'
			+'			</div>'
			+'			<div class="f-left secondP-div">'
			+'				<div class="f-left item-title title-50">第二：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="secondP">'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">&nbsp;</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left thirdP-div">'
			+'				<div class="f-left item-title title-50">第三：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="thirdP">'
			+'			</div>'
			+'			<div class="f-left fourthP-div">'
			+'				<div class="f-left item-title title-50">第四：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="fourthP">'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">阈值：</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left minThreshold-div">'
			+'				<div class="f-left item-title title-50">min：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="minThreshold">'
			+'			</div>'
			+'			<div class="f-left maxThreshold-div">'
			+'				<div class="f-left item-title title-50">max：</div>'
			+'				<input type="text" class="f-left parms input-60" parm="maxThreshold">'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item">'
			+'		<div class="f-left item-title">方差：</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left variance-div">'
			+'				<input type="text" class="f-left parms input-60" parm="variance">'
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

CloudDetectionDialog.prototype.setParms = function(parms){
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


CloudDetectionDialog.prototype.getParms = function(){
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

CloudDetectionDialog.prototype.verify = function(){

	this._win.find("input").removeClass("error");
	var valueReg =  /^[0-9]*$/;
	var floatReg =  /^[0-9.]*$/;
	var value = this._win.find(".firstP-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .firstP-div input",
			text : "请输入有效的firstPixelComponent"
		});
		value.addClass('error');
		return false;
	}

	var value = this._win.find(".secondP-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .secondP-div input",
			text : "请输入有效的secondPixelComponent"
		});
		value.addClass('error');
		return false;
	}

	var value = this._win.find(".thirdP-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .thirdP-div input",
			text : "请输入有效的thirdPixelComponent"
		});
		value.addClass('error');
		return false;
	}	

	var value = this._win.find(".fourthP-div input");
	if(!valueReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .fourthP-div input",
			text : "请输入有效的fourthPixelComponent"
		});
		value.addClass('error');
		return false;
	}

	var value = this._win.find(".minThreshold-div input");
	if(!floatReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .minThreshold-div input",
			text : "请输入有效的最小阈值"
		});
		value.addClass('error');
		return false;
	}

	var value = this._win.find(".maxThreshold-div input");
	if(!floatReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .maxThreshold-div input",
			text : "请输入有效的最大阈值"
		});
		value.addClass('error');
		return false;
	}

	var value = this._win.find(".variance-div input");
	if(!floatReg.test(value.val())){
		var tooltip = new Tooltip({
			target : ".func_dialog .variance-div input",
			text : "请输入有效的方差值"
		});
		value.addClass('error');
		return false;
	}

	return true;
};
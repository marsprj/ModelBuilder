var KMeansDialog = function(){
	this._funName = "KMeans";
	FunDialog.apply(this, arguments);
}

extend(KMeansDialog, FunDialog);

KMeansDialog.prototype.create = function(){
	var html =   '<div class="func_dialog dialog">'
			+'<div class="titlebar">'
			+'	<div class="dialog_title">KMeans分类</div>'
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
			+'		<div class="f-left item-title">分类个数:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left classes-div">'
			+'				<input type="text" class="f-left parms input-60" parm="classes">'
			+'			</div>'
			+'			<div class="f-left">'
			+'				<div class="classs-btn">设置</div>'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="dialog_item" style="height:100%">'
			+'		<div class="f-left item-title">分割阈值:</div>'
			+'		<div class="f-left item-content">'
			+'			<div class="f-left mean-div">'
			+'				<input type="text" class="f-left parms input-60" parm="mean">'
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

KMeansDialog.prototype.verify = function(){

	this._win.find("input").removeClass("error");
	var inputs = this._win.find(".mean-div input");
	var floatReg =  /^[0-9.]*$/;
	for(var i = 0; i < inputs.length;++i){
		var input = inputs[i];
		var value = $(input).val();
		if(!floatReg.test(value)|| value == ""){
			var tooltip = new Tooltip({
				target : ".mean-div input:eq(" + i + ")",
				text : "请输入有效的分割阈值"
			});
			$(input).addClass('error');
			return false;
		}
	}

	return true;
};

KMeansDialog.prototype.setParms = function(parms){

	if(!parms){
		return;
	}
	for(var i = 0; i < parms.length;++i){
		var item = parms[i];
		var name = item.name;
		var value = item.value;

		if(name == "means"){
			this.setMeans(value);
		}else if (name == "classes") {
			this._win.find(".classes-div input").val(value);
		}
	}

	var that = this;
	this._win.find(".classs-btn").click(function(event) {
		var classes =  that._win.find(".classes-div input").val();
		var valueReg =  /^[0-9]*$/;
		if(!valueReg.test(classes)){
			var tooltip = new Tooltip({
				target : ".func_dialog .classes-div input",
				text : "请输入有效的阈值个数"
			});
			return;
		}

		classes = parseInt(classes);
		if(classes <= 0){
			var tooltip = new Tooltip({
				target : ".func_dialog .classes-div input",
				text : "阈值个数必须大于0"
			});
			return;
		}

		var count = that._win.find(".mean-div input").length;
		if(classes < count){
			var delta = count - classes;
			that._win.find(".mean-div input").slice(-delta).remove();
		}else{
			var delta = classes - count;
			var html = '';
			for(var i = 0; i < delta; ++i){
				html += '<input type="text" class="f-left parms input-60" parm="mean">';
			}
			that._win.find(".mean-div").append(html);
		}

	});
};

KMeansDialog.prototype.setMeans = function(means){
	var html = '';
	for(var i = 0; i < means.length; ++i){
		var mean = means[i];
		if(mean){
			html += '<input type="text" class="f-left parms input-60" parm="mean" value="'
				 +  mean +'">';
		}
	}
	this._win.find(".mean-div").html(html);
};


KMeansDialog.prototype.getParms = function(){
	var parms = [];
	var classes =  this._win.find(".classes-div input").val();
	parms.push({
		name : "classes",
		value : classes
	});

	var means = [];
	var inputs = this._win.find(".mean-div input");
	for(var i = 0; i < inputs.length; ++i){
		means.push(parseFloat($(inputs[i]).val()));
	}

	parms.push({
		name : "means",
		value : means
	})
	return parms;
};

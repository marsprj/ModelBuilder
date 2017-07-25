var CreateModelDialog = function(onOK){
	Dialog.apply(this, arguments);

	this._onOK = onOK;
}

extend(CreateModelDialog, Dialog);


CreateModelDialog.prototype.show = function(){
	Dialog.prototype.show.apply(this, arguments);
	this._win.find(".create-model-name").focus();
}
CreateModelDialog.prototype.initCloseEvent = function(){
	var dlg = this;
	this._win.find(".dialog_exit:first").click(function(){
		dlg.destory();
	});

	this._win.find("#dlg_btn_exit:first").click(function(){
		dlg.destory();
	});
}

CreateModelDialog.prototype.initOkEvent = function(){
	var dlg = this;

	this._win.find("#dlg_btn_ok").click(function(){
		var name = dlg._win.find(".create-model-name").val();
		if(name == ""){
			alert("请输入模型名称");
			return;
		}

		// 判断是否已经有该模型了
		var items = $("#models_container .model-item[mname='" + name + "']");
		if(items.length != 0){
			alert("已经有该模型了");
			return;
		}

		var description = dlg._win.find("textarea").val();

		g_graph.clear();
		g_graph.setName(name);
		g_graph.setDescription(description);

		var text = g_graph.export();
		console.log(text);


		saveModel(text,function(result){
			dlg.destory();

			if(dlg._onOK){
				dlg._onOK(result);
			}
		});

		
	});
}

CreateModelDialog.prototype.create = function(){
	var html = '<div class="create-model-dialog dialog">'
		+'	<div class="titlebar">'
		+'		<div class="dialog_title">新建模型</div>'
		+'		<div class="dialog_exit"></div>'
		+'	</div>'
		+'	<div class="dialog_main">'
		+'		<div class="dialog_item">'
		+'			<span>名称:</span>'
		+'			<input type="text" placeholder="请输入模型名称" class="create-model-name">'
		+'		</div>'
		+'		<div class="dialog_item" style="height: 70px;">'
		+'			<span style="vertical-align: top;">描述:</span>'
		+'			<textarea rows="5"></textarea>'
		+'		</div>'
		+'	</div>'
		+'	<div class="dialog_bottom">'
		+'		<ul>'
		+'			<li>'
		+'				<a href="javascript:void(0)" id="dlg_btn_ok">确定</a>'
		+'			</li>'
		+'			<li>'
		+'				<a href="javascript:void(0)" id="dlg_btn_exit">取消</a>'
		+'			</li>'
		+'		</ul>'
		+'	</div>'
		+'</div>';
	var dlg = $(html);
	$(".create-model-dialog").remove()
	$('body').append(dlg);
	return dlg;
};
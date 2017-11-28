var CreateTaskDialog = function(onOK){
	Dialog.apply(this, arguments);

	this._onOK = onOK;
}

extend(CreateTaskDialog,Dialog);

CreateTaskDialog.prototype.show = function(){
	Dialog.prototype.show.apply(this, arguments);
	this._win.find(".new-task-name").focus();
}


CreateTaskDialog.prototype.initCloseEvent = function(){
	var dlg = this;
	this._win.find(".dialog_exit:first").click(function(){
		dlg.destory();
	});

	this._win.find("#dlg_btn_exit:first").click(function(){
		dlg.destory();
	});
}


CreateTaskDialog.prototype.initOkEvent = function(){
	var dlg = this;

	this._win.find("#dlg_btn_ok").click(function(){
		var name = dlg._win.find(".new-task-name").val();
		if(name == ""){
			alert("请输入任务名称");
			return;
		}

		var nameReg = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/;
        if(!nameReg.test(name)){
			alert("请输入有效的任务名称");
			return;
		}

		var modelId = $("#models_container .model-item.active").attr("uuid");
		if(modelId == null){
			alert("请选择一个模型");
			return;
		}
		createTask(modelId,name,function(obj){
			if(obj.status == "error"){
				alert(obj.message);
				return;
			}
			dlg.destory();
			if(dlg._onOK){
				dlg._onOK(obj.uuid);
			}
		});
	});
	this._win.find(".new-task-name").keydown(function (e) {
		if(e.keyCode == 13){
			dlg._win.find("#dlg_btn_ok").click();
		}
    })
}


CreateTaskDialog.prototype.create = function(){
	var html = '<div class="create-task-dialog dialog">'
		+'	<div class="titlebar">'
		+'		<div class="dialog_title">新建任务</div>'
		+'		<div class="dialog_exit"></div>'
		+'	</div>'
		+'	<div class="dialog_main">'
		+'		<div class="dialog_item">'
		+'			<span>名称:</span>'
		+'			<input type="text" placeholder="请输入任务名称" class="new-task-name">'
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
	$(".create-task-dialog").remove();
	$('body').append(dlg);
	return dlg;
}
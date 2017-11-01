var MonitorDialog = function(onOK){
	Dialog.apply(this, arguments);

	this._onOK = onOK;

	this._monitor = null;
}

extend(MonitorDialog, Dialog);


MonitorDialog.prototype.show = function(){
	Dialog.prototype.show.apply(this, arguments);
	this.showMonitorInfo();
}


MonitorDialog.prototype.initCloseEvent = function(){
	var dlg = this;
	this._win.find(".dialog_exit:first").click(function(){
		dlg.destory();
	});

	this._win.find("#dlg_btn_exit:first").click(function(){
		dlg.destory();
	});
}

MonitorDialog.prototype.initOkEvent = function(){
	var dlg = this;

	this._win.find("#dlg_btn_ok").click(function(){
		dlg.saveMonitor();
	});
}

MonitorDialog.prototype.create = function(){
	var html = '<div class="monitor-dialog dialog">'
		+'	<div class="titlebar">'
		+'		<div class="dialog_title">模型监听</div>'
		+'		<div class="dialog_exit"></div>'
		+'	</div>'
		+'	<div class="dialog_main">'
		+'		<div id="monitor_div">'
		+'			<div class="monitor-name">监听</div>'
		+'			<label class="switch">'
		+'			  <input type="checkbox" checked="">'
		+'			  <span class="slider round"></span>'
		+'			</label>'
		+'			<div class="monitor-info">&nbsp;</div>'
		+'		</div>'
		+'		<div class="data-div">'
		+'			<div class="table">'
		+'				<div class="row header">'
		+'					<div class="cell" style="width:20%">节点</div>'
		+'					<div class="cell" style="width:20%">前缀</div>'
		+'					<div class="cell" style="width:50%">文件夹</div>'
		+'					<div class="cell" style="width:10%"></div>'
		+'				</div>'
		// +'				<div class="row">'
		// +'					<div class="cell"><div class="node-div f-left">&nbsp;</div></div>'
		// +'					<div class="cell"><input type="text" class="prefix-input f-left" value=""></div>'
		// +'					<div class="cell"><input type="text" class="folder-input f-left" value="/"></div>'
		// +'					<div class="cell"><div class="f-left open-file" title="选择文件">……</div></div>'
		// +'				</div>'
		+'			</div>'
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


MonitorDialog.prototype.showMonitorInfo = function(){
	if(!g_graph){
		return;
	}

	g_graph.export();
	var monitor = g_graph.getMonitor();
	this._monitor = monitor;

	

	var data = monitor.getData();

	var html = '';
	for(var i = 0; i < data.length;++i){
		var d = data[i];
		var id = d.id;
		var prefix = d.prefix;
		var path = d.path;
		html += '<div class="row" dataid="' + id + '">'
			+'	<div class="cell"><div class="node-div f-left">&nbsp;</div></div>'
			+'	<div class="cell"><input type="text" class="prefix-input f-left" value="' + prefix + '"></div>'
			+'	<div class="cell"><input type="text" class="folder-input f-left" value="' + path + '"></div>'
			+'	<div class="cell"><div class="f-left open-file" title="选择文件夹">……</div></div>'
			+'</div>';
	}

	this._win.find(".data-div .table .header").after(html);

	var status = monitor.getStatus();
	this.setStatus(status);

	this.registerClickEvent();
};


MonitorDialog.prototype.setStatus = function(status){
	if(status == "on"){
		this._win.find(".monitor-info").html("可以编辑节点的监控设置")
		this._win.find("#monitor_div input").prop("checked", true);
		this._win.find(".data-div input").attr("disabled",false);
	}else{
		this._win.find(".monitor-info").html("开启监控状态，即可编辑节点设置")
		this._win.find("#monitor_div input").prop("checked", false);
		this._win.find(".data-div input").attr("disabled",true);
	}
};

MonitorDialog.prototype.registerClickEvent = function(){
	var dlg = this;
	this._win.find(".open-file").click(function(){
		var inputEle = $(this).parent().prev().children()
		var inputs = dlg._win.find(".folder-input");
		var index = inputs.index(inputEle);			

		var file_dlg = new FileDialog(inputEle.val(),"folder", function(){
			var folderPath = this.getFolderPath();
			inputEle.attr("value", folderPath);

		});
		file_dlg.show();
	});


	this._win.find("#monitor_div input").change(function(event) {
		var status = $(this).prop("checked");
		if(status){
			dlg._win.find(".monitor-info").html("");
			dlg._win.find(".data-div input").attr("disabled",false);
		}else{
			dlg._win.find(".monitor-info").html("");
			dlg._win.find(".data-div input").attr("disabled",true);
		}
	});


};



MonitorDialog.prototype.getData = function(){
	var rows = this._win.find(".data-div .table .row:not(.header)");
	var data = [];
	for(var i = 0; i < rows.length;++i){
		var row = rows[i];
		var id = $(row).attr("dataid");
		var prefix  = $(row).find(".prefix-input").val();
		var path = $(row).find(".folder-input").val();
		data.push({
			id : id,
			prefix : prefix,
			path : path
		})
	}
	return data;
};

MonitorDialog.prototype.saveMonitor = function(){
	var preStatus = this._monitor.getStatus();
	var status = this._win.find("#monitor_div input").prop("checked");
	var data = this.getData();


	var dlg = this;
	var modelID = $(".model-item.active").attr("uuid");

	// on=>off
	if(preStatus == "on" && !status){
		// on=>off
		
		this._win.find(".monitor-info").html("正在停止监控");
		this.stopMonitorModel(modelID,function(result){
			if(result.status == "error"){
				dlg._win.find(".monitor-info").html(result.message);
				return;
			}else if(result.status == "success"){
				dlg._win.find(".monitor-info").html("停止监控成功");
				setTimeout(function(){
					dlg.destory();
					if(dlg._onOK){
						dlg._onOK(result);
					}
				}, 400);
				getModel(modelID);
			}

		});
	}else if (preStatus == "on" && status) {
		// on=>on

		this._monitor.setData(data);
		var text = g_graph.export();
		dlg._win.find(".monitor-info").html("保存监控设置");
		saveModel(text,function(result){
			if(result.status == "error"){
				dlg._win.find(".monitor-info").html(result.message);
			}else if(result.status == "success"){
				dlg._win.find(".monitor-info").html("保存成功");
				setTimeout(function(){
					dlg._win.find(".monitor-info").html("正在重启监控");
					dlg.restartMonitorModel(modelID,function(result){
						if(result.status == "error"){
							dlg._win.find(".monitor-info").html(result.message);
							return;
						}else if(result.status == "success"){
							dlg._win.find(".monitor-info").html("重启监控成功");
							setTimeout(function(){
								dlg.destory();
								if(dlg._onOK){
									dlg._onOK(result);
								}
							}, 400);
							getModel(modelID);
						}
					});
				},400);
			}
		});
	}else if (preStatus == "off" && status) {
		// off =>on
		this._monitor.setData(data);
		var text = g_graph.export();
		dlg._win.find(".monitor-info").html("保存监控设置");
		saveModel(text,function(result){
			if(result.status == "error"){
				dlg._win.find(".monitor-info").html(result.message);
			}else if(result.status == "success"){
				dlg._win.find(".monitor-info").html("保存成功");
				setTimeout(function(){
					dlg._win.find(".monitor-info").html("正在开启监控");
					dlg.startMonitorModel(modelID,function(result){
						if(result.status == "error"){
							dlg._win.find(".monitor-info").html(result.message);
							return;
						}else if(result.status == "success"){
							dlg._win.find(".monitor-info").html("开启监控成功");
							setTimeout(function(){
								dlg.destory();
								if(dlg._onOK){
									dlg._onOK(result);
								}
							}, 400);
							getModel(modelID);
						}
					});
				},400);
			}
		});
	}else if (preStatus == "off" && !status) {
		// off=>off 直接关闭
		this.destory();
		if(this._onOK){
			this._onOK(result);
		}
	}

};


MonitorDialog.prototype.startMonitorModel = function(modelID,callback){
	if(modelID ==null){
		return;
	}
	
	var url = "/model/model/" + modelID + "/start/";
	$.ajax({
		url : url,
		dataType : "text",
		async : true,
		success : function(json,textStatus){
			var result = JSON.parse(json);
			if(callback){
				callback(result);
			}

		},
	 	error:function(xhr){
            console.log(xhr);
        }	
	});
};

MonitorDialog.prototype.stopMonitorModel = function(modelID,callback){
	if(modelID ==null){
		return;
	}
	
	var url = "/model/model/" + modelID + "/stop/";
	$.ajax({
		url : url,
		dataType : "text",
		async : true,
		success : function(json,textStatus){
			var result = JSON.parse(json);
			if(callback){
				callback(result);
			}

		},
	 	error:function(xhr){
            console.log(xhr);
        }	
	});
};



MonitorDialog.prototype.restartMonitorModel = function(modelID,callback){
	if(modelID ==null){
		return;
	}
	
	var url = "/model/model/" + modelID + "/restart/";
	$.ajax({
		url : url,
		dataType : "text",
		async : true,
		success : function(json,textStatus){
			var result = JSON.parse(json);
			if(callback){
				callback(result);
			}

		},
	 	error:function(xhr){
            console.log(xhr);
        }	
	});
};

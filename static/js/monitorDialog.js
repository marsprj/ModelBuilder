var MonitorDialog = function(onOK,onClose){
	Dialog.apply(this, arguments);

	this._onOK = onOK;

	this._onClose = onClose;

	this._monitor = null;
 
	this._colors = ["#fad96d","#959795","#4a6985","#768090","#813513","#e8e1d6"];
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
		if(dlg._onClose){
			dlg._onClose();
		}
	});

	this._win.find("#dlg_btn_exit:first").click(function(){
		dlg.destory();
		if(dlg._onClose){
			dlg._onClose();
		}
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
	$(".monitor-dialog").remove()
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
		var color = this._colors[i%this._colors.length];
		html += '<div class="row" dataid="' + id + '">'
			+'	<div class="cell"><div class="node-div f-left" style="background-color:' +color  + '">&nbsp;</div></div>'
			+'	<div class="cell"><input type="text" class="prefix-input f-left" value="' + prefix + '"></div>'
			+'	<div class="cell"><input type="text" class="folder-input f-left" value="' + path + '" readonly></div>'
			+'	<div class="cell"><button class="f-left open-folder" title="选择文件夹"></button></div>'
			+'</div>';

		var node = g_graph.getNodeById(id);
		node.setShapeAttr("fill",color);
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
		this._win.find(".data-div input,.data-div button").attr("disabled",false);
	}else{
		this._win.find(".monitor-info").html("开启监控状态，即可编辑节点设置")
		this._win.find("#monitor_div input").prop("checked", false);
		this._win.find(".data-div input,.data-div button").attr("disabled",true);
	}
};

MonitorDialog.prototype.registerClickEvent = function(){
	var dlg = this;
	this._win.find(".open-folder").click(function(){
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
			dlg._win.find(".data-div input,.data-div button").attr("disabled",false);
		}else{
			dlg._win.find(".monitor-info").html("");
			dlg._win.find(".data-div input,.data-div button").attr("disabled",true);
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

	if(status){
		var result = this.verifyData();
		if(!result){
			return;
		}
	}
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
						dlg._onOK();
					}
				}, 400);
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
									dlg._onOK();
								}
							}, 400);
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
									dlg._onOK();
								}
							}, 400);
						}
					});
				},400);
			}
		});
	}else if (preStatus == "off" && !status) {
		// off=>off 直接关闭
		this.destory();
		if(this._onOK){
			this._onOK();
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


MonitorDialog.prototype.verifyData = function(){

	// 判断前缀是否有效
	this._win.find("input").removeClass("error");
	var prefixReg = /^[\u4e00-\u9fa5_a-zA-Z0-9]*$/;
	var prefixInputs = this._win.find(".prefix-input");
	prefixInputs.each(function(index, el) {
		var value = $(this).val();
		if(!prefixReg.test(value)){
			var tooltip = new Tooltip({
				target : ".monitor-dialog .data-div .prefix-input:eq(" + index + ")",
				text : "请输入有效的前缀"
			});
			$(this).addClass('error');
			return false;
		}
	});


	// 在多个输入的情况下，保证同一个文件夹下，监听的内容必须要前缀，否则无法识别是哪个输入
	var folderInputs = this._win.find(".folder-input");
	for(var i = 0; i < folderInputs.length; ++i){
		var input = folderInputs[i];
		if($(input).val() == ""){
			var tooltip = new Tooltip({
				target : ".monitor-dialog .data-div .folder-input:eq("+ i + ")",
				text : "请设置有效的监听文件夹"
			});
			$(input).addClass('error');
			return false;
		}
		for(var j = i+1; j < folderInputs.length;++j){
			var compare = folderInputs[j];
			if($(input).val() === $(compare).val()){
				var inputPrefix = $(input).parent().prev().children();
				var comparePrefix = $(compare).parent().prev().children();
				if($(inputPrefix).val() == ""){
					var tooltip = new Tooltip({
						target : ".monitor-dialog .data-div .folder-input:eq("+ i + ")",
						text : "监控同一文件夹，请输入有效的前缀加以区分"
					});
					$(inputPrefix).addClass('error');
					$(input).addClass('error');
					$(compare).addClass('error');
					return false;
				}
				if($(comparePrefix).val() == ""){
					var tooltip = new Tooltip({
						target : ".monitor-dialog .data-div .prefix-input:eq(" + j + ")",
						text : "请输入有效的前缀"
					});
					$(comparePrefix).addClass('error');
					$(input).addClass('error');
					$(compare).addClass('error');
					return false;
				}
			}
		}
	}
	return true;
};
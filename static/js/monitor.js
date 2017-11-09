function registerPanelEvent(){

	// 切换tab
	$("#menu_panel .menu").click(function(){
		$("#menu_panel .menu").removeClass('active');
		$(this).addClass('active');
		var pre = $(this).attr("pre");
		var tab = "monitor_" + pre;
		$(".tab-panel").removeClass('active');
		$("#" + tab).addClass('active');

		if(pre == "task"){
			showMonitorModels();
		}else if (pre == "model") {
			g_model_id = null;
		}
	});

	// 模型状态切换
	$(".model-state-div li").click(function(){
		$(".model-state-div li").removeClass('active');
		$(this).addClass('active');
		var status = $(this).attr("status");
		showModelsStatus(status);
	});

	// 切换状态查看
	changeState();


	//退出
	$(".logout").click(function(){
		logout();
	});
}


function getModelsStatus(status,callback){
	var url = "/model/models/" + status + "/status/";
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
		error : function(xhr){
			console.log(xhr)
		}
	});
}

function showModelsStatus(status){
	$("#monitor_model .panel-content").addClass("loading");

	$("#monitor_model_table .row:not(.header)").remove();
	getModelsStatus(status,function(result){
		$("#monitor_model .panel-content").removeClass("loading");
		if(result.status == "error"){
			alert(result.message);
			return;
		}

		$("#monitor_model_panel .count-div #count span").html(result.length);

		var html = '';
		for(var i = 0; i < result.length;++i){
			var model = result[i];
			var status = model.status;
			if(status == "on"){
				checked = "checked";
			}else if (status == "off") {
				checked = ""
			}
			html += '<div class="row" uuid="' + model.uuid +'">'
                +'    <div class="cell">' + (i +1) + '</div>'
                +'    <div class="cell">' + model.name  + '</div>'
                +'    <div class="cell">' + model.create_time + '</div>'
                +'    <div class="cell">'
                +'        <label class="switch">'
                +'            <input type="checkbox" ' + checked + '>'
                +'            <span class="slider round"></span>'
                +'        </label>'
                +'    </div>'
                +'    <div class="cell">' + (status == "on"?'开启':'关闭') + '</div>'
                +'	  <div class="cell"><a class="view-btn" href="javascript:void(0)">查看</a></div>'
                +'</div>';
		}
		$("#monitor_model_table .row:not(.header)").remove();
	 	$("#monitor_model_table .header").after(html);	

	 	$("#monitor_model_table .row input[type='checkbox']").change(function(event) {
	 		changeModelMonitorStatus(this);
	 	});

	 	// 查看
	 	$("#monitor_model_table .view-btn").click(function(){

	 		var prev = $(this).parent().prev();
	 		if(prev.html() != "开启"){
	 			return
	 		}
	 		var uuid = $(this).parents(".row").attr("uuid");
	 		$("#menu_panel .menu").removeClass('active');
	 		$("#menu_panel .menu[pre='task']").addClass('active');
	 		$(".tab-panel").removeClass('active');
	 		$("#monitor_task").addClass('active');
	 		g_model_id = uuid;

	 		showMonitorModels();
	 	});
	});
}


function changeModelMonitorStatus(input){
	var row = $(input).parents(".row");
	var uuid = row.attr("uuid");
	var checked = $(input).prop("checked");
	var info = $(input).parents(".cell").next();
	if(checked){
		$(info).html("正在开启监听");
		startMonitorModel(uuid,function(result){
			if(result.status == "error"){
				info.html("开启失败:" + result.message);
				setTimeout(function(){
					$(input).prop("checked",false);
				}, 200);
				return;
			}else {
				info.html("开启监听成功");
				setTimeout(function(){
					info.html("开启");
				}, 200);
			}
		});
	}else{
		$(info).html("正在关闭监听");
		stopMonitorModel(uuid,function(result){
			if(result.status == "error"){
				info.html("关闭失败:" + result.message);
				setTimeout(function(){
					$(input).prop("checked",true);
				}, 200);
				return;
			}else {
				info.html("关闭监听成功");
				setTimeout(function(){
					info.html("关闭");
				}, 200);
			}
		})
	}
}


function startMonitorModel(modelID,callback){
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
}


function stopMonitorModel(modelID,callback){
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
}

function logout() {
	var url = "/model/" + g_username + "/logout/" ;
	$.ajax({
		type:"GET",
		url:url,
		contentType: "text/plain",
		dataType : "text",
		success:function(result){
			var text = JSON.parse(result);
			if(text.status == "error"){
				alert(text.message);
			}else{
				window.location.href = "login.html";
			}
		},
	 	error:function(xhr){
            console.log(xhr);
        }
	});
}
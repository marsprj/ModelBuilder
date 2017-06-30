// 获取模型列表
function loadModels(){
	$("#models_container").empty();
	var url = "/model/models/";
	$.ajax({
		url : url,
		dataType : "text",
		async : true,
		success : function(json,textStatus){
			showModels(JSON.parse(json));
		},
		error : function(){

		}
	});
}

// 展示模型列表
function showModels(json){
	var html = "";
	json.forEach(function(model){
		html += '<div class="model-item" uuid="' + model.uuid + '" mname="' + model.name + '">'
			 +  '	<div class="model-name">'  + model.name + "</div>"
			 + 	'</div>'
	});

	$("#models_container").html(html);

	$("#models_container .model-item").click(function(){
		var uuid = $(this).attr("uuid");
		$("#models_container .model-item").removeClass("active");
		$(this).addClass("active");
		var name = $(this).attr("mname");
		$(".titlebar-title span").html("[" + name + "]");
		getModel(uuid);
		getTasks(uuid);
	});

	if(g_new_model){
		$("#models_container .model-item").removeClass("active");
		$("#models_container .model-item[uuid='" + g_new_model + "']").addClass("active");
		g_new_model = null;
	}else{
		// 默认打开第一个
		var modelFirst = $("#models_container .model-item:first");
		if(modelFirst.attr("uuid")){
			modelFirst.addClass("active");
			getModel(modelFirst.attr("uuid"));
			getTasks(modelFirst.attr("uuid"));
		}
	}
}

// 读取某个模型
function getModel(uuid){
	if(uuid ==null){
		return;
	}
	g_graph.clear();
	var url = "/model/model/" + uuid;
	$.ajax({
		url : url,
		dataType : "text",
		async : true,
		success : function(json,textStatus){
			showModel(json);
		},
		error : function(){

		}		
	});
}

function showModel(json){
	g_graph.load(json);
	g_graph.setEditable(false);
	$("#state_div select option[value='not']").prop("selected",true);
}

// 获取计算任务
function getTasks(modelId){
	if(modelId == null){
		return;
	}

	$(".process-div").remove();
	$("#task_table .table .row:not(.header)").remove();
	var url = "/model/model/" + modelId + "/tasks";
	$.ajax({
		url : url,
		dataType : "text",
		async : true,
		success : function(json,textStatus){
			showTasks(JSON.parse(json));
		},
		error : function(){

		}		
	});	
}

function showTasks(json){
	if(json == null){
		return;
	}

	var html = '';
	json.forEach(function(t){
		var state = getState(t.state);
		var stateClass = getStateClass(t.state);
		var stateIcon = getStateIcon(t.state);
		html += '<div class="row ' + stateClass + ' " uuid="' + t.uuid+ '">'
			+	'	<div class="cell state-icon ' + stateIcon + ' "></div>'
			+	'	<div class="cell">' + t.name + '</div>'
			+	'	<div class="cell">' + state + '</div>'
			+	'	<div class="cell">' + t.start_time + '</div>'
			+	'	<div class="cell">' + t.end_time + '</div>'
			+	'	<div class="cell">' + '100%' + '</div>'
			+	'	<div class="cell"><button class="run-btn">运行</button></div>'
			+ 	'</div>';
	});

 	$("#task_table .task-header").after(html);

	$("#task_table .row:not(.header)").click(function(evt){
		if(evt.target instanceof HTMLButtonElement){
			return;
		}
		var uuid = $(this).attr("uuid");
		$("#task_table .row").removeClass("active-row");
		$(this).addClass("active-row");
		getTaskState(uuid);
	});

	$("#task_table .run-btn").click(function(){
		var taskId = $(this).parents(".row").attr("uuid");
		runTask(taskId,function(){

		});
	});

	// 是否有新建的task
	if(g_new_task){
		$("#task_table .row").removeClass("active-row");
		$("#task_table .row[uuid='" + g_new_task + "']").addClass("active-row");
		getTaskState(g_new_task);
		g_new_task = null;
	}

}


// 获取运行状态
function getState(state){
	switch(state){
		case 0:
			return "not started";
		case 1:
			return "running";
		case 2:
			return "completed";
		case 3:
			return "failed";
	}	
}

// 获取row的类名
function getStateClass(state){
	switch(state){
		case 0:
			return "not-started-row";
		case 1:
			return "running-row";
		case 2:
			return "completed-row";
		case 3:
			return "failed-row";
	}	
}

// 获取state图标
function getStateIcon(state){
	switch(state){
		case 0:
			return "not-started-icon";
		case 1:
			return "running-icon";
		case 2:
			return "completed-icon";
		case 3:
			return "failed-icon";
	}		
}


// 获取运行状态
function getTaskState(taskId){
	if(taskId == null){
		return;
	}

	var processDiv = $(".process-div");
	if(processDiv.length == 1){
		var processId = processDiv.attr("uuid");
		if(processId == taskId){
			processDiv.slideUp(400,function(){
				processDiv.remove();
			});
			return;
		}else{
			processDiv.slideUp(400,function(){
				processDiv.remove();
			});
		}
	}

	$("#result .table .row:not(.header)").remove();
	$("#result").addClass("loading");
	var url = "/model/task/" + taskId + "/state";
	$.ajax({
		url : url,
		dataType : "text",
		async : true,
		success : function(json,textStatus){
			stateJson = JSON.parse(json);
			showTaskState(stateJson);
		},
		error : function(){

		}		
	});
}

function showTaskState(json){
	if(json == null){
		return;
	}

	var processes = json.processes;
	if(processes == null){
		return;
	}
	var count = processes.length;

	var processesHtml = '';
	for(var i = 0; i < processes.length;++i){
		var process = processes[i];
		var state = getState(process.state);
		processesHtml += '<div class="row">'
						+'	<div class="cell">' + process.id + '</div>'
						+'	<div class="cell">' + process.name + '</div>'
						+'	<div class="cell">' + state + '</div>'
						+'	<div class="cell">' + process.start_time + '</div>'
						+'	<div class="cell">' + process.end_time + '</div>'
						+'	<div class="cell">' + '100%' + '</div>'
						+'</div>';
	}
	var uuid = json.uuid;
	var html = '<div class="process-div" uuid="' + uuid + '">'
			+	'	<div class="process-left">'
			+	'		<div class="icon-left">'
			+	'		</div>'
			+	'		<div class="name-right">计<br>算<br>过<br>程'
			+	'		</div>'
			+	'	</div>'
			+	'	<div class="process-right">'
			+	'		<div class="table">'
			+	'			<div class="row header process-header">'
			+	'				<div class="cell">'
			+	'				</div>'
			+	'				<div class="cell">'
			+	'					名称'
			+	'				</div>'
			+	'				<div class="cell">'
			+	'					状态'
			+	'				</div>'
			+	'				<div class="cell">'
			+	'					开始时间'
			+	'				</div>'
			+	'				<div class="cell">'
			+	'					完成时间'
			+	'				</div>'
			+	'				<div class="cell">'
			+	'					完成度'
			+	'				</div>'
			+	'			</div>'
			+				processesHtml
			+	'		</div>'
			+	'	</div>'
			+	'	<div class="process-close-btn">×</div>'
			+	'</div>';

	
	var row = $("#task_table .row[uuid='" + uuid + "']");
	$("#task_table").after(html);
	var rect = row[0].getClientRects()[0];
	var top = rect.top + rect.height;
	var left = rect.left;
	$(".process-div").css("left",left + "px").css("top",top + "px").slideDown();

	$(".process-div .process-close-btn").click(function(){
		var processDiv = $(".process-div");
		processDiv.slideUp(400,function(){
			processDiv.remove();
		});
	});
}


// 保存模型
function saveModel(text,callback){
	$.ajax({
		type:"POST",
		url:"/model/model/save/",
		data : text,
		contentType: "text/plain",
		dataType : "text",
		success:function(uuid){
			if(callback){
				callback(uuid);
			}
		}
	});	
}


// 删除模型
function deleteModel(uuid,callback){
	var url = "/model/model/" + uuid + "/delete";
	$.ajax({
		type:"get",
		url:url,
		contentType: "text/plain",
		dataType : "text",
		success:function(){
			if(callback){
				callback();
			}
		}
	});
}


// 创任务
function createTask(modelId,callback){
	if(modelId == null){
		return ;
	}
	var url = "/model/task/create/" + modelId;
	$.ajax({
		type:"get",
		url:url,
		contentType: "text/plain",
		dataType : "text",
		success:function(result){
			if(callback){
				callback(JSON.parse(result));
			}
		}
	});
}


// 任务运行
function runTask(taskId,callback){
	if(taskId == null){
		return;
	}
	var url = "/model/task/"+ taskId + "/run";
	$.ajax({
		type:"get",
		url:url,
		contentType: "text/plain",
		dataType : "text",
		success:function(result){
			console.log(result);
			if(callback){
				callback(JSON.parse(result));
			}
		}
	});

}
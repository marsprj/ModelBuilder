// 获取模型列表
function getModels(){
	$("#models_container").addClass("loading").empty();
	var url = "/model/models/";
	$.ajax({
		url : url,
		dataType : "text",
		async : false,
		success : function(json,textStatus){
			showModels(JSON.parse(json));
		},
		error : function(){

		}
	});
}


// 展示模型列表
function showModels(json){
	$("#models_container").removeClass("loading");
	var html = "";
	json.forEach(function(model){
		html += '<div class="model-item" uuid="' + model.uuid + '">'
			 +	'	<div class="model-icon"></div>'
			 +  '	<div class="model-name">'  + model.name + "</div>"
			 + 	'</div>'
	});

	$("#models_container").html(html);

	$("#models_container .model-item").click(function(){
		var uuid = $(this).attr("uuid");
		getModel(uuid);
	});

	// 默认打开第一个
	var modelFirst = $("#models_container .model-item:first");
	if(modelFirst.attr("uuid")){
		getModel(modelFirst.attr("uuid"));
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
		async : false,
		success : function(json,textStatus){
			showModel(json);
		},
		error : function(){

		}		
	});
}

function showModel(json){
	g_graph.load(json);
}

// 获取运行状态
function getTaskState(taskId){
	if(taskId == null){
		return;
	}

	$("#result .table .row:not(.header)").remove();
	$("#result").addClass("loading");
	var url = "/model/task/" + taskId + "/state";
	$.ajax({
		url : url,
		dataType : "text",
		async : false,
		success : function(json,textStatus){
			stateJson = JSON.parse(json);
			showTaskState(stateJson);
		},
		error : function(){

		}		
	});
}

function showTaskState(stateJson){
	$("#result").removeClass("loading");
	if(stateJson == null){
		return;
	}

	var html = '';
	var state = null,startTime = null,endTime = null,name = null;
	stateJson.processes.forEach(function(p){
		state = getState(p.state);
		startTime = p.start_time;
		endTime = p.end_time;
		name = p.name;
		html += '<div class="row state ' + state +'">'
			+	'	<div class="cell">' + name + '</div>'
			+	'	<div class="cell">' + 	state + '</div>'
			+	'	<div class="cell">' + startTime +  '</div>'
			+	'	<div class="cell">' + endTime +  '</div>'
			+	'</div>';

	});

	$("#result .table .row.header").after(html);
}

function getState(state){
	switch(state){
		case 0:
			return "stop";
		case 1:
			return "running";
		case 2:
			return "complete";
	}	
}


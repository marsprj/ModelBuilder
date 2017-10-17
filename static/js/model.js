// 获取模型列表
function loadModels(){
	$("#models_container").empty().addClass("loading");
	var url = "/model/" + g_username + "/models/";
	$.ajax({
		url : url,
		dataType : "text",
		async : true,
		success : function(json,textStatus){
			showModels(JSON.parse(json));
		},
		error : function(xhr){
			alert("获取模型列表失败");
			showModels([]);
			console.log(xhr)
		}
	});
}

// 展示模型列表
function showModels(json){
	$("#models_container").removeClass("loading");
	if(json.status == "error"){
		alert(json.message);
		return;
	}
	var html = "";
	json.forEach(function(model){
		html += '<div class="model-item" uuid="' + model.uuid + '" mname="' + model.name + '">'
			 +  '	<div class="model-icon"></div>'
			 +  '	<div class="model-name">'  + model.name + "</div>"
			 + 	'</div>'
	});

	$("#models_container").html(html);



	$("#models_container .model-item .model-name").click(function(){
		var item = $(this).parent();
		var uuid = item.attr("uuid");
		$("#models_container .model-item").removeClass("active");
		item.addClass("active");
		$(".model-tool-div li").removeClass('active');
		g_model_id = uuid;
		setState(g_state);

	});
}


// 所有的模型的任务列表
function showAllModelTask(){
	$("#models_container .model-item").removeClass('active');
	$(".model-tool-div li").addClass('active');
	g_model_id = 0;
	setState(g_state);
}
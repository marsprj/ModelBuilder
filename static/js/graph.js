// 绘制事件 
function initGraphEvent(){

	// data node
	$("#data_div").click(function(){
		$("#funcs a").removeClass("active");
		$(this).addClass("active");
		g_graph.setState(GRAPH_STATE.ADDDATA);
	});

	// tools
	$("#tools .tool").click(function(){
		var modelId = $("#models_container .model-item.active").attr("uuid");
		if(modelId == null){
			alert("请选择一个模型");
			return;
		}
		$("#tools .tool").removeClass("active");
		$(this).addClass("active");
		if($(this).hasClass("move-tool")){
			g_graph.stopConnecting();
			g_graph.draggable();
		}else if($(this).hasClass("connect-tool")){
			g_graph.undrag();
			g_graph.startConnecting();
		}else if($(this).hasClass("remove-tool")){
			g_graph.remove();
		}else if($(this).hasClass('refresh-tool')){
			var height = $("#canvas_div").height();
			var width = $("#canvas_div").width();

			g_graph.setSize(width,height);
			var imageIcons = $("#backdrop .image-icon");
			if(imageIcons.length!= 0){
				var imageIcon = imageIcons[0];
				var tid = $(imageIcon).attr("tid");
				if(tid != null && tid != undefined){
					showResultIcons(tid);
				}
			}
		}else if($(this).hasClass("save-tool")){
			var text = g_graph.export();
			// 判断是保存model还是task
			var activeTask = $("#task_table .row.active-row");
			if(activeTask.length == 1){
				var uuid = activeTask.attr("uuid");
				saveTask(uuid,text,function(result){
					if(result.status == "success"){
						alert("保存任务成功");
					}else {
						alert(text.message);
					}
				});
			}else{
				saveModel(text,function(result){
					if(result.status == "success"){
						alert("保存模型成功");
					}else {
						alert(text.message);
					}
				});
			}
		}
	});

	// 全屏
	$("#resize_div").click(function(){
		setFullScreen();
	});


	//编辑
	$("#state_div input").change(function(){
		var checked = this.checked;
		if(checked){
			g_graph.setEditable(true);
		}else{
			$("#tools .tool").removeClass("active");
			g_graph.setEditable(false);
		}
	});

}

// 全屏处理
function setFullScreen(){
	var processDiv = $(".process-div");
	processDiv.slideUp(400,function(){
		processDiv.remove();
	});
	if($("#canvas_div").hasClass("full-screen")){
		$("#resize_div").removeClass("full-screen").attr("title","全屏");
		$("#left").removeClass("full-screen");
		$("#right").removeClass("full-screen");
		$("#right > .titlebar").removeClass("full-screen");
		$("#task_table").removeClass("full-screen");
		$("#canvas_div").removeClass("full-screen");
	}else{
		$("#resize_div").addClass("full-screen").attr("title","退出全屏");
		$("#left").addClass("full-screen");
		$("#right").addClass("full-screen");
		$("#right > .titlebar").addClass("full-screen");
		$("#task_table").addClass("full-screen");
		$("#canvas_div").addClass("full-screen");
	}

	var height = $("#canvas_div").height();
	var width = $("#canvas_div").width();

	g_graph.setSize(width,height);

	var imageIcons = $("#backdrop .image-icon");
	if(imageIcons.length!= 0){
		var imageIcon = imageIcons[0];
		var tid = $(imageIcon).attr("tid");
		if(tid != null && tid != undefined){
			showResultIcons(tid);
		}
	}
}

// 设置不可编辑状态
function setNoEdit(){
	g_graph.setEditable(true);
	g_graph.setEditable(false);
	$("#state_div input").prop("checked",false);
	$("#backdrop").dblclick(function() {
		var tootip = new Tooltip({
				target : "#state_div",
				text: "请先启用编辑状态"
			});
	});
}
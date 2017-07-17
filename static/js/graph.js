// 绘制事件 
function initGraphEvent(){

	// data node
	$("#data_div").click(function(){
		$("#funcs .func_wrapper").removeClass("active");
		$(this).addClass("active");
		g_graph.setState(GRAPH_STATE.ADDDATA);
	});

	// fun node
	$("#funcs .func_wrapper").click(function(){
		$("#funcs .func_wrapper").removeClass("active");
		$("#data_div").removeClass("active");
		$(this).addClass("active");
		var ftype = $(this).attr("ftype");
		if(ftype){
			g_graph.setState(GRAPH_STATE.ADDFUNC);
			g_func_type = ftype;
		}else{
			g_graph.setState(GRAPH_STATE.NONE);
		}
	});

	// tools
	$("#tools .tool").click(function(){
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
		}else if($(this).hasClass("save-tool")){
			var text = g_graph.export();
			saveModel(text,function(result){
				alert(result);
			});
		}
	});

	// 全屏
	$("#resize_div").click(function(){
		setFullScreen();
	});


	//编辑
	$("#state_div select").change(function(){
		var value = $(this).val();
		if(value == "yes"){
			g_graph.setEditable(true);
		}else if(value == "not"){
			g_graph.setEditable(false);
		}
	});

}

// 全屏处理
function setFullScreen(){
	if($("#canvas_div").hasClass("full-screen")){
		$("#resize_div").removeClass("full-screen").attr("title","全屏");
		$("#left").removeClass("full-screen");
		$("#right").removeClass("full-screen");
		$("#right .titlebar").removeClass("full-screen");
		$("#task_table").removeClass("full-screen");
		$("#canvas_div").removeClass("full-screen");
	}else{
		$("#resize_div").addClass("full-screen").attr("title","退出全屏");
		$("#left").addClass("full-screen");
		$("#right").addClass("full-screen");
		$("#right .titlebar").addClass("full-screen");
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
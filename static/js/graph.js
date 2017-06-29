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
		}else if($(this).hasClass("run-tool")){
			alert("run");
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

	new ResizeSensor(jQuery('#canvas_div'), function(){ 
	    console.log( + "," +  g_graph.getWidth());
	    var canvasWidth = $('#canvas_div').width();
	    var canvasHeight = $('#canvas_div').height();
	    var graphWidth = g_graph.getWidth();
	    var graphHeight = g_graph.getHeight();

	    if(canvasWidth == graphWidth && canvasHeight == graphHeight){
	    	return;
	    }

	    g_graph.setSize(canvasWidth,canvasHeight);

	});
}

// 设置全屏
function launchFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.msRequestFullscreen){
    element.msRequestFullscreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullScreen();
  }
}


// 取消全屏
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

// 全屏处理
function setFullScreen(){
	var fullscreenElement =  document.fullscreenElement ||
		document.mozFullScreenElement ||  document.webkitFullscreenElement;
	if(fullscreenElement){
		exitFullscreen();
		$("#resize_div").attr("title","全屏");
	}else{
		launchFullscreen(document.getElementById("canvas_div"));
		$("#resize_div").attr("title","退出全屏");
	}
}
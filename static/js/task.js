function initPageEvent(){
	// 任务div滚动
	$("#task_table").scroll(function(){
		var processDiv = $(".process-div");
		processDiv.slideUp(200,function(){
			processDiv.remove();
			$("#task_table .active-row").removeClass("active-row");
		});
	});

	//退出
	$(".logout").click(function(){
		logout();
	});


	//排序切换
	$(".order-icon").click(function(){
		changeOrderBy(this);
	});

	// 所有模型
	$(".model-tool-div li").click(function(){
		showAllModelTask();
	});
}

// 切换状态
function changeState(){
	$(".task-state-div ul li").click(function(){
		if(g_state){
			window.clearInterval(g_state_int);
			g_state_int = null;
		}
		$(".task-state-div ul li").removeClass('active');
		$(this).addClass('active');
		var state = $(this).attr("state");
		g_order_field = "end_time"; 
		g_order = "desc";
		$(".order-icon").removeClass('asc active');
		$("span[field='end_time']").next().addClass("active")
		setState(state);
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

// 设置状态
function setState(state){
	g_state =  state;
	$(".process-div").remove();
	getStateCount(g_state,g_model_id, onGetStateCount);
}

// 获取状态个数
function getStateCount(state,model_id,callback){
	$("#task_table .row:not(.header)").remove();
	$("#count span").html("0");
	$(".pagination").empty();
	if(state == null){
		if(callback){
			var result = '{"status":"error","message":"state is null"}';
			callback(JSON.parse(result));
		}
		return;
	}

	var url = "/model/tasks/"  + model_id + "/" + state + "/count/";
	$.ajax({
		url : url,
		dataType : "text",
		async : true,
		success : function(json,textStatus){
			if(callback){
				var result = JSON.parse(json);
				callback(result.count);
			}
		},
		error :function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(XMLHttpRequest.status);
			if(callback){
				var result = '{"status":"error","message":"'  + XMLHttpRequest.status + '"}';
				callback(JSON.parse(result));
			}
		}	
	});	
}

// 获取任务列表
function getStateList(model_id,state,count,offset,field,orderby,callback){
	if(model_id == null ||state == null || count == null || offset == null){
		if(callback){
			var result = '{"status":"error","message":"parms is not valid"}';
			callback(JSON.parse(result));
		}
		return;
	}

	var url = "/model/tasks/" + model_id + "/" + state + "/list/" + count 
			+ "/" + offset + "/" + field + "/" + orderby + "/";
	$.ajax({
		url : url,
		dataType : "text",
		async : true,
		success : function(json,textStatus){
			if(callback){
				var result = JSON.parse(json);
				callback(result);
			}
		},
		error :function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(XMLHttpRequest.status);
			if(callback){
				var result = '{"status":"error","message":"'  + XMLHttpRequest.status + '"}';
				callback(JSON.parse(result));
			}
		}	
	});
}


function onGetStateCount(result){
	if(!result){
		return;
	}
	if(result.status == "error"){
		// alert(result.message);
		return;
	}

	var pageCount = Math.ceil(result/g_maxCount);
	g_pageCount = pageCount;

	$("#count span").html(result);

	initPageControl(1, g_pageCount);
	
}

// 按照页码获取
function getPage(page){
	if(page <= 0  || page > g_pageCount){
		return;
	}

	var offset = (page -1) * g_maxCount;

	$("#task_table .row:not(.header)").remove();
	$(".panel-content").addClass('loading');
	$(".process-div").remove();
	getStateList(g_model_id,g_state,g_maxCount,offset,g_order_field,g_order,onGetStateList);
}


function onGetStateList(json){
	$(".panel-content").removeClass('loading');
	var html = '';
	if(json.status == "error"){
		// alert(json.message);
		return;
	}
	json.forEach(function(t){
		var state = getState(t.state);
		var stateClass = getStateClass(t.state);
		var stateIcon = getStateIcon(t.state);
		var btnHtml = '';
		if(t.state == 1){
			btnHtml = '	<div class="cell"><a class="run-btn stop-btn" href="javascript:void(0)">停止</a></div>';
		}else{
			btnHtml = '	<div class="cell"><a class="run-btn" href="javascript:void(0)">运行</a></div>';
		}
		
		
		html += '<div class="row ' + stateClass + ' " uuid="' + t.uuid+ '">'
			+	'	<div class="cell state-icon ' + stateIcon + ' "></div>'
			+	'	<div class="cell">' + t.name + '</div>'
			+	'	<div class="cell">' + t.model_name + '</div>'
			+	'	<div class="cell">' + state + '</div>'
			+	'	<div class="cell">' + t.start_time + '</div>'
			+	'	<div class="cell">' + t.end_time + '</div>'
			+	'	<div class="cell">' + t.percent + '</div>'
			+	btnHtml
			+ 	'</div>';
	});

	$("#task_table .row:not(.header)").remove();
 	$("#task_table .task-header").after(html);

 	// 查看状态
 	$("#task_table .row:not(.header)").click(function(evt){
 		if(evt.target instanceof HTMLAnchorElement){
 			return;
 		}
 		var uuid = $(this).attr("uuid");
 		$("#task_table .row").removeClass("active-row");
 		$(this).addClass("active-row");
 		// 展开或者收缩状态面板
 		expandTaskState(uuid);
 	});

	// 运行
	$("#task_table .run-btn").click(function(){
		var taskId = $(this).parents(".row").attr("uuid");
		if($(this).hasClass("stop-btn")){
			// 点击停止按钮
			$(this).removeClass("stop-btn");
			$(this).html("运行");
			stopTask(taskId,function (result) {
				if(result.status == "success"){
					alert("停止成功");
					getTaskState(taskId,null);
				}else if(result.status == "error"){
					alert(result.message);
				}
            });
			window.clearInterval(g_state_int);
			g_state_int = null;
		}else{
			var btn = this;

			$(btn).addClass("stop-btn");
			$(btn).html("停止");
			$(btn).parents(".row:first").removeClass().addClass("row active-row running-row");
			$(btn).parents(".row:first").find(".cell:eq(3)").html("正在运行");
			$(btn).parents(".row:first").find(".cell:eq(5)").html("-");
			$(btn).parents(".row:first").find(".cell:eq(6)").html("0%");
			runTask(taskId,function(obj){
				window.clearInterval(g_state_int);
				g_state_int = null;
				obj.taskId = taskId;
				getTaskState(taskId,function(){
					setTimeout(function(){
						var taskName = $("#task_table .row[uuid='" + obj.taskId
							+ "'] .cell:eq(1)").html();

						if(obj.status == "success"){
							alert(taskName + " : 运行成功")
						}else if(obj.status == "error"){
							var message = obj.message;
							message.replace("\\\n","\n");
							console.log(message);
							alert(taskName + " :  " + message);
						}
					},10);
				});
				$("#task_table .run-btn").removeClass("stop-btn");
				$("#task_table .run-btn").html("运行");
			});
			// 开始运行就开始获取运行状态
			getRunningState(taskId);
		}		
	}); 	
}

// 获取运行状态
function getState(state){
	switch(state){
		case 0:
			return "未开始";
		case 1:
			return "正在运行";
		case 2:
			return "成功";
		case 3:
			return "失败";
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


	// 初始化页码
function initPageControl(currentPage,pageCount){
	if(currentPage <=0 || currentPage > pageCount){
		return;
	}
	var html = "";
	// 前一页
	if(currentPage == 1){
		html += '<li class="disabled">'
			+ '		<a href="javascript:void(0)" aria-label="Previous">'
			+ '			<span aria-hidden="true">«</span>'
			+ '		</a>'
			+ '	</li>';
	}else{
		html += '<li>'
			+ '		<a href="javascript:void(0)" aria-label="Previous">'
			+ '			<span aria-hidden="true">«</span>'
			+ '		</a>'
			+ '	</li>';
	}
	// 如果页码总数小于要展示的页码，则每个都显示
	if(pageCount <= g_pageNumber){
		for(var i = 1; i <= pageCount; ++i){
			if(i == currentPage){
				html += '<li class="active">'
				+ 	'	<a href="javascript:void(0)">' + currentPage.toString() 
				// + 	'		<span class="sr-only">(current)</span>'
				// + 	'		<span class="sr-only">(' + currentPage + ')</span>'
				+	'</a>'
				+ 	'</li>';
			}else{
				html += "<li>"
					+ "<a href='javascript:void(0)'>" + i + "</a>"
					+ "</li>";	
			}
		}	
	}else{
		// 开始不变化的页码
		var beginEndPage = pageCount - g_pageNumber + 1;
		if(currentPage <= beginEndPage){
			for(var i = currentPage; i < currentPage + g_pageNumber;++i){
				if(i == currentPage){
					html += '<li class="active">'
					+ 	'	<a href="javascript:void(0)">' + currentPage
					// + 	'		<span class="sr-only">(current)</span>'
					+	'</a>'
					+ 	'</li>';
				}else{
					html += "<li>"
						+ "<a href='javascript:void(0)'>" + i + "</a>"
						+ "</li>";	
				}					
			}
		}else{
			for(var i = beginEndPage; i <= pageCount; ++i){
				if(i == currentPage){
					html += '<li class="active">'
					+ 	'	<a href="javascript:void(0)">' + currentPage
					// + 	'		<span class="sr-only">(current)</span>'
					+	'</a>'
					+ 	'</li>';
				}else{
					html += "<li>"
						+ "<a href='javascript:void(0)'>" + i + "</a>"
						+ "</li>";	
				}
			}
		}
	}
	
	// 最后一页
	if(currentPage == pageCount){
		html += '<li class="disabled">'
			+ '		<a href="javascript:void(0)" aria-label="Next">'
			+ '			<span aria-hidden="true">»</span>'
			+ '		</a>'
			+ '	</li>';
	}else{
		html += '<li>'
			+ '		<a href="javascript:void(0)" aria-label="Next">'
			+ '			<span aria-hidden="true">»</span>'
			+ '		</a>'
			+ '	</li>';
	}

	$(".pagination").html(html);

	registerPageEvent();

	getPage(currentPage);
}


function registerPageEvent(){
	$(".pagination li a").click(function(){
		var active = $(".pagination li.active a").html();
		var currentPage = parseInt(active);

		var label = $(this).attr("aria-label");
		if(label == "Previous"){
			currentPage = currentPage - 1;
		}else if(label == "Next"){
			currentPage = currentPage + 1;
		}else{
			currentPage = parseInt($(this).html());
		}
		
		initPageControl(currentPage,g_pageCount);
	});
}


// 展开或者收缩状态面板
// 展开运行对话框
function expandTaskState(taskId){
	if(taskId == null){
		return;
	}
	var processDiv = $(".process-div");
	if(processDiv.length == 1){
		var processId = processDiv.attr("uuid");
		if(processId == taskId){
			processDiv.slideUp(400,function(){
				$("#task_table .active-row").removeClass("active-row");
				processDiv.remove();
			});
			return;
		}else{
			processDiv.slideUp(400,function(){
				$("#task_table .active-row").removeClass("active-row");
				processDiv.remove();
			});
		}
	}

	var taskIsRunning = $("#task_table .row[uuid='" + taskId + "'] ").hasClass("active-row");
	if(taskIsRunning){
		// 有正在运行的状态
		window.clearInterval(g_state_int);
		g_state_int = null;
		// 开始获取运行状态
		getRunningState(taskId);
	}else{
		// 展示下面的进程窗口
		showTaskStateDiv(taskId);
		getTaskState(taskId);
	}
}

// 弹出进程状态窗口
function showTaskStateDiv(uuid){
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
			+	'		</div>'
			+	'	</div>'
			// +	'	<div class="process-close-btn">×</div>'
			+	'</div>';	
	var row = $("#task_table .row[uuid='" + uuid + "']");
	$("#task_table").after(html);
	var rect = row[0].getClientRects()[0];
	var top = rect.top + rect.height - 131;
	var bottom = rect.bottom;

	var table = $("#task_table");
	var tableRect = table[0].getClientRects()[0];
	var tableBottom = tableRect.bottom;
	if(tableBottom < bottom+131 ){
		top -= (122+33+1);
	}

	top = Math.floor(top-1);
	$(".process-div").css("top",top + "px").slideDown();	
	
	// $(".process-div .process-close-btn").click(function(){
	// 	var processDiv = $(".process-div");
	// 	processDiv.slideUp(400,function(){
	// 		processDiv.remove();
	// 	});
	// });		
}


// 获取运行状态
function getTaskState(taskId,callback){
	var url = "/model/task/" + taskId + "/state/";
	$.ajax({
		url : url,
		dataType : "text",
		async : true,
		success : function(json,textStatus){
			var stateJson = JSON.parse(json);
			$(".process-div .row:not('.header')").remove()
			var result = showTaskState(stateJson);
			if(callback){
				callback(result);
			}
		},
	 	error:function(xhr){
            alert("获取运行状态失败");
            console.log(xhr);
            if(callback){
            	callback("failed");
            }
        }			
	});
}


// 填充运行状态
function showTaskState(json){
	if(json == null){
		return "failed";
	}
	if(json.status == "error"){
		console.log(json.message);
		return "failed";
	}

	var processes = json.processes;
	if(processes == null){
		return;
	}
	var count = processes.length;

	var taskState = json.state;

	var processesHtml = '';
	processes.sort(function(a,b){
		return a.id - b.id;
	});
	for(var i = 0; i < processes.length;++i){
		var process = processes[i];
		var state = getState(process.state);
		var bgcolor = getBgColor(state);
		processesHtml += '<div class="row ' + bgcolor + '">'
						+'	<div class="cell">' + process.id + '</div>'
						+'	<div class="cell">' + process.name + '</div>'
						+'	<div class="cell">' + state + '</div>'
						+'	<div class="cell">' + process.start_time + '</div>'
						+'	<div class="cell">' + process.end_time + '</div>'
						+'	<div class="cell">' + process.percent + '</div>'
						+'</div>';
		
	}
	var uuid = json.uuid;
	
	var row = $("#task_table .row[uuid='" + uuid + "']");
	$(".process-div .process-header").after(processesHtml);
	var rect = row[0].getClientRects()[0];
	var top = rect.height + rect.top - 131;
	var bottom = rect.bottom;

	var table = $("#task_table");
	var tableRect = table[0].getClientRects()[0];
	var tableBottom = tableRect.bottom;
	if(tableBottom < bottom+131 ){
		top -= (122+33+1);
	}
	top = Math.floor(top-1);
	$(".process-div").css("top",top + "px").slideDown();

	// 是否更新该行
	var row = $("#task_table .row[uuid='" + uuid + "']");
	var rowState = row.find(".cell:eq(3)").html();
	var rowPercent = row.find(".cell:eq(6)").html();
	var state = getState(taskState);
	var percent = json.percent;
	if(state != rowState || rowPercent != percent){
		// 状态改变了，修改改行
		var stateClass = getStateClass(taskState);
		var stateIcon = getStateIcon(taskState);
		row.removeClass().addClass(stateClass + " row active-row");
		row.find(".cell:eq(0)").removeClass().addClass("cell state-icon "+ stateIcon);
		row.find(".cell:eq(3)").html(state);
		row.find(".cell:eq(4)").html(json.start_time);
		row.find(".cell:eq(5)").html(json.end_time);
		row.find(".cell:eq(6)").html(json.percent);
	}
	return taskState;
}

// 进度颜色
function getBgColor(state){
	switch(state){
		case "失败":
			return "bg-red";
		case "成功":
			return "bg-green";
		case "正在运行":
			return "bg-yellow";
	}
	return "bg-white";
}


// 任务运行
function runTask(taskId,callback){
	if(taskId == null){
		return;
	}
	var url = "/model/task/"+ taskId + "/run/";
	$.ajax({
		type:"get",
		url:url,
		contentType: "text/plain",
		dataType : "text",
		success:function(result){
			if(callback){
				callback(JSON.parse(result));
			}
		},
		error :function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(XMLHttpRequest.status);
			if(callback){
				var result = '{"status":"error","message":"'  + XMLHttpRequest.status + '"}';
				callback(JSON.parse(result));
			}
		}
	});
}


// 获取运行时的状态
function getRunningState(taskId){
	if(taskId == null){
		return;
	}

	// 展开当前面板
	var processDiv = $(".process-div");
	if(processDiv.length == 1){
		var processId = processDiv.attr("uuid");
		if(processId != taskId){
			processDiv.slideUp(400,function(){
				processDiv.remove();
				$("#task_table .active-row").removeClass("active-row");
				// 展示下面的进程窗口
				showTaskStateDiv(taskId);	
			});
		}
	}else{
		// 展示下面的进程窗口
		showTaskStateDiv(taskId);	
	}

	
	// 循环获取状态
	var startTime = new Date();
	if(g_state_int){
		window.clearInterval(g_state_int);
		g_state_int = null;
	}
	g_state_int = setInterval(function(){
		getTaskState(taskId,function(result){
			if(result != 1 ){
				window.clearInterval(g_state_int);
				g_state_int = null;
			}
		})
		var time = new Date();
		var delta = time  - startTime;
		if(delta > 10*60*1000){
			window.clearInterval(g_state_int);
			g_state_int = null;
		}
	},1000);
}

// 停止任务
function stopTask(taskId, callback) {
	if(taskId == null){
		if(callback){
			callback("taskId is null")
		}
		return;
	}
	var url = "/model/task/"+ taskId + "/stop/";
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
		},
		error :function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(XMLHttpRequest.status);
			if(callback){
				var result = '{"status":"error","message":"'  + XMLHttpRequest.status + '"}';
				callback(JSON.parse(result));
			}
		}
	});
}


// 排序切换
function changeOrderBy(element){
	var field = $(element).prev().attr("field");
	g_order_field = field;

	var isActive = $(element).hasClass('active');
	if(isActive){
		var order = $(element).hasClass('asc');
		if(order){
			g_order = "desc";
			$(element).removeClass('asc');
		}else{
			g_order = "asc";
			$(element).addClass('asc');
		}
	}else{
		$(".order-icon").removeClass('active');
		$(element).addClass('active');
		var order = $(element).hasClass('asc');
		if(order){
			g_order = "asc";
		}else{
			g_order = "desc";
		}
	}

	setState(g_state);
}
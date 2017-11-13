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
			 +	'	<div class="btns">'
			 +	'		<button class="monitor-btn" title="监听模型"></button>'
			 +	'		<button class="remove-btn" title="删除模型"></button>'
			 +	'	 </div>'
			 + 	'</div>'
	});

	$("#models_container").html(html);

	$("#models_container .model-item .model-name").click(function(){
		var item = $(this).parent();
		var uuid = item.attr("uuid");
		$("#models_container .model-item").removeClass("active");
		item.addClass("active");
		var name = item.attr("mname");
		$("#right .titlebar-title span").html("[" + name + "]");
		refreshModel(uuid);
		showTasks(uuid);
	});


	$("#models_container .model-item .remove-btn").click(function(event) {
		var row = $(this).parents(".model-item");
		var name = row.attr("mname");
		if(name == null){
			alert("请指定要删除的模型");
			return;
		}
		if(!confirm("确定删除[" + name + "]模型?")){
			return;
		}
		var uuid = row.attr("uuid");
		if(uuid){
			deleteModel(uuid,function(result){
				if(result.status == "success"){
					alert("删除成功");
					g_graph.clear();
					var processDiv = $(".process-div");
					processDiv.slideUp(400,function(){
						processDiv.remove();
					});
					$("#task_table .table .row:not(.header)").remove();
					$("#right .titlebar-title span").html("");
					setNoEdit();
					$("#backdrop .image-icon").remove();
					loadModels();
				}else{
					alert(result.error);
				}
			});
		}
	});

	// 弹出监听窗口
	$("#models_container .model-item .monitor-btn").click(function(event){
		var row = $(this).parents(".model-item");
		var uuid = row.attr("uuid");
		g_graph.clear();
		$("#task_table .row.active-row").removeClass('active-row');
		$(".process-div").remove(),
		getModel(uuid,function(result){
			showModel(result);
			var dlg = new MonitorDialog(function(){
				refreshModel(uuid);
			},function(){
				refreshModel(uuid);
			});
			dlg.show();
		});
		
	});

	if(g_new_model){
		$("#models_container .model-item").removeClass("active");
		$("#models_container .model-item[uuid='" + g_new_model + "']").addClass("active");
		g_new_model = null;
		var name = $("#models_container .model-item.active").attr("mname");
		$("#right .titlebar-title span").html("[" + name + "]");
		$(".process-div").remove();
		$("#task_table .table .row:not(.header)").remove();
		$("#backdrop .image-icon").remove();
		if(g_helper.isShow()){
			g_helper.show(3);
		}
	}else{
		// 默认打开第一个
		var modelFirst = $("#models_container .model-item:first");
		if(modelFirst.attr("uuid")){
			var name =modelFirst.attr("mname");
			$("#right .titlebar-title span").html("[" + name + "]");
			modelFirst.addClass("active");
			refreshModel(modelFirst.attr("uuid"));
			showTasks(modelFirst.attr("uuid"))
		}
	}
}


function refreshModel(uuid){
	g_graph.clear();
	getModel(uuid,showModel);
}
// 读取某个模型
function getModel(uuid,callback){
	if(uuid ==null){
		return;
	}
	
	var url = "/model/model/" + uuid + "/";
	$.ajax({
		url : url,
		dataType : "text",
		async : true,
		success : function(json,textStatus){
			var result = JSON.parse(json);
			if(callback){
				callback(json);
			}
		},
	 	error:function(xhr){
            alert("读取模型失败");
            console.log(xhr);
        }	
	});
}


function showModel(result){
	if(result.status == "error"){
		alert(result.message);
		return;
	}
	g_graph.setNodeEditable(false);
	g_graph.load(result);
	setNoEdit();
}

// 获取任务列表
function getTasks(model_id,state,count,offset,field,orderby,callback){
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


function showTaskList(json){
	if(json == null){
		return;
	}
	if(json.status == "error"){
		alert(json.message);
		return;
	}

	var html = '';
	json.forEach(function(t){
		var state = getState(t.state);
		var stateClass = getStateClass(t.state);
		var stateIcon = getStateIcon(t.state);
		var btnHtml = '';
		if(t.state == 1){
			btnHtml = '	<div class="cell"><button class="run-btn stop-btn">停止</button>'
			+ '<button class="show-results-btn">查看结果</button></div>';
		}else{
			btnHtml = '	<div class="cell"><button class="run-btn">运行</button>'
					+ '<button class="show-results-btn">查看结果</button></div>';
		}
		
		
		html += '<div class="row ' + stateClass + ' " uuid="' + t.uuid+ '">'
			+	'	<div class="cell state-icon ' + stateIcon + ' "></div>'
			+	'	<div class="cell">' + t.name + '</div>'
			+	'	<div class="cell">' + state + '</div>'
			+	'	<div class="cell">' + t.start_time + '</div>'
			+	'	<div class="cell">' + t.end_time + '</div>'
			+	'	<div class="cell">' + t.percent + '</div>'
			+	btnHtml
			+ 	'</div>';
	});
	$("#task_table .table .row:not(.header)").remove();
 	$("#task_table .task-header").after(html);

 	// 点击任务行
	$("#task_table .row:not(.header)").click(function(evt){
		if(evt.target instanceof HTMLButtonElement){
			return;
		}
		var uuid = $(this).attr("uuid");
		setActiveTaskRow(uuid)
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
			// 先判断是不是activerow
			var isActive = $(this).parents(".row").hasClass('active-row');
			if(isActive){
				// 当前是active
				// 先校验任务是否已经设定了
				var result = g_graph.verify();
				if(result != "success"){
					alert(result);
					return;
				}
				if(g_helper.isShow()){
					g_helper.show(24);
				}
				// 设置为不可编辑状态
				setNoEdit();
				// 先保存再运行
				var text = g_graph.export();
				var btn = this;
				saveTask(taskId,text,function(result){
					$(btn).addClass("stop-btn");
					$(btn).html("停止");
					$(btn).parents(".row:first").find(".cell:eq(2)").html("running");
					$(btn).parents(".row:first").find(".cell:eq(5)").html("0%");
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
				});
			}else{
				// 不是active，直接运行。无需保存
				// 激活当前行
				setActiveTaskRow(taskId);
				$(btn).addClass("stop-btn");
				$(btn).html("停止");
				setActiveTaskRow(taskId);
				$(btn).parents(".row:first").find(".cell:eq(2)").html("running");
				$(btn).parents(".row:first").find(".cell:eq(5)").html("0%");
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
		}		
	});

	// 查看结果
	$("#task_table .show-results-btn").click(function(){
		var taskId = $(this).parents(".row").attr("uuid");
		showResultIcons(taskId);
	});

	// 是否有新建的task
	if(g_new_task){
		setActiveTaskRow(g_new_task)
		var row = $("#task_table .row[uuid='" + g_new_task + "']");
		// 滚动到新的位置
		var div = $('#task_table');
		div.animate({
		    scrollTop: row.offset().top - div.offset().top + div.scrollTop()
		},1000)
		g_new_task = null;
		if(g_helper.isShow()){
			g_helper.show(23);
		}
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
				processDiv.remove();
			});
			return;
		}else{
			processDiv.slideUp(400,function(){
				processDiv.remove();
			});
		}
	}

	var taskIsRunning = $("#task_table .row[uuid='" + taskId + "'] ").hasClass("active-row");
	if(g_state_int && taskIsRunning){
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
			+	'	<div class="process-close-btn">×</div>'
			+	'</div>';	
	var row = $("#task_table .row[uuid='" + uuid + "']");
	$("#task_table").after(html);
	var rect = row[0].getClientRects()[0];
	var top = rect.top + rect.height - 60;
	var left = 0;
	$(".process-div").css("left",left + "px").css("top",top + "px").slideDown();	
	
	$(".process-div .process-close-btn").click(function(){
		var processDiv = $(".process-div");
		processDiv.slideUp(400,function(){
			processDiv.remove();
		});
	});		
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
		// 闪烁running的node
		var nodeID = process.node_id;
		var node = g_graph.getNodeById(nodeID);
		if(node){
			if(process.state == 1){
				node.setShapeAttr("fill","#ffff00");
				node.blink();
			}else{
				node.stopBlink();
				if(process.state == 2){
					node.setShapeAttr("fill","#0f0");
				}else if(process.state == 0){
					node.setShapeAttr("fill","#ffb6bb");
				}else if(process.state == 3){
					node.setShapeAttr("fill","#da3732");
				}
			}
		}
		
	}
	var uuid = json.uuid;
	
	var row = $("#task_table .row[uuid='" + uuid + "']");
	$(".process-div .process-header").after(processesHtml);
	var rect = row[0].getClientRects()[0];
	var top = rect.height + rect.top - 60;
	var left = 0;
	$(".process-div").css("left",left + "px").css("top",top + "px").slideDown();

	// 是否更新该行
	var row = $("#task_table .row[uuid='" + uuid + "']");
	var rowState = row.find(".cell:eq(2)").html();
	var rowPercent = row.find(".cell:eq(5)").html();
	var state = getState(taskState);
	var percent = json.percent;
	if(state != rowState || rowPercent != percent){
		// 状态改变了，修改改行
		var stateClass = getStateClass(taskState);
		var stateIcon = getStateIcon(taskState);
		row.removeClass().addClass(stateClass + " row active-row");
		row.find(".cell:eq(0)").removeClass().addClass("cell state-icon "+ stateIcon);
		row.find(".cell:eq(2)").html(state);
		row.find(".cell:eq(3)").html(json.start_time);
		row.find(".cell:eq(4)").html(json.end_time);
		row.find(".cell:eq(5)").html(json.percent);
	}
	return taskState;
}

function getBgColor(state){
	switch(state){
		case "failed":
			return "bg-red";
		case "completed":
			return "bg-green";
		case "running":
			return "bg-yellow";
	}
	return "bg-white";
}


// 保存模型
function saveModel(text,callback){
	$.ajax({
		type:"POST",
		url:"/model/" + g_username + "/model/save/",
		data : text,
		contentType: "text/plain",
		dataType : "text",
		success:function(result){
			if(callback){
				callback(JSON.parse(result));
			}
		},
		error:function(xhr){
            alert("保存模型失败");
            console.log(xhr);
        }	
	});	
}

// 删除模型
function deleteModel(uuid,callback){
	var url = "/model/model/" + uuid + "/delete/";
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
		error:function(xhr){
            alert("删除模型失败");
            console.log(xhr);
        }		
	});
}


// 创建任务
function createTask(modelId,taskName,callback){
	if(modelId == null){
		return ;
	}

	var text = '{"model":"' + modelId + '","name":"' + taskName + '"}';
	var url = "/model/task/create/";
	$.ajax({
		type:"POST",
		url:url,
		data:text,
		contentType: "text/plain",
		dataType : "text",
		success:function(result){
			if(callback){
				callback(JSON.parse(result));
			}
		},
		error:function(xhr){
            alert("创建任务失败");
            console.log(xhr);
        }
	});
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

// 显示运行结果
function showResultIcons(taskId){
	if(taskId == null){
		return;
	}

	// 先设置为不可编辑状态，否则展示没有意义
	setNoEdit();

	var nodes = g_graph.getData();
	var html = "";
	var iconWidth = 48;
	var iconHeight = 48;
	for(var i = 0; i < nodes.length; ++i){
		var node = nodes[i];
		if(node){
			var name = node.getName();
			var flag = false;
			if(name.lastIndexOf(".tiff")!= -1 || name.lastIndexOf(".tif") != -1){
				flag = true;
			}
			var center = node.getCenter();
			if(center){
				var x = center.x;
				var y = center.y;
				x -= iconWidth/2;
				y -= iconHeight +10;
				html += '<div class="image-icon" style="top:' + y + 'px;left:' 
					+  x + 'px" tid="' + taskId + '" nid="' +  node.getID() 
					+ '" '+  (!flag?"": 'tiff="true"' )+ '></div>';
			}
		}
	}
	$("#backdrop").html(html);
	// 点击弹出窗口
	$("#backdrop .image-icon").click(function(){
		var taskID = $(this).attr("tid");
		var nodeID = $(this).attr("nid");
		var src = "/model/task/" + taskId + "/download/" + nodeID + "/";
		src += "?time=" + (new Date()).valueOf();
		var tiff = $(this).attr("tiff");
		var modal = document.getElementById('myModal');
		var modalImg = document.getElementById("img01");
		var caption = $(".modal #caption");
		modalImg.src = "";
		caption.html("");
		$(modal).addClass("loading active");
   		$.ajax({
			type:"get",
			url:src,
			// contentType: "image/jpeg",
			dataType : "text",
			success:function(result){
				$(modal).removeClass("loading");
				function isJson(str){
					try{
						JSON.parse(result);
					}
					catch(e){
						return false;
					}
					return true;
				}
				
				if(isJson(result)){
					var message = JSON.parse(result).message;
					var html = "暂不提供预览";
					if(message == "no task"){
						html = "没有该任务";
					}else if(message == "no node"){
						html = "没有该节点";
					}else if(message == "no file"){
						html = "没有该文件";
					}else if(message == "not a file"){
						html = "该路径不是一个文件";
					}
					caption.html(html);
					modalImg.src = "";
				}else{
					
					var html = "";
					if(tiff == "true"){
						modalImg.src = "";
						html += "<div>暂时不支持tif文件的预览</div>"
					}else{
						modalImg.src = src;								   			
					}
					html += "<a href='" +  src + "' download='img.png'>下载文件</a>";
			   		caption.html(html);
				}
			},
			error:function(xhr){
				$("#myModal").removeClass("loading");
	            alert("下载文件失败");
	            console.log(xhr);
	        }			
		});
	});
}

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

// 展示任务的graph
function showTaskGraph(task_id){
	if(!task_id){
		return;
	}

	getTask(task_id,function(text){
		g_graph.setNodeEditable(true);
		g_graph.load(text);
		setNoEdit()
	});

}

// 获取task的text
function getTask(task_id,callback){
	if(!task_id){
		if(callback){
			callback("task id  is null")
		}
		return;
	}
	var url = "/model/task/"+ task_id + "/get/";
	$.ajax({
		type:"get",
		url:url,
		contentType: "text/plain",
		dataType : "text",
		success:function(result){
			console.log(result);
			if(callback){
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

// 保存task的text
function saveTask(task_id,text,callback){
	if(!task_id || !text){
		if(callback){
			var result = '{"status":"error","message":"'  + "parms is invalid" + '"}';
			callback(JSON.parse(result));
		}
		return;
	}
	$.ajax({
		type:"POST",
		url:"/model/task/" + task_id + "/save/",
		data : text,
		contentType: "text/plain",
		dataType : "text",
		success:function(result){
			if(callback){
				callback(JSON.parse(result));
			}
		},
		error:function(xhr){
            console.log(XMLHttpRequest.status);
			if(callback){
				var result = '{"status":"error","message":"'  + XMLHttpRequest.status + '"}';
				callback(JSON.parse(result));
			}
        }	
	});	
}

// 设置active任务row
function setActiveTaskRow(task_id){
	var activeRow = $("#task_table .row.active-row");
	if(activeRow.length>0){
		var activeTaskId = activeRow.attr("uuid");
		if(activeTaskId === task_id){
			return;
		}
	}
	
	$("#task_table .row").removeClass('active-row');
	$("#task_table .row[uuid='" + task_id + "']").addClass('active-row');
	showTaskGraph(task_id);
}

// 展示模型下面的任务
function showTasks(modelId){
	g_model_id = modelId;
	$(".process-div").remove(),
	$(".pagination").empty();
    $("#task_table .table .row:not(.header)").remove();	

    getTasksCount("4",modelId,onGetTasksCount);
}

// 获取任务个数
function getTasksCount(state,modelId,callback){
	if(state == null){
		if(callback){
			var result = '{"status":"error","message":"state is null"}';
			callback(JSON.parse(result));
		}
		return;
	}

	var url = "/model/tasks/"  + modelId + "/" + state + "/count/";
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


function onGetTasksCount(result){
	if(result.status == "error"){
		alert(result.message);
		return;
	}

	var pageCount = Math.ceil(result/g_maxCount);
	g_pageCount = pageCount;

	$("#task_count span").html(result);

	initPageControl(1, g_pageCount);
}

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

// 按照页码获取
function getPage(page){
	if(page <= 0  || page > g_pageCount){
		return;
	}

	var offset = (page -1) * g_maxCount;

	$("#task_table .row:not(.header)").remove();

	getTasks(g_model_id,"4",g_maxCount,offset,g_order_field,g_order,showTaskList);
}


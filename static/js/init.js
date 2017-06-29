var g_graph = null;
var g_new_model = null;
var g_func_type = null;

$().ready(function(){
	g_graph = new Graph("canvas");
	initPageEvent();
	initGraphEvent();
	loadModels();

});


function initPageEvent(){
	// 新建模型
	$(".new-model-btn").click(function(){
		var dlg = new CreateModelDialog(function(uuid){
			g_new_model = uuid;
			loadModels();
		});
		dlg.show();
	});	

	// 删除模型
	$(".delete-model-btn").click(function(){
		var row = $("#models_container .model-item.active");
		var name = row.attr("mname");
		if(!confirm("确定删除[" + name + "]模型?")){
			return;
		}
		var uuid = row.attr("uuid");
		if(uuid){
			deleteModel(uuid,function(result){
				alert(result);
			});
		}
	});

	// 新建任务
	$(".new-task-btn").click(function(){
		var dlg = new CreateTaskDialog(function(){
			var uuid = $("#models_container .model-item.active").attr("uuid");
			getTasks(uuid);
		});
		dlg.show();
	});
}
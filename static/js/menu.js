function menuEvent(){
	$(".float-menu i").click(function(i,index){
		if($(this).hasClass("menu-new")){
			createModel();
		}else if($(this).hasClass("menu-save")){
			var text = g_graph.export();
			saveModel(text,function(uuid){
				if(uuid.length == 36){
					alert("保存成功");
				}
			});
		}else if($(this).hasClass("menu-refresh")){
			refreshModel();
		}

	});
}

function createModel(){
	var dlg = new CreateModelDialog(function(uuid){
		g_new_model = uuid;
		getModels();
	});
	dlg.show();
}


// 刷新模型
function refreshModel(){
	if(!confirm("刷新前请保存模型，否则将丢失，确定要刷新么？")){
		return;
	}
	var modelItem = $(".model-item.active");
	getModel(modelItem.attr("uuid"));
	getTasks(modelItem.attr("uuid"));
}

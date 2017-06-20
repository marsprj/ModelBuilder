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


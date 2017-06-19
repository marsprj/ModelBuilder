function menuEvent(){
	$(".float-menu i").click(function(i,index){
		if($(this).hasClass("menu-new")){
			createModel();
		}else if($(this).hasClass("menu-save")){
			saveModel();
		}

	});
}

function createModel(){
	g_graph.clear();
}

function saveModel(){
	alert("save");
}
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
	$(".new-model-btn").click(function(){
		var dlg = new CreateModelDialog(function(uuid){
			g_new_model = uuid;
			loadModels();
		});
		dlg.show();
	});	
}
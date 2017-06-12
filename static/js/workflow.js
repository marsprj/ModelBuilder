//=====================================================
var input, output, func;
//绘制链接线的状态
var STATE = {
	DRAW : "draw",
	CONNECT : "connect",
	NONE : "none"
}
var CONNECT_STATE = {		
	READY : "ready",
	CONNECTING : "connecting",
	NONE : "none"	
}
var g_state = STATE.CONNECT;
var g_connect_state = CONNECT_STATE.NONE;
//=====================================================

//=====================================================
// Global Variables Begin
//=====================================================
var g_graph = null;
var g_func_type = null;

var g_functions = [{
		name : "Stretch",
		description : "拉伸"
	},{
		name : "Fusion",
		description : "融合"
	}
]
//=====================================================
// Global Variables Begin
//=====================================================

//=====================================================
// Test Begin
//=====================================================
var g_dlg;
//=====================================================
// Test End
//=====================================================

$().ready(function(){

	g_graph = new Graph("canvas");

	loadFunctions();
	initMenuEvents();
	initNodeEvents();

	initGraph();

	// g_dlg = new StretchDialog();
	// g_dlg = new FileDialog();
	// g_dlg.show();
})

function initGraph(){

	var input_1_1 = g_graph.createDatumNode(50, 50, 100, 50);
	var input_1_2 = g_graph.createDatumNode(50, 150, 100, 50);
	var output_1  = g_graph.createDatumNode(350, 100, 100, 50);
	var func_1    = g_graph.createFuncNode(FUNCTION_TYPE.Fusion, 200, 100, 100, 50);
	var conn_1_1  = g_graph.createEdge(input_1_1, func_1);
	var conn_1_2  = g_graph.createEdge(input_1_2, func_1);
	var conn_1_3  = g_graph.createEdge(func_1, output_1);

	var input_2_1 = g_graph.createDatumNode(50, 300, 100, 50);
	//var func_2    = g_graph.createFuncNode(200, 300, 100, 50);
	var func_2    = g_graph.createFuncNode(FUNCTION_TYPE.Stretch, 200, 300, 100, 50);
	var output_2  = g_graph.createDatumNode(350, 300, 100, 50);
	var conn_2_1  = g_graph.createEdge(input_2_1, func_2);
	var conn_2_2  = g_graph.createEdge(func_2, output_2);

	var func_3    = g_graph.createFuncNode(FUNCTION_TYPE.Fusion, 600, 200, 100, 50);
	var output_3  = g_graph.createDatumNode(800, 200, 100, 50);
	var conn_3_1  = g_graph.createEdge(output_1, func_3);
	var conn_3_2  = g_graph.createEdge(output_2, func_3);
	var conn_3_3  = g_graph.createEdge(func_3, output_3);

	//设置值
	input_1_1.setPath("/raster/fusion1_raster_1.tif");
	input_1_2.setPath("/raster/fusion1_raster_2.tif");
	output_1.setPath("/raster/fusion1_output_1.tif");

	input_2_1.setPath("/raster/stretch/stretch_1.tif");
	output_2.setPath("/raster/stretch/stretch_output_1.tif");

	output_3.setPath("/raster/model/output.tif");
}

function initMenuEvents(){
	// $("#add").click(function(){
	// 	alert("add");
	// })

	$("#add").mouseover(function(){
		console.log("mouse over");
	})

	$("#add").mouseout(function(){
		console.log("mouse out");
	})

	$("#sel").click(function(){
		g_graph.stopConnecting();
		g_graph.draggable();
	})
	$("#conn").click(function(){
		g_graph.undrag();
		g_graph.startConnecting();
	})
	$("#save").click(function(){
		document.getElementById("result").innerHTML = g_graph.export();
	})
	$("#load").click(function(){
		//alert("load");
		loadGraph();		
	})
	$("#run").click(function(){
		g_graph.serialize();
		document.getElementById("result").innerHTML = g_graph.getWorkflowText();
		
	})

	$("#adddata").click(function(){
		g_graph.setState(GRAPH_STATE.ADDDATA);
	})
	$("#addfunc").click(function(){
		g_graph.setState(GRAPH_STATE.ADDFUNC);
	})
}

function initNodeEvents(){
	$(".func").click(function(){
		g_func_type = $(this).attr("id");
		console.log(g_func_type);

		$(".func_wrapper").css("background-color", "#ffffff");
		$(this).parent().css("background-color", "#dff1f9");
	})
}

function loadFunctions(){
	var html = "";
	g_functions.forEach(function(f){
		//html += "<div class='func' id='" + f.name + "'>" + f.description + "</div>";	
		html += "<div class='func_wrapper'>";
		html += "	<div class='func_icon'></div>";
		html += "	<div class='func' id='" + f.name + "'>" + f.description + "</div>";
		html += "</div>";
	})
	document.getElementById("func_container").innerHTML = html;
}

function loadGraph(){

	var text = '{"name":"my model","functions":[{"id":"dflgo","name":"Fusion","inputs":[{"id":"wyfzh"},{"id":"dwqe4"}],"output":{"id":"zbcqk"}},{"id":"4tgfo","name":"Stretch","inputs":[{"id":"4f152"}],"output":{"id":"ryqdc"}},{"id":"5fa6f","name":"Fusion","inputs":[{"id":"zbcqk"},{"id":"ryqdc"}],"output":{"id":"nwyes"}}],"data":[{"id":"wyfzh","path":"/raster/fusion1_raster_1.tif"},{"id":"dwqe4","path":"/raster/fusion1_raster_2.tif"},{"id":"zbcqk","path":"/raster/fusion1_output_1.tif"},{"id":"4f152","path":"/raster/stretch/stretch_1.tif"},{"id":"ryqdc","path":"/raster/stretch/stretch_output_1.tif"},{"id":"nwyes","path":"/raster/model/output.tif"}],"connections":[{"from":"wyfzh","to":"dflgo"},{"from":"dwqe4","to":"dflgo"},{"from":"dflgo","to":"zbcqk"},{"from":"4f152","to":"4tgfo"},{"from":"4tgfo","to":"ryqdc"},{"from":"zbcqk","to":"5fa6f"},{"from":"ryqdc","to":"5fa6f"},{"from":"5fa6f","to":"nwyes"}]}';
	g_graph.load(text);	
}
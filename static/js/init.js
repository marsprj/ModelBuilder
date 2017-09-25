	"use strict";
var g_graph = null;
var g_new_model = null;
var g_func_type = null;
var g_new_task = null;
var g_username = null;
var g_helper = null;


// 状态获取的循环器
var g_state_int = null;

$().ready(function(){

	user_init();
});


function user_init() {
    var username = getCookie("username");
    if(username){
		g_username = username;
		$("#main").show();
		$(".user-name").html("用户&nbsp;:&nbsp;" + username);
		g_graph = new Graph("canvas");
		setNoEdit();
		g_helper = new BeginnerHelper();
		initPageEvent();
		initGraphEvent();
		loadModels();
    }else{
        window.location.href = "login.html";
    }
}


function getCookie(name){
    var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
    if(arr != null) return unescape(arr[2]); return null;
}


function initPageEvent(){
	// 新手引导
	$(".user-helper").click(function(){
		g_helper.show(1);
	});

	//退出
	$(".logout").click(function(){
		logout();
	});

	// 新建模型
	$(".new-model-btn").click(function(){
		var dlg = new CreateModelDialog(function(result){
			if(result.status == "error"){
				alert(result.message);
				return;
			}
			g_new_model = result.uuid;
			loadModels();
		});
		dlg.show();
		if(g_helper.isShow()){
			g_helper.show(2);
		}
	});	

	// 删除模型
	$(".delete-model-btn").click(function(){
		var row = $("#models_container .model-item.active");
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
					$("#backdrop .image-icon").remove();
					setNoEdit();
					loadModels();
				}else{
					alert(result.error);
				}
			});
		}
	});

	// 新建任务
	$(".new-task-btn").click(function(){
		var dlg = new CreateTaskDialog(function(taskId){
			g_new_task= taskId;
			var uuid = $("#models_container .model-item.active").attr("uuid");
			getTasks(uuid);
		});
		dlg.show();
		if(g_helper.isShow()){
			g_helper.show(22);
		}
	});

	// 任务div滚动
	$("#task_table").scroll(function(){
		var processDiv = $(".process-div");
		processDiv.slideUp(200,function(){

		});
	});

	//窗口改变
	$(window).resize(function() {
		if(g_graph){
			var width = $("#canvas").width();
			var height = $("#canvas").height();
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
	});


	$("#myModal .close").click(function(event) {
		$("#myModal").removeClass('active');
	});

	$("#myModal").click(function(e){
		if(e.target instanceof HTMLAnchorElement){
			return;
		}
		$("#myModal").removeClass('active');
	});

	// 加载算法库
	loadFuns();
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
            $(".info").html("注销失败");
            console.log(xhr);
        }
	});
}

function loadFuns(){
	var html = loadFunType(g_funCatalog,1);
	$(".funcs_container").html(html);

	$(".funcs_container a").click(function(event) {
		var next = $(this).parent().next();
		if(next.length >0 && next[0] instanceof HTMLUListElement){
			if(next.hasClass("shown")){
				next.removeClass('shown');
				next.slideUp();
			}else{
				next.addClass('shown');
				next.slideDown();
			}
		}else{
			var ftype = $(this).attr("ftype");
			if(ftype){
				$("#funcs a").removeClass("active");
				$("#data_div").removeClass("active");
				$(this).addClass("active");		
				g_graph.setState(GRAPH_STATE.ADDFUNC);
				g_func_type = ftype;
			}
		}
	});
}

function loadFunType(catalog,deep){
	var html = '<ul>';
	if(deep == 1){
 		html = '<ul style="display:block">';
	}
	for(var  i = 0; i < catalog.length; ++i){
		var obj = catalog[i];
		var name = obj.name;
		var type = obj.type;
		var items = obj.items;
		if(items){
			html += '<li>'
				+'		<a href="javascript:void(0)" class="func_node" deep="' + deep + '">' + name + '</a>'
				+'	</li>';
			html += loadFunType(items,deep+1);
		}else{
			html += '<li>'
				+'		<a href="javascript:void(0)"  deep="' + deep + '" ftype="' + type + '">' + name + '</a>'
				+'	</li>';
		}
	}
	html += '</ul>';
	return html;
}
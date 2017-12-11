	"use strict";
var g_graph = null;
var g_new_model = null;
var g_func_type = null;
var g_new_task = null;
var g_username = null;
var g_helper = null;

var g_model_id = null;
// 页码个数
var g_pageNumber = 5;
// 每页的个数
var g_maxCount = 10;
// 页码
var g_pageCount = null;

// 排序字段
var g_order_field = "start_time";

// 升序or降序
var g_order = "desc";

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
		$(".dialog").remove();
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
			showTasks(uuid);
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

	// 算法库伸缩
	$("#funcs .funcs-icon").click(function(){
		if($(this).hasClass('funcs-min-icon')){
			$(this).removeClass('funcs-min-icon').addClass('funcs-max-icon').attr("title","展开");
			$(".funcs_container").slideUp(400,function(){
				
			});
		}else if ($(this).hasClass('funcs-max-icon')) {
			$(this).removeClass('funcs-max-icon').addClass('funcs-min-icon').attr("title","收起");
			$(".funcs_container").slideDown(400,function(){
				
			});
		}
	});


	// 算法库移动
	moveCanvasElement($("#funcs"));
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
				$(this).attr("content"," + ");
				next.removeClass('shown');
				next.slideUp();
			}else{
				$(this).attr("content"," - ");
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
				+'		<a href="javascript:void(0)" class="func_node" deep="' + deep + '" content=" + ">' + name + '</a>'
				+'	</li>';
			html += loadFunType(items,deep+1);
		}else{
			html += '<li>'
				+'		<a href="javascript:void(0)"  deep="' + deep + '" ftype="' + type + '" content=" - ">' + name + '</a>'
				+'	</li>';
		}
	}
	html += '</ul>';
	return html;
}


function moveCanvasElement(element){
	if(element.length == 0){
		return;
	}

	var parentElement = $("#canvas_div");
	if(parentElement.length == 0){
		return;
	}
	var onMouseDown = function (e) {
		var o_x = e.clientX;
		var o_y = e.clientY;
		var onMouseMove = function (e) {

			var s_x = e.clientX - o_x;
			var s_y = e.clientY - o_y;

			var top = element.offset().top - parentElement.offset().top;
			var left = element.offset().left - parentElement.offset().left;

			left += s_x;
			top += s_y;
			o_x = e.clientX;
			o_y = e.clientY;
			element.css("left",left + "px").css("top",top + "px");

        }
        var onMouseUp = function (e) {
			parentElement[0].removeEventListener("mousemove",onMouseMove);
			parentElement[0].removeEventListener("mouseup",onMouseUp);
        }

		parentElement[0].addEventListener("mousemove",onMouseMove);
		parentElement[0].addEventListener("mouseup",onMouseUp);

    }

    element[0].addEventListener("mousedown",onMouseDown);
}
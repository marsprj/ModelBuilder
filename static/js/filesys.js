var g_selected = "";

$().ready(function(){

	var path = $("#fs-location:first").val();
	registerEvents();
	populateFolders(path);
})

function registerEvents(){
	//上一级
	$("#fs-upward").click(onUpwards);
	$("#fs-create").click(onCreate);
	$("#fs-remove").click(onDelete);
	$("#fs-upload").click(onUpload);
}

function populateFolders(path){

	g_selected = "";

	var data = '{"path":"' + path + '"}';
	
	$.ajax({
		type:"POST",
		url:"/file/list/",
		data : data,
		contentType: "text/plain",
		dataType : "text",
		success:function(data){
			json = JSON.parse(data)
			populateFolderPanel(json);
			populateFilePanel(json);
		}
	});

}

function populateFolderPanel(folders){
	var html = "";
	for(var i in folders){
		var o = folders[i];
		if(o.type == "folder"){
			html += "<div class='fs-folder-item'>";
			html += "	<div class='fs-folder-icon'></div>";
			html += "	<div class='fs-folder-text'>" + o.name +"</div>";
			html += "</div>";	
		}
	}
	document.getElementById("fs-folder").innerHTML = html;

	//单击事件
	$(".fs-folder-item").click(function(){
		// alert($(this).find(".fs-folder-text:first").text());
		var folder_name = $(this).find(".fs-folder-text:first").text();
	})

	//双击事件
	$(".fs-folder-item").dblclick(function(){
		var folder_name = $(this).find(".fs-folder-text:first").text();
		var current_path = $("#fs-location:first").val();
		var new_path = current_path + folder_name + "/";
		$("#fs-location:first").val(new_path);

		populateFolders(new_path);
	})
}

function populateFilePanel(files){
	var html = "";
	// for(var i in files){
	// 	var o = files[i];
	// 	var icon = (o.type == "folder" ? "fs-folder-icon" : "fs-file-icon");
	// 	{
	// 		html += "<div class='fs-file-item'>";
	// 		html += "	<div class='" + icon + "'></div>";
	// 		html += "	<div class='fs-folder-text'>" + o.name +"</div>";
	// 		html += "</div>";	
	// 	}
	// }

	for(var i in files){
		var o = files[i];
		if(o.type == "folder"){
			html += "<div class='fs-folder-item-2'>";
			html += "	<div class='fs-folder-icon'></div>";
			html += "	<div class='fs-folder-text'>" + o.name +"</div>";
			html += "</div>";	
		}
	}

	for(var i in files){
		var o = files[i];
		if(o.type != "folder"){
			html += "<div class='fs-file-item'>";
			html += "	<div class='fs-file-icon'></div>";
			html += "	<div class='fs-folder-text'>" + o.name +"</div>";
			html += "</div>";	
		}
	}


	document.getElementById("fs-files").innerHTML = html;

		//单击事件
	$("#fs-files .fs-folder-item-2").click(function(){
		g_selected = $(this).find(".fs-folder-text:first").text();
		$(".fs-file-item").css("background-color", "#ffffff");
		$(this).css("background-color", "#e0ecf6");
	})

	$("#fs-files .fs-file-item").click(function(){
		g_selected = $(this).find(".fs-folder-text:first").text();
		$(".fs-file-item").css("background-color", "#ffffff");
		$(this).css("background-color", "#e0ecf6");
	})

	//双击事件
	$("#fs-files .fs-folder-item-2").dblclick(function(){
		var folder_name = $(this).find(".fs-folder-text:first").text();
		var current_path = $("#fs-location:first").val();
		var new_path = current_path + folder_name + "/";
		$("#fs-location:first").val(new_path);

		populateFolders(new_path);
	})
}

function onUpwards(){
	var cur_path = $("#fs-location:first").val();
	if(cur_path.length<=1){
		return;
	}
	
	var pos = cur_path.substring(0, cur_path.length-1).lastIndexOf("/");
	if(pos<0){
		return;
	}

	var new_path = cur_path.substring(0, pos+1);
	$("#fs-location:first").val(new_path);
	populateFolders(new_path);
}

function onCreate(){
	var cur_path = $("#fs-location:first").val();

	var that = this;
	var fname = Math.random().toString(36).substr(2);
	var fpath = makeFolderPath(cur_path, fname);

	var data = '{"path":"' + fpath + '"}';

	$.ajax({
		type:"POST",
		url:"/file/create/",
		data : data,//JSON.stringify(data),
		//data : JSON.stringify(data),
		contentType: "text/plain",
		dataType : "application/json",
		success : function(result,status_code){
			alert(result.status);
		},
		complete : function(request){
			//alert("complete")
			populateFolders(cur_path);
		}
	});
}

function onDelete(){
	var cur_path = $("#fs-location:first").val();

	fpath = makeFolderPath(cur_path, g_selected);
	var data = '{"path":"' + fpath + '"}';

	$.ajax({
		type:"POST",
		url:"/file/remove/",
		data : data,//JSON.stringify(data),
		//data : JSON.stringify(data),
		contentType: "text/plain",
		dataType : "application/json",
		success:function(result){
			alert(result.status);
		},
		complete:function(){
			populateFolders(cur_path);
		}
	});
}

function onUpload(){
	var cur_path = $("#fs-location:first").val();
	var dlg = new UploadDialog(cur_path, null, function(){
		populateFolders(cur_path);
	});
	dlg.show();
}

function makeFolderPath(folderPath, folderame){
	return folderPath + folderame + "/";
}
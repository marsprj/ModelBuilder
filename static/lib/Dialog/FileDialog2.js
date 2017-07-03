var FileDialog2 = function(path, onOK){

	Dialog.apply(this, arguments);
	
	this._folder_path = "";	//地址栏里的路径
	this._file_path = "";	//选中的完整文件路径
	this._file_name = "";	//选中的文件名
	this._file_type = "";	//选中的文件类型[文件(file)|文件夹(folder)]
	this._onOK = onOK;

	this.setPath(path ? path : "/");
	this.populateFolders();

	this.initUpwardEvent();
	this.initCreateFolderEvent();
	this.initDeleteFolderEvent();
}

extend(FileDialog2, Dialog)

// FileDialog2.prototype.initEvents = function(){
	
// 	//打开文件的点击事件
// 	this.initUpwardEvent();
// 	this.initFileEvent();
// 	this.initCloseEvent();
// 	this.initOkEvent();
// }


FileDialog2.prototype.initUpwardEvent = function(){

	var dlg = this;
	this._win.find(".dialog_folder_up:first").click(function(){
		dlg.upwards();
	});
}

FileDialog2.prototype.initCreateFolderEvent = function(){

	var dlg = this;
	this._win.find(".dialog_folder_add:first").click(function(){
		dlg.createFolder();
	});
}

FileDialog2.prototype.initDeleteFolderEvent = function(){

	var dlg = this;
	this._win.find(".dialog_folder_delete:first").click(function(){
		dlg.deleteFolder();
	});
}

FileDialog2.prototype.initFileEvent = function(){
	var dlg = this;
	this._win.find(".item_container").each(function(){
		var container = this;
		var type = $(this).attr("type");
		switch(type){
			case "folder":{
				$(this).dblclick(function(){
					//双击文件夹，进入该目录
					var curPath = dlg.getPath();
					var fldName = $(this).find('.folder_item_text:first').text();
					var newPath = dlg.makeFolderPath(curPath, fldName);
					dlg.setPath(newPath);
					dlg.populateFolders();
					dlg._file_path = null;
				});

				$(this).click(function(){
					//单击文件夹，选中该文件夹
					var curPath = dlg.getPath();
					var fldName = $(this).find('.folder_item_text:first').text();
					var newPath = dlg.makeFolderPath(curPath, fldName);
					dlg._file_path = newPath;
					dlg._file_name = fldName;
					dlg._file_type = "folder";
					$("#dialog_file_ctrl .item_container").css("background-color", "#ffffff");
					$(this).css("background-color", "#e0ecf6");
				});
			}
			break;
			case "file":{
				$(this).click(function(){
					//单击文件，选中该文件
					var curPath = dlg.getPath();
					var filName = $(this).find('.folder_item_text:first').text();
					dlg._file_path = dlg.makeFilePath(curPath, filName);
					dlg._file_name = filName;
					dlg._file_type = "file";

					$("#dialog_file_ctrl .item_container").css("background-color", "#ffffff");
					$(this).css("background-color", "#e0ecf6");
				});
			}
		}
	});	
}
 
FileDialog2.prototype.initCloseEvent = function(){
	var dlg = this;
	this._win.find(".dialog_exit:first").click(function(){
		dlg.destory();
	});

	this._win.find("#dlg_btn_exit:first").click(function(){
		dlg.destory();
	});
}

FileDialog2.prototype.initOkEvent = function(){
	var dlg = this;
	this._ok = true;
	
	this._win.find("#dlg_btn_ok:first").click(function(){
		dlg.destory();

		if(dlg._onOK){
			dlg._onOK();
		}
	});
}



FileDialog2.prototype.setPath = function(path){
	this._file_path = path;
	this._folder_path = "/";
	if(path[path.length-1]=="/"){
		this._folder_path = path;
		this._file_name = "";
	}
	else{
		this._folder_path = path.substring(0, path.lastIndexOf("/")+1);
		this._file_name = path.substring(path.lastIndexOf("/")+1, path.length);
	}

	$(".dialog_folder_path").attr("value", this._folder_path);
}

FileDialog2.prototype.getPath = function(path){
	return $(".dialog_folder_path").attr("value");	
}

FileDialog2.prototype.getFilePath = function(){
	return this._file_path;
}

FileDialog2.prototype.populateFolders = function(){
	// var json = [{
	// 		name : "raster",
	// 		type : "folder"
	// 	},{
	// 		name : "dem",
	// 		type : "folder"
	// 	},{
	// 		name : "vector",
	// 		type : "folder"
	// 	},{
	// 		name : "sar",
	// 		type : "folder"
	// 	},{
	// 		name : "world-1.tif",
	// 		type : "file"
	// 	},{
	// 		name : "world-2.jpg",
	// 		type : "file"
	// 	},{
	// 		name : "world-3.png",
	// 		type : "file"
	// 	}
	// ];
	// 
	// 
	var that = this;
	var data = '{"path":"' + this._folder_path + '"}';
	
	$.ajax({
			type:"POST",
			url:"/file/list/",
			data : data,//JSON.stringify(data),
			//data : JSON.stringify(data),
			contentType: "text/plain",
			dataType : "text",
			success:function(data){
				json = JSON.parse(data)
				var html = "";
				for(var i in json){
					var o = json[i];
					var icon = (o.type == "folder" ? "folder_item_icon" : "file_item_icon");
					html += "<div class='item_container' type='" + o.type + "'>";
					html += "<div class='" + icon + "'></div>";
					html += "<div class='folder_item_text'>" + o.name + "</div>";
					html += "</div>";
				}
				document.getElementById("dialog_file_ctrl").innerHTML = html;
				that.initFileEvent();
				// html  = "<table border='1'>";
				// obj.forEach(function(f){
				// 	html += "<tr>";
				// 	html += "<td>" + f.name + "</td>";
				// 	html += "<td>" + f.type + "</td>";
				// 	html += "</tr>";
				// })
				// html += "</table>";
				// document.getElementById("result").innerHTML = html;
			}
		});

	// var html = "";
	// for(var i in json){
	// 	var o = json[i];
	// 	var icon = (o.type == "folder" ? "folder_item_icon" : "file_item_icon");
	// 	html += "<div class='item_container' type='" + o.type + "'>";
	// 	html += "<div class='" + icon + "'></div>";
	// 	html += "<div class='folder_item_text'>" + o.name + "</div>";
	// 	html += "</div>";
	// }
	// document.getElementById("dialog_file_ctrl").innerHTML = html;
	// this.initFileEvent();
}

FileDialog2.prototype.upwards = function(){
	var curPath = this.getPath();
	if(curPath.length==0){
		return;
	}
	if(curPath == "/"){
		return;
	}

	var pos = curPath.lastIndexOf("/", curPath.length-2);
	if( pos>=0 ){
		var parentPath = curPath.substring(0, pos) + "/";
		this.setPath(parentPath);
		this.populateFolders();
	}
}

FileDialog2.prototype.createFolder = function(){
	if(!this._folder_path){
		return;
	}

	var that = this;
	var fname = Math.random().toString(36).substr(2);
	var fpath = this.makeFolderPath(this._folder_path, fname);

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
			that.populateFolders();
		}
	});

}

FileDialog2.prototype.deleteFolder = function(){
	if((!this._file_path)||(!this._file_name)){
		return;
	}

	var dlg = this;
	fpath = this.makeFolderPath(this._folder_path, this._file_name);
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
			dlg.populateFolders();
		}
	});
}

FileDialog2.prototype.makeFolderPath = function(folderPath, folderame){
	return folderPath + folderame + "/";
}

FileDialog2.prototype.makeFilePath = function(folderPath, fileName){
	return folderPath + fileName;
}

FileDialog2.prototype.onOK = function(func){
	this._onOK = func;
}


FileDialog2.prototype.create = function(){
	var html = "<div class='func_dialog file_dialog dialog'>"
			+"	<div class='titlebar'>"
			+"		<div class='dialog_title'>文件</div>"
			+"		<div class='dialog_exit'></div>"
			+"	</div>"
			+"	<div class='dialog_main'>"
			+"		<div class='dialog_file_path_wrapper'>"
			+"			<span>路径:</span>"
			+"			<input type='text' class='dialog_folder_path' readonly='readonly' value='/'>"
			+"			<ul>"
			+"				<li><div class='dialog_folder_up'></div></li>"
			+"				<li><div class='dialog_folder_add'></div></li>"
			+"				<li><div class='dialog_folder_delete'></div></li>"
			+"			</ul>"
			// +"			<div class='dialog_folder_up'></div>"
			// +"			<div class='dialog_folder_add'></div>"
			// +"			<div class='dialog_folder_delete'></div>"
			+"		</div>"
			+"		<div id='dialog_file_ctrl'>"
			// +"			<div class='item_container' type='folder'>"
			// +"				<div class='folder_item_icon'></div>"
			// +"				<div class='folder_item_text'>raster</div>"
			// +"			</div>"
			// +"			<div class='item_container' type='folder'>"
			// +"				<div class='folder_item_icon'></div>"
			// +"				<div class='folder_item_text'>dem</div>"
			// +"			</div>"
			// +"			<div class='item_container' type='folder'>"
			// +"				<div class='folder_item_icon'></div>"
			// +"				<div class='folder_item_text'>world-2.tif</div>"
			// +"			</div>"
			// +"			<div class='item_container' type='folder'>"
			// +"				<div class='folder_item_icon'></div>"
			// +"				<div class='folder_item_text'>world-2.tif</div>"
			// +"			</div>"
			// +"			<div class='item_container' type='folder'>"
			// +"				<div class='folder_item_icon'></div>"
			// +"				<div class='folder_item_text'>world-2.tif</div>"
			// +"			</div>"
			// +"			<div class='item_container' type='file'>"
			// +"				<div class='file_item_icon'></div>"
			// +"				<div class='folder_item_text'>raster</div>"
			// +"			</div>"
			// +"			<div class='item_container' type='file'>"
			// +"				<div class='file_item_icon'></div>"
			// +"				<div class='folder_item_text'>dem</div>"
			// +"			</div>"
			// +"			<div class='item_container' type='file'>"
			// +"				<div class='file_item_icon'></div>"
			// +"				<div class='folder_item_text'>world-2.tif</div>"
			// +"			</div>"
			// +"			<div class='item_container' type='file'>"
			// +"				<div class='file_item_icon'></div>"
			// +"				<div class='folder_item_text'>world-2.tif</div>"
			// +"			</div>"
			// +"			<div class='item_container' type='file'>"
			// +"				<div class='file_item_icon'></div>"
			// +"				<div class='folder_item_text'>world-2.tif</div>"
			// +"			</div>"
			+"		</div>"
			+"	</div>"
			+"	<div class='dialog_bottom'>"
			+"		<ul>"
			+"			<li>"
			+"				<a href='javascript:void(0)' id='dlg_btn_ok'>确定</a>"
			+"			</li>"
			+"			<li>"
			+"				<a href='javascript:void(0)' id='dlg_btn_exit'>取消</a>"
			+"			</li>"
			+"		</ul>"
			+"	</div>"
			+"</div>";					
	var dlg = $(html);
	$(".file_dialog").remove();
	$('body').append(dlg);
	return dlg;
}

FileDialog2.prototype.echo = function(){
	alert("file dialog");
}
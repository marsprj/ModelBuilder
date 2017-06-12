var FileDialog = function(path, onOK){

	Dialog.apply(this, arguments);

	this._file_path = null;
	this._onOK = onOK;

	this.setPath(path ? path : "/");
	this.populateFolders();

	this.initUpwardEvent();
}

extend(FileDialog, Dialog)

// FileDialog.prototype.initEvents = function(){
	
// 	//打开文件的点击事件
// 	this.initUpwardEvent();
// 	this.initFileEvent();
// 	this.initCloseEvent();
// 	this.initOkEvent();
// }


FileDialog.prototype.initUpwardEvent = function(){

	var dlg = this;
	this._win.find(".dialog_folder_up:first").click(function(){
		dlg.upwards();
	});
}

FileDialog.prototype.initFileEvent = function(){
	var dlg = this;
	this._win.find(".item_container").each(function(){
		var container = this;
		var type = $(this).attr("type");
		switch(type){
			case "folder":{
				$(this).dblclick(function(){
					var curPath = dlg.getPath();
					var fldName = $(this).find('.folder_item_text:first').text();
					var newPath = dlg.makeFolderPath(curPath, fldName);
					dlg.setPath(newPath);
					dlg.populateFolders();
					dlg._file_path = null;
				});
			}
			break;
			case "file":{
				$(this).click(function(){
					var curPath = dlg.getPath();
					var filName = $(this).find('.folder_item_text:first').text();
					dlg._file_path = dlg.makeFilePath(curPath, filName);

					$("#dialog_file_ctrl .item_container").css("background-color", "#ffffff");
					$(this).css("background-color", "#e0ecf6");
				});
			}
		}
	});	
}
 
FileDialog.prototype.initCloseEvent = function(){
	var dlg = this;
	this._win.find(".dialog_exit:first").click(function(){
		dlg.destory();
	});

	this._win.find("#dlg_btn_exit:first").click(function(){
		dlg.destory();
	});
}

FileDialog.prototype.initOkEvent = function(){
	var dlg = this;
	this._ok = true;
	
	this._win.find("#dlg_btn_ok:first").click(function(){
		dlg.destory();

		if(dlg._onOK){
			dlg._onOK();
		}
	});
}



FileDialog.prototype.setPath = function(path){
	this._path = path;
	var folder = "/";
	if(path[path.length-1]=="/"){
		folder = path;
	}
	else{
		folder = path.substring(0, path.lastIndexOf("/")+1);
	}
	$(".dialog_folder_path").attr("value", folder);
}

FileDialog.prototype.getPath = function(path){
	return $(".dialog_folder_path").attr("value");	
}

FileDialog.prototype.getFilePath = function(){
	return this._file_path;
}

FileDialog.prototype.populateFolders = function(){
	var json = [{
			name : "raster",
			type : "folder"
		},{
			name : "dem",
			type : "folder"
		},{
			name : "vector",
			type : "folder"
		},{
			name : "sar",
			type : "folder"
		},{
			name : "world-1.tif",
			type : "file"
		},{
			name : "world-2.jpg",
			type : "file"
		},{
			name : "world-3.png",
			type : "file"
		}
	];

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
	this.initFileEvent();
}

FileDialog.prototype.upwards = function(){
	var curPath = this.getPath();
	if(curPath.length==0){
		return;
	}
	if(curPath == "/"){
		return;
	}

	var pos = curPath.lastIndexOf("/", curPath.length-2);
	if( pos>0 ){
		var parentPath = curPath.substring(0, pos) + "/";
		this.setPath(parentPath);
		this.populateFolders();
	}
}

FileDialog.prototype.makeFolderPath = function(folderPath, folderame){
	return folderPath + folderame + "/";
}

FileDialog.prototype.makeFilePath = function(folderPath, fileName){
	return folderPath + fileName;
}

FileDialog.prototype.onOK = function(func){
	this._onOK = func;
}


FileDialog.prototype.create = function(){
	var html = "<div class='func_dialog file_dialog'>"
			+"	<div class='titlebar'>"
			+"		<div class='dialog_title'>文件</div>"
			+"		<div class='dialog_exit'></div>"
			+"	</div>"
			+"	<div class='dialog_main'>"
			+"		<div class='dialog_file_path_wrapper'>"
			+"			<span>路径:</span>"
			+"			<input type='text' class='dialog_folder_path' readonly='readonly' value='/'>"
			+"			<div class='dialog_folder_up'></div>"
			+"		</div>"
			+"		<div id='dialog_file_ctrl'>"
			+"			<div class='item_container' type='folder'>"
			+"				<div class='folder_item_icon'></div>"
			+"				<div class='folder_item_text'>raster</div>"
			+"			</div>"
			+"			<div class='item_container' type='folder'>"
			+"				<div class='folder_item_icon'></div>"
			+"				<div class='folder_item_text'>dem</div>"
			+"			</div>"
			+"			<div class='item_container' type='folder'>"
			+"				<div class='folder_item_icon'></div>"
			+"				<div class='folder_item_text'>world-2.tif</div>"
			+"			</div>"
			+"			<div class='item_container' type='folder'>"
			+"				<div class='folder_item_icon'></div>"
			+"				<div class='folder_item_text'>world-2.tif</div>"
			+"			</div>"
			+"			<div class='item_container' type='folder'>"
			+"				<div class='folder_item_icon'></div>"
			+"				<div class='folder_item_text'>world-2.tif</div>"
			+"			</div>"
			+"			<div class='item_container' type='file'>"
			+"				<div class='file_item_icon'></div>"
			+"				<div class='folder_item_text'>raster</div>"
			+"			</div>"
			+"			<div class='item_container' type='file'>"
			+"				<div class='file_item_icon'></div>"
			+"				<div class='folder_item_text'>dem</div>"
			+"			</div>"
			+"			<div class='item_container' type='file'>"
			+"				<div class='file_item_icon'></div>"
			+"				<div class='folder_item_text'>world-2.tif</div>"
			+"			</div>"
			+"			<div class='item_container' type='file'>"
			+"				<div class='file_item_icon'></div>"
			+"				<div class='folder_item_text'>world-2.tif</div>"
			+"			</div>"
			+"			<div class='item_container' type='file'>"
			+"				<div class='file_item_icon'></div>"
			+"				<div class='folder_item_text'>world-2.tif</div>"
			+"			</div>"
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
	$('body').append(dlg);
	return dlg;
}

FileDialog.prototype.echo = function(){
	alert("file dialog");
}
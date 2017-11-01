var FileDialog = function(path,mode,onOK){

	Dialog.apply(this, arguments);

	this._folder_path = "";	//地址栏里的路径
	this._file_path = "";	//选中的完整文件路径
	this._file_name = "";	//选中的文件名
	this._file_type = "";	//选中的文件类型[文件(file)|文件夹(folder)]
	this._onOK = onOK;
	this.setMode(mode);

	this.setPath(path ? path : "/");
	this.populateFolders();

	this.initUpwardEvent();
	this.initCreateFolderEvent();
	this.initDeleteFolderEvent();
	this.initUploadEvent();
	this.initNameInputEvent();
}

extend(FileDialog, Dialog)


//选中模式(choose)还是输入文件名模式(new)
FileDialog.prototype.setMode =function(mode){
	this._mode = mode;
	if(this._mode == "choose"){
		this._win.find(".dialog_title").html("选择一个文件");
		this._win.find("#dlg_file_name").prop("readonly","readonly");
		this._win.find(".file-dialog-backup").hide();
	}else if(this._mode == "new"){
		this._win.find(".dialog_title").html("选择要输出的位置");
		this._win.find(".file-dialog-backup").show();
	}else if (this._mode == "folder") {
		this._win.find(".dialog_title").html("选择一个文件夹");
		this._win.find("#dlg_file_name").prop("readonly","readonly");
		this._win.find(".file-dialog-backup").hide();
	}
}

FileDialog.prototype.initUpwardEvent = function(){

	var dlg = this;
	this._win.find(".dialog_folder_up:first").click(function(){
		dlg.upwards();
	});
}

FileDialog.prototype.initCreateFolderEvent = function(){

	var dlg = this;
	this._win.find(".dialog_folder_add:first").click(function(){
		var createFoloderDialog = new CreateFolderDialog(dlg._folder_path,function () {
			dlg.populateFolders();
        },function () {

        })
		createFoloderDialog.show();
	});
}

FileDialog.prototype.initDeleteFolderEvent = function(){

	var dlg = this;
	this._win.find(".dialog_folder_delete:first").click(function(){
		dlg.deleteFolder();
	});
}

FileDialog.prototype.initUploadEvent = function(){
	var dlg = this;
	this._win.find(".dialog_file_upload").click(function(){
		var uploadDlg = new UploadDialog(dlg._folder_path,function(){
			// ok
		},function(){
			// close
			dlg.populateFolders();
		});
		uploadDlg.show();
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
					//双击文件夹，进入该目录
					var curPath = dlg.getPath();
					var fldName = $(this).find('.folder_item_text:first').text();
					var newPath = dlg.makeFolderPath(curPath, fldName);
					dlg.setPath(newPath);
					dlg.populateFolders();
					dlg._file_path = null;
					dlg._win.find("#dlg_file_name").val("");
				});

				$(this).click(function(){
					//单击文件夹，选中该文件夹
					dlg._file_name = "";
					dlg._file_type = "folder";

					dlg._win.find(".item_container").removeClass("active");
					$(this).addClass("active");
					dlg._win.find("#dlg_file_name").val(dlg._file_name);
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

					dlg._win.find("#dlg_file_name").val(dlg._file_name);
					dlg._win.find(".item_container").removeClass("active");
					$(this).addClass("active");
				});

				$(this).dblclick(function(){
					dlg._win.find("#dlg_btn_ok:first").click();
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
		if(dlg._mode == "choose"){
			if(dlg._file_name == ""){
				alert("请选择一个文件");
				return;
			}
			var item = dlg._win.find(".item_container[title='" + dlg._file_name + "']");
			if(item.length == 0){
				alert("请选择一个有效的文件");
				return;
			}
		}else if(dlg._mode == "new"){
			var name = dlg._win.find("#dlg_file_name").val();
			if(name == ""){
				alert("请输入一个文件");
				return;
			}
			var nameReg =  /^.+\.(?:jpg|jpeg|png|tif|tiff)$/;
			if(!nameReg.test(name)){
				alert("请输入有效的后缀名");
				return;
			}
			dlg._file_path = dlg.makeFilePath(dlg._folder_path,name);
		}else if (dlg._mode == "folder") {
			var active = dlg._win.find(".item_container.active");
			var type = active.attr("type");
			var chooseName = active.find(".folder_item_text").html();
			if(chooseName == null || type == null || type == "file"){
				alert("请选择一个文件夹");
				return;
			}
			var path = dlg.makeFolderPath(dlg._folder_path, chooseName);
		}

		dlg.destory();
		if(dlg._onOK){
			dlg._onOK();
		}
	});
}



FileDialog.prototype.setPath = function(path){
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
	this._win.find("#dlg_file_name").val(this._file_name);
	this._win.find(".dialog_folder_path").attr("value", this._folder_path);
}

FileDialog.prototype.getPath = function(path){
	return $(".dialog_folder_path").attr("value");
}

FileDialog.prototype.getFilePath = function(){
	return this._file_path;
}


FileDialog.prototype.getFolderPath = function(){
	var active = this._win.find(".item_container.active");
	var type = active.attr("type");
	var chooseName = active.find(".folder_item_text").html();
	
	var path = this.makeFolderPath(this._folder_path, chooseName);
	return path;
};
FileDialog.prototype.populateFolders = function(){
	var that = this;
	var data = '{"path":"' + this._folder_path + '"}';
	$("#dialog_file_ctrl .tab").removeClass("active");
	$("#dilaog_file_loading").addClass("active");
	$.ajax({
			type:"POST",
			url:"/file/list/",
			data : data,
			contentType: "text/plain",
			dataType : "text",
			success:function(data){
				$("#dialog_file_ctrl .tab").removeClass("active");
				$("#dialog_file_list").addClass("active");
				var json = JSON.parse(data);
				if(json.status == "error"){
					alert(json.message);
					var curPath = that.getPath();
					if(curPath.length==0){
						return;
					}
					if(curPath == "/"){
						return;
					}
					var pos = curPath.lastIndexOf("/", curPath.length-2);
					if( pos>=0 ){
						var parentPath = curPath.substring(0, pos) + "/";
						that.setPath(parentPath);
						that.populateFolders();
					}
					return;
				}
				var html = "";
				for(var i in json){
					var o = json[i];
					var icon = (o.type == "folder" ? "folder_item_icon" : "file_item_icon");
					html += "<div class='item_container' type='" + o.type + "' title='" + o.name + "'>";
					html += "<div class='" + icon + "'></div>";
					html += "<div class='folder_item_text'>" + o.name + "</div>";
					html += "</div>";
				}
				document.getElementById("dialog_file_list").innerHTML = html;
				that._win.find(".item_container[title='" + that._file_name + "']").addClass("active")
				that.initFileEvent();
			},
			error:function(xhr){
				$("#dialog_file_ctrl .tab").removeClass("active");
				$("#dialog_file_list").addClass("active");
	            alert("get folder list failed");
	            console.log(xhr);
	        }	
		});
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
	if( pos>=0 ){
		var parentPath = curPath.substring(0, pos) + "/";
		this.setPath(parentPath);
		this.populateFolders();
	}
}

// FileDialog.prototype.createFolder = function(){
// 	if(!this._folder_path){
// 		return;
// 	}
//
// 	var that = this;
// 	var fname = Math.random().toString(36).substr(2);
// 	var fpath = this.makeFolderPath(this._folder_path, fname);
//
// 	var data = '{"path":"' + fpath + '"}';
//
// 	$.ajax({
// 		type:"POST",
// 		url:"/file/create/",
// 		data : data,
// 		contentType: "text/plain",
// 		dataType : "text",
// 		async : true,
// 		success : function(result){
// 			var text = JSON.parse(result);
// 			if(text.status == "success"){
// 				that.populateFolders();
// 			}else{
// 				alert((text.message));
// 			}
// 		},
// 	});
//
// }

FileDialog.prototype.deleteFolder = function(){
	var active = this._win.find(".item_container.active");
	var type = active.attr("type");
	var chooseName = active.find(".folder_item_text").html();
	if(chooseName == null || type == null){
		alert("请选择一个文件");
		return;
	}
	var fpath = null;
	if(type == "file"){
		fpath = this.makeFilePath(this._folder_path, chooseName);
	}else if(type == "folder"){
		fpath = this.makeFolderPath(this._folder_path, chooseName);
	}
	var dlg = this;

	var data = '{"path":"' + fpath + '"}';

	if(!confirm("确定删除 [" + fpath + "] ?")){
		return;
	}

	$.ajax({
		type:"POST",
		url:"/file/remove/",
		data : data,
		contentType: "text/plain",
		dataType : "text",
		async : true,
		success:function(json){
			var result = JSON.parse(json);
			if(result.status == "success"){
				alert("删除成功");
				dlg.populateFolders();
			}else if(result.status == "error"){
				alert(result.message);
			}
		},
		error:function(xhr){
            alert("delete file failed");
            console.log(xhr);
        }	
	});
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
	var html = "<div class='file_dialog dialog'>"
			+"	<div class='titlebar'>"
			+"		<div class='dialog_title'>文件</div>"
			+"		<div class='dialog_exit'></div>"
			+"	</div>"
			+"	<div class='dialog_main'>"
			+"		<div class='dialog_file_path_wrapper'>"
			+"			<span>路径:</span>"
			+"			<input type='text' class='dialog_folder_path' readonly='readonly' value='/'>"
			+"			<ul>"
			+"				<li><div class='folder-tool dialog_folder_up' title='上一级'></div></li>"
			+"				<li><div class='folder-tool dialog_folder_add' title='新建文件夹'></div></li>"
			+"				<li><div class='folder-tool dialog_folder_delete' title='删除'></div></li>"
			+"				<li><div class='folder-tool dialog_file_upload' title='上传文件'></div></li>"
			+"			</ul>"
			+"		</div>"
			+"		<div id='dialog_file_ctrl'>"
			+"			<div class='tab' id='dialog_file_list'>"
			+"			</div>"
			+"			<div class='tab' id='dilaog_file_loading'>"
			+"				<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='200px' height='200px' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid'>"
			+"					<g transform='translate(25 50)'>"
			+"						<circle cx='0' cy='0' r='10' fill='#456caa' transform='scale(0.226392 0.226392)'>"
			+"		  					<animateTransform attributeName='transform' type='scale' begin='-0.3333333333333333s' calcMode='spline' keySplines='0.3 0 0.7 1;0.3 0 0.7 1' values='0;1;0' keyTimes='0;0.5;1' dur='1s' repeatCount='indefinite'></animateTransform>"
			+"						</circle>"
			+"					</g>"
			+"					<g transform='translate(50 50)'>"
			+"						<circle cx='0' cy='0' r='10' fill='#88a2ce' transform='scale(0.00325972 0.00325972)'>"
			+"		  					<animateTransform attributeName='transform' type='scale' begin='-0.16666666666666666s' calcMode='spline' keySplines='0.3 0 0.7 1;0.3 0 0.7 1' values='0;1;0' keyTimes='0;0.5;1' dur='1s' repeatCount='indefinite'></animateTransform>"
			+"						</circle>"
			+"					</g>"
			+"					<g transform='translate(75 50)'>"
			+"						<circle cx='0' cy='0' r='10' fill='#c2d2ee' transform='scale(0.313074 0.313074)'>"
			+"		  					<animateTransform attributeName='transform' type='scale' begin='0s' calcMode='spline' keySplines='0.3 0 0.7 1;0.3 0 0.7 1' values='0;1;0' keyTimes='0;0.5;1' dur='1s' repeatCount='indefinite'></animateTransform>"
			+"						</circle>"
			+"					</g>"
			+"				</svg>"
			+"			</div>"
			+"		</div>"
			+"	</div>"
			+"	<div class='file-dialog-backup'></div>"
			+"	<div class='dialog_bottom'>"
			+"		<span>文件名：</span>"
			+"		<input type='text' id='dlg_file_name'></input>"
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

FileDialog.prototype.echo = function(){
	alert("file dialog");
}

// 判断是否有该文件
FileDialog.prototype.hasFile = function(fileName){
	var items = this._win.find(".item_container");
	for(var i = 0; i < items.length; ++i){
		var item = items[i];
		var type = $(item).attr("type");
		if(type == "file"){
			var name = $(item).find(".folder_item_text").html();
			if(name == fileName){
				return true;
			}
		}
	}
	return false;
}

FileDialog.prototype.initNameInputEvent = function(){
	var that = this;
	this._win.find("#dlg_file_name").keydown(function(e){
		if(e.keyCode == 13){
			that._win.find("#dlg_btn_ok:first").click();
		}
	});
}

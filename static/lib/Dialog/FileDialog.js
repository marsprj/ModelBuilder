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


	this.registerPanelEvent();

}

extend(FileDialog, Dialog)

FileDialog.prototype.registerPanelEvent = function(){
	this.initCreateFolderEvent();
	this.initDeleteFolderEvent();
	this.initUploadEvent();
	this.initNameInputEvent();

	this.initFolderViewEvent();

	this.initOrderEvent();

	this.initPathEvent();
};


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


FileDialog.prototype.initCreateFolderEvent = function(){

	var dlg = this;
	this._win.find(".create-folder-tool").click(function(){
		var createFoloderDialog = new CreateFolderDialog(dlg._folder_path,function () {
			dlg.populateFolders();
        },function () {

        })
		createFoloderDialog.show();
	});
}

FileDialog.prototype.initDeleteFolderEvent = function(){

	var dlg = this;
	this._win.find(".delete-folder-tool").click(function(){
		dlg.deleteFolder();
	});
}

FileDialog.prototype.initUploadEvent = function(){
	var dlg = this;
	this._win.find(".upload-tool").click(function(){
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
	this._win.find(".item-container").each(function(){
		var container = this;
		var type = $(this).attr("type");
		switch(type){
			case "folder":{
				$(this).dblclick(function(){
					//双击文件夹，进入该目录
					var curPath = dlg.getPath();
					var fldName = $(this).attr("title");
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

					dlg._win.find(".item-container").removeClass("active");
					$(this).addClass("active");
					dlg._win.find("#dlg_file_name").val(dlg._file_name);
				});
			}
			break;
			case "file":{
				$(this).click(function(){
					//单击文件，选中该文件
					var curPath = dlg.getPath();
					var filName = $(this).attr("title");;
					dlg._file_path = dlg.makeFilePath(curPath, filName);
					dlg._file_name = filName;
					dlg._file_type = "file";

					dlg._win.find("#dlg_file_name").val(dlg._file_name);
					dlg._win.find(".item-container").removeClass("active");
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
			var item = dlg._win.find(".item-container[title='" + dlg._file_name + "']");
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
			var active = dlg._win.find(".item-container.active");
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
	this._win.find(".path-div").attr("dpath",this._folder_path);

	var pathList = this._folder_path.split("/");
	var html = '';
	var curPath = "/";
	for(var i = 0; i < pathList.length;++i){
		var p = pathList[i];
		if(p == ""){
			continue;
		}
		curPath += p + "/";
		html += '<li title="' + curPath + '">'
			+'		<a href="javascript:void(0)">' + p + '</a>'
			+'	</li>';
	}
	this._win.find(".path-div ul").html(html);

	var length = 0;
	this._win.find(".path-div ul li").each(function(){
		length += this.getBoundingClientRect().width;
	});
	var width = 770;
	if(length > width){
		console.log(length);
		var delta = width - length ;
		this._win.find(".path-div ul").css("left",delta + "px").css("width",length + "px");
	}else{
		this._win.find(".path-div ul").css("left","0px");
	}

	var that = this;
	this._win.find(".path-div ul li").click(function(event) {
		var path = $(this).attr("title");
		that.setPath(path);
		that.populateFolders();
	});
}


FileDialog.prototype.getPath = function(path){
	return $(".path-div").attr("dpath");
}

FileDialog.prototype.getFilePath = function(){
	return this._file_path;
}


FileDialog.prototype.getFolderPath = function(){
	var active = this._win.find(".item-container.active");
	var type = active.attr("type");
	var chooseName = active.attr("title");
	
	var path = this.makeFolderPath(this._folder_path, chooseName);
	return path;
};

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


FileDialog.prototype.deleteFolder = function(){
	var active = this._win.find(".item-container.active");
	var type = active.attr("type");
	var chooseName = active.attr("title");
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
	var html = '<div class="file_dialog dialog">'
				+'	<div class="titlebar">'
				+'		<div class="dialog_title">文件</div>'
				+'		<div class="dialog_exit"></div>'
				+'	</div>'
				+'	<div class="dialog_main">'
				+'	<div class="address-div">'
				+'		<div class="home" title="根目录"></div>'
				+'		<div class="path-div" dpath="/">'
				+'		<ul>'
				+'			<li><a href="javascript:void(0)">folder1</a></li>'
				+'			<li><a href="javascript:void(0)">folder2</a></li>'
				+'			<li><a href="javascript:void(0)">folder3</a></li>'
				+'		</ul>'
				+'		</div>'
				+'		<div class="path-tool up-tool" title="上一级"></div>'
				+'		<div class="path-tool refresh-tool" title="刷新"></div>'
				+'	</div>'
				+'		<div id="dialog_file_ctrl">'
				+'			<div id="filedialog_tool">'
				+'				<ul class="file-tool">'
				+'					<li class="create-folder-tool"><span></span>新建文件夹</li>'
				+'					<li class="delete-folder-tool"><span></span>删除</li>'
				+'					<li class="upload-tool"><span></span>上传</li>'
				+'				</ul>'
				+'				<ul class="file-list-view">'
				+'					<li class="icon-view " title="图标显示">&nbsp;</li>'
				+'					<li class="list-view active" title="列表显示">&nbsp;</li>'
				+'				</ul>'
				+'			</div>'
				+'			<div class="tab active" id="dialog_file_list">'
				+'				<div class="table list-title">'
				+'					<div class="row header">'
				+'						<div class="cell" style="width: 40%">'
				+'							<span field="name">名称</span>'
				+'							<span class="order-icon desc-order asc active"></span>'
				+'						</div>'
				+'						<div class="cell" style="width: 20%">'
				+'							<span field="filetype">类型</span>'
				+'							<span class="order-icon desc-order asc"></span>'
				+'						</div>'
				+'						<div class="cell" style="width: 20%">'
				+'							<span field="size">大小</span>'
				+'							<span class="order-icon desc-order asc"></span>'
				+'						</div>'
				+'						<div class="cell" style="width: 20%">'
				+'							<span field="time">最后修改日期</span>'
				+'							<span class="order-icon desc-order asc"></span>'
				+'						</div>'
				+'					</div>'
				+'				</div>'
				+'				<div class="table" >'
				+'					<div class="row header list-header">'
				+'						<div class="cell" style="width: 40%">'
				+'							<span field="name">名称</span>'
				+'						</div>'
				+'						<div class="cell" style="width: 20%">'
				+'							<span field="filetype">类型</span>'
				+'						</div>'
				+'						<div class="cell" style="width: 20%">'
				+'							<span field="size">大小</span>'
				+'						</div>'
				+'						<div class="cell" style="width: 20%">'
				+'							<span field="time">最后修改日期</span>'
				+'						</div>'
				+'					</div>'
				+'				</div>'
				+'			</div>'
				+'			<div class="tab" id="dialog_file_icon">'
				+'			</div>'
				+'			<div id="dilaog_file_loading">'
				+'				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">'
				+'					<g transform="translate(25 50)">'
				+'						<circle cx="0" cy="0" r="10" fill="#456caa" transform="scale(0.0032592 0.0032592)">'
				+'		  					<animateTransform attributeName="transform" type="scale" begin="-0.3333333333333333s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>'
				+'						</circle>'
				+'					</g>'
				+'					<g transform="translate(50 50)">'
				+'						<circle cx="0" cy="0" r="10" fill="#88a2ce" transform="scale(0.226395 0.226395)">'
				+'		  					<animateTransform attributeName="transform" type="scale" begin="-0.16666666666666666s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>'
				+'						</circle>'
				+'					</g>'
				+'					<g transform="translate(75 50)">'
				+'						<circle cx="0" cy="0" r="10" fill="#c2d2ee" transform="scale(0.68693 0.68693)">'
				+'  						<animateTransform attributeName="transform" type="scale" begin="0s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>'
				+'						</circle>'
				+'					</g>'
				+'				</svg>'
				+'			</div>'
				+'		</div>'
				+'	</div>'
				+'	<div class="file-dialog-backup" style="display: none;"></div>'
				+'	<div class="dialog_bottom">'
				+'		<span>文件名：</span>'
				+'		<input type="text" id="dlg_file_name" readonly="">'
				+'		<ul>'
				+'			<li><a href="javascript:void(0)" id="dlg_btn_ok">确定</a></li>'
				+'			<li><a href="javascript:void(0)" id="dlg_btn_exit">取消</a></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>';

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

FileDialog.prototype.populateFolders = function(){
	var listActive = this._win.find(".file-list-view li.active");
	if(listActive.hasClass('list-view')){
		this.showFolderList();
	}else if(listActive.hasClass('icon-view')){
		this.showFolderIcon();
	}
};


// 列表显示
FileDialog.prototype.showFolderList = function(){
	this._win.find("#dialog_file_ctrl .tab").removeClass("active");
	this._win.find("#dialog_file_ctrl").addClass("loading");
	this._win.find("#dialog_file_list").addClass('active');
	this._win.find("#dialog_file_list .row:not(.header)").remove();
	var that = this;
	var element = this._win.find(".list-title .order-icon.active");
	var field = $(element).prev().attr("field");
	var order = $(element).hasClass('asc')?"asc":"desc";
	this.getFolderListByList(this._folder_path,field,order,function(result){
		that._win.find("#dialog_file_ctrl").removeClass("loading");
		if(result.status == "error"){
			alert(result.message);
			// 返回上一级目录
			var parentPath = that.getParentPath(that.getPath());
			that.setPath(parentPath);
			that.populateFolders();
			return;
		}
		var html = '';
		for(var i = 0; i < result.length; ++i){
			var o = result[i];
			var ftype = "",size = "",fclass="";
			if(o.type == 'folder'){
				ftype = "文件夹";
				size = "";
				fclass = "folder-item-icon";
			}else{
				ftype = o.filetype;
				size = Math.ceil(o.size);
				size += "kb";
				fclass = "file-item-icon";
			}


			html += '<div class="row item-container" type="' + o.type + '" title="' + o.name  +  '">'
				+'		<div class="cell">' 
				+'			<div class="' + fclass + '"></div>'		
				+'			<span class="file-name">'+ o.name  + '</span>'
				+'		</div>'
				+'		<div class="cell">' + ftype + '</div>'
				+'		<div class="cell">' + size + '</div>'
				+'		<div class="cell">' + o.ftime + '</div>'
				+'	</div>';
		}

		that._win.find("#dialog_file_list .row.list-header").after(html);
		that._win.find("#dialog_file_list .row[title='" + that._file_name + "'][type='file']").addClass('active');
		that.initFileEvent();
	});
};

// 图标显示
FileDialog.prototype.showFolderIcon = function(){
	this._win.find("#dialog_file_ctrl .tab").removeClass("active");
	this._win.find("#dialog_file_ctrl").addClass("loading");
	this._win.find("#dialog_file_icon").addClass('active');
	this._win.find("#dialog_file_icon").empty();
	var that = this;
	this.getFolderListByIcon(this._folder_path,function(result){
		that._win.find("#dialog_file_ctrl").removeClass("loading");
		if(result.status == "error"){
			alert(result.message);
			// 返回上一级目录
			alert(result.message);
			// 返回上一级目录
			var parentPath = that.getParentPath(that.getPath());
			that.setPath(parentPath);
			that.populateFolders();
			return;
		}

		var html = '';
		for(var i = 0; i < result.length;++i){
			var o = result[i];
			var type = o.type;
			var file_type = '';
			if(type == "folder"){
				file_type = "folder-icon";
			}else if(type == "file"){
				file_type = "file-icon";
			}
			html += '<div class="file-icon-item item-container" type="' + o.type + '" title="' + o.name  +  '">'
					+'	<div class="icon-div ' + file_type + '">'
					+'	</div>'
					+'	<div class="file-info-div">'
					+'		<div class="file-info-name">' + o.name +  '</div>'
					+'	</div>'
					+'</div>';
		}
		that._win.find("#dialog_file_icon").html(html);
		that._win.find(".file-icon-item[title='" + that._file_name + "'][type='file']").addClass("active");
		that.initFileEvent();
	});
};

// 按照图标获取
FileDialog.prototype.getFolderListByIcon = function(path,callback){
	if(!path){
		if(callback){
			callback("");
		}
		return;
	}

	var dataObj = {
		"path": path,
		"type": "icon"
	};
	$.ajax({
			type:"POST",
			url:"/file/list/",
			data : JSON.stringify(dataObj),
			contentType: "text/plain",
			dataType : "text",
			success:function(data){
				var json = JSON.parse(data);
				if(callback){
					callback(json);
				}
				
			},
			error:function(xhr){
				var json = {
					"status" : "error",
					"message" : "失败"
				};
				if(callback){
					callback(json);
				}
	        }	
		});


};

FileDialog.prototype.initFolderViewEvent = function(){
	var that = this;
	this._win.find(".file-list-view li").click(function(){
		that._win.find(".file-list-view li").removeClass('active');
		// if($(this).has('list-view')){
			
		// 	that.showFolderList();
		// }else{
		// 	$(this).addClass('active');
		// 	that.showFolderIcon();
		// }
		$(this).addClass('active');
		that.populateFolders();
	});
};


// 列表获取
FileDialog.prototype.getFolderListByList = function(path,field,order,callback){
	if(!path || !field || !order){
		if(callback){
			callback("");
		}
		return;
	}

	var dataObj = {
		"path": path,
		"type": "list",
		"field": field,
		"order": order,
	};
	$.ajax({
			type:"POST",
			url:"/file/list/",
			data : JSON.stringify(dataObj),
			contentType: "text/plain",
			dataType : "text",
			success:function(data){
				var json = JSON.parse(data);
				if(callback){
					callback(json);
				}
			},
			error:function(xhr){
				var json = {
					"status" : "error",
					"message" : "失败"
				};
				if(callback){
					callback(json);
				}
	        }	
		});
};

// 排序事件
FileDialog.prototype.initOrderEvent = function(){
	var that = this;
	this._win.find(".list-title .order-icon").click(function(){
		that.changeOrderBy(this);
	});
};

FileDialog.prototype.changeOrderBy = function(element){
	var field = $(element).prev().attr("field");
	var isActive = $(element).hasClass('active');
	if(isActive){
		var order = $(element).hasClass('asc');
		if(order){
		    $(element).removeClass('asc');
		}else{
		    $(element).addClass('asc');
		}
	}else{
		this._win.find(".order-icon").removeClass('active');
        $(element).addClass('active');
	}

	this.showFolderList();
};


FileDialog.prototype.getParentPath = function(path){
	if(!path){
		return "/";
	}

	var pos = path.lastIndexOf("/", path.length-2);
	if(pos>=0 ){
		var parentPath = path.substring(0, pos) + "/";
		return parentPath;
	}
	return "/";
};

FileDialog.prototype.initPathEvent = function(){
	var that = this;
	this._win.find(".home").click(function(event) {
		that.setPath("/");
		that.populateFolders();
		that._file_path = null;
		that._win.find("#dlg_file_name").val("");
	});

	this._win.find(".up-tool").click(function(event) {
		that.upwards();
	});

	this._win.find('.refresh-tool').click(function(event) {
		that.populateFolders();
	});
};
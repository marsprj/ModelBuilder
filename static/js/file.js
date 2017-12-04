function initPageEvent () {
	// 新建文件夹
	$(".create-folder-tool").click(function(){
		createNewFolder();
	});

	// 删除
	$(".delete-folder-tool").click(function(){
		deleteFolder();
	});


	// 上传
	$(".upload-tool").click(function(event) {
		uploadFile();
	});


	// 文件view
	$(".file-list-view li").click(function(event) {
		$(".file-list-view li").removeClass('active');
		$(this).addClass('active');
		populateFolders();
	});


	$(".home").click(function(event) {
		setPath("/");
		populateFolders();
	});

	$(".up-tool").click(function(event) {
		upwards();
	});

	$('.refresh-tool').click(function(event) {
		populateFolders();
	});

	$(window).resize(function(event) {
		resizeFileIcons();
	});

	// 排序
	$(".list-title .order-icon").click(function(event) {
		changeOrderBy(this);
	});

	addKeyEvent();

	$("#myModal .close").click(function(event) {
		$("#myModal").removeClass('active');
	});

	$("#myModal").click(function(e){
		if(e.target instanceof HTMLAnchorElement){
			return;
		}
		$("#myModal").removeClass('active');
	});


	//退出
	$(".logout").click(function(){
		logout();
	});
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
            console.log(xhr);
        }
	});
}

function setPath(path){
	if(!path){
		return;
	}

	g_path = path;
	$(".path-div").attr("dpath",g_path);

	var pathList = g_path.split("/");
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
	$(".path-div ul").html(html);


	var length = 0;
	$(".path-div ul li").each(function(){
		length += this.getBoundingClientRect().width;
	});

	var width = $(".path-div")[0].getBoundingClientRect().width;
	if(length > width){
		var delta = width - length ;
		$(".path-div ul").css("left",delta + "px").css("width",length + "px");
	}else{
		$(".path-div ul").css("left","0px");
	}

	$(".path-div ul li").click(function(event) {
		var path = $(this).attr("title");
		setPath(path);
		populateFolders();
	});
}


function  populateFolders() {
	var listActive = $(".file-list-view li.active");
	if(listActive.hasClass('list-view')){
		showFolderList();
	}else if(listActive.hasClass('icon-view')){
		showFolderIcon();
	}
}

// 显示文件夹列表
function showFolderList () {
	$("#dialog_file_ctrl .tab").removeClass("active");
	$("#dialog_file_ctrl").addClass("loading");
	$("#dialog_file_list").addClass('active');
	$("#dialog_file_list .row:not(.header)").remove();
	$("#dialog_file_icon").empty();
	var element = $(".list-title .order-icon.active");
	var field = $(element).prev().attr("field");
	var order = $(element).hasClass('asc')?"asc":"desc";
	getFolderListByList(g_path,field,order,function(result){
		$("#dialog_file_ctrl").removeClass("loading");
		if(result.status == "error"){
			alert(result.message);
			// 返回上一级目录
			var parentPath = getParentPath(getPath());
			if(parentPath == getPath()){
				return;
			}
			setPath(parentPath);
			populateFolders();
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

		$("#dialog_file_list .row.list-header").after(html);
		initFileEvent();
	});
}

// 列表
function getFolderListByList(path,field,order,callback){
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


function showFolderIcon() {
	$("#dialog_file_ctrl .tab").removeClass("active");
	$("#dialog_file_ctrl").addClass("loading");
	$("#dialog_file_icon").addClass('active');
	$("#dialog_file_icon").empty();
	$("#dialog_file_list .row:not(.header)").remove();
	getFolderListByIcon(g_path,function(result){
		$("#dialog_file_ctrl").removeClass("loading");
		if(result.status == "error"){
			alert(result.message);
			// 返回上一级目录
			var parentPath = getParentPath(getPath());
			if(parentPath == getPath()){
				return;
			}
			setPath(parentPath);
			populateFolders();
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
		$("#dialog_file_icon").html(html);
		resizeFileIcons();
		initFileEvent();
	});
}

// 按照图标获取
function getFolderListByIcon(path,callback){
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


// 上一级目录
function getParentPath(path){
	if(!path){
		return "/";
	}

	var pos = path.lastIndexOf("/", path.length-2);
	if(pos>=0 ){
		var parentPath = path.substring(0, pos) + "/";
		return parentPath;
	}
	return "/";
}

// 获取路径
function getPath(path){
	return $(".path-div").attr("dpath");
}

// 文件单击进入
function initFileEvent(){
	$(".item-container").each(function(){
		var container = this;
		var type = $(this).attr("type");
		switch(type){
			case "folder":{
				$(this).dblclick(function(){
					//双击文件夹，进入该目录
					var curPath = getPath();
					var fldName = $(this).attr("title");
					var newPath = makeFolderPath(curPath, fldName);
					setPath(newPath);
					populateFolders();
				});

				$(this).click(function(){
					//单击文件夹，选中该文件夹
					if(g_multi){
						$(this).addClass("active");
					}else{
						$(".item-container").removeClass("active");
						$(this).addClass("active");
					}
					
					
				});
			}
			break;
			case "file":{
				$(this).click(function(){
					if(g_multi){
						$(this).addClass("active");
					}else{
						$(".item-container").removeClass("active");
						$(this).addClass("active");
					}
				});

				$(this).dblclick(function(){
					preview_file(this);
				});
			}
		}
	});
}

// 构建文件夹路径
function makeFolderPath(folderPath, folderame){
	return folderPath + folderame + "/";
}


// 构建文件路径
function makeFilePath (folderPath,fileName) {
	return folderPath + fileName;
}

function upwards(){
	var curPath = getPath();
	if(curPath.length==0){
		return;
	}
	if(curPath == "/"){
		return;
	}

	var pos = curPath.lastIndexOf("/", curPath.length-2);
	if( pos>=0 ){
		var parentPath = curPath.substring(0, pos) + "/";
		setPath(parentPath);
		populateFolders();
	}
}


function resizeFileIcons() {
	var icons = $(".file-icon-item")
	if(icons.length == 0){
		return;
	}

	var  width = $("#dialog_file_icon").width();
	var iconWidth = icons[0].getBoundingClientRect().width;



	var count = Math.floor(width/iconWidth);


	var delta = (width - count*iconWidth)/2/count;

	icons.css("margin-left",delta + "px").css("margin-right",delta + "px");
}



function createNewFolder () {
    var html = "<div class='create-folder-dialog dialog'>"
			+"	<div class='titlebar'>"
			+"		<div class='dialog_title'>新建文件夹</div>"
			+"		<div class='dialog_exit'></div>"
			+"	</div>"
            +"  <div class='dialog_main'>"
            +"      <div class='dialog_item'>"
            +"			<span>名称:</span>"
		    +"			<input type='text' placeholder='请输入文件夹名称' class='new-folder-name'>"
            +"  </div>"
            +"  </div>"
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
	$(".create-folder-dialog").remove();
	$('body').append(dlg);
	$(".create-folder-dialog").show();
	$(".create-folder-dialog input").focus();

	$(".create-folder-dialog #dlg_btn_exit,.create-folder-dialog .dialog_exit").click(function(event) {
		$(".create-folder-dialog").remove();
	});

	$(".create-folder-dialog #dlg_btn_ok").click(function(event) {
		var name = $(".create-folder-dialog .new-folder-name").val();
        if (name == "") {
            alert("请输入文件夹名称");
            return;
        }

        var nameReg = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/;
        if(!nameReg.test(name)){
			alert("请输入有效的文件夹名称");
			return;
		}

        var path = g_path + name + "/" ;
        createFolder(path,function (result) {
            if(result.status == "success"){
            	$(".create-folder-dialog").remove();
               	populateFolders();
            }else{
                alert(result.message);
            }
        })
	});
}


function createFolder(path, callback) {
    var that = this;
	var data = '{"path":"' + path + '"}';
	$.ajax({
		type:"POST",
		url:"/file/create/",
		data : data,
		contentType: "text/plain",
		dataType : "text",
		async : true,
		success : function(result){
			var text = JSON.parse(result);
			if(callback){
			    callback(text);
            }
		},
		error:function(xhr){
	        alert("create folder failed");
	        console.log(xhr);
	    }		
	});
}



function uploadFile () {
	var html = "<div class='upload_dialog dialog'>"
			+"	<div class='titlebar'>"
			+"		<div class='dialog_title'>文件上传</div>"
			+"		<div class='dialog_exit'></div>"
			+"	</div>"
			+"	<div class='file-oper-row'>"
			+"		<div id='filePicker'>选择文件</div>"
    		+"		<a href='javascript:void(0)' class='upload-btn'>开始上传</a>"
    		+"	</div>"
    		+"	<div id='fileList' class='uploader-list'>"
	var dlg = $(html);
	$(".upload_dialog").remove();
	$('body').append(dlg);
	$(".upload_dialog").show();

	initUploader();
	

	$(".upload_dialog .dlg_file_up_load").click(function(){
		var files = document.getElementById("dlg_upoad_files").files;
		if(files.length==0){
			alert("尚未选择上传文件")
		}
		else{
			document.getElementById("dlg_upoad_path").value = $("#upload_folder:first").val();
			document.getElementById("dlg_file_up_form").submit();
		}
	});

	$(".upload_dialog .dialog_exit").click(function(event) {
		$(".upload_dialog").remove();
		populateFolders();
	});
}

function initUploader(){
	this._uploader = WebUploader.create({

	    // 选完文件后，是否自动上传。
	    auto: false,

	    // 文件接收服务端。
	    server: '/file/upload/',

	    // 选择文件的按钮。可选。
	    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
	    pick: '#filePicker',

	    formData :{
	    	dlg_upoad_path : g_path
	    }
	});

	// 当有文件添加进来的时候
	this._uploader.on('fileQueued', function( file ) {
	    var html = '<div class="file-item" id="' + file.id+ '">'
			    +	'	<div class="file-name" title="' + file.name + '">'
			    +			file.name
			    +	'	</div>'
			    +	'	<div class="progress">'
			    +	'		<div class="progress-bar"></div>'
			    +	'	</div>'
			    + 	'	<div class="state">等待上传</div>'
			    +	'</div>';
	    $(".upload_dialog #fileList").append(html);
	});


	// 文件上传过程中创建进度条实时显示。
	this._uploader.on('uploadProgress', function( file, percentage ) {
	   	var progressbar = $(".upload_dialog #" + file.id + " .progress-bar");
	    progressbar.css( 'width', percentage * 100 + '%' );
	    $(".upload_dialog #" + file.id + " .state").html("上传中");
	});

	// 文件上传成功
	this._uploader.on( 'uploadSuccess', function( file ) {
	    $(".upload_dialog #" + file.id + " .state").html("上传成功");
	});

	// 文件上传失败，显示上传出错。
	this._uploader.on( 'uploadError', function( file ) {
		$(".upload_dialog #" + file.id + " .state").html("上传失败");
	});

	// 上传按钮
	this._uploadBtn = $(".upload-btn");
	this._uploadBtn.click(function(){
		if(g_uploadState === 'uploading' ) {
			// 暂停上传
            _uploader.stop();
        }else{
        	// 上传
            _uploader.upload();
        }
	});

	// 整体上传事件
    this._uploader.on( 'all', function( type ) {
        if ( type === 'startUpload' ) {
            g_uploadState = 'uploading';
        } else if ( type === 'stopUpload' ) {
            g_uploadState = 'paused';
        } else if ( type === 'uploadFinished' ) {
            g_uploadState = 'done';
        }

        if ( g_uploadState === 'uploading' ) {
            _uploadBtn.text('暂停上传');
        } else {
            _uploadBtn.text('开始上传');
        }
    });
}

// 排序
function changeOrderBy(element){
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
		$(".order-icon").removeClass('active');
        $(element).addClass('active');
	}

	showFolderList();
};


function deleteFolder () {
	var active = $(".item-container.active");
	if(active.length == 0){
		alert("请选择要删除的文件,ctrl可多选");
		return;
	}
	var list = [];
	var nameList = [];
	for(var i = 0; i < active.length;++i){
		var ele = active[i];
		var type = $(ele).attr("type");
		var name = $(ele).attr("title");
		nameList.push(name);
		var path = makeFilePath(getPath(),name);
		list.push({
			"type": type,
			"path" : path
		});
	}

	var str = "确认删除[" + nameList.toString() +  "]?";
	if(!confirm(str)){
		return;
	}

	
	deleteFiles(list,function(result){
		if(!result){
			alert("删除失败");
			return;
		}

		if(result.status == "error"){
			alert(result.message);
			return;
		}

		var list = result.result;
		if(!list){
			return;
		}
		var successCount = 0;
		var failList = [];
		for(var i = 0; i < list.length;++i){
			var l = list[i];
			if(l.result == "success"){
				successCount++;
			}else{
				failList.push(l.path);
			}
		}

		if(successCount == list.length){
			alert("删除成功");
		}else{
			var str = "删除成功：" + successCount + "个 \n失败：\n" + failList.join('\n');
			alert(str);
		}

		populateFolders();

	});
}

function deleteFiles(list,callback) {
	if(!list){
		return;
	}
	var dataObj = {
		"list":list
	};
	var data = JSON.stringify(dataObj);

	$.ajax({
		type:"POST",
		url:"/file/remove/",
		data : data,
		contentType: "text/plain",
		dataType : "text",
		async : true,
		success:function(json){
			var result = JSON.parse(json);
			console.log(result);
			if(callback){
				callback(result);
			}
		},
		error:function(xhr){
            alert("delete file failed");
            console.log(xhr);
        }	
	});
}


function addKeyEvent () {
	var event = function(evt) {
		var keyCode = evt.keyCode;
		if(keyCode != 17){
			return;
		}
		console.log("ctrl down");

		g_multi = true;

		var onkeyup = function(evet){
			console.log(evt);
			g_multi = false;
			document.removeEventListener("keyup",onkeyup);
		}
		document.addEventListener("keyup",onkeyup,false);
	}
	document.addEventListener("keydown", event);
}


function preview_file(element) {
	var type = $(element).attr("type");
	if(type != "file"){
		return;
	}

	var name = $(element).attr("title");
	var index = name.lastIndexOf(".");
	if(index == -1){
		return;
	}

	var fix = name.slice(index+1);
	fix = fix.toLowerCase();
	if(fix  == "jpeg" || fix == "jpg" || fix == "png"){
		path = makeFilePath(getPath(),name);
		var modal = document.getElementById('myModal');
		var modalImg = document.getElementById("img01");
		var caption = $(".modal #caption");
		modalImg.src = "";
		caption.html("");
		$(modal).addClass("loading active");
		preview(path,function(result){
			$(modal).removeClass('loading');
			function isJson(str){
				try{
					JSON.parse(result);
				}
				catch(e){
					return false;
				}
				return true;
			}
			
			if(isJson(result)){
				var message = JSON.parse(result).message;
				var html = "暂不提供预览";
				if(message == "no file"){
					html = "没有该文件";
				}
				caption.html(html);
				modalImg.src = "";
			}else{
				var html = "";
				path = path.replace(/\//g,"|") ;
				var src = "/file/preview/" + path + "/";	
				modalImg.src = src;
				var html = "<a href='" +  src + "' download='img.png'>下载文件</a>";
		   		caption.html(html);
			}
		});
	}
	
}

function preview (path,callback) {

	path = path.replace(/\//g,"|") ;
	var dataObj = {
		"path":path
	};
	var data = JSON.stringify(dataObj);
	$.ajax({
		type:"get",
		url:"/file/preview/" + path + "/",
		dataType : "text",
		success:function(result){
			if(callback){
				callback(result);
			}
		},
		error:function(xhr){
			var json = {
				"status" : "error",
				"message" : "失败"
			};
	        console.log(xhr);
	        if(callback){
	        	callback(json);
	        }
	    }			
	});
}
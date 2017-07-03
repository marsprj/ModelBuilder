var UploadDialog = function(path, onOK){

	Dialog.apply(this, arguments);
	
	this._folder_path = "";	//地址栏里的路径
	this._file_path = "";	//选中的完整文件路径
	this._file_name = "";	//选中的文件名
	this._file_type = "";	//选中的文件类型[文件(file)|文件夹(folder)]
	this._onOK = onOK;

	this.initEvents();
	this.initFolderOpenEvents();
	this.initUploadEvents();
}

extend(UploadDialog, Dialog)

UploadDialog.prototype.initEvents = function(){


	this._win.find("#dlg_upoad_files").change(function(){
		var files = this.files;
		var count = files.length;
		var html = "<ul>"
		for(var i=0; i<count; i++){
			f = files[i];
			console.log(f.name);
			html += "<li><span>" + i + "</span><span>" + f.name + "</span></li>";
		}
		html += "</ul>";
		document.getElementById("dlg_file_up_ls_ctrl").innerHTML = html;

		// $("#dlg_file_up_ls_ctrl li").click(function(){
		// 	var obj = $(this).find("span")[1];
		// 	alert($(obj)val());
		// })
	});

	this._win.find(".dlg_file_up_add").click(function(){
		//alert("dlg_file_up_add");
		var obj = document.getElementById('dlg_upoad_files');
		obj.click();
	});
}

UploadDialog.prototype.initUploadEvents = function(){
	$(".dlg_file_up_load").click(function(){
		var files = document.getElementById("dlg_upoad_files").files;
		if(files.length==0){
			alert("尚未选择上传文件")
		}
		else{
			document.getElementById("dlg_upoad_path").value = $("#upload_folder:first").val();
			document.getElementById("dlg_file_up_form").submit();	
		}
		
	});
}

UploadDialog.prototype.initFolderOpenEvents = function(){
	var that = this;
	$(".dlg_folder_open_2").click(function(){
		var curPath = that._win.find(".dialog_folder_path:first").val();
		var fdlg = new FileDialog2(curPath, function(){
			that.setUploadPath(fdlg.getPath())
		});
		fdlg.show();
	});
}

UploadDialog.prototype.initCloseEvent = function(){
	var dlg = this;
	this._win.find(".dialog_exit:first").click(function(){
		dlg.destory();
	});

	// this._win.find("#dlg_btn_exit:first").click(function(){
	// 	dlg.destory();
	// });
}

UploadDialog.prototype.initOkEvent = function(){
	var dlg = this;
	this._ok = true;
	
	// this._win.find("#dlg_btn_ok:first").click(function(){
	// 	dlg.destory();

	// 	if(dlg._onOK){
	// 		dlg._onOK();
	// 	}
	// });
}


UploadDialog.prototype.onOK = function(func){
	this._onOK = func;
}

UploadDialog.prototype.create = function(){
	var html = "<div class='func_dialog upload_dialog dialog'>"
			+"	<div class='titlebar'>"
			+"		<div class='dialog_title'>文件上传</div>"
			+"		<div class='dialog_exit'></div>"
			+"	</div>"
			+"	<div class='dlg_upload_main'>"
			+"		<div class='dialog_file_path_wrapper'>"
			+"			<span>路径:</span>"
			+"			<input type='text' id='upload_folder' class='dialog_folder_path' readonly='readonly' value='/' style='width:590px'>"
			+"		</div>"
			+"		<div id='dlg_file_up_ls_ctrl'></div>"
			+"	</div>"
			+"	<div class='dlg_file_up_main_wrapper'>"
			+"		<div class='dlg_file_up_bar'>"
			+"			<div class='dlg_folder_open_2'></div>"
			+"			<div class='dlg_file_up_add'></div>"
			+"			<div class='dlg_file_up_load'></div>"
			+"			<div class='dlg_file_up_exit'></div>"
			+"		</div>"
			+"	</div>"
			+"</div>"
			+"<form id='dlg_file_up_form' hidden='true' style='display:none' enctype='multipart/form-data' action='/file/upload/' method='post'>"
			+"	<input id='dlg_upoad_path'  name='dlg_upoad_path'  type='input' style='display:none' value='/'>"
			+"	<input id='dlg_upoad_files' name='dlg_upoad_files' type='file' style='display:none' multiple >"
			+"	<input type='submit' value='upload'/ style='display:none' >"
			+"</form/>";
	var dlg = $(html);
	$(".file_dialog").remove();
	$('body').append(dlg);
	//$("#dlg_file_up_form").css("display", "none");
	return dlg;
}



// UploadDialog.prototype.create = function(){
// 	var html = "<div class='func_dialog upload_dialog dialog'>"
// 			+"	<div class='titlebar'>"
// 			+"		<div class='dialog_title'>文件上传</div>"
// 			+"		<div class='dialog_exit'></div>"
// 			+"	</div>"
// 			+"	<div class='dialog_main'>"
// 			+"		<div class='dialog_file_path_wrapper'>"
// 			+"			<span>路径:</span>"
// 			+"			<input type='text' id='upload_folder' class='dialog_folder_path' readonly='readonly' value='/' style='width:590px'>"
// 			+"			<div class='dlg_folder_open'></div>"
// 			+"		</div>"
// 			+"		<div class='dlg_file_up_main_wrapper'>"
// 			+"			<div id='dlg_file_up_ls_ctrl'></div>"
// 			+"			<div class='dlg_file_up_bar'>"
// 			+"				<div class='dlg_folder_open_2'></div>"
// 			+"				<div class='dlg_file_up_add'></div>"
// 			//+"				<div class='dlg_file_up_remove'></div>"
// 			+"				<div class='dlg_file_up_load'></div>"
// 			+"				<div class='dlg_file_up_exit'></div>"
// 			+"			</div>"
// 			+"		</div>"
// 			+"	</div>"
// 			// +"	<div class='dialog_bottom'>"
// 			// +"		<ul>"
// 			// +"			<li>"
// 			// +"				<a href='javascript:void(0)' id='dlg_btn_ok'>确定</a>"
// 			// +"			</li>"
// 			// +"			<li>"
// 			// +"				<a href='javascript:void(0)' id='dlg_btn_exit'>取消</a>"
// 			// +"			</li>"
// 			// +"		</ul>"
// 			// +"	</div>"
// 			+"</div>"
// 			+"<form id='dlg_file_up_form' hidden='true' style='display:none' enctype='multipart/form-data' action='/file/upload/' method='post'>"
// 			+"	<input id='dlg_upoad_path'  name='dlg_upoad_path'  type='input' style='display:none' value='/'>"
// 			+"	<input id='dlg_upoad_files' name='dlg_upoad_files' type='file' style='display:none' multiple >"
// 			+"	<input type='submit' value='upload'/ style='display:none' >"
// 			+"</form/>";
// 	var dlg = $(html);
// 	$(".file_dialog").remove();
// 	$('body').append(dlg);
// 	//$("#dlg_file_up_form").css("display", "none");
// 	return dlg;
// }

UploadDialog.prototype.setUploadPath = function(path){
	this._win.find("#upload_folder:first").value = path;
}

UploadDialog.prototype.echo = function(){
	alert("upload dialog");
}

// function onAddFileComplete(evt){
// 	alert("onAddFileComplete");	
// }
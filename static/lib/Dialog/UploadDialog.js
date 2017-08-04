var UploadDialog = function(path, onOK, onClose){

	Dialog.apply(this, arguments);
	this._upload_path = null;

	// this._folder_path = "";	//地址栏里的路径
	// this._file_path = "";	//选中的完整文件路径
	// this._file_name = "";	//选中的文件名
	// this._file_type = "";	//选中的文件类型[文件(file)|文件夹(folder)]
	this._onOK = onOK;
	this._onClose = onClose;
	this._uploader = null;

	this.setUploadPath(path);
	this.initUploader();
	this.initEvents();
	// this.initFolderOpenEvents();
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

UploadDialog.prototype.initUploader = function(){
	var dlg = this;
	this._uploader = WebUploader.create({

	    // 选完文件后，是否自动上传。
	    auto: false,

	    // 文件接收服务端。
	    server: '/file/upload/',

	    // 选择文件的按钮。可选。
	    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
	    pick: '#filePicker',

	    formData :{
	    	dlg_upoad_path : dlg._upload_path
	    }

	    // 只允许选择图片文件。
	    // accept: {
	    //     title: 'Images',
	    //     extensions: 'gif,jpg,jpeg,bmp,png,tif',
	    //     mimeTypes: 'image/*'
	    // }
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
	    dlg._win.find("#fileList").append(html);
	});


	// 文件上传过程中创建进度条实时显示。
	this._uploader.on('uploadProgress', function( file, percentage ) {
	   	var progressbar = dlg._win.find("#" + file.id + " .progress-bar");
	    progressbar.css( 'width', percentage * 100 + '%' );
	   dlg._win.find("#" + file.id + " .state").html("上传中");
	});

	// 文件上传成功
	this._uploader.on( 'uploadSuccess', function( file ) {
	    dlg._win.find("#" + file.id + " .state").html("上传成功");
	});

	// 文件上传失败，显示上传出错。
	this._uploader.on( 'uploadError', function( file ) {
		dlg._win.find("#" + file.id + " .state").html("上传失败");
	});

	// 上传按钮
	this._uploadBtn = $(".upload-btn");
	this._uploadBtn.click(function(){
		if(dlg._uploadState === 'uploading' ) {
			// 暂停上传
            dlg._uploader.stop();
        }else{
        	// 上传
            dlg._uploader.upload();
        }
	});	

	// 整体上传事件
    this._uploader.on( 'all', function( type ) {
        if ( type === 'startUpload' ) {
            dlg._uploadState = 'uploading';
        } else if ( type === 'stopUpload' ) {
            dlg._uploadState = 'paused';
        } else if ( type === 'uploadFinished' ) {
            dlg._uploadState = 'done';
        }

        if ( dlg._uploadState === 'uploading' ) {
            dlg._uploadBtn.text('暂停上传');
        } else {
            dlg._uploadBtn.text('开始上传');
        }
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

// UploadDialog.prototype.initFolderOpenEvents = function(){
// 	var that = this;
// 	$(".dlg_folder_open_2").click(function(){
// 		var curPath = that._win.find(".dialog_folder_path:first").val();
// 		var fdlg = new FileDialog2(curPath, function(){
// 			that.setUploadPath(fdlg.getPath())
// 		});
// 		fdlg.show();
// 	});
// }

UploadDialog.prototype.initCloseEvent = function(){
	var dlg = this;
	this._win.find(".dialog_exit:first").click(function(){
		dlg.destory();
		if(dlg._onClose){
			dlg._onClose();
		}
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
			// +"	<div class='dlg_upload_main'>"
			// +"		<div class='dialog_file_path_wrapper'>"
			// +"			<span>路径:</span>"
			// +"			<input type='text' id='upload_folder' class='dialog_folder_path' readonly='readonly' value='/' style='width:590px'>"
			// +"		</div>"
			// +"		<div id='dlg_file_up_ls_ctrl'></div>"
			// +"	</div>"
			// +"	<div class='dlg_file_up_main_wrapper'>"
			// +"		<div class='dlg_file_up_bar'>"
			// +"			<div class='dlg_folder_open_2'></div>"
			// +"			<div class='dlg_file_up_add'></div>"
			// +"			<div class='dlg_file_up_load'></div>"
			// +"			<div class='dlg_file_up_exit'></div>"
			// +"		</div>"
			// +"	</div>"
			// +"</div>"
			// +"<form id='dlg_file_up_form' hidden='true' style='display:none' enctype='multipart/form-data' action='/file/upload/' method='post' target='_blank'>"
			// +"	<input id='dlg_upoad_path'  name='dlg_upoad_path'  type='input' style='display:none' value='/'>"
			// +"	<input id='dlg_upoad_files' name='dlg_upoad_files' type='file' style='display:none' multiple >"
			// +"	<input type='submit' value='upload'/ style='display:none' >"
			// +"</form/>";
	var dlg = $(html);
	$(".upload_dialog").remove();
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
	this._upload_path = path;
}

UploadDialog.prototype.echo = function(){
	alert("upload dialog");
}

// function onAddFileComplete(evt){
// 	alert("onAddFileComplete");	
// }
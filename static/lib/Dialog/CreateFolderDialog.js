var CreateFolderDialog = function (path, onOk, onClose) {
    this._path = path;
    Dialog.apply(this, arguments);
    this._onOK = onOk;
    this._onClose = onClose;
}

extend(CreateFolderDialog,Dialog)

CreateFolderDialog.prototype.show = function(){
	Dialog.prototype.show.apply(this, arguments);
	this._win.find(".new-folder-name").focus();
}


CreateFolderDialog.prototype.initCloseEvent = function(){
	var dlg = this;
	this._win.find(".dialog_exit:first").click(function(){
		dlg.destory();
	});

	this._win.find("#dlg_btn_exit:first").click(function(){
		dlg.destory();
	});
}

CreateFolderDialog.prototype.initOkEvent = function () {
    var dlg = this;
    this._win.find("#dlg_btn_ok").click(function() {
        var name = dlg._win.find(".new-folder-name").val();
        if (name == "") {
            alert("请输入文件夹名称");
            return;
        }

        var nameReg = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/;
        if(!nameReg.test(name)){
			alert("请输入有效的文件夹名称");
			return;
		}

        var path = dlg._path + name + "/" ;
        dlg.createFolder(path,function (result) {
            if(result.status == "success"){
                dlg.destory();
                if(dlg._onOK){
                    dlg._onOK();
                }
            }else{
                alert(result.message);
            }
        })
        
    });
    
    	this._win.find(".new-folder-name").keydown(function (e) {
		if(e.keyCode == 13){
			dlg._win.find("#dlg_btn_ok").click();
		}
    })
}



CreateFolderDialog.prototype.createFolder = function (path, callback) {
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

CreateFolderDialog.prototype.create = function () {
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
	return dlg;
}
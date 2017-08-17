var BeginnerHelper = function(){
	this._isShow = false;
	this._currentStep = 0;
	this._data = [
		{
			step :1 ,
			object : "#left .titlebar",
			position : "right",
			text: "点击新建",
			next : "false"
		},{
			step :2 ,
			object : ".create-model-dialog",
			position : "right",
			text: "输入名称和描述，点击确定",
			next : "false"
		},{
			step :3 ,
			object : "#models_container .model-item:first",
			position : "right",
			text: "可以看到新建的模型",
			next : "true"
		},{
			step :4 ,
			object : "#canvas_div",
			position : "top",
			text: "该区域为编辑区域，进行工作流的绘制",
			next : "true"
		},{
			step :5 ,
			object : "#state_div",
			position : "left",
			text: "默认是禁止编辑状态，选择启用开始进行编辑",
			next : "true"
		},{
			step :6 ,
			object : "#funcs",
			position : "top",
			text: "在算法库中选择一个算法，点击",
			next : "true"
		},{
			step :7 ,
			object : "#canvas_div",
			position : "top",
			text: "在画板上双击，得到一个算法节点",
			next : "true"
		},{
			step :8 ,
			object : "#data_div",
			position : "top",
			text: "点击数据节点",
			next : "true"
		},{
			step :9 ,
			object : "#canvas_div",
			position : "top",
			text: "在画板上双击，得到一个数据节点",
			next : "true"
		},{
			step :10 ,
			object : "#canvas_div",
			position : "top",
			text: "再次双击，得到另一个数据节点,一个作为输入，一个作为输出",
			next : "true"
		},{
			step :11 ,
			object : "#tools",
			position : "top",
			text: "点击第二个按钮“链接”按钮",
			next : "true"
		},{
			step :12 ,
			object : "#canvas_div",
			position : "top",
			text: "鼠标经过节点的时候，会显示连接点，点击该点，"+
					"拖动鼠标，绘制箭头，到达结束点的时候松开鼠标，依次连接输入和输出",
			next : "true"
		},{
			step :13 ,
			object : "#canvas_div",
			position : "top",
			text: "双击输入数据节点，弹出文件选择对话框",
			next : "true"
		},{
			step :14 ,
			object : ".file_dialog ",
			position : "right",
			text: "该面板显示该用户所属的文件,单击最右侧的上传文件按钮，弹出文件上传对话框",
			next : "true"
		},{
			step :15 ,
			object : ".upload_dialog",
			position : "right",
			text: "点击“选择文件”按钮，弹出打开对话框，选择文件，"+
					"点击“开始上传”按钮，上传成功后，关闭该对话框",
			next : "true"
		},{
			step :16 ,
			object : ".file_dialog ",
			position : "right",
			text: "在文件对话框中看到已经上传的文件，选中该文件，点击“确定”按钮，关闭该对话框",
			next : "true"
		},{
			step :17 ,
			object : "#canvas_div ",
			position : "top",
			text: "看到输入的数据节点已经进行了设置，双击输出的节点，将弹出打开对话框",
			next : "true"
		},{
			step :18 ,
			object : ".file_dialog ",
			position : "right",
			text: "在文件名输入框内，输入文件名称，注意后缀,输入结束后，点击确定，关闭对话框",
			next : "true"
		},{
			step :19 ,
			object : "#canvas_div",
			position : "top",
			text: "完善了该流程的输入和输出",
			next : "true"
		},{
			step :20 ,
			object : "#tools",
			position : "top",
			text: "点击最后一个“保存”按钮，将弹出保存结果",
			next : "true"
		},{
			step :21 ,
			object : ".new-task-btn",
			position : "left",
			text: "点击“新建”按钮，弹出新建任务对话框",
			next : "false"
		},{
			step :22 ,
			object : ".create-task-dialog",
			position : "right",
			text: "输入任务名称，点击确定，关闭对话框",
			next : "false"
		},{
			step :23 ,
			object : "#task_table",
			position : "bottom",
			text: "可以在任务列表中看到新建的任务,点击“运行”按钮，"+ 
					"如果有错误需要根据提示进行修改，否则将运行任务,弹出计算过程",
			next : "false"
		},{
			step :24 ,
			object : "#right",
			position : "left",
			text: "可以看到运行的状态，运行结束后，可查看运行结果，至此引导结束",
			next : "false"
		}
	]
}


BeginnerHelper.prototype.isShow = function(){
	if(this._isShow){
		return true;
	}else{
		return false;
	}
}
BeginnerHelper.prototype.show = function(step){

	// set object
	$(".highlight-object").removeClass("highlight-object");
	var data = this.getStepData(step);
	if(data == null){
		this.hide();
		return;
	}
	
	var object = $(data.object);
	if(object.length == 0){
		this.hide();
		return;
	}
	this._isShow = true;
	this._currentStep = step;
	object.addClass("highlight-object");
	object.attr("helper-text",data.text).attr("helper-position",data.position)
		.attr("helper-step",data.step).attr("helper-next",data.next);

	var clientRect = object[0].getBoundingClientRect();
	var styleHtml = "left:" + clientRect.left + "px;top:" + clientRect.top + "px; width:" 
					+ clientRect.width + "px;height:" + clientRect.height + "px";



	var infoText = object.attr("helper-text");

	if($(".black-overlay").length == 0){
		var blockHtml = '<div class="black-overlay"></div>';
		var overlayhtml = '<div class="highlight-overlay" style="' + styleHtml +  '"></div>';
		var infoHtml = 	'<div class="highlight-info">'
					+  	'	<div class="info-text">'
					+		infoText	
					+	'	</div>'
					+	'	<div class="info-bottom">'
					+	'		<button class="info-bottom-btn helper-hide">退出引导</button>'
					+	'		<button class="info-bottom-btn helper-step">下一步</button>'
					+	'	</div>'
					+	'</div>';


		var html = blockHtml + overlayhtml + infoHtml;

		$(".black-overlay,.highlight-overlay,.highlight-info").remove();
		$("body").after(html);

		var that = this;
		var infoDiv = $(".highlight-info");
		infoDiv.find(".helper-hide").click(function(){
			that.hide();
		});

		infoDiv.find(".helper-step").click(function(){
			var step = that._currentStep;
			that.show(step +1);
		});

	}else{
		$(".highlight-overlay").attr("style",styleHtml);
		$(".highlight-info .info-text").html(infoText);
	}

	var showNext = object.attr("helper-next");
	if(showNext == "false"){
		 $(".helper-step").addClass("hide-step");
	}else{
		$(".helper-step").removeClass("hide-step");
	}

	// 设置info的位置
	var infoDiv = $(".highlight-info");
	var infoHeight = infoDiv[0].getBoundingClientRect().height;
	var infoWidth = infoDiv[0].getBoundingClientRect().width;

	var position = object.attr("helper-position");
	var infoLeft = null,infoTop = null;
	var padding = 10;

	if(position == "left"){
		infoLeft = clientRect.left - infoWidth - padding;
		infoTop = clientRect.top;
	}else if(position == "right"){
		infoLeft = clientRect.left + clientRect.width + padding;
		infoTop = clientRect.top;
	}else if(position == "top"){
		infoLeft = clientRect.left;
		infoTop = clientRect.top - infoHeight - padding;
	}else if(position == "bottom"){
		infoLeft = clientRect.left;
		infoTop = clientRect.top + clientRect.height + padding;
	}	

	infoDiv.css("top",infoTop + "px").css("left",infoLeft + "px");

}

BeginnerHelper.prototype.hide = function(){
	this._isShow = false;
	$(".highlight-object").removeClass("highlight-object");
	$(".black-overlay,.highlight-overlay,.highlight-info").remove();
	var infoDiv = $(".highlight-info");
}


BeginnerHelper.prototype.getStepData = function(step){
	for(var i = 0 ; i < this._data.length;++i){
		var d = this._data[i];
		if(d.step ==  step){
			return d;
		}
	}
	return null;
}
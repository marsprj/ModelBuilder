var BeginnerHelper = function(){
	var _isShow = false;
}


BeginnerHelper.prototype.isShow = function(){
	if(this._isShow){
		return true;
	}else{
		return false;
	}
}
BeginnerHelper.prototype.show = function(step){

	var object = $("[helper-step='" + step + "']");
	if(object.length == 0){
		return;
	}
	this._isShow = true;

	$(".highlight-object").removeClass("highlight-object");
	object.addClass("highlight-object");
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
			var step = parseInt($(".highlight-object").attr("helper-step"));
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

	var infoDiv = $(".highlight-info");
	var infoHeight = infoDiv.height();
	var infoWidth = infoDiv.width();

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
}
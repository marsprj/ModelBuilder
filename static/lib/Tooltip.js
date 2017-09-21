var Tooltip = function(option){
	if(!option){
		return;
	}
	if(option.target){
		this._target = option.target;
	}

	if(option.text){
		this._text = option.text;
	}

	var element = $(this._target);
	if(element.length == 0){
		return;
	}

	this._time = 5;


	var clientRect = element[0].getBoundingClientRect();
	var top =  clientRect.top + clientRect.height/2 - 26/2;
	var left = clientRect.left + clientRect.width + 10;
	var styleHtml = "left:" + left + "px;top:" + top + "px; ";

	var html = '<div class="tooltip" style="' + styleHtml + '">'
				+'	<span class="tooltiptext tooltip-right">' + this._text + '</span>'
				+'</div>';

	$(".tooltip").remove();
	$("body").append(html);

	this._div = $(".tooltip");

	var that = this;
	setTimeout(function(){
		that.destory();
	},this._time*1000);


	this._div.hover(function() {
		setTimeout(function(){
			that.destory();
		},1*1000);
	}, function() {
		
	});
}

Tooltip.prototype.show = function(){
	this._div.css("opacity","1");
};

Tooltip.prototype.hide = function(){
	this._div.css("opacity","0");
};

Tooltip.prototype.destory = function(){
	this._target = null;
	this._text = null;
	if(this._div){
		this._div.remove();
		this._div = null;
	}
};
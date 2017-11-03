function getModelsStatus(status,callback){

	var url = "/model/models/" + status + "/status/";
	$.ajax({
		url : url,
		dataType : "text",
		async : true,
		success : function(json,textStatus){
			var result = JSON.parse(json);
			if(callback){
				callback(result);
			}
		},
		error : function(xhr){
			console.log(xhr)
		}
	});
}

function showModelsStatus(status){
	// $("#models_container").empty().addClass("loading");
	$("#monitor_model_table .row:not(.header)").remove();
	getModelsStatus(status,function(result){
		if(result.status == "error"){
			alert(result.message);
			return;
		}

		var html = '';
		for(var i = 0; i < result.length;++i){
			var model = result[i];
			html += '<div class="row">'
                +'    <div class="cell">' + (i +1) + '</div>'
                +'    <div class="cell">' + model.name  + '</div>'
                +'    <div class="cell">' + model.create_time + '</div>'
                +'    <div class="cell">正常</div>'
                +'    <div class="cell">'
                +'        <label class="switch">'
                +'            <input type="checkbox" checked="">'
                +'            <span class="slider round"></span>'
                +'        </label>'
                +'    </div>'
                +'</div>';
		}
		$("#monitor_model_table .row:not(.header)").remove();
	 	$("#monitor_model_table .header").after(html);		
	});
}
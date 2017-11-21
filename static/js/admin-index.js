$().ready(function () {
    var username = getCookie("username");
    if(username){
        if(username != "admin"){
            window.location.href = "index.html";
        }
        $("#main").show();
	    $(".user-name").html("用户&nbsp;:&nbsp;" + username);
    }else{
        window.location.href = "login.html";
    }

    registerPanelEvent();

});
function getCookie(name){
    var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
    if(arr != null) return unescape(arr[2]); return null;
}

function registerPanelEvent(){
    //退出
    $(".logout").click(function(){
        logout();
    });

    // 切换tab
    $("#menu_panel .menu").click(function(event) {
        $("#menu_panel .menu").removeClass('active');
        $(this).addClass('active');
        var pre = $(this).attr("pre");
        var tab = pre + "_tab_panel";
        $(".tab-panel").removeClass('active');
        $("#" + tab).addClass('active');

        if(pre == "user"){
            showUsersCount();
        }else if (pre === "model") {
            showModelsStatus(g_model_state);
        }
    });

        //排序切换
    $("#user_panel .order-icon").click(function(){
        changeOrderBy(this);
    });

    // 切换模型状态
    $(".model-state-div li").click(function(){
        $(".model-state-div li").removeClass('active');
        $(this).addClass('active');
        var status = $(this).attr("status");
        g_model_state = status;
        showModelsStatus(status);
    });
}

function login(username,password) {
    var obj = {
        "username": username,
        "password": password
    }
    var text = JSON.stringify(obj);
    $(".info").html("登录中……");
    $.ajax({
        type:"POST",
        url:"/model/login/",
        data : text,
        contentType: "text/plain",
        dataType : "text",
        success:function(result){
            var text = JSON.parse(result);
            if(text.status == "error"){
                $(".info").html(text.message);
            }else{
                $(".info").html("登录成功，正在跳转……");
                window.open("index.html");
            }
        },
        error:function(xhr){
            $(".info").html("登录失败");
            console.log(xhr);
        }
    });
}
function logout() {
    var url = "/model/admin/logout/" ;
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
            $(".info").html("注销失败");
            console.log(xhr);
        }
    });
}
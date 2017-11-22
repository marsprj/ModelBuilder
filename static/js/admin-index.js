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

    showAmdinInfo();
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
        }else if (pre == "index") {
            showAmdinInfo();
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

    // 切换监听状态
    $(".monitor-oper input[type='checkbox']").change(function(){
        changeMonitorStatus(this);
    });

    // 进入具体的页面
    $(".inner-box").click(function(event) {
        if($(this).hasClass('user-box')){
            $(".menu[pre='user']").click()
        }else if ($(this).hasClass('model-box')) {
            $(".menu[pre='model']").click();
        }
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

// 获取统计信息
function getAdminInfo(callback){
    var url = "/model/admin/info/" ;
    $.ajax({
        type:"GET",
        url:url,
        contentType: "text/plain",
        dataType : "text",
        success:function(result){
            var text = JSON.parse(result);
            if(callback){
                callback(text);
            }
        },
        error:function(xhr){
            $(".info").html("注销失败");
            console.log(xhr);
        }
    });    
}

// 展示用户、模型、监听等统计信息
function showAmdinInfo(callback){
    getAdminInfo(function(result){
        if(!result){
            return;
        }

        if(result.status == "error"){
            console.log(result.message);
            return;
        }

        $(".user-box .box-info").html(result.users);
        $(".model-box .box-info").html(result.models);
        $(".task-box .box-info").html(result.tasks);
    });

    showMonitorStatus();
}

// 展示监听状态
function showMonitorStatus(){
    $(".monitor-status span").html("…");
    getMonitorStatus(function(result){
        if(!result){
            return;
        }

        if(result.status == "error"){
            alert(result.message);
            return;
        }

        var status = result.monitorStatus;
        if(status == "start"){
            $(".monitor-status span").html("开启");
            $(".monitor-oper input").prop("checked",true);
        }else if (status == "stop") {
            $(".monitor-status span").html("停止");
            $(".monitor-oper input").prop("checked",false);
        }        
    });
}

function getMonitorStatus(callback){
    var url = "/model/monitor/status/" ;
    $.ajax({
        type:"GET",
        url:url,
        contentType: "text/plain",
        dataType : "text",
        success:function(result){
            var text = JSON.parse(result);
            if(callback){
                callback(text);
            }
        },
        error:function(xhr){
            $(".info").html("注销失败");
            console.log(xhr);
        }
    }); 
}


// 切换监听状态
function changeMonitorStatus(input){
    var checked = $(input).prop("checked");
    var info = $(".monitor-status span");
    if (checked) {
        info.html("正在开启监听");
        monitorOper("start",function(result){
            if(!result){
                return;
            }

            if(result.status == "error"){
                console.log(result.message);
                info.html("开启失败");
                return;
            }
            info.html("开启成功");

            setTimeout(function(){
                showMonitorStatus();
            }, 500);

        });
    } else {
        info.html("正在关闭监听");
        monitorOper("stop",function(result){
            if(!result){
                return;
            }

            if(result.status == "error"){
                console.log(result.message);
                info.html("关闭失败");
                return;
            }
            info.html("关闭成功");

            setTimeout(function(){
                showMonitorStatus();
            }, 500);
        });
    }
}


function monitorOper(oper,callback){
    if(!oper){
        if(callback){
            callback("");
            return;
        }
    }
    var url = "/model/monitor/" +  oper + "/" ;
    $.ajax({
        type:"GET",
        url:url,
        contentType: "text/plain",
        dataType : "text",
        success:function(result){
            var text = JSON.parse(result);
            if(callback){
                callback(text);
            }
        },
        error:function(xhr){
            $(".info").html("注销失败");
            console.log(xhr);
        }
    }); 
}
function showUsersCount(){
    $("#user_tab_panel .count-div span").html('0');
    $("#user_tab_panel .pagination").empty();
    $("#user_panel .table .row:not(.header)").remove();
    getUsersCount(onGetUsersCount);
}

// 获取用户个数
function getUsersCount(callback){
    $.ajax({
        type:"get",
        url:"/model/users/count",
        contentType: "text/plain",
        dataType : "text",
        success:function(result){
            var text = JSON.parse(result);
            if(callback){
                callback(text);
            }
        }
    });
}

function onGetUsersCount(result){
    if(result.status == "error"){
        console.log(result.message);
        return;
    }
    var count = result.count;
    $("#user_tab_panel .count-div span").html(count);

    var pageCount = Math.ceil(count/g_userMaxCount);
    g_userPageCount = pageCount;

    initUserPageControl(1,g_userPageCount);
}

// 初始化页码
function initUserPageControl(currentPage,pageCount){
    if(currentPage <=0 || currentPage > pageCount){
        return;
    }
    var html = "";
    // 前一页
    if(currentPage == 1){
        html += '<li class="disabled">'
            + '     <a href="javascript:void(0)" aria-label="Previous">'
            + '         <span aria-hidden="true">«</span>'
            + '     </a>'
            + ' </li>';
    }else{
        html += '<li>'
            + '     <a href="javascript:void(0)" aria-label="Previous">'
            + '         <span aria-hidden="true">«</span>'
            + '     </a>'
            + ' </li>';
    }
    // 如果页码总数小于要展示的页码，则每个都显示
    if(pageCount <= g_pageNumber){
        for(var i = 1; i <= pageCount; ++i){
            if(i == currentPage){
                html += '<li class="active">'
                +   '   <a href="javascript:void(0)">' + currentPage.toString() 
                // +    '       <span class="sr-only">(current)</span>'
                // +    '       <span class="sr-only">(' + currentPage + ')</span>'
                +   '</a>'
                +   '</li>';
            }else{
                html += "<li>"
                    + "<a href='javascript:void(0)'>" + i + "</a>"
                    + "</li>";  
            }
        }   
    }else{
        // 开始不变化的页码
        var beginEndPage = pageCount - g_pageNumber + 1;
        if(currentPage <= beginEndPage){
            for(var i = currentPage; i < currentPage + g_pageNumber;++i){
                if(i == currentPage){
                    html += '<li class="active">'
                    +   '   <a href="javascript:void(0)">' + currentPage
                    // +    '       <span class="sr-only">(current)</span>'
                    +   '</a>'
                    +   '</li>';
                }else{
                    html += "<li>"
                        + "<a href='javascript:void(0)'>" + i + "</a>"
                        + "</li>";  
                }                   
            }
        }else{
            for(var i = beginEndPage; i <= pageCount; ++i){
                if(i == currentPage){
                    html += '<li class="active">'
                    +   '   <a href="javascript:void(0)">' + currentPage
                    // +    '       <span class="sr-only">(current)</span>'
                    +   '</a>'
                    +   '</li>';
                }else{
                    html += "<li>"
                        + "<a href='javascript:void(0)'>" + i + "</a>"
                        + "</li>";  
                }
            }
        }
    }
    
    // 最后一页
    if(currentPage == pageCount){
        html += '<li class="disabled">'
            + '     <a href="javascript:void(0)" aria-label="Next">'
            + '         <span aria-hidden="true">»</span>'
            + '     </a>'
            + ' </li>';
    }else{
        html += '<li>'
            + '     <a href="javascript:void(0)" aria-label="Next">'
            + '         <span aria-hidden="true">»</span>'
            + '     </a>'
            + ' </li>';
    }

    $("#user_tab_panel .pagination").html(html);

    registerUserPageEvent();

    getUserPage(currentPage);
}

// 页码事件
function registerUserPageEvent(){
    $("#user_tab_panel .pagination li a").click(function(){
        var active = $("#user_tab_panel .pagination li.active a").html();
        var currentPage = parseInt(active);

        var label = $(this).attr("aria-label");
        if(label == "Previous"){
            currentPage = currentPage - 1;
        }else if(label == "Next"){
            currentPage = currentPage + 1;
        }else{
            currentPage = parseInt($(this).html());
        }
        
        initUserPageControl(currentPage,g_userPageCount);
    });
}

// 按照页码获取
function getUserPage(page){
    if(page <= 0  || page > g_userPageCount){
        return;
    }

    var offset = (page -1) * g_userMaxCount;

    $("#user_panel .table .row:not(.header)").remove();
    $("#user_panel .panel-content").addClass('loading');

    getUserList(g_userMaxCount,offset,g_user_order_field,g_userOrder,onGetUserList);
}

// 用户列表
function getUserList(count,offset,field,orderby,callback) {
    if(count == null || offset == null || field == null || orderby == null){
        if(callback){
            callback("");
        }
        return;
    }
    $.ajax({
        type:"get",
        url:"/model/users/list/" + count + "/" + offset + "/" + field + "/" + orderby + "/",
        contentType: "text/plain",
        dataType : "text",
        success:function(result){
            var text = JSON.parse(result);
            if(callback){
                callback(text);
            }
        }
    });
}

// 展示用户列表
function onGetUserList(result){
    $("#user_panel .panel-content").removeClass('loading');
    if(!result){
        return;
    }
    if(result.status == "error"){
        alert(result.message);
        return;
    }
    var html = '';
    for(var i = 0; i < result.length;++i){
        var item = result[i];
        html += '<div class="row" uuid="' +item.uuid + '" uname="' + item.name + '">'
            +   '   <div class="cell">' + (i+1) + '</div>'
            +   '   <div class="cell">' + item.name + '</div>'
            +   '   <div class="cell">' + item.password + '</div>'
            +   '   <div class="cell">' + item.login_time + '</div>'
            +   '   <div class="cell">' + item.models + '</div>'
            +   '   <div class="cell">'
            +   '       <a class="user-oper user-visit" href="javascript:void(0)">访问</a>'
            +   '       <a class="user-oper user-delete" href="javascript:void(0)">删除</a>'
            +   '    </div>'
            +   '</div>';
    }

    $("#user_panel .table .header").after(html);

    $("#user_panel .table .user-delete").click(function () {
        var user_id = $(this).parents(".row").attr("uuid");
        var name = $(this).parents(".row").attr("uname");
        if(!confirm("确定删除用户[" + name + "]")){
            return;
        }
        deleteUser(user_id,function(result) {
            if(result.status == "success"){
                alert("删除成功")
                showUsersCount();
            }else{
                alert(result.message);
            }
        });
    })

    $("#user_panel .table .user-visit").click(function () {
         var user_id = $(this).parents(".row").attr("uuid");
         var name = $(this).parents(".row").attr("uname");
         var password = $(this).parents(".row").find(".cell:eq(2)").html();
         login(name,password);

    })
}

// 删除用户
function deleteUser(user_id,callback) {
    if(user_id == null){
        if(callback){
            var result = '{"status":"error","message":"user is not valid"}';
            callback(JSON.parse(result));
        }
        return;
    }
     $.ajax({
        type:"get",
        url:"/model/user/" + user_id + "/delete/",
        contentType: "text/plain",
        dataType : "text",
        success:function(result){
            var text = JSON.parse(result);
            if(callback){
                callback(text);
            }
        },
        error:function(xhr){
            $(".info").html("获取用户列表失败");
            console.log(xhr);
        }
    });
}


// 排序切换
function changeOrderBy(element){
    var field = $(element).prev().attr("field");
    g_user_order_field = field;

    var isActive = $(element).hasClass('active');
    if(isActive){
        var order = $(element).hasClass('asc');
        if(order){
            g_userOrder = "desc";
            $(element).removeClass('asc');
        }else{
            g_userOrder = "asc";
            $(element).addClass('asc');
        }
    }else{
        $(".order-icon").removeClass('active');
        $(element).addClass('active');
        var order = $(element).hasClass('asc');
        if(order){
            g_userOrder = "asc";
        }else{
            g_userOrder = "desc";
        }
    }

    showUsersCount();
}
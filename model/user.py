import json,logging,os
from .views import http_error_response,http_success_response
from .models import Model, Task, Process,User
from json import JSONDecodeError
from django.utils import timezone
from django.http import HttpResponse
from ModelFlow import settings


logger = logging.getLogger('model.app')

"""
用户注册
"""
def user_register(request):
    text = request.body.decode('utf-8')
    try:
        obj = json.loads(text)
    except JSONDecodeError:
        logger.error("register user text:{0}".format(text))
        return http_error_response("参数有错误")

    try:
        username = obj["username"]
        users = User.objects.filter(username=username)
    except Exception as e:
        logger.error("get user[{0}] failed: {1}".format(username, str(e)))
        return http_error_response("query user failed")

    if len(users)>0:
        logger.error("register user failed: has user named[{0}]".format(username))
        return http_error_response("已经有该用户")

    try:
        password = obj["password"]
        time = timezone.now()
        user = User(
            username=username,
            password=password,
            login_time=time
        )
        user.save()
        user_uuid = user.uuid
        response = http_success_response()
        response.set_cookie('username', username, 3600)
        response.set_cookie('user_uuid', user_uuid, 3600)
        user_root = os.path.join(settings.UPLOADS_ROOT, str(user_uuid))
        os.makedirs(user_root)
        logger.info("register user[{0}]".format(username))
        return response
    except Exception as e:
        logger.error("register user failed:{0}".format(str(e)))
        return http_error_response("用户注册失败")


"""
用户登录
"""
def user_login(request):
    text = request.body.decode('utf-8')
    try:
        obj = json.loads(text)
    except JSONDecodeError:
        logger.error("登录解析失败：" + text)
        return http_error_response("解析失败")

    try:
        username = obj["username"]
        password = obj["password"]
        user = User.objects.filter(username=username)
        if len(user) == 0:
            logger.error("user[{0}] does not exist".format(username))
            return http_error_response("用户不存在")
    except Exception as e:
        logger.error("用户[{0}]登录失败:{1}".format(username, str(e)))
        return http_error_response("登录失败")

    try:
        user = User.objects.get(username=username, password=password)
    except User.DoesNotExist:
        logger.error("用户[{0}]登录失败: 密码错".format(username))
        return http_error_response("密码错误")
    except Exception as e:
        logger.error("user login failed : {0}".format(str(e)))
        return http_error_response("登录失败")
    try:
        time = timezone.now()
        user.login_time = time;
        user.save();
        response = http_success_response();
        response.set_cookie('username', username, 36000)
        response.set_cookie('user_uuid', str(user.uuid), 36000)
        logger.info("用户[{0}]登录成功".format(username))
        return response
    except Exception as e:
        logger.error("用户[{0}]登录失败:{1}".format(username,str(e)))
        return http_error_response("登录失败")


"""
用户注销
"""
def user_logout(request,username):
    response = http_success_response()
    response.delete_cookie("username")
    response.delete_cookie("user_uuid")
    logger.info("用户[{0}]注销".format(username))
    return  response


"""
获取用户个数
"""
def users_count(request):
    username = request.COOKIES.get("username")
    if not username:
        logger.error("get user list failed: user not login")
        return http_error_response("please login")
    if username != "admin":
        logger.error("get user list failed: user is not admin")
        return http_error_response("please login admin")

    try:
        users = User.objects.all().exclude(username='admin')
        obj = {
            "count": len(users)
        }

        logger.info("get users count:{}".format(str(len(users))))
        return HttpResponse(json.dumps(obj),content_type="application/json")
    except Exception as e:
        logger.error("get users count failed:{}".format(str(e)))
        return http_error_response("get users count failed")

"""
分页获取用户列表
"""
def user_list(request,count,offset,field,orderby):
    username = request.COOKIES.get("username")
    if not username:
        logger.error("get user list failed: user not login")
        return http_error_response("please login")
    if username != "admin":
        logger.error("get user list failed: user is not admin")
        return http_error_response("please login admin")

    try:
        start = int(offset)
        end = int(offset) + int(count)
        users = User.objects.all().exclude(username='admin')
        users_list = []
        users_list.extend(users)
        obj = []
        if orderby == 'desc':
            reverse_order = True
        else:
            reverse_order = False
        if field == "login_time":
            users_list.sort(key=lambda k: k.login_time,reverse=reverse_order)
        elif field == "models":
            users_list.sort(key=lambda k: len(k.model_set.all()), reverse=reverse_order)
        elif field == "username":
            users_list.sort(key=lambda k: k.username, reverse=reverse_order)

        return_list = users_list[start:end]
        for user in return_list:
            obj.append(user.exportToJson())
        text = json.dumps(obj)
        logger.info("get user list offset[{}] count[{}] order by {} {}:{}".format(offset,
                                                                    count,field,orderby,text))
        return HttpResponse(text, content_type="application/json")
    except Exception as e:
        logger.error("get user list failed:{0}".format(str(e)))
        return http_error_response("get user list failed")

"""
用户删除
"""
def user_delete(request,user_id):
    try:
        user = User.objects.get(uuid=user_id)
    except User.DoesNotExist:
        logger.error("delete user[{0}] failed : user is not exist".format(user_id))
        return http_error_response("user is not exist")
    except Exception as e:
        logger.error("get delete user[{0}] failed:{1}".format(user_id,str(e)))
        return http_error_response("get delete user failed")

    try:
        user.delete()
        logger.info("delete user[{0}] success".format(user_id))
    except Exception as e:
        logger.error("delete user[{0}] failed: {1}".format(user_id,str(e)))
        return http_error_response("delete user failed")
    return http_success_response()


"""
用户、模型等统计信息
"""
def admin_info(request):
    try:
        username = request.COOKIES.get("username")
        if not username:
            logger.error("get admin info list: user not login")
            return http_error_response("please login")
        if username != "admin":
            logger.error("get admin info list failed: user is not admin")
            return http_error_response("please login admin")
    except Exception as e:
        logger.error("get admin info list failed:{}".format(str(e)))
        return http_error_response("get admin info list failed")

    try:
        users = User.objects.all().exclude(username='admin')
        models = Model.objects.all()
        tasks = Task.objects.all()
        obj = {
            "users": len(users),
            "models": len(models),
            "tasks": len(tasks)
        }
        return HttpResponse(json.dumps(obj), content_type="application/json")
    except Exception as e:
        logger.error("get admin info list failed:{}".format(str(e)))
        return http_error_response("get admin info list failed")
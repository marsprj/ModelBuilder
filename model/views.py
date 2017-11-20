from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render,render_to_response
from django import  forms
from django.db.utils import OperationalError

from . import models
from . import functions
from .models import Model, Task, Process,User
from .Graph import Graph
from ModelFlow import settings
import ModelFlow
import signal
import subprocess
import psutil


from django.utils import timezone

import time, json, uuid, datetime, os, os.path, logging,shutil
from json import JSONDecodeError

# Create your views here.

logger = logging.getLogger('model.app')

def index(request):
    return HttpResponse("hello world.")

def model_save(request,username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        logger.error("用户{[0]}不存在".format(username))
        return http_error_response("该用户不存在")
    except OperationalError as e:
        logger.error("user query failed :{0}".format(str(e)))
        return  http_error_response("user query failed")
    user_id = user.uuid

    text = request.body.decode('utf-8')

    #解析Model的json对象
    logger.debug("user[{0}] model save : {1}".format(username,text))
    try:
        obj = json.loads(text)
    except JSONDecodeError as e:
        logger.error("Model的json对象解析失败:{0}".format(str(e)))
        return http_error_response("Model的json对象解析失败")


    try:
        # 检索数据库，看当前Model是否已经存在
        model_name = obj["name"]
        models = user.model_set.filter(name=model_name)
    except OperationalError as e:
        logger.error("Model查询失败:{0}".format(str(e)))
        return http_error_response("Model查询失败")
    try:
        if len(models)>0:
            #Model已经存在，修改Model的数据
            #return http_error_response("Model[{0}]已经存在".format(model_name))
            model = models[0]
            model.text = json.dumps(obj)
            #model.save();
        else:
            #Model不存在，创建新的Model
            create_time = timezone.now()
            obj["create_time"] = str(create_time)
            user = User.objects.get(username=username)
            model = user.model_set.create(name=model_name,
                description=model_name,
                create_time=create_time,
                text=json.dumps(obj))
    except Exception as e:
        logger.error("save model[{0} failed:{1}".format(model_name,str(e)))
        return http_error_response("Model保存失败")
    # 创建model的目录
    model_path = os.path.join(ModelFlow.settings.MODEL_ROOT, str(model.uuid))
    if not os.path.exists(model_path):
        try:
            os.makedirs(model_path)
        except OSError as e:
            logger.error(e.strerror)

    # 保存model
    try:
        model.save()
        obj = {
            "uuid" : str(model.uuid),
            "status":"success"
        }
        return HttpResponse(json.dumps(obj), content_type="application/json")
    except Exception as e:
        logger.error("Model保存失败:{0} ".format(str(e)))
        return http_error_response("Model保存失败")

"""
返回所有的Model
"""
def models(request,username):

    obj = []
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        logger.error("no user[{0}]".format(username))
        return http_error_response("no user")
    except Exception as e:
        logger.error("get models failed : {0}".format(str(e)))
        return http_error_response("get modesl failed")

    try:
        models = user.model_set.all().order_by("-create_time")
        for model in models:
            obj.append(model.exportToJson())
        result = json.dumps(obj)
        logger.debug("user [{0}] get models list: {1}".format(username,str(obj)))
        return HttpResponse(result, content_type="application/json")
    except Exception as e:
        logger.error("get user [{0}] models failed :{1}".format(str(e)))
        return http_error_response("get user models failed")


"""
返回指定id的Model
"""
def model_get(request, model_id):
    try:
        model = Model.objects.get(uuid=model_id)
    except Model.DoesNotExist:
        logger.error("no model [{0}]".format(model_id))
        return http_error_response("Model does not exist")
    except Exception as e:
        logger.error("get model[{0}] failed:{1}".format(model_id,str(e)))
        return http_error_response("get model failed")
    return HttpResponse(model.text, content_type="application/json")

"""
删除指定id的Model
"""
def model_delete(request,model_id):
    try:
        model = Model.objects.get(uuid=model_id)
    except Model.DoesNotExist:
        logger.error("Model does not exist [{0}]".format(model_id))
        return http_error_response("Model不存在")
    except Exception as e:
        logger.error("query model failed: {0}".format(str(e)))
        return http_error_response("query model failed")

    try:
        model.delete()
        kill_model_monitor(model_id)
        logger.info("delete model [{0}] success".format(model_id))
    except Exception as e:
        logger.error("delete model [{0}]:".format(model_id,str(e)))
        return http_error_response("delete model failed")
    return http_success_response()

def model_plan(request, model_id):
    model = Model.objects.filter(uuid=model_id)[0]
    graph = Graph()
    if not graph.load(model.text):
        return HttpResponse("Error")
    else:
        flow = graph.plan()
        plan = ""
        for s in flow:
            plan += "{0}({1})-->".format(s.getID(), s.getName())
        return HttpResponse(plan)

"""
获取model_id指定的Model下面的Task
"""
def model_tasks(request, model_id):
    try:
        model = Model.objects.get(uuid=model_id)
    except Model.DoesNotExist:
        logger.error("no model [{0}]".format(model_id))
        return http_error_response("no model [{0}]".format(model_id))
    except Exception as e:
        logger.error("get model[{0}] task failed : {1}".format(model_id,str(e)))
        return http_error_response("get model task failed")

    try:
        tasks = model.task_set.all().order_by("-start_time")
        obj = []
        for task in tasks:
            obj.append(task.exportToJson())
        text = json.dumps(obj)
        return HttpResponse(text, content_type="application/json")
    except Exception as e:
        logger.error("get model[{0}] task failed : {1}".format(model_id,str(e)))
        return HttpResponse("get model task failed")


"""
获取Task的状态
"""
def tasks(request):
    try:
        username = request.COOKIES['username']
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        logger.error("no user[{0}]".format(username))
        return http_error_response("no user[{0}]".format(username))

    try:
        obj = []
        models = user.model_set.all()
        for model in models:
            tasks = model.task_set.all();
            for task in tasks:
                obj.append(task.exportToJson())
        text = json.dumps(obj)
        return HttpResponse(text, content_type="application/json")
    except:
        return http_error_response("")
"""
获取Task的text
"""
def task_get(request,task_id):
    try:
        task = Task.objects.get(uuid=task_id)
    except Task.DoesNotExist:
        logger.error("no task [{0}]".format(task_id))
        return http_error_response("Task does not exist")
    except Exception as e:
        logger.error("get task[{0}] failed : {1}".format(task_id,str(e)))
        return http_error_response("get task failed")
    try:
        if task.text == '':
            task.text = task.model.text
            task.save()
        return HttpResponse(task.text,content_type="application/json")
    except Exception as e:
        logger.error("get task[{0}] failed : {1}".format(task_id, str(e)))
        return http_error_response("get task failed")

"""
保存task的text
"""
def task_save(request,task_id):
    try:
        task = Task.objects.get(uuid=task_id)
    except Task.DoesNotExist:
        logger.error("no task [{0}]".format(task_id))
        return http_error_response("Task does not exist")
    except Exception as e:
        logger.error("get task[{0}] failed : {1}".format(task_id,str(e)))
        return http_error_response("save task failed")

    try:
        text = request.body.decode('utf-8')
        logger.debug("task[{0}] save : {1}".format(task_id,text))
    except Exception as e:
        logger.error("task text is invaild:{0}".format(text))
        return http_error_response("save task failed")


    try:
        obj = json.loads(text)
    except JSONDecodeError as e:
        logger.error("Task的json对象解析失败:{0}".format(str(e)))
        return http_error_response("task的json对象解析失败")

    try:
        task.text = json.dumps(obj)
        task.save()
        obj = {
            "uuid": str(task.uuid),
            "task_name" : task.name,
            "status": "success"
        }
        return HttpResponse(json.dumps(obj), content_type="application/json")
    except Exception as e:
        logger.error("save task failed :{0} ".format(str(e)))
        return http_error_response("任务保存失败")

"""
获取指定Task的状态
"""
def task_state(request, task_id):
    try:
        task = Task.objects.get(uuid=task_id)
    except Task.DoesNotExist:
        logger.error("task[{0}] does not exist".format(task_id))
        return http_error_response("task does not exist")
    except Exception as e:
        logger.error("get task[{0}] state failed : {1}".format(task_id,str(e)))
        return http_error_response("get task state failed")

    try:
        processes = task.process_set.all()
        percent = 0

        obj = {
            "id": task.id,
            "name": task.name,
            "uuid": str(task.uuid),
            "model": str(task.model_id),
            "state": task.state,
            "start_time": task.start_time.astimezone().strftime("%Y-%m-%d %H:%M:%S"),
            "end_time": "-" if task.end_time==None else task.end_time.astimezone().strftime("%Y-%m-%d %H:%M:%S"),
            "processes" : [],
            "percent": "{0}%".format(task.complete_percent),
        }

        for process in processes:
            obj["processes"].append(process.exportToJson())
        text = json.dumps(obj)
        return HttpResponse(text, content_type="application/json")
    except Exception as e:
        logger.error("get task[{0}] state failed:{1}".format(task_id, str(e)))
        return http_error_response("get task state failed")


"""
创建Model的Task
返回Task的uuid
"""
def task_create(request):

    text = request.body.decode('utf-8')

    # 解析Model的json对象
    try:
        obj = json.loads(text)
    except JSONDecodeError as e:
        logger.error("parse create task json failed: {0}".format(text))
        return http_error_response("Task的json对象解析失败")

    start_time = timezone.now()

    #初始化task_name，如果没有指定task_name，则用当前时间作为task_name
    model_id = obj["model"]
    if "name" in obj:
        task_name = obj["name"]
    else:
        task_name = start_time.astimezone().strftime("%Y%m%d%H%M%S")
    try:
        model = Model.objects.get(uuid=model_id)
    except Model.DoesNotExist:
        logger.error("create task failed: model[{0}] does not exist".format(model_id))
        return http_error_response("create task failed")
    except Exception as e:
        logger.error("create task {0} failed : {1}".format(task_name,str(e)))
        return http_error_response("create task failed")

    try:
        text = model.text
        task = model.task_set.create(
            uuid=uuid.uuid4(),
            name=task_name,
            start_time=start_time,
            text=text
            #end_time=timezone.now(),
        )
        task.save()

        obj = {
            "uuid" : str(task.uuid)
        }
        logger.debug("create task success:{0}".format(text))
        return HttpResponse(json.dumps(obj), content_type="application/json")
    except Exception as e:
        logger.error("create task {0} failed:{1}".format(task_name,str(e)))
        return http_error_response("create task failed")


"""
运行task
"""
def task_run(request, task_id):
    try:
        task = Task.objects.get(uuid=task_id)
    except Task.DoesNotExist:
        logger.error("task[{0}] does not exist".format(task_id))
        return http_error_response("task does not exist")
    except Exception as e:
        logger.error("task[{0}] query failed:{1}".format(task_id,str(e)))
        return http_error_response("run task failed")

    if task.state == 1: #running
        return http_error_response("Task正在运行")

    return start_task_2(task)

"""
启动模型计算
"""
def start_task_2(task):

    try:
        user_uuid = task.model.user.uuid
    except:
        logger.error("get user failed")
        return http_error_response('用户没有登录')
    try:
        success = True
        graph = Graph()
        if task.text == "":
            task.text = task.model.text
            task.save()
        if not graph.load(task.text):
            pass
        else:
            task.start_time = timezone.now()
            task.end_time = None
            task.complete_percent = 0
            task.state = 1
            task.save()

            #文件夹处理
            file_root = get_file_root()
            user_root = os.path.join(file_root,str(user_uuid))
            task_path = os.path.join(user_root,str(task.uuid))
            if os.path.exists(task_path):
                shutil.rmtree(task_path)
            os.mkdir(task_path)
            logger.info("create task folder:{0}".format(task_path))

            #生成执行计划
            flow = graph.plan()
            if flow:

                #task.process_set.delete()
                Process.objects.filter(task=task).delete()

                #生成执行步骤及其状态,记录Process的状态
                processes = []
                for func in flow:
                    process = task.process_set.create(
                        name = func.getName(),
                        node_id = func.getID()
                        #start_time = timezone.now(),
                        #end_time = timezone.now()
                    )
                    process.save()
                    processes.append(process)

                #执行Plan
                count = len(processes)
                for i in range(count):
                    # 先判断是否已经失败了
                    task = Task.objects.get(uuid=task.uuid)
                    if task.state == 3:
                        logger.error("task[{0}] already fail".format(str(task.uuid)))
                        success = False;
                        errmsg = "run task failed:already fail"
                        break;

                    #执行func
                    #更新process的状态为正在执行
                    process = processes[i]
                    process.state = 1
                    process.complete_percent = 0
                    process.start_time = timezone.now()
                    process.save()


                    ###################################################
                    # 执行计算任务 Begin
                    ###################################################
                    func = flow[i]
                    #processing func
                    logger.debug(func.getName())

                    success = False
                    errmsg  = ""
                    process_func_name = "process_" + func.getName()
                    #检查是否存在相应的处理函数
                    if hasattr(functions, process_func_name.lower()):
                        #如果存在相应的处理函数，则获取该处理函数
                        f = getattr(functions, process_func_name.lower())
                        #处理计算任务
                        logger.info("run {0} function".format(process_func_name))
                        try:
                            success = f(func,process,str(user_uuid))
                        except Exception as e:
                            errmsg = "process {0} run failed :{1}".format(process_func_name,str(e))
                            logger.error(errmsg)
                            success = False
                    else:
                        errmsg = "方法[{0}]尚未在系统中注册".format(func.getName());
                        logger.error(errmsg)
                        success = False

                    # time.sleep(5)
                    ###################################################
                    # 执行计算任务 End
                    ###################################################

                    ###################################################
                    # 设置Process的状态 Begin
                    ###################################################
                    if success == True:
                        # 更新process的状态为结束，并记录结束时间
                        process.end_time = timezone.now()
                        process.state = 2   #success
                        process.complete_percent = 100
                        process.save()

                        task = Task.objects.get(uuid=task.uuid)
                        if task.state == 3:
                            logger.info("user stop task already")
                            errmsg = "user stop task already"
                            success = False
                            break;

                        # 更新task的percent
                        task.complete_percent = 100 * (i+1) / count
                        task.save()
                        logger.info("process[{0}] run success".format(str(process.id)))
                    else:
                        # 更新process的状态为结束，并记录结束时间
                        process.state = 3   #failure
                        process.save()
                        # errmsg = "process[{0}] run failed".format(str(process.id))
                        logger.info("process[{0}] run failed".format(str(process.id)))
                        break
                    ###################################################
                    # 设置Process的状态 End
                    ###################################################

            ###################################################
            # 设置Task的状态 Begin
            ###################################################
            if success==True:
                task.state = 2
                task.end_time = timezone.now()
                task.complete_percent = 100
                logger.info("task[{0}] run success".format(str(task.uuid)))
            else:
                task.state =  3  # 设置task的状态
                logger.info("task[{0}] run fail".format(str(task.uuid)))
            task.save()
            ###################################################
            # 设置Task的状态 End
            ###################################################

        return http_success_response() if success==True else http_error_response(errmsg)
    except Exception as e:
        task.state = 3
        task.save();
        logger.error("run task failed:{0}".format(str(e)))
        return http_error_response("run failed: {0}".format(str(e)))

def task_stop(request, task_id):
    try:
        task = Task.objects.get(uuid=task_id)
    except Task.DoesNotExist:
        logger.error("task[{0}] does not exist".format(task_id))
        return http_error_response("task does not exist")
    except Exception as e:
        logger.error("get task[{0}] failed".format(task_id))
        return http_error_response("stop task failed")
    try:
        processes = task.process_set.all().order_by("id");
        for pro in processes:
            pid = pro.pid
            logger.info("process[{0}] pid [{1}]".format(pro.node_id, str(pid)))
            if pid > 0:
                os.kill(pid, signal.SIGTERM)
                logger.info("kill process success :{0}".format(str(pid)))
    except OSError as e:
        logger.error("kill task[{0}] process  failed :{1}".format(task_id, str(e)))
    except Exception as e:
        logger.error("kill task[{0}] process  failed :{1}".format(task_id, str(e)))
    try:
        if task.state == 1: #running状态
            task.state = 3
            task.save()
        logger.debug("stop task[{0}] success".format(task_id))
        return http_success_response()
    except Exception as e:
        logger.error("stop task[{0}] failed : {1}".format(task_id,str(e)))
        return http_error_response("stop task failed")
"""
返回http错误信息
"""
def http_error_response(error):
    obj = {
        "status" : "error",
        "message" : error
    }
    return HttpResponse(json.dumps(obj), content_type="application/json")

def http_success_response():
    obj = {
        "status" : "success"
    }
    return HttpResponse(json.dumps(obj), content_type="application/json")

def json_text_strip(text):
    striped_text = text
    if striped_text[0] == '"':
        striped_text = striped_text[1:]
    if striped_text[-1] == '"':
        striped_text = striped_text[:-1]

    return striped_text


def get_file_root():
    return os.path.join(
        os.path.join(
            os.path.join(settings.BASE_DIR, "static"),
            "data"
        ),
        "uploads"
    )

def task_download(request,task_id,node_id):
    try:
        task = Task.objects.get(uuid=task_id)
    except Task.DoesNotExist:
        logger.error("task[{0}] does not exist".format(task_id))
        return http_error_response("task[{0}] does not exist".format(task_id))
    except Exception as e:
        logger.error("get task[{0}] failed: {1}".format(task_id),str(e))
        return http_error_response("get task[{0}] failed".format(task_id))

    graph = Graph()
    if not graph.load(task.text):
        pass
    else:
        node = graph.findNodeById(node_id)
    if not node:
        logger.error("download task node image :no node[{0}]".format(node_id))
        return http_error_response("no node[{0}]".format(node_id))

    user_uuid = request.COOKIES.get("user_uuid")
    if not user_uuid:
        logger.error("no user[{0}]".format(user_uuid))
        return http_error_response("no user")

    try:
        file_root = get_file_root()
        user_root = os.path.join(file_root,user_uuid)
        node_path = node.getPath()
        if node.getFrom():
            file_path = os.path.join(os.path.join(user_root,task_id),node_path[1:])
        else:
            file_path = os.path.join(user_root,node_path[1:])
        logger.debug("task[{0}] node[{1}] path:{2}".format(task_id,node_id,file_path))

        if os.path.exists(file_path):
            if not os.path.isfile(file_path):
                logger.error("file[{0}] does not a file".format(file_path))
                return http_error_response("not a file")
            with open(file_path, 'rb') as fh:
                response = HttpResponse(fh.read(), content_type="application/x-tif")
                response['Content-Disposition'] = 'inline; filename=' + os.path.basename(file_path)
                return response
        else:
            logger.error("no file:{0}".format(file_path))
            return  http_error_response("no file")

        return http_success_response()
    except Exception as e:
        logger.error("download task[{0}] node[{1}] failed:{2}".format(task_id,node_id,str(e)))
        return http_error_response("failed")



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
        file_root = get_file_root()
        user_root = os.path.join(file_root,str(user_uuid))
        os.makedirs(user_root)
        logger.info("register user[{0}]".format(username))
        return response
    except Exception as e:
        logger.error("register user failed:{0}".format(str(e)))
        return http_error_response("用户注册失败")


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

def user_logout(request,username):
    response = http_success_response()
    response.delete_cookie("username")
    response.delete_cookie("user_uuid")
    logger.info("用户[{0}]注销".format(username))
    return  response

def user_list(request):
    username = request.COOKIES.get("username")
    if not username:
        logger.error("get user list failed: user not login")
        return http_error_response("please login")
    if username != "admin":
        logger.error("get user list failed: user is not admin")
        return http_error_response("please login admin")

    try:
        users = User.objects.all().exclude(username='admin').order_by("-login_time")
        obj = []
        for user in users:
            obj.append(user.exportToJson())
        return HttpResponse(json.dumps(obj),content_type="application/json")
    except Exception as e:
        logger.error("get user list failed:{0}".format(str(e)))
        return http_error_response("get user list failed")


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


def task_count(request,model_id,task_state):
    try:
        username = request.COOKIES.get("username")
        user = User.objects.get(username=username)

    except User.DoesNotExist:
        logger.error("no user[{0}]".format(username))
        return http_error_response("no user[{0}]".format(username))

    try:
        count = 0
        if model_id == '0':
            models = user.model_set.all()
        else:
            models = user.model_set.filter(uuid=model_id)
        for model in models:
            if task_state == '4':
                tasks = model.task_set.all()
            else:
                tasks = model.task_set.filter(state=task_state)
            count += len(tasks)
        obj = {
            "count": count
        }
        text = json.dumps(obj)
        logger.info("get task[{0}] count:{1}".format(task_state,str(count)))
        return HttpResponse(text, content_type="application/json")
    except Exception as e:
        logger.error("get task [{0}] count failed:{1}".format(task_state, str(e)))
        return http_error_response("get task count failed")


def task_list(request,model_id,task_state,offset,count,field,orderby):
    try:
        username = request.COOKIES.get("username")
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        logger.error("no user[{0}]".format(username))
        return http_error_response("no user[{0}]".format(username))

    try:
        result = hasattr(Task,field)
        if result == False:
            logger.error("没有该字段:{0}".format(field))
            return http_error_response("没有该字段:{0}".format(field))
        start = int(offset)
        end = int(offset) + int(count)
        obj = []
        if model_id == '0':
            models = user.model_set.all()
        else:
            models = user.model_set.filter(uuid=model_id)
        tasks_all = []
        for model in models:
            if task_state == '4':
                tasks = model.task_set.all()
            else:
                tasks = model.task_set.filter(state=task_state)
            tasks_all.extend(tasks)

        # 排序
        if orderby == 'desc':
            reverse_order = True
        else:
            reverse_order = False
        t = tasks_all[0]
        if field == "start_time":
            tasks_all.sort(key=lambda k: k.start_time, reverse=reverse_order)
        elif field == "end_time":
            tasks_all.sort(key=lambda k: (k.end_time is None, k.end_time=="",k.end_time,k.start_time), reverse=reverse_order)
        elif field == "complete_percent":
            tasks_all.sort(key=lambda k: k.complete_percent, reverse=reverse_order)

        tasks_count = len(tasks_all)
        if start > tasks_count:
            return http_error_response("已经没有数据了")
        tasks = tasks_all[start:end]

        for task in tasks:
            task_json = task.exportToJson()
            task_json["model_name"] = task.model.name
            obj.append(task_json)

        text = json.dumps(obj)
        logger.info("get task[{0}] list offset[{1}] count[{2}] order by {3} {4}:{5}".format(task_state,str(offset),
                                                                           str(count),field,orderby,text))
        return HttpResponse(text, content_type="application/json")
    except Exception as e:
        logger.error("get task[{0}] list offset[{1}] count[{2}] order by {3} {4} failed: {5}".format(task_state,str(offset),
                                                                           str(count),field,orderby,str(e)))
        return http_error_response("get task count failed:{0}".format(str(e)))


def auto_task(request):
    command = "python /home/zhangyf/code/run/model/main.py"
    p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    p.wait()
    p_out_info = p.stdout.read()
    print(p_out_info)
    logger.info(" return code is :{0}".format(str(p.returncode)))
    if (p.returncode) != 0:
        logger.info('kill pid')
        p.kill()
        p_erro_info = p.stderr.read()
        return_info = p_erro_info
        if p_erro_info.decode("utf-8") == '':
            return_info = p_out_info
        # raise Exception("process run failed:{0}".format(return_info.decode("utf-8")))
        # return False
        logger.info(return_info)
    return http_success_response()


# model 启动监听
def model_start(request,model_id):
    try:
        model = Model.objects.get(uuid=model_id)
    except Model.DoesNotExist:
        logger.error("no model [{0}]".format(model_id))
        return http_error_response("Model does not exist")
    except Exception as e:
        logger.error("get model[{0}] failed:{1}".format(model_id,str(e)))
        return http_error_response("start model failed")

    try:
        text = model.text
        obj = json.loads(text)
        monitor = obj['monitor']
        if not monitor:
            logger.error("model[{0}] does not has monitor info".format(model_id))
            return http_error_response("model does not has monitor info")
        status = monitor["status"]
        if status == "on":
            logger.error("model[{0}] has already start monitor".format(model_id))
            return http_error_response("model has already start monitor")

        if not model_monitor_verify(text):
            logger.error("model[{0}] monitor info not valid".format(model_id))
            return http_error_response("监听信息设置无效")

        monitor["status"] = "on"
        model.text = json.dumps(obj)
        model.save()
        logger.info("start model[{}] monitor success".format(model_id))
    except Exception as e:
        logger.error("start model[{0}] monitor  failed:{1}".format(model_id,str(e)))
        return http_error_response("start model failed")
    return http_success_response()


# 监听是否设置正确
def model_monitor_verify(text):
    graph = Graph()
    if not graph.load(text):
        return False
    #待补充，检测只输入的dataNode是否已经设置完毕
    nodes = graph.getMonitorData()
    if not nodes:
        return False
    monitor = graph.getMonitor()
    if not monitor:
        return False

    data = monitor.getData()
    validData = []
    for node in nodes:
        flag = False
        for d in data:
            id = d["id"]
            if id == node:
                path = d["path"]
                if not path or path.strip() == "":
                    return False
                validData.append(d)
                flag = True
                break
        if not flag:
            logger.error("no data [{}] monitor info".format(str(node)))
            return False

    for i in range(len(validData)):
        for j in range(i+1,len(validData)):
            d_i = validData[i]
            d_j = validData[j]
            path_i = d_i["path"]
            path_j = d_j["path"]
            if path_i == path_j and d_i["prefix"] == d_j["prefix"]:
                logger.error("two data has same path and same prefix:[{}],[{}]".format(d_i["id"],d_j["id"]))
                return False
    return True

# 停止监听
def model_stop(request,model_id):
    try:
        model = Model.objects.get(uuid=model_id)
    except Model.DoesNotExist:
        logger.error("no model [{0}]".format(model_id))
        return http_error_response("Model does not exist")
    except Exception as e:
        logger.error("get model[{0}] failed:{1}".format(model_id,str(e)))
        return http_error_response("stop model monitor failed")

    try:
        text = model.text
        obj = json.loads(text)
        monitor = obj['monitor']
        if not monitor:
            logger.error("model[{0}] does not has monitor info".format(model_id))
            return http_error_response("model does not has monitor info")

        status = monitor["status"]
        if status == "off":
            logger.error("model[{0}] has already stop monitor".format(model_id))
            return http_error_response("model has already stop monitor")

        monitor["status"] = "off"
        model.text = json.dumps(obj)
        model.save()
        logger.info("stop model[{}] monitor success".format(model_id))
    except Exception as e:
        logger.error("stop model[{0}] monitor failed".format(model_id))
        return http_error_response("stop model monitor failed")
    return http_success_response()



# # 重启监听
# def model_restart(request,model_id):
#     try:
#         model = Model.objects.get(uuid=model_id)
#     except Model.DoesNotExist:
#         logger.error("no model [{0}]".format(model_id))
#         return http_error_response("Model does not exist")
#     except Exception as e:
#         logger.error("get model[{0}] failed:{1}".format(model_id,str(e)))
#         return http_error_response("restart model monitor failed")
#
#     try:
#         text = model.text
#         obj = json.loads(text)
#         monitor = obj['monitor']
#         if not monitor:
#             logger.error("model[{0}] does not has monitor info".format(model_id))
#             return http_error_response("model does not has monitor info")
#         status = monitor["status"]
#         # if status == "on":
#         #     logger.error("model[{0}] has already stop monitor".format(model_id))
#         #     return http_error_response("model has already stop monitor")
#
#         # path = os.path.join(os.path.join(settings.BASE_DIR, "monitor"), "__init__.py")
#         # command = "python " + path + " restart " + model_id
#         # logger.debug("command: {0}".format(command))
#         # p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
#         # p.wait()
#         #
#         # logger.info(" return code is :{0}".format(str(p.returncode)))
#         # if (p.returncode) != 0:
#         #     logger.info('kill pid')
#         #     p.kill()
#         #     p_erro_info = p.stderr.read()
#         #     return_info = p_erro_info
#         #     print(return_info)
#         #     if p_erro_info.decode("utf-8") == '':
#         #         return_info = p.stdout.read()
#         #     logger.info(return_info)
#         #     raise Exception("start monitor failed:{0}".format(return_info.decode("utf-8")))
#
#     except Exception as e:
#         logger.error("restart model[{}] monitor failed:{}".format(model_id,str(e)))
#         return http_error_response("restart model monitor failed")
#     return http_success_response()


# 强制停止监听程序
# def kill_model_monitor(uuid):
#     try:
#         for p in psutil.process_iter(attrs=["cmdline"]):
#             cmdlines = p.info['cmdline']
#             if len(cmdlines) == 4 and cmdlines[3] == uuid :
#                 p.kill()
#                 logger.info("kill model[{}] monitor : {}".format(uuid,p.pid))
#     except Exception as e:
#         logger.error("kill model[{}] monitor failed : {}".format(uuid,str(e)))
#         raise e


# def get_model_monitor_process(uuid):
#     processes = []
#     try:
#         for p in psutil.process_iter(attrs=["cmdline"]):
#             cmdlines = p.info['cmdline']
#             if len(cmdlines) == 4 and cmdlines[3] == uuid :
#                 processes.append(p.pid)
#         return  processes
#     except Exception as e:
#         raise e

# 模型的监控状态
def models_status(request,model_status,count,offset):
    model_list = []
    try:
        username = request.COOKIES.get("username")
        user = User.objects.get(username=username)

    except User.DoesNotExist:
        logger.error("no user[{0}]".format(username))
        return http_error_response("no user[{0}]".format(username))

    except Exception as e:
        logger.error("get models status failed :{}".format(str(e)))
        return http_error_response("get models status failed")

    try:
        start = int(offset)
        end = int(offset) + int(count)
        models = user.model_set.all()
        for model in models:
            text = model.text
            obj = json.loads(text)
            selected = None
            if not "monitor" in obj:
                flag = "off"
            else:
                monitor = obj['monitor']
                if not monitor:
                    flag = "off"
                else:
                    status = monitor["status"]
                    if not status:
                        flag = "off"
                    elif status == "on":
                        flag = "on"
                    elif status == "off":
                        flag = "off"
            if model_status == "start" and flag == "on":
                selected = model
            elif model_status == "stop" and flag == "off":
                selected = model
            elif model_status == "all":
                selected = model
            if selected:
                model_text = selected.exportToJson()
                model_text["status"] = flag
                model_text["monitor_status"] = "ok"
                model_list.append(model_text)
        result = model_list[start:end]
        result = json.dumps(result)
        return HttpResponse(result, content_type="application/json")
    except Exception as e:
        logger.error("get models status failed  :{}".format(str(e)))
        return http_error_response("get models status failed")

# 获取模型状态列表的个数
def models_status_count(request,model_status):
    result = []
    try:
        username = request.COOKIES.get("username")
        user = User.objects.get(username=username)

    except User.DoesNotExist:
        logger.error("no user[{0}]".format(username))
        return http_error_response("no user[{0}]".format(username))

    except Exception as e:
        logger.error("get models status failed :{}".format(str(e)))
        return http_error_response("get models status failed")
    try:
        models = user.model_set.all()
        count = 0
        for model in models:
            text = model.text
            obj = json.loads(text)
            selected = None
            if not "monitor" in obj:
                flag = "off"
            else:
                monitor = obj['monitor']
                if not monitor:
                    flag = "off"
                else:
                    status = monitor["status"]
                    if not status:
                        flag = "off"
                    elif status == "on":
                        flag = "on"
                    elif status == "off":
                        flag = "off"
            if model_status == "start" and flag == "on":
                count += 1
            elif model_status == "stop" and flag == "off":
                count += 1
            elif model_status == "all":
                count += 1
        obj = {
            "count" : count
        }
        return HttpResponse(json.dumps(obj),content_type="application/json")
    except Exception as e:
        logger.error("get model status[{}] count failed:{}".format(model_status),str(e))
        return http_error_response("get model status count failed")

# 模型进程的状态
# def getMonitorStatus(model_id,status):
#     try:
#         pids = getMonitorProcess(model_id)
#         monitor_status =None
#         if status == "on":
#             if len(pids) == 1:
#                 monitor_status = "ok"
#             else:
#                 monitor_status = "error"
#         elif status == "off":
#             if len(pids) == 0:
#                 monitor_status = "ok"
#             else:
#                 monitor_status = "error"
#         return monitor_status
#     except Exception as e:
#         logger.error("get model[{}] monitor status failed:{}".format(model_id,str(e)))
#         return "error"


# 获取模型的相关进程
# def getMonitorProcess(model_id):
#     pids = []
#     try:
#         for p in psutil.process_iter(attrs=["cmdline"]):
#             cmdlines = p.info["cmdline"]
#             if len(cmdlines) == 4 and cmdlines[3] == model_id:
#                 pids.append(p.pid)
#         return pids
#     except Exception as e:
#         logger.error("get monitor[{}] pid failed:{}".format(model_id,str(e)))
#         raise e


# 单一进程的状态获取
def model_status(request,model_id):
    try:
        username = request.COOKIES.get("username")
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        logger.error("no user[{0}]".format(username))
        return http_error_response("no user[{0}]".format(username))
    except Exception as e:
        logger.error("get model[{}] status failed :{}".format(model_id,str(e)))
        return http_error_response("get model status failed")

    try:
        model = Model.objects.get(uuid=model_id)
    except Model.DoesNotExist:
        logger.error("no model [{0}]".format(model_id))
        return http_error_response("Model does not exist")
    except Exception as e:
        logger.error("get model[{0}] failed:{1}".format(model_id, str(e)))
        return http_error_response("get model status failed")

    try:
        text = model.text
        obj = json.loads(text)

        if not "monitor" in obj:
            flag = "off"
        else:
            monitor = obj['monitor']
            if not monitor:
                flag = "off"
            else:
                status = monitor["status"]
                if not status:
                    flag = "off"
                elif status == "on":
                    flag = "on"
                elif status == "off":
                    flag = "off"
        model_text = model.exportToJson()
        model_text["status"] = flag
        # monitor_status = getMonitorStatus(model_id, flag)
        model_text["monitor_status"] = "ok"
        result = json.dumps(model_text)
        logger.info("get model[{}] status:{}".format(model_id,result))
        return HttpResponse(result,content_type="application/json")
    except Exception as e:
        logger.error("get model[{}] status failed:{}".format(model_id,str(e)))
        return http_error_response("get model status failed")

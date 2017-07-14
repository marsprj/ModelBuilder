from django.shortcuts import render
from django.http import HttpResponse


from . import models
from . import functions
from .models import Model, Task, Process
from .Graph import Graph
from ModelFlow import settings
import ModelFlow


from django.utils import timezone

import time, json, uuid, datetime, os, os.path, logging,shutil
from json import JSONDecodeError

# Create your views here.

def index(request):
    return HttpResponse("hello world.")

def model_save(request):

    text = request.body.decode('utf-8')

    #解析Model的json对象
    try:
        obj = json.loads(text)
    except JSONDecodeError:
        return http_error_response("Model的json对象解析失败")

    #检索数据库，看当前Model是否已经存在
    model_name = obj["name"]
    try:
        models = Model.objects.filter(name=model_name)
    except:
        return http_error_response("Model查询失败")

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
        #生成Model
        model = Model(
            name=model_name,
            description=model_name,
            create_time=create_time,
            text=json.dumps(obj))

    # 创建model的目录
    model_path = os.path.join(ModelFlow.settings.MODEL_ROOT, str(model.uuid))
    if not os.path.exists(model_path):
        try:
            os.makedirs(model_path)
        except OSError as e:
            logging.getLogger('model.app').error(e.strerror)

    # 保存model
    try:
        model.save()

        return HttpResponse(model.uuid)
    except OperationalError:
        return http_error_response("Model保存失败")

"""
返回所有的Model
"""
def models(request):

    obj = []
    models = Model.objects.all()
    for model in models:
        obj.append(model.exportToJson())

    return HttpResponse(json.dumps(obj), content_type="application/json")

"""
返回指定id的Model
"""
def model_get(request, model_id):
    try:
        model = Model.objects.get(uuid=model_id)
    except Model.DoesNotExist:
        raise Http404("Model does not exist")
    return HttpResponse(model.text, content_type="application/json")

"""
删除制定id的Model
"""
def model_delete(request,model_id):
    try:
        model = Model.objects.get(uuid=model_id)
    except Model.DoesNotExist:
        return http_error_response("Model不存在")
    model.delete()
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
        models = Model.objects.filter(uuid=model_id)

        if len(models) == 0:
            return HttpResponse("no model [{0}]".format(model_id))

        model = models[0]
        tasks = model.task_set.all()

        obj = []
        for task in tasks:
            obj.append(task.exportToJson())
        text = json.dumps(obj)
        return HttpResponse(text, content_type="application/json")
    except:
        return HttpResponse("Error")


"""
获取Task的状态
"""
def tasks(request):

    tasks = Task.objects.all()

    obj = []
    for task in tasks:
        obj.append(task.exportToJson())
    text = json.dumps(obj)
    return HttpResponse(text, content_type="application/json")

"""
获取指定Task的状态
"""
def task_state(request, task_id):
    try:
        tasks = Task.objects.filter(uuid=task_id)

        if len(tasks) == 0:
            return HttpResponse("no task [{0}]".format(model_id))

        task = tasks[0]
    except:
        return HttpResponse("Error")

    processes = task.process_set.all()
    percent = 0

    obj = {
        "id": task.id,
        "name": task.name,
        "uuid": str(task.uuid),
        "model": str(task.model_id),
        "state": task.state,
        "start_time": task.start_time.strftime("%Y-%m-%d %H:%M:%S"),
        "end_time": "-" if task.end_time==None else task.end_time.strftime("%Y-%m-%d %H:%M:%S"),
        "processes" : [],
        "percent": "{0}%".format(task.complete_percent),
    }

    for process in processes:
        obj["processes"].append(process.exportToJson())
    text = json.dumps(obj)
    return HttpResponse(text, content_type="application/json")


"""
创建Model的Task
返回Task的uuid
"""
def task_create(request):

    text = request.body.decode('utf-8')

    # 解析Model的json对象
    try:
        obj = json.loads(text)
    except JSONDecodeError:
        return http_error_response("Task的json对象解析失败")

    start_time = timezone.now()

    #初始化task_name，如果没有指定task_name，则用当前时间作为task_name
    model_id = obj["model"]
    if "name" in obj:
        task_name = obj["name"]
    else:
        task_name = start_time.strftime("%Y%m%d%H%M%S")

    try:
        models = Model.objects.filter(uuid=model_id)
    except:
        return http_error_response("Error")

    if not models:
        return http_error_response("Error")

    model = models[0]

    task = model.task_set.create(
        uuid=uuid.uuid4(),
        name=task_name,
        start_time=start_time,
        #end_time=timezone.now(),
    )
    task.save()

    obj = {
        "uuid" : str(task.uuid)
    }
    return HttpResponse(json.dumps(obj), content_type="application/json")


"""
启动模型计算
返回Task的uuid
@deprecated
"""
# def model_run(request, model_id):
#
#     try:
#         models = Model.objects.filter(uuid=model_id)
#     except:
#         return HttpResponse("Error")
#
#     if not models:
#         return HttpResponse("Error")
#
#     model = models[0]
#
#     str1 = start_task(model)
#
#     #return HttpResponse("{0}".format(task.uuid))
#     return HttpResponse(str1)
#
# """
# 启动模型计算
# @deprecated
# """
# def start_task(model):
#     #model = Model.objects.filter(uuid=model_id)[0]
#
#     graph = Graph()
#     if not graph.load(model.text):
#         pass
#     else:
#         #创建task
#         task = model.task_set.create(
#             uuid=uuid.uuid4(),
#             name=model.name,
#             start_time=timezone.now(),
#             end_time=timezone.now(),
#         )
#         task.state = 1
#         task.save()
#
#         #生成执行计划
#         flow = graph.plan()
#         if flow:
#             #生成执行步骤及其状态,记录Process的状态
#             processes = []
#             for func in flow:
#                 process = task.process_set.create(
#                     name = func.getName(),
#                     start_time = timezone.now(),
#                     end_time = timezone.now()
#                 )
#                 process.save()
#                 processes.append(process)
#
#             #执行Plan
#             count = len(processes)
#             for i in range(count):
#                 #执行func
#                 #更新process的状态为正在执行
#                 process = processes[i]
#                 process.state = 1
#                 process.save()
#
#                 #time.sleep(5)
#                 func = flow[i]
#                 #processing func
#                 run_process(func)
#
#                 #更新process的状态为结束，并记录结束时间
#                 process.end_time = timezone.now()
#                 process.state = 2
#                 process.save()
#                 pass
#
#         task.state = 2
#         task.save()
#     return task.uuid


"""
运行task
"""
def task_run(request, task_id):
    try:
        tasks = Task.objects.filter(uuid=task_id)
    except:
        return http_error_response("no task")

    if not tasks:
        return http_error_response("no task")

    task = tasks[0]
    if task.state == 1: #running
        return http_error_response("Task正在运行")

    return start_task_2(task)

"""
启动模型计算
"""
def start_task_2(task):
    #model = Model.objects.filter(uuid=model_id)[0]

    logger = logging.getLogger('model.app')

    success = True
    graph = Graph()
    if not graph.load(task.model.text):
        pass
    else:

        task.state = 1
        task.save()

        #文件夹处理
        file_root = get_file_root()
        task_path = os.path.join(file_root,str(task.uuid))
        if os.path.exists(task_path):
            shutil.rmtree(task_path)
        os.mkdir(task_path)

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
                    success = f(func,str(task.uuid))
                else:
                    errmsg = "方法[{0}]尚未在系统中注册".format(func.getName());
                    logger.error(errmsg)
                    success = False

                time.sleep(5)
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

                    # 更新task的percent
                    task.complete_percent = 100 * i / count
                    task.save()
                else:
                    # 更新process的状态为结束，并记录结束时间
                    process.state = 3   #failure
                    process.save()
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
        else:
            task.state =  3  # 设置task的状态
        task.save()
        ###################################################
        # 设置Task的状态 End
        ###################################################

    return http_success_response() if success==True else http_error_response(errmsg)

def task_stop(request, task_id):
    try:
        tasks = Task.objects.filter(uuid=task_id)
    except:
        return http_error_response("no task")

    if not tasks:
        return http_error_response("no task")

    task = tasks[0]
    if task.state == 1: #running状态
        task.state = 3
        task.save()
    return http_success_response()
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

# def run_process(process):
#     if process.name == "Stretch":
#         print(process.name)
#     elif process.name == "Fusion":
#         pass

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
        tasks = Task.objects.filter(uuid=task_id)
    except:
        return  http_error_response("no task")
    if not tasks:
        return  http_error_response("no task")

    task = tasks[0]

    graph = Graph()
    if not graph.load(task.model.text):
        pass
    else:
        node = graph.findNodeById(node_id)
    if not node:
        return  http_error_response("no node")


    file_root = get_file_root()
    node_path = node.getPath()
    if node.getFrom():
        file_path = os.path.join(os.path.join(file_root,task_id),node_path[1:])
    else:
        file_path = os.path.join(file_root,node_path[1:])

    if os.path.exists(file_path):
        if not os.path.isfile(file_path):
            return  http_error_response("not a file")
        with open(file_path, 'rb') as fh:
            response = HttpResponse(fh.read(), content_type="application/x-tif")
            response['Content-Disposition'] = 'inline; filename=' + os.path.basename(file_path)
            return response
    else:
        return  http_error_response("no file")

    return http_success_response()


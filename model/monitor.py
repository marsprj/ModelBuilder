import logging,os,subprocess,json
from ModelFlow import settings

from django.http import HttpResponse
from .views import http_success_response
from .views import http_error_response
from .models import Model, Task, Process,User
from .Graph import Graph

logger = logging.getLogger('model.app')

"""
开启或者关闭系统的监听进程
"""
def monitor_oper(request,oper):
    try:
        username = request.COOKIES.get("username")
        if not username:
            logger.error("{} monitor failed: user not login".format(oper))
            return http_error_response("please login")
        if username != "admin":
            logger.error("{} monitor failed: user is not admin".format(oper))
            return http_error_response("please login admin")
    except Exception as e:
        logger.error("{} monitor failed:{}".format(oper,str(e)))
        return http_error_response("failed")

    try:
        path = os.path.join(os.path.join(settings.BASE_DIR, "monitor"), "__init__.py")
        command = "python " + path + " " + oper
        logger.debug("command: {0}".format(command))
        p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        p.wait()
        logger.info(" return code is :{0}".format(str(p.returncode)))
        if (p.returncode) != 0:
            logger.info('kill pid')
            p.kill()
            p_erro_info = p.stderr.read()
            return_info = p_erro_info
            print(return_info)
            if p_erro_info.decode("utf-8") == '':
                return_info = p.stdout.read()
            logger.info(return_info)
            raise Exception("start monitor failed:{0}".format(return_info.decode("utf-8")))
    except Exception as e:
        logger.error("{} monitor failed            :{}".format(oper, str(e)))
        return http_error_response("faield:{}".format(str(e)))
    return http_success_response()


"""
查询监听进程的状态
"""
def monitor_status(request):
    try:
        path = os.path.join(os.path.join(settings.BASE_DIR, "monitor"), "__init__.py")
        command = "python " + path + " status"
        logger.debug("command: {0}".format(command))
        p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        p.wait()
        logger.info(" return code is :{0}".format(str(p.returncode)))
        return_info = "error"
        if (p.returncode) != 0:
            logger.info('kill pid')
            p.kill()
            p_erro_info = p.stderr.read()
            return_info = p_erro_info
            print(return_info)
            if p_erro_info.decode("utf-8") == '':
                return_info = p.stdout.read()
            logger.info(return_info)
        else:
            p_info = p.stderr.read()
            return_info = p_info
            print(return_info)
            if p_info.decode("utf-8") == '':
                return_info = p.stdout.read()
        return_info = return_info.decode("utf-8")
        return_info = return_info.replace("\n", "")
        obj = {
            "monitorStatus": return_info
        }
        return HttpResponse(json.dumps(obj),content_type="application/json")
    except Exception as e:
        logger.error("get monitor status failed :{}".format(str(e)))
        return http_error_response("error")

"""
model 启动监听
"""
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

"""
监听是否设置正确
"""
def model_monitor_verify(text):
    graph = Graph()
    if not graph.load(text):
        return False
    #待补充，检测只输入的dataNode是否已经设置完毕
    nodes = graph.getMonitorData()
    if not nodes:
        logger.error("monitor data not valid")
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


"""
模型停止监听
"""
def model_stop(request, model_id):
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


"""
模型的监听状态
"""
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
        if username == "admin":
            models = Model.objects.all()
        else:
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
                model_text["user"] = selected.user.username
                model_list.append(model_text)
        result = model_list[start:end]
        result = json.dumps(result)
        return HttpResponse(result, content_type="application/json")
    except Exception as e:
        logger.error("get models status failed  :{}".format(str(e)))
        return http_error_response("get models status failed")


"""
获取指定监听状态模型的个数
"""
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
        if username == "admin":
            models = Model.objects.all()
        else:
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


"""
某个模型的监听状态
"""
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
        model_text["monitor_status"] = "ok"
        model_text["user"] = model.user.username
        result = json.dumps(model_text)
        logger.info("get model[{}] status:{}".format(model_id,result))
        return HttpResponse(result,content_type="application/json")
    except Exception as e:
        logger.error("get model[{}] status failed:{}".format(model_id,str(e)))
        return http_error_response("get model status failed")
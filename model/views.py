from django.shortcuts import render
from django.http import HttpResponse

from . import models
from .models import Model, Task

from django.utils import timezone

import time, json, uuid, datetime

from .Graph import Graph


# Create your views here.

def index(request):
    return HttpResponse("hello world.")

def model_save(request):

    text = request.body.decode('utf-8')
    create_time = time.strftime("%Y-%m-%d %H:%M:%S")
    obj = json.loads(text)
    obj["create_time"] = create_time
    name = obj["name"]

    model = models.Model(name=name, description=name, create_time=create_time, text=json.dumps(obj))
    model.save();

    return HttpResponse(name)

def model_get(request, model_id):
    try:
        model = GModel.objects.get(pk=model_id)
    except Model.DoesNotExist:
        raise Http404("Model does not exist")
    return HttpResponse(model.text)

#启动模型计算
#返回Task的uuid
def model_run(request, model_id):

    try:
        models = Model.objects.filter(uuid=model_id)
    except:
        return HttpResponse("Error")

    if not models:
        return HttpResponse("Error")



    str1 = start_task(model_id)

    #return HttpResponse("{0}".format(task.uuid))
    return HttpResponse(str1)

#启动模型计算
def start_task(model_id):
    model = Model.objects.filter(uuid=model_id)[0]

    graph = Graph()
    if not graph.load(model.text):
        pass
    else:
        #创建task
        task = model.task_set.create(
            uuid=uuid.uuid4(),
            name=model.name,
            start_time=timezone.now(),
            end_time=timezone.now(),
        )
        task.save()

        #生成执行计划
        flow = graph.plan()
        if flow:
            #生成执行步骤及其状态
            for func in flow:
                process = task.process_set.create(
                    name = func.getName(),
                    start_time = timezone.now(),
                    end_time = timezone.now()
                )
                process.save()

        # str1 = ""
        # for s in flow:
        #     str1 += s.getID()
        #     str1 += " --> "
        #
        # return str1
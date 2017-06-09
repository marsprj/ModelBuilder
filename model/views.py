from django.shortcuts import render
from django.http import HttpResponse

from . import models
from .models import Model

import time, json

#from .models import Model

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
    except GModel.DoesNotExist:
        raise Http404("Model does not exist")
    return HttpResponse(model.text)
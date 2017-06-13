from django.shortcuts import render
from django.http import HttpResponse
from ModelFlow import settings

import os

# Create your views here.

def file_upload(request):
    if request.method != "POST":
        return HttpResponse("error")

    myFile = request.FILES.get("myfile", None)
    if not myFile:
        return HttpResponse("no file upload")

    file_folder = os.path.join(
            os.path.join(settings.BASE_DIR, "static"),
            "uploads"
    )

    if not os.path.exists(file_path):
        os.path.mkdir(file_path)

    file_path = os.path.join(file_folder, myFile.name)
    with open(file_path, "wb+") as f:
        for chunk in myFile.chunks():
            f.write(chunk)

    return HttpResponse("success")
from django.shortcuts import render
from django.http import HttpResponse
from ModelFlow import settings
import  requests

import os
import json

# Create your views here.


def file_upload(request):
    if request.method != "POST":
        return HttpResponse("error")

    file_path = request.POST['dlg_upoad_path']

    file_root = get_user_file_root(request)
    local_folder = os.path.join(file_root, file_path[1:])

    files = request.FILES.getlist("file", None)
    for file in files:
        local_path = os.path.join(local_folder, file.name)
        with open(local_path, "wb+") as f:
            for chunk in file.chunks():
                f.write(chunk)

    return http_success_response()


"""
列出指定目录下的文件和文件夹
｛
    "path" : "/folder1/"
｝
"""


def file_list(request):

    text = request.body.decode('utf-8')
    # 解析Model的json对象
    try:
        obj = json.loads(text)
    except JSONDecodeError:
        return http_error_response("Model的json对象解析失败")

    request_path = obj["path"]

    file_root = get_user_file_root(request)

    file_path = os.path.join(file_root, request_path[1:])
    if not os.path.exists(file_path):
        return http_error_response('该路径不存在')

    files_json = []

    files = os.listdir(file_path)
    for f in files:
        fpath = os.path.join(file_path, f)
        type = "file" if os.path.isfile(fpath) else "folder"

        files_json.append({
            "name": f,
            "type": type
        })

    return HttpResponse(
        json.dumps(files_json),
        content_type="application/json")


"""
创建文件夹
｛
    "path" : "/folder1/"
｝
"""


def file_create(request):
    text = request.body.decode('utf-8')
    # 解析Model的json对象
    try:
        obj = json.loads(text)
    except JSONDecodeError:
        return http_error_response("Model的json对象解析失败")

    request_path = obj["path"]
    file_root = get_user_file_root(request)

    file_path = os.path.join(file_root, request_path[1:])
    try:
        os.makedirs(file_path)
        return http_success_response()
    except OSError as e:
        return http_error_response(e.strerror)


"""
删除空文件夹或文件
｛
    "path" : "/folder1/file1"
｝
"""


def file_remove(request):
    text = request.body.decode('utf-8')
    # 解析Model的json对象
    try:
        obj = json.loads(text)
    except JSONDecodeError as err:
        return http_error_response("Model的json对象解析失败")

    request_path = obj["path"]
    file_root = get_user_file_root(request)

    file_path = os.path.join(file_root, request_path[1:])
    try:
        if os.path.isdir(file_path):
            os.rmdir(file_path)
        else:
            os.remove(file_path)
        return http_success_response()
    except OSError as e:
        return http_error_response(e.strerror)


def get_user_file_root(request):
    username = request.COOKIES['username']
    return os.path.join(
        os.path.join(
            os.path.join(
                os.path.join(settings.BASE_DIR, "static"),
                "data"
            ),
            "uploads"
        ),username
    )


"""
返回http错误信息
"""


def http_error_response(error):
    obj = {
        "status": "error",
        "message": error
    }
    return HttpResponse(json.dumps(obj), content_type="application/json")


def http_success_response():
    obj = {
        "status": "success"
    }
    response = HttpResponse(json.dumps(obj), content_type="application/json", status=200)
    return response

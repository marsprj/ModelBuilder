from django.shortcuts import render
from django.http import HttpResponse
from ModelFlow import settings
#import requests
from json import JSONDecodeError

import os, logging
import json, time, math, subprocess, uuid

# Create your views here.

logger = logging.getLogger('model.app')

# 把时间戳转化为时间: 1479264792 to 2016-11-16 10:53:12'''
def TimeStampToTime(timestamp):
    timeStruct = time.localtime(timestamp)
    return time.strftime('%Y-%m-%d %H:%M:%S',timeStruct)

def file_upload(request):
    if request.method != "POST":
        return http_error_response("error")

    try:
        file_path = request.POST['dlg_upoad_path']

        file_root = get_user_file_root(request)
        local_folder = os.path.join(file_root, file_path[1:])

        files = request.FILES.getlist("file", None)
        for file in files:
            local_path = os.path.join(local_folder, file.name)
            with open(local_path, "wb+") as f:
                for chunk in file.chunks():
                    f.write(chunk)
                logger.info("upload file[{0}]".format(file.name))

        return http_success_response()
    except Exception as e:
        logger.error("upload file failed: {0}".format(str(e)))
        obj = {
            "status": "error",
            "message": str(e)
        }
        return HttpResponse(json.dumps(obj), content_type="application/json", status=500)

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
    except JSONDecodeError as e:
        logger.error("get file list json{0} parse failed: {1}".format(text, str(e)))
        return http_error_response("json 解析失败")

    try:
        request_path = obj["path"]
        file_root = get_user_file_root(request)
        file_path = os.path.join(file_root, request_path[1:])
        if not os.path.exists(file_path):
            logger.error("folder path[{0}] is not exist".format(file_path))
            return http_error_response('该路径不存在')

        list_json = []
        dir_json = []
        file_json = []

        if "type" in obj:
            type = obj["type"]
        else:
            type = "icon"

        # 图标排列
        if type == "icon":
            for parent, dirs, files in os.walk(file_path):
                for dirname in dirs:
                    if os.path.normpath(parent) != os.path.normpath(file_path):
                        continue
                    dirpath = os.path.join(parent, dirname)

                    dir_json.append({
                        "type": "folder",
                        "name": dirname,
                    })
                for filename in files:
                    if os.path.normpath(parent) != os.path.normpath(file_path):
                        continue
                    file_json.append({
                        "type": "file",
                        "name": filename,
                    })
                break
            dir_json = sorted_ls(dir_json,"name")
            file_json = sorted_ls(file_json,"name")
            list_json.extend(dir_json)
            list_json.extend(file_json)
        # 列表排序
        elif type == "list":
            field = obj["field"]
            order = obj["order"]
            for parent,dirs,files in os.walk(file_path):
                for dirname in dirs:
                    if os.path.normpath(parent) != os.path.normpath(file_path):
                        continue
                    dirpath = os.path.join(parent,dirname)
                    modify_time = os.path.getmtime(dirpath)

                    dir_json.append({
                        "type":"folder",
                        "name": dirname,
                        "ftime": str(TimeStampToTime(modify_time)),
                        "time":modify_time,
                        "filetype" : "文件夹"
                    })
                for filename in files:
                    if os.path.normpath(parent) != os.path.normpath(file_path):
                        continue
                    filepath = os.path.join(parent,filename)
                    modify_time = os.path.getmtime(filepath)
                    fsize = os.path.getsize(filepath)
                    fsize = fsize / float(1024)
                    # fsize = convertBytes(fsize)
                    index = filename.rfind(".")
                    if index == -1:
                        filetype = "文件"
                    else:
                        fix = filename[index+1:]
                        filetype = fix.lower() + "文件"
                    file_json.append({
                        "type": "file",
                        "name": filename,
                        "ftime": str(TimeStampToTime(modify_time)),
                        "time": TimeStampToTime(modify_time),
                        "fsize": str(fsize) +  "KB",
                        "size": fsize,
                        "filetype":filetype
                    })
                break
            if order == "desc":
                reverse = True
            else:
                reverse = False
            if field == "name" or field == "time":
                dir_json = sorted_ls(dir_json,field,reverse)
                file_json = sorted_ls(file_json,field,reverse)
                list_json.extend(dir_json)
                list_json.extend(file_json)
            elif field == "size":
                dir_json = sorted_ls(dir_json, "name")
                file_json = sorted_ls(file_json, field, reverse)
                if order == "desc":
                    list_json.extend(file_json)
                    list_json.extend(dir_json)
                else:
                    list_json.extend(dir_json)
                    list_json.extend(file_json)
            elif field == "filetype":
                dir_json = sorted_ls(dir_json, "name",reverse)
                file_json = sorted_ls(file_json, field, reverse)
                list_json.extend(dir_json)
                list_json.extend(file_json)

        logger.info("get folder path:{0}".format(json.dumps(list_json)))

        return HttpResponse(
            json.dumps(list_json),
            content_type="application/json")
    except Exception as e:
        logger.error("get file list[{0}] failed: {1}".format(request_path,str(e)))
        return http_error_response("get file list failed")

def convertBytes(bytes, lst=['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']):
    i = int(math.floor( # 舍弃小数点，取小
             math.log(bytes, 1024) # 求对数(对数：若 a**b = N 则 b 叫做以 a 为底 N 的对数)
            ))

    if i >= len(lst):
        i = len(lst) - 1
    return ('%.2f' + " " + lst[i]) % (bytes/math.pow(1024, i))


# 默认是升序
def sorted_ls(jsons,field,reverse=False):
    key_field = lambda f: f[field]
    return list(sorted(jsons, key=key_field,reverse=reverse))
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
    except JSONDecodeError as e:
        logger.error("create file json[{0}] parse failed: {1}".format(text, str(e)))
        return http_error_response("json 解析失败")

    try:
        request_path = obj["path"]
        file_root = get_user_file_root(request)

        file_path = os.path.join(file_root, request_path[1:])
        os.makedirs(file_path)
        logger.info("create file[{0}] success".format(file_path))
        return http_success_response()
    except OSError as e:
        logger.error("create file[{0}] failed: {1}".format(file_path,str(e)))
        return http_error_response(e.strerror)
    except Exception as e:
        logger.error("create file[{0}] failed: {1}".format(request_path, str(e)))
        return http_error_response("create file failed")


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
    except JSONDecodeError as e:
        logger.error("remove file json[{0}] parse failed: {1}".format(text, str(e)))
        return http_error_response("json 解析失败")
    try:
        remove_list = obj["list"]
        result = []
        file_root = get_user_file_root(request)
        for obj in remove_list:
            try:
                type = obj["type"]
                path = obj["path"]
                file_path = os.path.join(file_root, path[1:])
                if type == "file":
                    os.remove(file_path)
                elif type == "folder":
                    os.rmdir(file_path)
                result.append({
                    "path": path,
                    "result":"success"
                })
                logger.info("remove {} success:{}".format(type,path))
            except Exception as e:
                logger.error("remove {} failed:{}".format(type, path))
                result.append({
                    "path": path,
                    "result": "fail"
                })
                continue
        data = {
            "result": result
        }
        return HttpResponse(json.dumps(data), content_type="application/json")
    except OSError as e:
        logger.error("remove file[{0}] failed: {1}".format(text, str(e)))
        data = {
            "result":result
        }
        return HttpResponse(json.dumps(data), content_type="application/json")


def get_user_file_root(request):
    user_uuid = request.COOKIES.get("user_uuid")
    if not user_uuid:
        e = Exception("user is not login")
        raise e
        return None

    username = request.COOKIES.get("username")
    if username == "admin":
        user_uuid = ""
    return os.path.join(settings.UPLOADS_ROOT, user_uuid)


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

"""
图片预览
"""
def file_preview(request,path):
    try:
        path = path.replace("|","/")
        file_root = get_user_file_root(request)
        file_path = os.path.join(file_root, path[1:])
        if not os.path.exists(file_path):
            logger.error("file[{0}] does not exist".format(path))
            return http_error_response("no file")

        if not os.path.isfile(file_path):
            logger.error("file[{0}] does not a file".format(file_path))
            return http_error_response("not a file")


        postfix_index = file_path.rfind('.')
        if postfix_index == -1:
            logger.error("file[{0}] does not preview".format(path))
            return http_error_response("no preview")
        postfix = file_path[postfix_index+1:]
        postfix = postfix.lower()

        if postfix == "jpg" or postfix == "jpeg" or postfix == "png":
            with open(file_path, 'rb') as fh:
                response = HttpResponse(fh.read(), content_type="application/x-tif")
                response['Content-Disposition'] = 'inline; filename=' + os.path.basename(file_path)
                return response

        if postfix == "tif" or postfix == "tiff":
            # 进行转换
            fun_command = "{0}{1}".format(settings.OTB_COMMAND_DIR, "IndexedToRGBImage")
            output_name = str(uuid.uuid4()) + ".png"
            output_path = os.path.join(settings.THUMBNAIL_ROOT, output_name)
            command ="{} {} {}".format(fun_command,file_path,output_path)
            logger.debug("convert tiff image command: {0}".format(command))
            p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            p.wait()
            logger.info(" return code is :{0}".format(str(p.returncode)))
            if p.returncode != 0:
                logger.info('kill pid')
                p.kill()
                p_erro_info = p.stderr.read()
                return_info = p_erro_info
                print(return_info)
                if p_erro_info.decode("utf-8") == '':
                    return_info = p.stdout.read()
                logger.info(return_info)
                logger.error("file[{0}] does not preview".format(path))
                return http_error_response("cannot preview")

            if not os.path.isfile(output_path):
                logger.error("file[{}] thumbnail does not exist".format(output_path))
                return http_error_response("cannot preview")
            with open(output_path, 'rb') as fh:
                response = HttpResponse(fh.read(), content_type="application/x-tif")
                response['Content-Disposition'] = 'inline; filename=' + os.path.basename(output_path)
                return response

        logger.error("get file[{}] preview failed:{}".format(path, "不支持的文件类型"))
        return http_error_response("cannot preview")
    except Exception as e:
        logger.error("get file[{}] preview failed:{}".format(path, str(e)))
        return http_error_response("failed")
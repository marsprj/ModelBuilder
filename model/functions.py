from ModelFlow import settings

from .Graph import Function, Datum
from PIL import Image
import os.path
import shutil

"""
处理图像拉伸
"""
def process_stretch(func,taskId,user_uuid):
    #获取输入参数
    inputs = func.getInputs()
    if len(inputs) == 0:
        return False
    ipath = inputs[0].getPath()

    if not inputs[0].getFrom():
        local_ipath = build_local_path(ipath,user_uuid)
    else :
        local_ipath = build_task_local_path(ipath,taskId,user_uuid)

    # 获取输出参数
    output = func.getOutput()
    if output == None:
        return False
    opath = output.getPath()

    local_opath = build_task_local_path(opath, taskId,user_uuid)

    # 执行具体的计算任务
    return raster_stretch(local_ipath, local_opath)


def raster_stretch(ipath, opath):

    #模拟生成一个新的图片
    image = Image.open(ipath)
    image_out = Image.new(image.mode, image.size)
    index = ipath.rfind('.')
    if index != -1:
        postfix = ipath[index:]
        if postfix == '.tiff' or postfix == '.tif':
            return True

    pixels = list(image.getdata())
    image_out.putdata(pixels)
    image_out.save(opath)

    # if not os.path.exists(local_ipath):
    #     return False

    # if not os.path.exists(local_opath):
    #     return False

    #shutil.copy2(local_ipath, local_opath)

    return True

"""
处理图像融合
"""
def process_fusion(func,task_idss):
    return True

def build_local_path(path,user_uuid):
    root_path = os.path.join(
        os.path.join(
            os.path.join(settings.BASE_DIR, "static"),
            "data"
        ),
        "uploads"
    )
    user_path = os.path.join(root_path,user_uuid)
    return os.path.join(
        user_path, path[1:]
    )
def build_task_local_path(path,taskId,user_uuid):
    root_path = os.path.join(
        os.path.join(
            os.path.join(settings.BASE_DIR, "static"),
            "data"
        ),
        "uploads"
    )
    user_path = os.path.join(root_path,user_uuid)
    task_path = os.path.join(user_path,taskId)
    return os.path.join(
        task_path, path[1:]
    )

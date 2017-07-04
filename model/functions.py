from ModelFlow import settings

from .Graph import Function, Datum
import os.path
import shutil

"""
处理图像拉伸
"""
def process_stretch(func):
    #获取输入参数
    inputs = func.getInputs()
    if len(inputs) == 0:
        return False
    ipath = inputs[0].getPath()

    # 获取输出参数
    output = func.getOutput()
    if output == None:
        return False
    opath = output.getPath()

    # 执行具体的计算任务
    return raster_stretch(ipath, opath)


def raster_stretch(ipath, opath):

    local_ipath = build_local_path(ipath)
    local_opath = build_local_path(opath)

    # if not os.path.exists(local_ipath):
    #     return False

    # if not os.path.exists(local_opath):
    #     return False

    #shutil.copy2(local_ipath, local_opath)

    return True

"""
处理图像融合
"""
def process_fusion(func):
    return True

def build_local_path(path):
    root_path = os.path.join(
        os.path.join(
            os.path.join(settings.BASE_DIR, "static"),
            "data"
        ),
        "uploads"
    )

    return os.path.join(
        root_path, path[1:]
    )
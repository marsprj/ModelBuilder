from ModelFlow import settings

from .Graph import Function, Datum
from PIL import Image
import os.path
import shutil
import re
import subprocess,signal,logging

logger = logging.getLogger('model.app')

"""
处理图像拉伸
"""
def process_stretch(func,process,user_uuid):
    try:
        task_id = str(process.task_id)
        #获取输入参数
        # inputs = func.getInputs()
        # if len(inputs) == 0:
        #     return False
        # ipath = inputs[0].getPath()
        #
        # if not inputs[0].getFrom():
        #     local_ipath = build_local_path(ipath,user_uuid)
        # else :
        #     local_ipath = build_task_local_path(ipath,task_id,user_uuid)
        #
        # # 获取输出参数
        # output = func.getOutput()
        # if output == None:
        #     return False
        # opath = output.getPath()
        #
        # local_opath = build_task_local_path(opath, task_id,user_uuid)

        parms = func.getParms()
        command = ""
        for i in parms:
            key = i['key']
            value = i['value']
            inObj = re.search(r'in=\[(.{5})\]*', value, re.M | re.I)
            if inObj:
                inputId = inObj.group(1)
                input = func.getInput(inputId)
                if input:
                    input_path = input.getPath()
                    if not input.getFrom():
                        local_ipath = build_local_path(input_path, user_uuid)
                    else:
                        local_ipath = build_task_local_path(input_path, task_id, user_uuid)
                    command = "{0} {1} {2}".format(command,key,local_ipath)
            outObj = re.search(r'(\[out\](.*))', value, re.M | re.I)
            if outObj:
                output = func.getOutput()
                output_path = output.getPath()
                local_opath = build_task_local_path(output_path, task_id, user_uuid)
                pat = re.compile(r'(\[out\])')
                res = pat.sub(r'' +local_opath + '', value)
                command = "{0} {1} {2}".format(command, key, res)
            if not inObj and not outObj:
                command = "{0} {1} {2}".format(command, key, value)

        command = "{0} {1}".format("otbcli_EdgeExtraction",command)
        doFunction(process, command)
    except Exception as e:
        logger.error("process stretch run failed: {0}".format(str(e)))
        raise e
        return False
    return True


def raster_stretch(ipath, opath):
    try:

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
        #
        # if not os.path.exists(local_opath):
        #     return False
        #
        # shutil.copy2(local_ipath, local_opath)
    except Exception as e:
        logger.error("raster stretch run failed: {0}".format(str(e)))
        raise e

"""
处理边缘检测
"""
def process_edgeextraction(func,process,user_uuid):
    try:
        task_id = str(process.task_id)
        parms = func.getParms()
        command = ""
        for i in parms:
            key = i['key']
            value = i['value']
            inObj = re.search(r'in=\[(.{5})\]*', value, re.M | re.I)
            if inObj:
                inputId = inObj.group(1)
                input = func.getInput(inputId)
                if input:
                    input_path = input.getPath()
                    if not input.getFrom():
                        local_ipath = build_local_path(input_path, user_uuid)
                    else:
                        local_ipath = build_task_local_path(input_path, task_id, user_uuid)
                    command = "{0} {1} {2}".format(command,key,local_ipath)
            outObj = re.search(r'(\[out\](.*))', value, re.M | re.I)
            if outObj:
                output = func.getOutput()
                output_path = output.getPath()
                local_opath = build_task_local_path(output_path, task_id, user_uuid)
                pat = re.compile(r'(\[out\])')
                res = pat.sub(r'' +local_opath + '', value)
                command = "{0} {1} {2}".format(command, key, res)
            if not inObj and not outObj:
                command = "{0} {1} {2}".format(command, key, value)

        command = "{0} {1}".format("otbcli_EdgeExtraction",command)
        doFunction(process, command)
        # raster_stretch(local_ipath, local_opath)
    except Exception as e:
        logger.error("process run failed: {0}".format(str(e)))
        raise e
        return False
    return True


"""
处理平滑濾波
"""
def process_smoothing(func, process, user_uuid):
    try:
        task_id = str(process.task_id)
        parms = func.getParms()
        command = ""
        for i in parms:
            key = i['key']
            value = i['value']
            inObj = re.search(r'in=\[(.{5})\]*', value, re.M | re.I)
            if inObj:
                inputId = inObj.group(1)
                input = func.getInput(inputId)
                if input:
                    input_path = input.getPath()
                    if not input.getFrom():
                        local_ipath = build_local_path(input_path, user_uuid)
                    else:
                        local_ipath = build_task_local_path(input_path, task_id, user_uuid)
                    command = "{0} {1} {2}".format(command, key, local_ipath)
            outObj = re.search(r'(\[out\](.*))', value, re.M | re.I)
            if outObj:
                output = func.getOutput()
                output_path = output.getPath()
                local_opath = build_task_local_path(output_path, task_id, user_uuid)
                pat = re.compile(r'(\[out\])')
                res = pat.sub(r'' + local_opath + '', value)
                command = "{0} {1} {2}".format(command, key, res)


        command = "{0} {1}".format("otbcli_Smoothing", command)
        doFunction(process, command)
    except Exception as e:
        logger.error("process run failed: {0}".format(str(e)))
        raise e
        return False
    return True

"""
处理边缘检测
"""
def process_edgeextraction(func,process,user_uuid):
    try:
        task_id = str(process.task_id)
        parms = func.getParms()
        command = ""
        for i in parms:
            key = i['key']
            value = i['value']
            inObj = re.search(r'in=\[(.{5})\]*', value, re.M | re.I)
            if inObj:
                inputId = inObj.group(1)
                input = func.getInput(inputId)
                if input:
                    input_path = input.getPath()
                    if not input.getFrom():
                        local_ipath = build_local_path(input_path, user_uuid)
                    else:
                        local_ipath = build_task_local_path(input_path, task_id, user_uuid)
                    command = "{0} {1} {2}".format(command,key,local_ipath)
            outObj = re.search(r'(\[out\](.*))', value, re.M | re.I)
            if outObj:
                output = func.getOutput()
                output_path = output.getPath()
                local_opath = build_task_local_path(output_path, task_id, user_uuid)
                pat = re.compile(r'(\[out\])')
                res = pat.sub(r'' +local_opath + '', value)
                command = "{0} {1} {2}".format(command, key, res)
            if not inObj and not outObj:
                command = "{0} {1} {2}".format(command, key, value)

        command = "{0} {1}".format("otbcli_EdgeExtraction",command)
        doFunction(process, command)
    except Exception as e:
        logger.error("process run failed: {0}".format(str(e)))
        raise e
        return False
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



# 拉伸操作执行
def raster_fusion(process,input_path_1,input_path_2,output_path):
    try:
        command = "{0} {1} {2} {3}".format(settings.FUNSION_COMMAND,input_path_1,input_path_2,output_path)
        logger.debug("command: {0}".format(command))

        p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        process.pid = p.pid
        process.save()

        logger.debug("process pid is: {0}".format(str(process.pid)))
        p.wait()
        p_info = p.stdout.read()
        logger.info(p_info)
        logger.info("process return code is :{0}".format(str(p.returncode)))

        if (p.returncode) != 0:
            logger.info('kill pid')
            p.kill()
            raise Exception("process run failed:{0}".format(p.stderr.read()))
            return False
    except Exception as e:
        print("process failed:{0}".format(str(e)))
        raise e
    return True


def doFunction(process, command):
    try:

        command = "{0}{1}".format(settings.OTB_COMMAND_DIR,command)
        logger.debug("command: {0}".format(command))
        p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        process.pid = p.pid
        process.save()

        logger.debug("process pid is: {0}".format(str(process.pid)))
        p.wait()
        p_out_info = p.stdout.read()
        logger.info(p_out_info)
        logger.info("process return code is :{0}".format(str(p.returncode)))

        if (p.returncode) != 0:
            logger.info('kill pid')
            p.kill()
            p_erro_info = p.stderr.read()
            return_info = p_erro_info
            if p_erro_info.decode("utf-8") == '':
                return_info = p_out_info
            raise Exception("process run failed:{0}".format(return_info.decode("utf-8")))
            return False
    except Exception as e:
        print("process failed:{0}".format(str(e)))
        raise e
    return True

# 灰度拉伸
def process_rescale(func, process, user_uuid):
    return process_common(func,process,user_uuid, "RescaleImageFilter")

# 灰度Cast
def process_cast(func, process, user_uuid):
    return process_common(func,process,user_uuid, "CastImageFilter")

# 灰度阈值
def process_threshold(func,process, user_uuid):
    return process_common(func, process, user_uuid, "BinaryThresholdImageFilter",False)

# 灰度二值化
def process_binarythreshold(func,process, user_uuid):
    return process_common(func, process, user_uuid, "BinaryThresholdImageFilter",False)

# 栅格转RGB图像
def process_indexedtorgb(func, process, user_uuid):
    return process_common(func, process, user_uuid, "IndexedToRGBImage")

# 均值滤波
def process_meanimagefilter(func, process, user_uuid):
    return process_common(func, process, user_uuid, "MeanImageFilter")

# 中值滤波
def process_medianimagefilter(func, process, user_uuid):
    return process_common(func, process, user_uuid, "MedianImageFilter")

#高斯平滑
def process_discretegaussian(func,process, user_uuid):
    return process_common(func, process, user_uuid,"DiscreteGaussianImageFilter", False)


# 梯度计算
def process_gradient(func,process, user_uuid):
    return process_common(func, process,user_uuid,"GradientMagnitudeImageFilter")

# 带平滑的梯度计算
def process_gradientgaussian(func,process,user_uuid):
    return process_common(func, process,user_uuid,"GradientMagnitudeRecursiveGaussianImageFilter",False)

# 拉普拉斯滤波
def process_laplacian(func,process,user_uuid):
    return process_common(func, process, user_uuid,"LaplacianImageFilter")

# Canny边缘检测
def process_cannyedgedetection(func,process,user_uuid):
    return process_common(func,process,user_uuid,"CannyEdgeDetectionImageFilter")

# 腐蚀
def process_erode(func,process,user_uuid):
    return process_common(func,process,user_uuid,"ErodeImageFilter")

# 膨胀
def process_dilate(func,process,user_uuid):
    return process_common(func,process,user_uuid,"DilateImageFilter")

# 图像融合
def process_fusion(func,process,user_uuid):
    return process_common(func,process,user_uuid,"otbcli_Pansharpening")

# 灰度共生矩阵
def process_texture(func,process,user_uuid):
    return process_common(func,process,user_uuid,"Texture",False)

# PanTex纹理
def process_pantex(func,process,user_uuid):
    return process_common(func,process,user_uuid,"PanTex")

# HarrisDetector 特征点检测
def process_harrisdetector(func,process,user_uuid):
    return process_common(func,process,user_uuid,"HarrisDetector",False)

# SURFDetector 特征点检测
def process_surfdetector(func,process,user_uuid):
    return process_common(func,process,user_uuid,"SURFDetector",False)

"""
通用处理
"""
def process_common(func, process, user_uuid,fun_command,use_key=True):
    try:
        task_id = str(process.task_id)
        parms = func.getParms()
        command = ""
        for i in parms:
            key = i['key']
            value = i['value']
            value = str(value)
            inObj = re.search(r'in=\[(.{5})\]*', value, re.M | re.I)
            if inObj:
                inputId = inObj.group(1)
                input = func.getInput(inputId)
                if input:
                    input_path = input.getPath()
                    if not input.getFrom():
                        local_ipath = build_local_path(input_path, user_uuid)
                    else:
                        local_ipath = build_task_local_path(input_path, task_id, user_uuid)
                    command = "{0} {1} {2}".format(command, key, local_ipath)
            outObj = re.search(r'(\[out\](.*))', value, re.M | re.I)
            if outObj:
                output = func.getOutput()
                output_path = output.getPath()
                local_opath = build_task_local_path(output_path, task_id, user_uuid)
                pat = re.compile(r'(\[out\])')
                res = pat.sub(r'' + local_opath + '', value)
                command = "{0} {1} {2}".format(command, key, res)
            if not inObj and not outObj:
                if use_key == True:
                    command = "{0} {1} {2}".format(command, key, value)
                else:
                    command = "{0} {1} {2}".format(command, "", value)


        command = "{0} {1}".format(fun_command, command)
        doFunction(process, command)
    except Exception as e:
        logger.error("process run failed: {0}".format(str(e)))
        raise e
        return False
    return True
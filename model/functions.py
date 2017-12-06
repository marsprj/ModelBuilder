from ModelFlow import settings

from .Graph import Function, Datum
from PIL import Image
import os.path
import shutil
import re
import subprocess,signal,logging

logger = logging.getLogger('model.app')




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


def build_task_local_path(path,model_name,task_name,user_uuid):
    user_root = os.path.join(settings.UPLOADS_ROOT, str(user_uuid))
    model_path = os.path.join(user_root, model_name)
    task_path = os.path.join(model_path,task_name)
    return os.path.join(
        task_path, path[1:]
    )


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

# Radio线检测
def process_radiolinedetector(func,process,user_uuid):
    return process_common(func,process,user_uuid,"LineRadioDetector",False)

# Hough线提取
def process_localhoughextrator(func,process,user_uuid):
    return process_common(func,process,user_uuid,"LocalHoughExtractor",False)


# 云检测
def process_clouddetection(func,process,user_uuid):
    return process_common(func,process,user_uuid,"CloudDetection",False)

# 连通阈分割
def process_connectedsegment(func,process,user_uuid):
    return process_common(func,process,user_uuid,"ConnectedSegment",False)

# kMeans分类
def process_kmeans(func,process,user_uuid):
    return process_common(func,process,user_uuid,"KMeansImageClassification",False)

# 平均变化检测
def process_meandiffdetection(func,process,user_uuid):
    return process_common(func,process,user_uuid,"MeanDiffDetection",False)

# 平均比率变化检测
def process_meanradiodiffdetection(func,process,user_uuid):
    return process_common(func,process,user_uuid,"MeanRadioDiffDetection",False)

# 基于Kullback-Leibler距离检测
def process_kldiffdetection(func,process,user_uuid):
    return process_common(func,process,user_uuid,"KullbackLeilberDiffDetection",False)

# 基于相关系数的变化检测
def process_correlationdiffdetection(func,process,user_uuid):
    return process_common(func,process,user_uuid,"CorrelationDiffDetection",False)

# 多成分变化检测
def process_multivariatediffdetection(func,process,user_uuid):
    return process_common(func,process,user_uuid,"MultivariateDiffDetection")

# ROI裁剪
def process_roiextract(func,process,user_uuid):
    return process_common(func,process,user_uuid,"ROIExtract",False)

"""
通用处理
"""
def process_common(func, process, user_uuid,fun_command,use_key=True):
    try:

        task_id = str(process.task_id)
        task_name = process.task.name
        model_name = process.task.model.name
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
                        local_ipath = build_task_local_path(input_path, model_name,task_name, user_uuid)
                    command = "{0} {1} {2}".format(command, key, local_ipath)
            outObj = re.search(r'(\[out\](.*))', value, re.M | re.I)
            if outObj:
                output = func.getOutput()
                output_path = output.getPath()
                local_opath = build_task_local_path(output_path,model_name, task_name, user_uuid)
                pat = re.compile(r'(\[out\])')
                res = pat.sub(r'' + local_opath + '', value)
                command = "{0} {1} {2}".format(command, key, res)
            outputsObj = re.search(r'out=\[(.{5})\]*', value, re.M | re.I)
            if outputsObj:
                outputId = outputsObj.group(1)
                ouput = func.getOutputByID(outputId)
                if ouput:
                    output_path = ouput.getPath()
                    local_opath = build_task_local_path(output_path,model_name, task_name, user_uuid)
                    command = "{0} {1} {2}".format(command, key, local_opath)

            if (not inObj and not outObj) and not outputsObj:
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
import logging,os,subprocess,json
from ModelFlow import settings

from django.http import HttpResponse
from .views import http_success_response
from .views import http_error_response

logger = logging.getLogger('model.app')


def monitor_oper(request,oper):
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
        logging.error("{} monitor failed            :{}".format(oper, str(e)))
        return http_error_response("faield:{}".format(str(e)))
    return http_success_response()



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
            "status": return_info
        }
        return HttpResponse(json.dumps(obj),content_type="application/json")
    except Exception as e:
        logging.error("get monitor status failed :{}".format(str(e)))
        return http_error_response("error")

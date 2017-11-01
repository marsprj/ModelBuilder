#!/usr/bin/env python
# coding: utf-8


import sys, os, time, atexit, string,json

import setting

from signal import SIGTERM
import signal


import os
from pyinotify import WatchManager, Notifier, ProcessEvent, IN_DELETE, IN_CREATE, IN_MODIFY
import uuid,os,shutil,json,re,logging,datetime

import django
from django.db import connection
from django.utils import timezone
from django.utils.timezone import utc

from model.Graph import Graph
from model import functions
from model.models import User,Model,Task,Process


logger = logging.getLogger("model.app")

g_model_id = None
monitor_data = None

class Daemon:
    def _daemonize(self):
        try:
            pid = os.fork()  # 第一次fork，生成子进程，脱离父进程
            if pid > 0:
                sys.exit(0)  # 退出主进程
        except OSError as e:
            logger.error('fork #1 failed: %d (%s)\n' % (e.errno, e.strerror))
            sys.exit(1)

        os.chdir("/")  # 修改工作目录
        os.setsid()  # 设置新的会话连接
        os.umask(0)  # 重新设置文件创建权限

        try:
            pid = os.fork()  # 第二次fork，禁止进程打开终端
            if pid > 0:
                sys.exit(0)
        except OSError as e:
            logger.error('fork #2 failed: %d (%s)\n' % (e.errno, e.strerror))
            sys.exit(1)


    def start(self):

        try:
            model = Model.objects.get(uuid=g_model_id)
            self.model = model
        except Model.DoesNotExist:
            info = "model[{0}] does not exist".format(g_model_id)
            logger.error(info)
            sys.exit(1)
        except Exception as e:
            info = "get model [{0}] failed : {1}".format(g_model_id, str(e))
            logger.error(info)
            sys.exit(1)

        # 数据库读取
        try:

            text = model.text
            obj = json.loads(text)

            monitor = obj["monitor"]
            if not monitor:
                info = "model[{0}] does not has monitor info".format(g_model_id)
                logger.error(info)
                sys.exit(1)
            status = monitor["status"]
            if status == "on":
                info = "model[{0}] has already start monitor".format(g_model_id)
                logger.error(info)
                sys.exit(1)
            pid = monitor.get("pid")

            # if pid != '0':
            #     # 并且检测以下是否存在,待补充
            #     message = 'pid %s already exist. Monitor already running!'
            #     logger.fatal(message)
            #     sys.exit(1)
        except Exception as e:
            logger.error("start monitor failed:{0}".format(str(e)))
            sys.exit(1)

        # 启动监控
        self._daemonize()
        self._run()

    def stop(self):
        try:
            model = Model.objects.get(uuid=g_model_id)
            self.model = model
        except Model.DoesNotExist:
            info = "model[{0}] does not exist".format(g_model_id)
            logger.error(info)
            sys.exit(1)
        except Exception as e:
            info = "get model [{0}] failed : {1}".format(g_model_id, str(e))
            logger.error(info)
            sys.exit(1)

        try:

            text = model.text
            obj = json.loads(text)
            logger.debug("monitor model text:{0}".format(text))

            monitor = obj["monitor"]
            if not monitor:
                info = "model[{0}] does not has monitor info".format(g_model_id)
                logger.error(info)
                sys.exit(1)
            status = monitor["status"]
            if status == "off":
                info = "model[{0}] has already stop monitor".format(g_model_id)
                logger.error(info)
                sys.exit(1)
            pid = monitor.get("pid")
            pid = int(pid)
            logger.info("pid is {0}".format(pid))
        except Exception as e:
            logger.error("stop monitor failed:{}".format(str(e)))


        # 杀进程,循环删除
        try:
            while 1:
                os.kill(pid, SIGTERM)
                time.sleep(0.1)

        except OSError as err:
            err = str(err)

            if err.find('No such process') > 0:
                logger.error("no such process")
            else:
                logger.error(str(err))
                sys.exit(1)
        try:
            text = self.model.text
            obj = json.loads(text)
            monitor = obj.get("monitor")

            monitor["status"] = "off"
            monitor["pid"] = '0'
            self.model.text = json.dumps(obj)
            self.model.save()
            logger.info("stop monitor [{}]  success".format(g_model_id))
        except Exception as e:
            logger.error("stop monitor failed:{}".format(str(e)))

    def restart(self):
        self.stop()
        self.start()

    def _run(self):
        try:
            text = self.model.text
            obj = json.loads(text)
            monitor = obj.get("monitor")

            monitor["status"] = "on"
            monitor["pid"] = str(os.getpid())
            self.model.text = json.dumps(obj)
            self.model.save()
        except Exception as e:
            logger.error("save model monitor failed:{}".format(str(e)))
            sys.exit(1)

        monitor_model(g_model_id)


# 创建task
def createTask(new_data):
    # logger.info(daemon)
    try:
        django.setup()
        model = Model.objects.get(uuid=g_model_id)
    except Model.DoesNotExist:
        info = "model[{0}] does not exist".format(g_model_id)
        logger.error(info)
        return
    except Exception as e:
        info = "get model [{0}] failed : {1}".format(g_model_id, str(e))
        logger.error(info)
        return

    try:
        text = model.text
        obj = json.loads(text)
        data = obj["data"]
        #匹配的名称
        new_file_name = ""
        for d in data:
            d_id = d["id"]
            for new in new_data:
                new_id = new["id"]
                new_path = new["new_path"]
                relative_path = new["relative_path"]
                # 设置输入
                if new_id == d_id:
                    d["path"] = os.path.join(relative_path,new["name"])
                    new_file_name = new["new_file_name"]

            # 没有设置的,默认为输出
            if d["path"] == "/":
                d["path"] = "/" + d["id"] + ".jpg"

        # 修改后的task数据
        new_text = json.dumps(obj)
        logger.debug("new task text:{0}".format(new_text))

        start_time = datetime.datetime.utcnow() - datetime.timedelta(hours=5)
        task_name = "auto_" + new_file_name

        task = model.task_set.create(
            uuid=uuid.uuid4(),
            name=task_name,
            start_time=start_time,
            text=new_text
        )
        task.save()
        logger.info("save new task[{0}] success".format(task_name))
        runTask(task.uuid)
    except Exception as e:
        logger.error("save new task[{0}] failed:{1}".format(task_name,str(e)))
        return


# 运行任务
def runTask(task_id):
    try:
        task = Task.objects.get(uuid=task_id)
    except Task.DoesNotExist:
        info ="task[{0}] does not exist".format(task_id)
        logger.error(info)
        return
    except Exception as e:
        info = "task[{0}] query failed:{1}".format(task_id, str(e))
        logger.error(info)
        return
    if task.state == 1:  # running
        logger.error("task[{0}] is running".format(task_id))
    start_run_task(task)

def start_run_task(task):
    try:
        user_uuid = task.model.user.uuid
    except:
        logger.error("no user")
    try:
        success = True
        graph = Graph()
        if not graph.load(task.text):
            pass
        else:
            task.start_time = datetime.datetime.utcnow() - datetime.timedelta(hours=5)

            task.end_time = None
            task.complete_percent = 0
            task.state = 1
            task.save()

            #文件夹处理
            file_root = setting.UPLOADS_ROOT
            user_root = os.path.join(file_root,str(user_uuid))
            task_path = os.path.join(user_root,str(task.uuid))
            if os.path.exists(task_path):
                shutil.rmtree(task_path)
            os.mkdir(task_path)
            info = ("create task folder:{0}".format(task_path))
            logger.info(info)
            #生成执行计划
            flow = graph.plan()
            if flow:

                #task.process_set.delete()
                Process.objects.filter(task=task).delete()

                #生成执行步骤及其状态,记录Process的状态
                processes = []
                for func in flow:
                    process = task.process_set.create(
                        name = func.getName(),
                        node_id = func.getID()
                        #start_time = timezone.now(),
                        #end_time = timezone.now()
                    )
                    process.save()
                    processes.append(process)

                #执行Plan
                count = len(processes)
                for i in range(count):
                    # 先判断是否已经失败了
                    task = Task.objects.get(uuid=task.uuid)
                    if task.state == 3:
                        info = "task[{0}] already fail".format(str(task.uuid))
                        success = False;
                        errmsg = "run task failed:already fail"
                        break;

                    #执行func
                    #更新process的状态为正在执行
                    process = processes[i]
                    process.state = 1
                    process.complete_percent = 0
                    process.start_time = datetime.datetime.utcnow() - datetime.timedelta(hours=5)
                    process.save()


                    ###################################################
                    # 执行计算任务 Begin
                    ###################################################
                    func = flow[i]
                    #processing func

                    success = False
                    errmsg  = ""
                    process_func_name = "process_" + func.getName()
                    #检查是否存在相应的处理函数
                    if hasattr(functions, process_func_name.lower()):
                        #如果存在相应的处理函数，则获取该处理函数
                        f = getattr(functions, process_func_name.lower())
                        #处理计算任务
                        info = "run {0} function".format(process_func_name)
                        try:
                            success = f(func,process,str(user_uuid))
                        except Exception as e:
                            errmsg = "process {0} run failed :{1}".format(process_func_name,str(e))

                            success = False
                    else:
                        errmsg = "方法[{0}]尚未在系统中注册".format(func.getName());

                        success = False

                    # time.sleep(5)
                    ###################################################
                    # 执行计算任务 End
                    ###################################################

                    ###################################################
                    # 设置Process的状态 Begin
                    ###################################################
                    if success == True:
                        # 更新process的状态为结束，并记录结束时间
                        process.end_time = datetime.datetime.utcnow() - datetime.timedelta(hours=5)
                        process.state = 2   #success
                        process.complete_percent = 100
                        process.save()

                        task = Task.objects.get(uuid=task.uuid)
                        if task.state == 3:
                            errmsg = "user stop task already"
                            success = False
                            break;

                        # 更新task的percent
                        task.complete_percent = 100 * (i+1) / count
                        task.save()
                        info = "process[{0}] run success".format(str(process.id))
                        logger.info(info)
                    else:
                        # 更新process的状态为结束，并记录结束时间
                        process.state = 3   #failure
                        process.save()
                        # errmsg = "process[{0}] run failed".format(str(process.id))
                        info = "process[{0}] run failed".format(str(process.id))
                        logger.error(info)
                        break
                    ###################################################
                    # 设置Process的状态 End
                    ###################################################

            ###################################################
            # 设置Task的状态 Begin
            ###################################################
            if success==True:
                task.state = 2
                task.end_time = datetime.datetime.utcnow() - datetime.timedelta(hours=5)

                task.complete_percent = 100
                info = "task[{0}] run success".format(str(task.uuid))
                logger.info(info)
            else:
                task.state =  3  # 设置task的状态
                info = "task[{0}] run fail".format(str(task.uuid))
                logger.error(info)
            task.save()
            ###################################################
            # 设置Task的状态 End
            ###################################################

    except Exception as e:
        task.state = 3
        task.save();
        info = "run task failed:{0}".format(str(e))
        logger.error(info)
    finally:
        connection.close()


# 验证新加入的文件是否符合规则
def verify(path,name):
    new_data = []
    length = len(monitor_data)

    # 匹配的名称
    new_file_name = None
    for data in monitor_data:
        d_path = data["path"]
        d_prefix = data["prefix"]
        if os.path.normpath(d_path) == os.path.normpath(path):
            result = re.match(r"^" + d_prefix + "",name)
            if result == None:
                # 路径一致,但是前缀不符合
                logger.info("new file does not matched")
                return
            logger.info("new file[{}] match [{}]".format(name,d_prefix))

            # 前缀与文件类型之间的名称
            pos_1 = name.index(".")
            prefix_length = len(d_prefix)
            new_file_name = name[0:pos_1]

            data["new_path"] = os.path.join(d_path, name)
            data["new_file_name"] = new_file_name
            data["name"] = name
            # 数据有效
            new_data.append(data)
            break

    # 只有一个的情况
    if len(new_data) == length:
        createTask(new_data)
        return

    # 多个输入时考虑,待补充
    for data in monitor_data:
        path = data["path"]
        id = data["id"]
        for new in new_data:
            new_id = new["id"]

    if len(new_data) == length:
        createTask(new_data)
        return
    return



class EventHandler(ProcessEvent):
    """事件处理"""
    def process_IN_CREATE(self, event):
        logger.info("Create file: %s " % os.path.join(event.path, event.name))
        verify(event.path,event.name)

    def process_IN_MODIFY(self, event):
        logger.info("Modify file: %s " % os.path.join(event.path, event.name))
        verify(event.path,event.name)

# 监听一个模型
def monitor_model(model_id):
    try:
        model = Model.objects.get(uuid=model_id)
    except Model.DoesNotExist:
        info = "model[{0}] does not exist".format(model_id)
        logger.error(info)
        return
    except Exception as e:
        info = "get model [{0}] failed : {1}".format(model_id, str(e))
        logger.error(info)
        return
    try:
        text = model.text
        obj = json.loads(text)
        user_id = model.user.uuid
        user_root = os.path.join(setting.UPLOADS_ROOT,str(user_id))

        monitor = obj["monitor"]
        if not monitor:
            info ="model[{0}] does not has monitor info".format(model_id)
            logger.error(info)
            return
        data = monitor["data"]
        for d in data:
            d_path = d["path"]
            d["relative_path"] = d_path
            d_path = os.path.join(user_root,d_path[1:])
            d["path"] = d_path

        # 从监听信息中读取监听的路径等数据
        global monitor_data
        monitor_data = data

        connection.close()
        monitor_path()

    except Exception as e:
        logger.error("monitor model[{0}] failed: {1}".format(model_id,str(e)))
        return



# 监听路径
def monitor_path():
    try:
        wm = WatchManager()
        mask = IN_CREATE|IN_MODIFY
        notifier = Notifier(wm, EventHandler())

        # 添加监听
        for d in monitor_data:
            path = d["path"]
            wm.add_watch(path, mask, rec=True)
            logger.info('now starting monitor %s' % (path))

        while True:
            try:
                notifier.process_events()
                if notifier.check_events():
                    notifier.read_events()
            except KeyboardInterrupt:
                notifier.stop()
                break
    except Exception as e:
        logger.error("start monitor failed:{}".format(str(e)))


# 入口
if __name__ == '__main__':
    daemon = Daemon()
    if len(sys.argv) == 3:
        g_model_id = sys.argv[2]
        if 'start' == sys.argv[1]:
            daemon.start()
        elif 'stop' == sys.argv[1]:
            daemon.stop()
        elif 'restart' == sys.argv[1]:
            daemon.restart()
        else:
            logger.error('unknown command')
            sys.exit(2)
        sys.exit(0)
    else:
        logger.error('usage: %s start|stop|restart model_id' % sys.argv[0])
        sys.exit(2)

    # global g_model_id
    # g_model_id = 'e8c1e1b4-2a80-4acb-845c-0875724f02f3'
    # monitor_model(g_model_id)

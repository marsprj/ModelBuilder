#!/usr/bin/env python
# coding: utf-8


import sys, os, time, atexit, string,json,inspect

currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0,parentdir)
# print(sys.path)

import setting
from signal import SIGTERM
import signal,threading,atexit

from pyinotify import WatchManager, Notifier, ProcessEvent,IN_CLOSE_WRITE
import uuid,os,shutil,json,re,logging,datetime

import django
from django.db import connection
from django.utils import timezone
from django.utils.timezone import utc

from model.Graph import Graph
from model import functions
from model.models import User,Model,Task,Process


logger = logging.getLogger("model.app")

class Daemon:
    __monitorData = []
    __monitorPaths = []
    __timer = None
    __notifier = None
    __wm = None
    __watchPaths = None
    __pidfile = None
    __interval = 2*60

    def __init__(self,pidfile):
        self.__monitorData = []
        self.__monitorPaths = []
        self.__timer = None
        self.__notifier = None
        self.__wm = None
        self.__watchPaths = None
        self.__pidfile = pidfile
        self.__interval = 2*60

    # def __del__(self):
    #     self.__cleanMonitorData()
    #     if self.__notifier:
    #         self.__notifier.stop()
    #     if self.__timer:
    #         self.__timer.cancel()

    # 守护进程
    def __daemonize(self):
        try:
            pid = os.fork()  # 第一次fork，生成子进程，脱离父进程
            if pid > 0:
                sys.exit(0)  # 退出主进程
        except OSError as e:
            logger.error('fork #1 failed: %d (%s)\n' % (e.errno, e.strerror))
            sys.exit(1)

        try:
            os.chdir("/")  # 修改工作目录
            os.setsid()  # 设置新的会话连接
            os.umask(0)  # 重新设置文件创建权限
            pid = os.fork()  # 第二次fork，禁止进程打开终端
            if pid > 0:
                sys.exit(0)
        except OSError as e:
            logger.error('fork #2 failed: %d (%s)\n' % (e.errno, e.strerror))
            sys.exit(1)

        try:
            atexit.register(self.__delete_pidfile)
            logger.info("save daemon process pid to file")
            pid = str(os.getpid())
            fo = open(self.__pidfile,'w+')
            fo.write('%s\n'%pid)
            fo.close()
        except Exception as e:
            logger.error("save daemon pid failed:{}".format(str(e)))
            sys.exit(1)

    def __delete_pidfile(self):
        try:
            if os.path.exists(self.__pidfile):
                logger.info("******delete daemon pid file*****")
                os.remove(self.__pidfile)
        except Exception as e:
            logger.error("delete daemon pid file failed:{}".format(str(e)))
            sys.exit(1)

    # 启动
    def start(self):
        # 先判断是否已经启动了
        try:
            fo = open(self.__pidfile,'r')
            pid = int(fo.read().strip())
            fo.close()
        except Exception as e:
            pid = None

        if pid:
            logger.error("pidfile already exist.Daemon monitor already running?")
            sys.exit(1)

        # 启动监控
        self.__daemonize()
        self.__run()

    # 停止
    def stop(self):
        try:
            fo = open(self.__pidfile,'r')
            pid = int(fo.read().strip())
            fo.close()
        except Exception as e:
            logger.error("get daemon pid file failed:{}".format(str(e)))
            pid = None

        if not pid:
            logger.error("pid file does not exist. not running?")
            return

        logger.debug("read pid from pid file:{}".format(str(pid)))

        logger.info("stop daemon monitor process")

        # 杀进程,循环删除
        try:
            while 1:
                os.kill(pid, SIGTERM)
                time.sleep(0.1)

        except OSError as err:
            err = str(err)
            if err.find('No such process') > 0:
                logger.error("no such process")
                if os.path.exists(self.__pidfile):
                    os.remove(self.__pidfile)
            else:
                logger.error(str(err))
                sys.exit(1)

    def restart(self):
        self.stop()
        self.start()

    def __run(self):
        try:
            logger.info("pid is {}".format(os.getpid()))
            self.__timer = threading.Timer(1, self.monitor_models)
            self.__timer.start()
        except Exception as e:
            logger.error("start monitor failed:{}".format(str(e)))
            sys.exit(1)


    # 刷新前清理数据
    def __cleanMonitorData(self):
        try:
            self.__monitorData = []
            self.__monitorPaths = []
            if connection:
                connection.close()
        except Exception as e:
            logger.error("clean monitor data failed:{}".format(str(e)))

    # 监听所有模型
    def monitor_models(self):
        try:
            now = datetime.datetime.utcnow() - datetime.timedelta(hours=16)
            logger.info("refresh monitor info from database :{}".format(now.strftime("%Y-%m-%d %H:%M:%S")))
            self.__cleanMonitorData()
            models = Model.objects.all()
        except Exception as e:
            info = "get models failed : {}".format(str(e))
            logger.error(info)
            sys.exit(1)

        try:
            for model in models:
                text = model.text
                obj = json.loads(text)
                if not "monitor" in obj:
                    continue

                user_id = model.user.uuid
                user_root = os.path.join(setting.UPLOADS_ROOT,str(user_id))
                monitor = obj["monitor"]
                status = monitor["status"]
                if status == "on":
                    data = monitor["data"]
                    for d in data:
                        d_path = d["path"]
                        d["relative_path"] = d_path
                        path = os.path.join(user_root,d_path[1:])
                        d["path"] = path
                        self.__add_monitor_folder_path(path,str(model.uuid))
                    self.__monitorData.append({
                        "id": str(model.uuid),
                        "data": data
                    })
        except Exception as e:
            logger.error("get monitor info failed:{}".format(str(e)))
            return

        try:
            mask = IN_CLOSE_WRITE
            paths = []
            if not self.__wm:
                wm = WatchManager()
                self.__wm = wm
                self.__notifier = Notifier(self.__wm, EventHandler())
                for monitorPath in self.__monitorPaths:
                    path = monitorPath["path"]
                    logger.info('now starting monitor %s' % (path))
                    paths.append(path)
                self.__watchPaths = self.__wm.add_watch(paths, mask, rec=False)
                connection.close()
                self.__timer = threading.Timer(self.__interval, self.monitor_models)
                self.__timer.start()

                while True:
                    try:
                        self.__notifier.process_events()
                        if self.__notifier.check_events():
                            self.__notifier.read_events()
                    except KeyboardInterrupt:
                        self.__notifier.stop()
                        break
            else:
                # 第二次访问，清理监听文件夹，新加入监听文件夹
                rm_paths = []
                for value in self.__watchPaths.values():
                    rm_paths.append(value)
                self.__wm.rm_watch(rm_paths)
                for monitorPath in self.__monitorPaths:
                    path = monitorPath["path"]
                    logger.info('now starting monitor %s' % (path))
                    paths.append(path)
                self.__watchPaths = self.__wm.add_watch(paths, mask, rec=False)
                connection.close()
                self.__timer = threading.Timer(self.__interval, self.monitor_models)
                self.__timer.start()
        except Exception as e:
            logger.error("run monitor failed:{}".format(str(e)))


    # 加入监听文件夹
    def __add_monitor_folder_path(self,path,model_id):
        try:
            for p in self.__monitorPaths:
                models = p["models"];
                if p["path"] == path:
                    if not model_id in models :
                        models.append(model_id)
                    return
            self.__monitorPaths.append({
                "path":path,
                "models":[model_id]
            })
        except Exception as e:
            logger.error("add monitor path failed:{}".format(str(e)))


    # 上传文件后的判断
    def verify(self,path,name):
        try:
            logger.debug("***********begin verify new file***********")
            for monitorPath in self.__monitorPaths:
                m_path = monitorPath["path"]
                if os.path.normpath(m_path) == os.path.normpath(path):
                    for model in monitorPath["models"]:
                        self.__verify_model(path,name,model)
            logger.debug("***********stop verify new file***********")
        except Exception as e:
            logger.error("verify file failed:{}".format(str(e)))

    # 根据模型id来获取监听信息
    def __get_monitor_data(self,model_id):
        try:
            for monitorData in self.__monitorData:
                id = monitorData["id"]
                if id == model_id:
                    return monitorData["data"]
        except Exception as e:
            logger.error("get monitor data failed:{}".format(str(e)))
        return None

    # 验证一个模型
    def __verify_model(self,path,name,model_id):
        try:
            monitorData = self.__get_monitor_data(model_id)
            if not monitorData:
                return
            new_data = []
            logger.info("new file[{}] match model[{}] path".format(name,model_id))

            for data in monitorData:
                d_path = data["path"]
                d_prefix = data["prefix"]
                if os.path.normpath(d_path) == os.path.normpath(path):
                    result = re.match(r"^" + d_prefix + "", name)
                    if result == None:
                        # 路径一致,但是前缀不符合
                        logger.info("new file[{}] does not matched prefix[{}]".format(name,d_prefix))
                        continue
                    logger.info("new file[{}] match [{}]".format(name, d_prefix))

                    # 前缀与文件类型之间的名称
                    pos_1 = name.index(".")
                    prefix_length = len(d_prefix)
                    new_file_name = name[prefix_length:pos_1]

                    data["new_path"] = os.path.join(d_path, name)
                    data["new_file_name"] = new_file_name
                    data["name"] = name
                    # 数据有效
                    new_data.append(data)
            if len(new_data) == 0:
                logger.info("new file[{}] does not match any node".format(name))
                return

            #单一输入
            if len(new_data) == len(monitorData):
                createTask(model_id,new_data)
                return

            # 验证通过的数据
            new_data_id = new_data[0]["id"]
            new_file_name = new_data[0]["new_file_name"]

            # 多个输入时考虑,去监听数据中根据路径查找名称相同的
            for data in monitorData:
                d_path = data["path"]
                d_id = data["id"]
                if d_id == new_data_id:
                    continue
                d_prefix = data["prefix"]

                prefix_length = len(d_prefix)
                flag = False
                for filename in os.listdir(d_path):
                    fp = os.path.join(d_path, filename)
                    if os.path.isfile(fp):
                        result = re.match(r"^" + d_prefix + "",filename)
                        if result == None:
                            continue
                        pos_1 = filename.index(".")
                        middle_name = filename[prefix_length:pos_1]
                        if middle_name == new_file_name:
                            flag = True
                            data["new_path"] = fp
                            data["new_file_name"] = middle_name
                            data["name"] = filename
                            new_data.append(data)
                            break
                if not flag:
                    # 在另一个输入里面没有形同名称的文件，直接退出
                    logger.info("not found match file")
                    return
            if len(new_data) == len(monitorData):
                createTask(model_id,new_data)
                return
            return
        except Exception as e:
            logger.error("verify model[{}] failed:{}".format(model_id,str(e)))
            return

# 创建task
def createTask(model_id,new_data):
    try:
        django.setup()
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

        start_time = datetime.datetime.utcnow() - datetime.timedelta(hours=6)
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

# 执行运行任务
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
            task.start_time = datetime.datetime.utcnow() - datetime.timedelta(hours=6)

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
                    process.start_time = datetime.datetime.utcnow() - datetime.timedelta(hours=6)
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
                        process.end_time = datetime.datetime.utcnow() - datetime.timedelta(hours=6)
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
                task.end_time = datetime.datetime.utcnow() - datetime.timedelta(hours=6)

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

# 监听文件夹的事件处理
class EventHandler(ProcessEvent):
    def process_IN_CLOSE_WRITE(self, event):
        if event.dir:
            return
        logger.info("close write file: %s " % os.path.join(event.path, event.name))
        daemon.verify(event.path,event.name)

# 入口
if __name__ == '__main__':
    pidfile = "/tmp/daedom_monitor.pid"
    daemon = Daemon(pidfile)
    if len(sys.argv) == 2:
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
        logger.error('usage: %s start|stop|restart' % sys.argv[0])
        sys.exit(2)
    # daemon.monitor_models()

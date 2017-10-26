import django,logging,sys
from django.db import models
from django.conf import settings
import uuid,os


#外部调用django时，需要设置django相关环境变量
#设置INSTALLED_APPS信息
INSTALLED_APPS = [
    'model',
    # 'django.contrib.admin',
    # 'django.contrib.auth',
    # 'django.contrib.contenttypes',
    # 'django.contrib.sessions',
    # 'django.contrib.messages',
    # 'django.contrib.staticfiles',
]
#设置数据库信息
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'model',                        #数据库名称
        'USER': 'postgres',                         #数据库用户名
        'PASSWORD': 'qwer1234',                   #数据库密码
        'HOST': '192.168.111.63',                    #主机地址
        'PORT': '5432',                         #数据库端口号
    }
}
#给Django配置相关信息
if not settings.configured:
    settings.configure(DATABASES=DATABASES, INSTALLED_APPS=INSTALLED_APPS, DEBUG=True)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_ROOT = os.path.join(BASE_DIR, "static")
DATA_ROOT = os.path.join(SITE_ROOT, "data")
UPLOADS_ROOT = os.path.join(DATA_ROOT, "uploads")

OTB_COMMAND_DIR = "/opt/otb-6.0/bin/"
#启动Django
django.setup()


# 获取logger实例，如果参数为空则返回root logger
logger = logging.getLogger("model.app")
# formatter = logging.Formatter('%(asctime)s %(levelname)-8s: %(message)s')
formatter = logging.Formatter('%(asctime)s [%(threadName)s:%(thread)d] [%(filename)s:%(lineno)d] [%(levelname)s]- %(message)s')

# 文件日志
file_handler = logging.FileHandler( os.path.join(SITE_ROOT+'/logs/','monitor.log'))
file_handler.setFormatter(formatter)  # 可以通过setFormatter指定输出格式
# 控制台日志
console_handler = logging.StreamHandler(sys.stdout)
console_handler.formatter = formatter  # 也可以直接给formatter赋值


# 为logger添加的日志处理器
logger.addHandler(file_handler)
logger.addHandler(console_handler)

# 指定日志的最低输出级别，默认为WARN级别
logger.setLevel(logging.DEBUG)

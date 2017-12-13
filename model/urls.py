from django.conf.urls import url
from . import views
from . import monitor
from . import user

import time,json

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^(?P<username>[-A-Za-z0-9]+)/models/$', views.models, name='models'),
    url(r'^(?P<username>[-A-Za-z0-9]+)/model/save/$', views.model_save, name='save'),
    url(r'^model/(?P<model_id>[-A-Za-z0-9]+)/$', views.model_get, name='get'),
    url(r'^model/(?P<model_id>[-A-Za-z0-9]+)/delete/$', views.model_delete, name='delete'),
    url(r'^model/(?P<model_id>[-A-Za-z0-9]+)/plan/$', views.model_plan, name='plan'),
    url(r'^model/(?P<model_id>[-A-Za-z0-9]+)/tasks/$', views.model_tasks, name='tasks'),


    url(r'^tasks/$', views.tasks, name='tasks'),
    url(r'^task/(?P<task_id>[-A-Za-z0-9]+)/get/$', views.task_get),
    url(r'^task/(?P<task_id>[-A-Za-z0-9]+)/save/$', views.task_save),
    url(r'^task/create/$', views.task_create, name='create_task'),
    url(r'^task/(?P<task_id>[-A-Za-z0-9]+)/state/$', views.task_state, name='state'),
    url(r'^task/(?P<task_id>[-A-Za-z0-9]+)/run/$', views.task_run, name='run'),
    url(r'^task/(?P<task_id>[-A-Za-z0-9]+)/stop/$', views.task_stop, name='stop'),
    url(r'^task/(?P<task_id>[-A-Za-z0-9]+)/download/(?P<node_id>[-A-Za-z0-9]+)/(?P<original>true|false)/$', views.task_download, name='download'),

    url(r'^register/$', user.user_register, name='register'),
    url(r'^login/$', user.user_login, name='login'),
    url(r'^(?P<username>[-A-Za-z0-9]+)/logout/$', user.user_logout, name='logout'),
    url(r'^users/count/$',user.users_count),
    url(r'^users/list/(?P<count>[0-9]+)/(?P<offset>[0-9]+)/(?P<field>[-_A-Za-z0-9]+)/(?P<orderby>desc|asc)/$', user.user_list, name='users'),
    url(r'^user/(?P<user_id>[-A-Za-z0-9]+)/delete/$', user.user_delete, name='user_delete'),
    url(r'^admin/info/$', user.admin_info),


    url(r'^tasks/(?P<model_id>[-A-Za-z0-9]+)/(?P<task_state>[0-4]{1})/count/$',views.task_count),
    url(r'^tasks/(?P<model_id>[-A-Za-z0-9]+)/(?P<task_state>[0-4]{1})/list/(?P<count>[0-9]+)/(?P<offset>[0-9]+)/(?P<field>[-_A-Za-z0-9]+)/(?P<orderby>desc|asc)/$',views.task_list),


    url(r'^model/(?P<model_id>[-A-Za-z0-9]+)/start/$',monitor.model_start),
    url(r'^model/(?P<model_id>[-A-Za-z0-9]+)/stop/$',monitor.model_stop),
    url(r'^models/(?P<model_status>start|stop|all)/status/$',monitor.models_status),
    url(r'^models/(?P<model_status>start|stop|all)/status/count/$',monitor.models_status_count),
    url(r'^models/(?P<model_status>start|stop|all)/status/(?P<count>[0-9]+)/(?P<offset>[0-9]+)/$',monitor.models_status),
    url(r'^model/(?P<model_id>[-A-Za-z0-9]+)/status/$',monitor.model_status),

    url(r'^monitor/(?P<oper>start|stop|restart)/$',monitor.monitor_oper),
    url(r'^monitor/status/$',monitor.monitor_status),

]
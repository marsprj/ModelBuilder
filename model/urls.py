from django.conf.urls import url
from . import views

import time,json

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^model/run/(?P<model_id>[-A-Za-z0-9]+)/$', views.model_run, name='run'),
    url(r'^model/save/$', views.model_save, name='save'),
    #url(r'^model/(?P<model_id>[0-9]+)/$', views.model_get, name='get'),
    # url(r'^(?P<question_id>[0-9]+)/$', views.detail, name='detail'),
]
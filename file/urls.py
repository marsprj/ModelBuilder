from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^upload/$', views.file_upload, name='file_upload'),
    url(r'^list/$', views.file_list, name='file_list'),
    url(r'^create/$', views.file_create, name='file_create'),
    url(r'^preview/(?P<path>.+)/$', views.file_preview, name='file_preview'),
    url(r'^remove/$', views.file_remove, name='file_remove'),
]
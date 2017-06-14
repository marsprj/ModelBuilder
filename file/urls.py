from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^upload/$', views.file_upload, name='file_upload'),
]
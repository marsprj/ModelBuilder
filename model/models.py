from django.db import models
import uuid

# Create your models here.
class User(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, null=False, unique=True)
    username = models.CharField(max_length=50)
    password = models.CharField(max_length=50)
    login_time = models.DateTimeField()

    def exportToJson(self):
        return {
            "uuid": str(self.uuid),
            "name": self.username,
            "password": self.password,
            "login_time":self.login_time.astimezone().strftime("%Y-%m-%d %H:%M:%S"),
            "models":len(self.model_set.all())
        }

class Model(models.Model):
    id = models.AutoField(primary_key=True, null=False)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, null=False, unique=True)
    name = models.CharField(max_length=255, null=False)
    create_time = models.DateTimeField()
    description = models.CharField(max_length=1024)
    text = models.TextField()
    user = models.ForeignKey(User,to_field='uuid', null=True)

    def exportToJson(self):
        return {
            "name" : self.name,
            "uuid" : str(self.uuid),
            "description" : self.description,
            "create_time" : self.create_time.astimezone().strftime("%Y-%m-%d %H:%M:%S"),
        }

class Task(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, null=False, unique=True)
    model = models.ForeignKey(Model, to_field='uuid')
    name = models.CharField(max_length=64)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True)
    state = models.IntegerField(default=0)
    complete_percent = models.IntegerField(default=0)
    text = models.TextField()

    def exportToJson(self):
        obj = {
            "id" : self.id,
            "name" : self.name,
            "uuid" : str(self.uuid),
            "model" : str(self.model_id),
            "state" : self.state,
            "start_time": self.start_time.astimezone().strftime("%Y-%m-%d %H:%M:%S"),
            "end_time" : "-" if self.end_time==None else self.end_time.astimezone().strftime("%Y-%m-%d %H:%M:%S"),
            "percent": "{0}%".format(self.complete_percent),
        }
        return obj


class Process(models.Model):
    id = models.AutoField(primary_key=True)
    task = models.ForeignKey(Task, to_field='uuid')
    name = models.CharField(max_length=64)
    start_time = models.DateTimeField(null=True)
    end_time = models.DateTimeField(null=True)
    state = models.IntegerField(default=0)
    complete_percent = models.IntegerField(default=0)
    node_id = models.CharField(max_length=64, null=True)
    pid = models.IntegerField(default=0)

    def exportToJson(self):
        return {
            "id": self.id,
            "name": self.name,
            # "uuid": str(self.uuid),
            "task": str(self.task_id),
            "state": self.state,
            "start_time": "-" if self.start_time==None else self.start_time.astimezone().strftime("%Y-%m-%d %H:%M:%S"),
            "end_time": "-" if self.end_time==None else self.end_time.astimezone().strftime("%Y-%m-%d %H:%M:%S"),
            "percent" : "{0}%".format(self.complete_percent),
            "node_id": self.node_id
        }




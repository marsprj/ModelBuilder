from django.db import models
import uuid

# Create your models here.

class Model(models.Model):
    id = models.AutoField(primary_key=True, null=False)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, null=False, unique=True)
    name = models.CharField(max_length=255, null=False)
    create_time = models.DateTimeField()
    description = models.CharField(max_length=1024)
    text = models.TextField()

    def exportToJson(self):
        return {
            "name" : self.name,
            "uuid" : str(self.uuid),
            "description" : self.description,
            "create_time" : str(self.create_time)
        }

class Task(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, null=False, unique=True)
    model = models.ForeignKey(Model, to_field='uuid')
    name = models.CharField(max_length=64)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    state = models.IntegerField(default=0)

    def exportToJson(self):
        obj = {
            "id" : self.id,
            "name" : self.name,
            "uuid" : str(self.uuid),
            "model" : str(self.model_id),
            "state" : self.state,
            "start_time" : str(self.start_time),
            "end_time" : str(self.end_time),
        }
        return obj


class Process(models.Model):
    id = models.AutoField(primary_key=True)
    task = models.ForeignKey(Task, to_field='uuid')
    name = models.CharField(max_length=64)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True)
    state = models.IntegerField(default=0)

    def exportToJson(self):
        return {
            "id": self.id,
            "name": self.name,
            # "uuid": str(self.uuid),
            "task": str(self.task_id),
            "state": self.state,
            "start_time": str(self.start_time),
            "end_time": str(self.end_time),
        }

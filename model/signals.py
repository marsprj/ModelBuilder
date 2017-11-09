from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from channels import Group

from .models import Task
import json

def send_notification(notification):
    print('send_notification. notification = %s', notification)
    Group("users").send({'text': json.dumps(notification)})

@receiver(post_save, sender=Task)
def incident_post_save(sender, **kwargs):
    instance = kwargs['instance']
    if instance.name.find("auto_") == 0:
        send_notification({
            'type': 'post_save',
            'created': kwargs['created'],
            'feature': json.dumps(kwargs['instance'].exportToJson())
        })

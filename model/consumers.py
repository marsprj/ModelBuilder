import json
from channels import Group
from channels.auth import channel_session_user, channel_session_user_from_http,channel_session

from json import dumps
from django.http import HttpResponse
from django.utils.timezone import now

@channel_session_user_from_http
def ws_connect(message):
    Group('users').add(message.reply_channel)
    Group('users').send({
        'text': json.dumps({
            'username': message.user.username,
            'is_logged_in': True
        })
    })


@channel_session_user
def ws_disconnect(message):
    Group('users').send({
        'text': json.dumps({
            'username': message.user.username,
            'is_logged_in': False
        })
    })
    Group('users').discard(message.reply_channel)


@channel_session
def websocket_keepalive(message):
    print('websocket_keepalive. message = %s', message)
    Group("users").add(message.reply_channel)



def http_consumer(message):
    response = HttpResponse(
        "It is now {} and you've requested {} with {} as request parameters.".format(
            now(),
            # message.content['path']
            # dumps(message.content['get'])
        )
    )

    message.reply_channel.send(response.channel_encode())

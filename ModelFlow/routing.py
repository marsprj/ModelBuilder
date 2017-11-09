from channels.routing import route
from model.consumers import ws_connect, ws_disconnect,websocket_keepalive


channel_routing = [
    route('websocket.connect', ws_connect),
    route('websocket.disconnect', ws_disconnect),
    route('websocket.keepalive', websocket_keepalive),
    # route("http.request", http_consumer)
]

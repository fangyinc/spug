# Copyright: (c) OpenSpug Organization. https://github.com/openspug/spug
# Copyright: (c) <spug.dev@gmail.com>
# Released under the MIT License.
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import uuid
import logging

layer = get_channel_layer()

logger = logging.getLogger('django.libs.Channel')


class Channel:
    @staticmethod
    def get_token():
        return uuid.uuid4().hex

    @staticmethod
    def send_ssh_executor(hostname, port, username, command, token=None, engine=None):
        if engine is None:
            engine = {}
        message = {
            'type': 'exec',
            'token': token,
            'hostname': hostname,
            'port': port,
            'username': username,
            'command': command,
            'engine': engine
        }
        async_to_sync(layer.send)('ssh_exec', message)

# Copyright: (c) OpenSpug Organization. https://github.com/openspug/spug
# Copyright: (c) <spug.dev@gmail.com>
# Released under the MIT License.
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django_redis import get_redis_connection
from .utils import json_response
from apps.account.models import User
import traceback
import time
from spug.settings import REDIS_AUTH_KEY
import logging

logger = logging.getLogger('django.libs.Auth')

class HandleExceptionMiddleware(MiddlewareMixin):
    """
    处理试图函数异常
    """

    def process_exception(self, request, exception):
        traceback.print_exc()
        return json_response(error='Exception: %s' % exception)


class AuthenticationMiddleware(MiddlewareMixin):
    """
    登录验证
    """

    def process_request(self, request):
        rds_cli = get_redis_connection()
        if request.path in settings.AUTHENTICATION_EXCLUDES:
            return None
        if any(x.match(request.path) for x in settings.AUTHENTICATION_EXCLUDES if hasattr(x, 'match')):
            return None
        access_token = request.headers.get('x-token') or request.GET.get('x-token')
        if access_token:
            x_real_ip = request.headers.get('x-real-ip', '')
            username = rds_cli.get(REDIS_AUTH_KEY + access_token)
            username = username.decode() if username else None
            user = User.objects.filter(username=username).first()
            if user and user.is_active:
                request.user = user
                user.token_expired = 8 * 60 * 60
                user.save()
                rds_cli.set(REDIS_AUTH_KEY + access_token, user.username, user.token_expired)
                return None
        response = json_response(error="验证失败，请重新登录")
        response.status_code = 401
        return response

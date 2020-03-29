"""
# Copyright: (c) OpenSpug Organization. https://github.com/openspug/spug
# Copyright: (c) <spug.dev@gmail.com>
# Released under the MIT License.

Django settings for spug project.

Generated by 'django-admin startproject' using Django 2.2.7.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.2/ref/settings/
"""

import os
import re

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'vk0do47)egwzz!uk49%(y3s(fpx4+ha@ugt-hcv&%&d@hwr&p7'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    'channels',
    'apps.account',
    'apps.host',
    'apps.setting',
    'apps.exec',
    'apps.schedule',
    'apps.monitor',
    'apps.alarm',
    'apps.config',
    'apps.app',
    'apps.deploy',
    'apps.notify',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'libs.middleware.AuthenticationMiddleware',
    'libs.middleware.HandleExceptionMiddleware',
]

ROOT_URLCONF = 'spug.urls'

WSGI_APPLICATION = 'spug.wsgi.application'
ASGI_APPLICATION = 'spug.routing.application'

# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ATOMIC_REQUESTS': True,
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': False,
    },
]

SCHEDULE_KEY = 'spug:schedule'
MONITOR_KEY = 'spug:monitor'
REQUEST_KEY = 'spug:request'
REPOS_DIR = os.path.join(BASE_DIR, 'repos')

# 单点登录
REDIS_AUTH_KEY = 'spug:auto:sso:'

# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Shanghai'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# 引擎脚本默认临时存放的地方
# 引擎脚本执行默认存放位置:  基础路径 + 引擎类型 + 当前时间的毫秒数 + 引擎启动脚本
# 例如python3的修改hosts的引擎: /tmp/spug/engine/python3/1584813680149/change_hosts.py
REMOTE_SCRIPT_BASE_DIR = "/tmp/spug"

AUTHENTICATION_EXCLUDES = (
    '/account/login/',
    re.compile('/apis/.*'),
)

SPUG_VERSION = 'v2.2.0'

# override default config
try:
    ENV_VAR = os.environ.get('SPUG_ENV')
    if ENV_VAR is None:
        from spug.overrides import *
    else:
        pass
except ImportError:
    pass

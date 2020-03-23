import os


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MYSQL_DB = os.environ.get('MYSQL_DB')
MYSQL_USER = os.environ.get('MYSQL_USER')
MYSQL_HOST = os.environ.get('MYSQL_HOST')
MYSQL_PORT = os.environ.get('MYSQL_PORT')
MYSQL_PWD = os.environ.get('MYSQL_PWD')

REDIS_HOST = os.environ.get('REDIS_HOST')
REDIS_PORT = os.environ.get('REDIS_PORT')
REDIS_DB = os.environ.get('REDIS_DB')

DATABASES = {
    'default': {
        'ATOMIC_REQUESTS': True,
        'ENGINE': 'django.db.backends.mysql',
        'NAME': MYSQL_DB if MYSQL_DB else 'spug',
        'USER': MYSQL_USER if MYSQL_USER else 'spug',
        'PASSWORD': MYSQL_PWD if MYSQL_PWD else 'spug',
        'HOST': MYSQL_HOST if MYSQL_HOST else '127.0.0.1',
        'PORT': MYSQL_PORT if MYSQL_PORT else '3306',
        'OPTIONS': {
            'charset': 'utf8mb4',
            'sql_mode': 'STRICT_TRANS_TABLES'
        },

    }
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": f'redis://{REDIS_HOST if REDIS_HOST else "127.0.0.1"}'
                    f':{REDIS_PORT if REDIS_PORT else "6379"}/{REDIS_DB if REDIS_DB else "1"}',
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(f'{REDIS_HOST if REDIS_HOST else "127.0.0.1"}', f'{REDIS_DB if REDIS_DB else "1"}')],
        },
    },
}

# 引擎脚本默认临时存放的地方
# 引擎脚本执行默认存放位置:  基础路径 + 引擎类型 + 当前时间的毫秒数 + 引擎启动脚本
# 例如python3的修改hosts的引擎: /tmp/spug/engine/python3/1584813680149/change_hosts.py
REMOTE_SCRIPT_BASE_DIR = "/tmp/spug"

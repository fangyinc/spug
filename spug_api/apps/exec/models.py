# Copyright: (c) OpenSpug Organization. https://github.com/openspug/spug
# Copyright: (c) <spug.dev@gmail.com>
# Released under the MIT License.
from django.db import models
from libs import ModelMixin, human_datetime
from apps.account.models import User
import inspect


class ExecEngine(models.Model, ModelMixin):
    """
    执行引擎
    """
    ENGINE_TYPES = (
        ('1', 'shell'),
        ('2', 'python2'),
        ('3', 'python3')
    )
    # 引擎名字
    name = models.CharField(max_length=50)
    # 引擎类型(shell、python)
    engine_type = models.CharField(max_length=2, choices=ENGINE_TYPES, default=ENGINE_TYPES[0][0])
    # 启动用户
    start_user = models.CharField(max_length=50, null=True)
    # 启动命令
    start_command = models.CharField(max_length=255, null=True)
    # 启动脚本
    start_script = models.TextField(null=True)
    # 引擎描述
    engine_desc = models.CharField(max_length=255, null=True)

    def __repr__(self):
        return '<ExecEngine %r>' % self.name

    class Meta:
        db_table = 'exec_engine'
        ordering = ('-id',)

    @staticmethod
    def get_engine_dict(f):
        return dict((key, value) for key, value in f.__dict__.items()
                    if not callable(value) and not key.startswith('__') and not key.startswith('_'))

    @staticmethod
    def build_engine(type_id):
        if type_id and type_id in dict(ExecEngine.ENGINE_TYPES):
            return {'engine_type': type_id}
        return None


class ExecTemplate(models.Model, ModelMixin):
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    body = models.TextField()
    desc = models.CharField(max_length=255, null=True)
    # 引擎类型
    engine = models.ForeignKey(ExecEngine, models.PROTECT, related_name='+', null=True)

    created_at = models.CharField(max_length=20, default=human_datetime)
    created_by = models.ForeignKey(User, models.PROTECT, related_name='+')
    updated_at = models.CharField(max_length=20, null=True)
    updated_by = models.ForeignKey(User, models.PROTECT, related_name='+', null=True)

    def __repr__(self):
        return '<ExecTemplate %r>' % self.name

    class Meta:
        db_table = 'exec_templates'
        ordering = ('-id',)

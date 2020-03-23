# Copyright: (c) OpenSpug Organization. https://github.com/openspug/spug
# Copyright: (c) <spug.dev@gmail.com>
# Released under the MIT License.
from django.views.generic import View
from libs import json_response, JsonParser, Argument, human_datetime
from libs.channel import Channel
from apps.exec.models import ExecTemplate, ExecEngine
from apps.host.models import Host
import logging

logger = logging.getLogger('django.apps.exec.TemplateView')

class TemplateView(View):
    def get(self, request):
        templates = ExecTemplate.objects.all()
        types = [x['type'] for x in templates.order_by('type').values('type').distinct()]
        template_list = []
        for item in templates:
            x = item.to_dict()
            if item.engine:
                x['engine_name'] = item.engine.name
            else:
                x['engine_name'] = ''
            template_list.append(x)
        return json_response({'types': types, 'templates': template_list})

    def post(self, request):
        form, error = JsonParser(
            Argument('id', type=int, required=False),
            Argument('name', help='请输入模版名称'),
            Argument('type', help='请选择模版类型'),
            Argument('body', help='请输入模版内容'),
            Argument('desc', required=False),
            Argument('engine_id', type=int, required=False)
        ).parse(request.body)
        if error is None:
            if form.id:
                form.updated_at = human_datetime()
                form.updated_by = request.user
                ExecTemplate.objects.filter(pk=form.pop('id')).update(**form)
            else:
                form.created_by = request.user
                ExecTemplate.objects.create(**form)
        return json_response(error=error)

    def delete(self, request):
        form, error = JsonParser(
            Argument('id', type=int, help='请指定操作对象')
        ).parse(request.GET)
        if error is None:
            ExecTemplate.objects.filter(pk=form.id).delete()
        return json_response(error=error)


def do_task(request):
    form, error = JsonParser(
        Argument('host_ids', type=list, filter=lambda x: len(x), help='请选择执行主机'),
        Argument('command', help='请输入执行命令内容'),
        Argument('engine_type', type=int, required=False),
        Argument('engine_id', type=int, required=False)
    ).parse(request.body)
    if error is None:
        token = Channel.get_token()
        engine = None
        if form.engine_id:
            engine_obj = ExecEngine.objects.filter(pk=form.engine_id).first()
            if engine_obj:
                engine = ExecEngine.get_engine_dict(engine_obj)
        else:
            engine = ExecEngine.build_engine(form.engine_type)
        logger.info(f'{engine}')
        for host in Host.objects.filter(id__in=form.host_ids):
            Channel.send_ssh_executor(
                token=token,
                hostname=host.hostname,
                port=host.port,
                username=host.username,
                command=form.command,
                engine=engine
            )
        return json_response(token)
    return json_response(error=error)


class EngineView(View):
    """
    执行引擎
    类型: shell（默认）, python2, python3, java等
    引擎脚本: 脚本的内容
    执行命令时会将引擎脚本传输到目标机器
    例如修改机器hosts的引擎的启动命令
    python3 /opt/spug/install/data/python3/change_hosts.py

    执行该脚本的命令为:
    $ 设置环境变量;执行引擎启动命令 执行脚本内容
    $ export PYTHON_PATH=/usr/local/python3;python3 /opt/spug/install/data/python3/change_hosts.py "脚本内容"
    """

    def get(self, request):
        engines = ExecEngine.objects.all()
        engine_list = []
        for item in engines:
            x = item.to_dict()
            x['engine_type_name'] = dict(ExecEngine.ENGINE_TYPES).get(item.engine_type)
            engine_list.append(x)
        return json_response(engine_list)

    def post(self, request):
        form, error = JsonParser(
            Argument('id', type=int, required=False),
            Argument('name', help='请输入引擎名称'),
            Argument('engine_type', filter=lambda x: x in dict(ExecEngine.ENGINE_TYPES), help='请选择引擎类型'),
            Argument('start_user', help='请输入启动用户', required=False),
            Argument('start_command', help='请输入启动命令', required=False),
            Argument('start_script', help='请输入启动脚本', required=False),
            Argument('engine_desc', required=False)
        ).parse(request.body)
        if error is None:
            if form.id:
                # 更新
                ExecEngine.objects.filter(pk=form.pop('id')).update(**form)
            else:
                ExecEngine.objects.create(**form)
        return json_response(error=error)

    def delete(self, request):
        form, error = JsonParser(
            Argument('id', type=int, help='请指定操作对象')
        ).parse(request.GET)
        if error is None:
            ExecEngine.objects.filter(pk=form.id).delete()
        return json_response(error=error)


def engine_type(request):
    d = ExecEngine.ENGINE_TYPES
    types = [dict({'name': v, 'engine_type': k}) for k, v in d]
    return json_response(types)

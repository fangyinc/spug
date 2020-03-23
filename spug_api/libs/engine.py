from django.conf import settings
import time
import os
import logging

logger = logging.getLogger('django.libs.engine.Engine')


def get_now_time_str():
    """
    返回当前时间的毫秒数
    """
    t = time.time()
    return str(int(round(t * 1000)))


class PathBuild(object):
    def __init__(self, sep='/'):
        self.path = ''
        self.sep = sep

    @staticmethod
    def get_builder():
        return PathBuild()

    def add(self, new_path):
        if new_path is None or new_path == '':
            return self
        if not new_path.startswith(self.sep):
            new_path = self.sep + new_path
        if new_path.endswith(self.sep):
            new_path = new_path.rsplit(self.sep, 1)[0]
        logger.info(f'path: {self.path}, new_path: {new_path}')
        self.path = self.path + new_path
        return self

    def add_blank(self):
        self.path = self.path + ' '
        return self

    def get_path(self):
        return self.path


class EngineHelper(object):

    @staticmethod
    def _build_engine(ssh_cli, engine_type, start_user, start_command, start_script):
        if engine_type is None or str(engine_type) == '':
            type = '1'
            logger.info('引擎类型为空, 使用默认shell引擎')
        else:
            type = str(engine_type)

        if type == '1':
            return ShellEngine(ssh_cli, type, start_user, start_command, start_script)
        elif type == '2':
            return Python2Engine(ssh_cli, type, start_user, start_command, start_script)
        elif type == '3':
            return Python3Engine(ssh_cli, type, start_user, start_command, start_script)
        else:
            raise Exception(f'不支持的引擎类型{type}')

    @staticmethod
    def get_exec_engine(ssh_cli, **kwargs):
        engine_conf = kwargs.get('engine')
        if engine_conf is None:
            logger.info('引擎配置为空, 使用默认shell引擎')
            return EngineHelper._build_shell_engine(ssh_cli)
        engine_type = engine_conf.get('engine_type')
        start_user = engine_conf.get('start_user')
        start_command = engine_conf.get('start_command')
        start_script = engine_conf.get('start_script')
        return EngineHelper._build_engine(ssh_cli, engine_type, start_user, start_command, start_script)

    @staticmethod
    def _build_shell_engine(ssh_cli):
        return ShellEngine(ssh_cli, '1', '', '', '')


class Engine(object):
    """
    执行引擎
    """

    def __init__(self, ssh_cli, engine_type, start_user, start_command, start_script):
        logger.info(f'ssh_cli: {ssh_cli}, engine_type: {engine_type}, '
                    f'start_user: {start_user}, start_command: {start_command}, start_script: {start_script}')
        # ssh客户端
        self.ssh_cli = ssh_cli
        self.engine_base_dir = settings.REMOTE_SCRIPT_BASE_DIR
        self.engine_type = engine_type
        self.start_user = start_user
        self.start_command = start_command
        self.start_script = start_script
        self.time_str = get_now_time_str()

    def exec_script(self, content=None, timeout=1800, environment=None):
        """
        执行命令
        """
        command = self.get_full_command()
        logger.info(f'需要执行的命令为: {command}')

        # 准备执行引擎的数据
        self._prepare_engine_data()
        # 执行执行的脚本的内容的数据
        self._prepare_exec_data(content)
        return self.ssh_cli.exec_command(command)

    def exec_script_with_stream(self, content=None, timeout=1800, environment=None):
        """
        执行命令返回steam
        """
        command = self.get_full_command()
        logger.info(f'需要执行的命令为: {command}')

        # 准备执行引擎的数据
        self._prepare_engine_data()
        # 执行执行的脚本的内容的数据
        self._prepare_exec_data(content)
        return self.ssh_cli.exec_command_with_stream(command)

    def check_exec_env(self):
        """
        执行环境检查
        """

    @property
    def _has_engine_script(self):
        return self.start_script is not None and self.start_script != ''

    def get_full_command(self):
        """
        返回完整的执行命令
        执行命令 + 执行引擎脚本路径 + 执行文件的路径
        如果引擎脚本路径为空, 则说明直接由执行命令执行文件(默认的shell使用这种形式)
        """
        return self._get_start_command() + ' ' + PathBuild.get_builder().add(self.get_engine_path()) \
            .add_blank().add(self.get_exec_script_path()).get_path()

    def get_engine_path(self):
        """
        返回执行引擎启动脚本的路径
        """
        if not self._has_engine_script:
            # 引擎脚本内容为空, 返回空字符
            return ''
        # 引擎脚本执行默认存放位置:  基础路径 + 引擎类型 + 当前时间的毫秒数
        # 例如python3的修改hosts的引擎: /tmp/spug/engine/python3/1584813680149
        return settings.REMOTE_SCRIPT_BASE_DIR + f'/engine/{str(self.engine_type)}/' + \
               self.time_str + '/' + self._get_engine_file_name()

    def get_exec_script_path(self):
        """
        返回执行引擎需要运行的脚本的路径
        """
        return settings.REMOTE_SCRIPT_BASE_DIR + f'/exec/{str(self.engine_type)}/' + \
               self.time_str + '/' + self._get_exec_script_name()

    def _get_start_command(self):
        """
        返回启动命令: 如果start_command不为空的话以传入的start_command为主
        """
        if self.start_command is not None and self.start_command != '':
            return self.start_command
        return ''

    def _get_engine_file_name(self):
        """
        返回执行引擎的脚本名
        """
        raise NotImplemented

    def _get_exec_script_name(self):
        """
        返回执行脚本的名字
        """
        raise NotImplemented

    def _prepare_engine_data(self):
        """
        准备执行引擎的脚本数据
        """
        if not self._has_engine_script:
            # 没有引擎脚本, 直接返回
            logger.warning(f'引擎类型[{self.engine_type}]的引擎脚本为空, 不用准备引擎数据')
            return
        logger.info(f'开始准备引擎数据, 引擎数据路径为: {self.get_engine_path()}')
        self.ssh_cli.put_content_to_remote(self.get_engine_path(), self.start_script, True)

    def _prepare_exec_data(self, content):
        """
        准备执行的数据
        """
        if content is None or content == '':
            raise Exception('缺少执行内容')
        self.ssh_cli.put_content_to_remote(self.get_exec_script_path(), content, True)


class ShellEngine(Engine):
    """
    shell 执行引擎
    """

    def _get_start_command(self):
        if super()._get_start_command() == '':
            return '/bin/sh'
        return super()._get_start_command()

    def _get_engine_file_name(self):
        return f'shell-engine-{self.time_str}.sh'

    def _get_exec_script_name(self):
        return f'shell-script-{self.time_str}.sh'


class Python2Engine(Engine):
    """
    python2 执行引擎
    """

    def _get_start_command(self):
        if super()._get_start_command() == '':
            return 'python2'
        return super()._get_start_command()

    def _get_engine_file_name(self):
        return f'python2-engine-{self.time_str}.py'

    def _get_exec_script_name(self):
        return f'python2-script-{self.time_str}.py'


class Python3Engine(Engine):
    """
    python3执行引擎
    """

    def _get_start_command(self):
        if super()._get_start_command() == '':
            return 'python3'
        return super()._get_start_command()

    def _get_engine_file_name(self):
        return f'python3-engine-{self.time_str}.py'

    def _get_exec_script_name(self):
        return f'python3-script-{self.time_str}.py'

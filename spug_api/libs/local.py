# -*- coding: utf-8 -*-

import subprocess
import os
import logging

logger = logging.getLogger('django.spug.libs.loal.Local')


class Local(object):
    """
    本地工具类
    暂时不支持windows系统
    """

    @staticmethod
    def put_content_to_local(local_path, content, mkdir=False):
        """
        写入文件内容到本地
        """
        dir_name, file_name = os.path.split(local_path)
        if dir_name != '' and not os.path.exists(dir_name) and mkdir:
            os.makedirs(dir_name)
        with open(local_path, 'w') as f:
            f.write(content)

    @staticmethod
    def exec_command(self, content=None, timeout=1800, environment=None):
        """
        执行本地命令, 直接返回执行结果
        """
        pass

    @staticmethod
    def exec_command_with_stream(content=None, timeout=1800, environment=None):
        """
        执行本地命令, 将输出封装为stream返回
        :return code, message  如果code不为0, 说明执行没有成功
        """
        command = 'set -e\n' + content
        task = subprocess.Popen(command, env=environment, shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

        message = task.stdout.readline()
        while message:
            yield task.wait(), message.decode()
            message = task.stdout.readline()
        yield task.wait(), task.returncode

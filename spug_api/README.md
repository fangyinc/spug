# 快速开始
配置文件主要spug/settings.py中, 默认使用本地的redis和sqllite


# 生产环境搭建
mysql 需要安装：
pip3 install  mysqlclient


# Docker镜像构建的问题:
pip安装会出现mysqlclient可能存在如下问题:
```
pip install mysql-python fails with EnvironmentError: mysql_config not found
```
需要安装mysql开发包
apline: mariadb-dev
debian/ubuntu: default-libmysqlclient-dev
centos: mysql-devel

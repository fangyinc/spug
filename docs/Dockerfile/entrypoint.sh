#!/bin/sh
# Copyright: (c) OpenSpug Organization. https://github.com/openspug/spug
# Copyright: (c) <spug.dev@gmail.com>
# Released under the MIT License.

set -e

# init nginx
if [ ! -d /run/nginx ]; then
    mkdir -p /run/nginx
    chown -R nginx.nginx /run/nginx
fi


cd /spug/spug_api
python manage.py initdb
python manage.py useradd -u admin -p spug.dev -s -n 管理员

nginx
supervisord -c /etc/supervisord.conf
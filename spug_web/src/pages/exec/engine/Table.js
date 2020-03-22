/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the MIT License.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { Table, Divider, Modal, message } from 'antd';
import ComForm from './Form';
import http from 'libs/http';
import store from './store';
import { LinkButton } from "components";

@observer
class ComTable extends React.Component {
  componentDidMount() {
    store.fetchRecords()
  }

  columns = [{
    title: '引擎名称',
    dataIndex: 'name',
  }, {
    title: '引擎类型',
    dataIndex: 'engine_type',
  }, {
    title: '启动命令',
    dataIndex: 'start_command',
  }, {
    title: '启动用户',
    dataIndex: 'start_user',
  }, {
    title: '启动脚本',
    render: text => text.start_script,
    ellipsis: true
  }, {
    title: '描述信息',
    dataIndex: 'engine_desc',
    ellipsis: true
  }, {
    title: '操作',
    render: info => (
      <span>
        <LinkButton auth="exec.template.edit" onClick={() => store.showForm(info)}>编辑</LinkButton>
        <Divider type="vertical" />
        <LinkButton auth="exec.template.del" onClick={() => this.handleDelete(info)}>删除</LinkButton>
      </span>
    )
  }];

  handleDelete = (text) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除【${text['name']}】?`,
      onOk: () => {
        var id = JSON.parse(JSON.stringify(text)).id
        return http.delete(`/api/exec/engine/?id=${id}`)
          .then(() => {
            message.success('删除成功');
            store.fetchRecords()
          })
      }
    })
  };

  render() {
    let data = store.records;
    console.log('store.records', store.records)
    if (store.f_name) {
      data = data.filter(item => item['name'].toLowerCase().includes(store.f_name.toLowerCase()))
    }
    if (store.f_type) {
      data = data.filter(item => item['engine_type'].toLowerCase().includes(store.f_type.toLowerCase()))
    }
    return (
      <React.Fragment>
        <Table rowKey="id" loading={store.isFetching} dataSource={data} columns={this.columns} />
        {store.formVisible && <ComForm />}
      </React.Fragment>
    )
  }
}

export default ComTable

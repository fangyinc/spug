/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the MIT License.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { Modal, Form, Input, Select, Col, Button, message } from 'antd';
import http from 'libs/http';
import AuthModal from './AuthModal';
import store from './store';

@observer
class ComForms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      password: null,
      zone: null,
      showAuthModal: false,
      host_list: []
    }
  }


  trimStr = (str) => { return str.replace(/(^\s*)|(\s*$)/g, ""); }

  handleSubmit = () => {
    this.setState({ loading: true });
    const formData = this.props.form.getFieldsValue();
    var host_list = formData.host_list.trim().split('\n')
    var hosts = []
    var host = {}
    host_list.forEach((item, index) => {
      item = this.trimStr(item).split(' ')
      host.zone = formData.zone || '-'
      host.username = item[0] || '-'
      host.hostname = item[1] || '-'
      host.port = item[2] || '-'
      host.name = item[3] || '-'
      host.desc = item[4] || '-'
      hosts.push(host)
      host = {}
    })
    console.log('hosts', hosts)
    http.post('/api/host/batch', JSON.stringify({ host_list: hosts })).then(res => {
      console.log('res', res)
      message.success("操作完成")
      if (res.length > 0) {
        this.setState({ showAuthModal: true, loading: false, host_list: res });
      }
    }, () => this.setState({ loading: false }))
  };


  handleConfirm = (formData) => {
    if (this.state.password) {
      formData['password'] = this.state.password;
      console.log('formData', formData)
      return http.post('/api/host/', formData).then(res => {
        message.success('验证成功');
        store.formVisible = false;
        store.fetchRecords()
      })
    }
    message.error('请输入授权密码')
  };

  confirmForm = (username) => {
    return (
      <Form>
        <Form.Item required label="授权密码" help={`用户 ${username} 的密码， 该密码仅做首次验证使用，不会存储该密码。`}>
          <Input.Password onChange={val => this.setState({ password: val.target.value })} />
        </Form.Item>
      </Form>
    )
  };

  handleAddZone = () => {
    Modal.confirm({
      icon: 'exclamation-circle',
      title: '添加主机类别',
      content: this.addZoneForm,
      onOk: () => {
        if (this.state.zone) {
          store.zones.push(this.state.zone);
          this.props.form.setFieldsValue({ 'zone': this.state.zone })
        }
      },
    })
  };

  addZoneForm = (
    <Form>
      <Form.Item required label="主机类别">
        <Input onChange={val => this.setState({ zone: val.target.value })} />
      </Form.Item>
    </Form>
  );

  render() {
    const info = store.record;
    const { getFieldDecorator } = this.props.form;
    const AuthModalProps = {
      onCancel: () => this.setState({ showAuthModal: false }),
      onOk: () => { },
      host_list: this.state.host_list
    }
    return (
      <Modal
        visible
        width={1200}
        maskClosable={false}
        title={'批量添加'}
        okText="验证"
        onCancel={() => {store.formsVisible = false; store.fetchRecords()}}
        confirmLoading={this.state.loading}
        onOk={this.handleSubmit}>
        <Form labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
          <Form.Item required label="主机类别">
            <Col span={16}>
              {getFieldDecorator('zone', { initialValue: info['zone'] })(
                <Select placeholder="请选择主机类别/区域/分组">
                  {store.zones.map(item => (
                    <Select.Option value={item} key={item}>{item}</Select.Option>
                  ))}
                </Select>
              )}
            </Col>
            <Col span={6} offset={2}>
              <Button type="link" onClick={this.handleAddZone}>添加类别</Button>
            </Col>
          </Form.Item>
          <Form.Item required label="主机及其认证方式">
            {getFieldDecorator('host_list', { initialValue: info['host_list'] })(
              <Input.TextArea style={{ minHeight: "300px" }} placeholder="请输入主机认证信息，每行一个主机，格式：主机名 主机地址 端口 主机名称 备注" />
            )}
          </Form.Item>
          <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
            <span role="img" aria-label="notice">⚠️ 首次验证时需要输入登录用户名对应的密码，但不会存储该密码。</span>
          </Form.Item>
          {/* <AuthDiv style={{ display: "flex", justifyContent: 'center' }}>
            <AuthDiv style={{ display: "flex", justifyContent: 'space-around', width: "30%" }}>
              <Button type="primary" icon="sync" onClick={store.clearRecords}>清空</Button>
              <Button type="primary" icon="sync" onClick={this.handleSubmit}>验证</Button>
            </AuthDiv>
          </AuthDiv> */}
          {
            this.state.showAuthModal && <AuthModal {...AuthModalProps}></AuthModal>
          }
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(ComForms)

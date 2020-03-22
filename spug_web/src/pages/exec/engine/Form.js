/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the MIT License.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { Modal, Form, Input, Select, Col, Button, message } from 'antd';
import { ACEditor } from 'components';
import { http, cleanCommand } from 'libs';
import store from './store';

@observer
class ComForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      engine_type: null,
      start_script: store.record['start_script'],
    }
  }

  handleSubmit = () => {
    this.setState({ loading: true });
    const formData = this.props.form.getFieldsValue();
    formData['start_script'] = cleanCommand(this.state.start_script);
    console.log('formData', formData, store.record.id)
    if (store.record.id) {
      formData['id'] = store.record.id;
      http.post('/api/exec/engine/', formData)
        .then(res => {
          message.success('更新成功');
          store.formVisible = false;
          store.fetchRecords()
        }, () => this.setState({ loading: false }))
    }else{
      http.post('/api/exec/engine/', formData)
        .then(res => {
          message.success('创建成功');
          store.formVisible = false;
          store.fetchRecords()
        }, () => this.setState({ loading: false }))
    }
  };

  handleAddZone = () => {
    Modal.confirm({
      icon: 'exclamation-circle',
      title: '添加模板类型',
      content: this.addZoneForm,
      onOk: () => {
        if (this.state.engine_type) {
          store.engine_types.push(this.state.engine_type);
          this.props.form.setFieldsValue({ 'engine_type': this.state.engine_type })
        }
      },
    })
  };

  addZoneForm = (
    <Form>
      <Form.Item required label="引擎类型">
        <Input onChange={val => this.setState({ type: val.target.value })} />
      </Form.Item>
    </Form>
  );

  render() {
    const info = store.record;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        visible
        width={800}
        maskClosable={false}
        title={store.record.id ? '编辑引擎' : '新建引擎'}
        onCancel={() => store.formVisible = false}
        confirmLoading={this.state.loading}
        onOk={this.handleSubmit}>
        <Form labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
          <Form.Item required label="引擎类型">
            <Col span={16}>
              {getFieldDecorator('engine_type', { initialValue: info['engine_type'] })(
                <Select placeholder="请选择引擎类型">
                  {store.engine_types.map(item => (
                    <Select.Option value={item} key={item}>{item}</Select.Option>
                  ))}
                </Select>
              )}
            </Col>
          </Form.Item>
          <Form.Item required label="引擎名称">
            {getFieldDecorator('name', { initialValue: info['name'] })(
              <Input placeholder="请输入引擎名称" />
            )}
          </Form.Item>
          <Form.Item label="启动用户">
            {getFieldDecorator('start_user', { initialValue: info['start_user'] })(
              <Input placeholder="请输入启动用户" />
            )}
          </Form.Item>
          <Form.Item label="启动命令">
            {getFieldDecorator('start_command', { initialValue: info['start_command'] })(
              <Input placeholder="请输入启动命令" />
            )}
          </Form.Item>
          <Form.Item label="启动脚本">
            <ACEditor
              mode="sh"
              value={this.state.start_script}
              onChange={val => this.setState({ start_script: val })}
              height="300px" />
          </Form.Item>
          <Form.Item label="备注信息">
            {getFieldDecorator('engine_desc', { initialValue: info['engine_desc'] })(
              <Input.TextArea placeholder="请输入备注信息" />
            )}
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(ComForm)

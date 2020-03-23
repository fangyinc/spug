/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the MIT License.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { Form, Button, Tag, Col, Select } from 'antd';
import { ACEditor, AuthCard } from 'components';
import HostSelector from './HostSelector';
import EngineSelector from './EngineSelector';
import TemplateSelector from './TemplateSelector';
import ExecConsole from './ExecConsole';
import { http, cleanCommand } from 'libs';
import store from './store';
import engineStore from '../engine/store';

@observer
class TaskIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      body: '',
      engine: {
        name: '请选择引擎类型',
        engine_type: '',
        engine_id: ''
      }
    }
  }
  componentDidMount() {
    engineStore.fetchRecords()
  }
  handleSubmit = () => {
    this.setState({ loading: true });
    const host_ids = store.hosts.map(item => item.id);
    http.post('/api/exec/do/', { host_ids, command: cleanCommand(this.state.body),
      engine_type: this.state.engine.engine_type, engine_id: this.state.engine.engine_id })
      .then(store.switchConsole)
      .finally(() => this.setState({ loading: false }))
  };

  render() {
    const { body, token } = this.state;
    console.log('body', body)
    return (
      <AuthCard auth="exec.task.do">
        <Form>
          <Form.Item label="执行主机">
            {store.hosts.map(item => (
              <Tag color="#108ee9" key={item.id}>{item.name}({item.hostname}:{item.port})</Tag>
            ))}
          </Form.Item>
          <Button icon="plus" onClick={store.switchHost}>从主机列表中选择</Button>
          <Form.Item label="引擎类型">
            <Col span={6}>
              <Select placeholder="请选择引擎类型" onChange={(e) => { this.setState({
                engine: {engine_type: engineStore.engines[e].engine_type, name:engineStore.engines[e].name  }}) }} value={this.state.engine && this.state.engine.name}>
                {engineStore.engines.map((item, index) => (
                  <Select.Option key={index}>{item.name}</Select.Option>
                ))}
              </Select>
            </Col>
          </Form.Item>
          <Form.Item label="执行命令">
            <ACEditor mode="sh" value={body} height="300px" onChange={body => this.setState({ body })} />
          </Form.Item>
          <Form.Item>
            <Button icon="plus" onClick={store.switchTemplate}>从执行模版中选择</Button>
          </Form.Item>
          <Button icon="thunderbolt" type="primary" onClick={this.handleSubmit}>开始执行</Button>
        </Form>
        {store.showHost && <HostSelector onCancel={store.switchHost} onOk={hosts => store.hosts = hosts} />}
        {store.showTemplate && <TemplateSelector onCancel={store.switchTemplate} onOk={(body, engine) => { this.setState({ body, engine })}} />}
        {store.showConsole && <ExecConsole token={token} onCancel={store.switchConsole} />}
      </AuthCard >
    )
  }
}

export default TaskIndex
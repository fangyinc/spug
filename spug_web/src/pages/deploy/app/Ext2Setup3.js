/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the MIT License.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { Form, Input, Button, message, Divider, Alert, Icon, Col, Select } from 'antd';
import Editor from 'react-ace';
import 'ace-builds/src-noconflict/mode-sh';
import 'ace-builds/src-noconflict/theme-tomorrow';
import { SearchForm} from 'components';
import TemplateSelector from './TemplateSelector';
import styles from './index.module.css';
import { http, cleanCommand } from 'libs';
import engineStore from '../../exec/engine/store';
import templateStore from '../../exec/template/store';
import store from './store';

@observer
class Ext2Setup3 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    }
  }

  componentDidMount() {
    if (engineStore.records.length === 0) {
      engineStore.fetchRecords()
    }
    if (templateStore.records.length === 0) {
      templateStore.fetchRecords()
    }
  }

  handleSubmit = () => {
    this.setState({ loading: true });
    const info = store.deploy;
    info['app_id'] = store.app_id;
    info['extend'] = '2';
    info['host_actions'] = info['host_actions'].filter(x => x.title && x.data);
    info['server_actions'] = info['server_actions'].filter(x => x.title && x.data);
    console.log('info', info)
    http.post('/api/app/deploy/', info)
      .then(res => {
        message.success('保存成功');
        store.ext2Visible = false;
        store.loadDeploys(store.app_id)
      }, () => this.setState({ loading: false }))
  };

  render() {
    const server_actions = store.deploy['server_actions'];
    const host_actions = store.deploy['host_actions'];
    return (
      <Form labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} className={styles.ext2Form}>
        {store.deploy.id === undefined && (
          <Alert
            closable
            showIcon
            type="info"
            message="小提示"
            style={{ margin: '0 80px 20px' }}
            description={[
              <p key={1}>Spug 将遵循先本地后目标主机的原则，按照顺序依次执行添加的动作，例如：本地动作1 -> 本地动作2 -> 目标主机动作1 -> 目标主机动作2 ...</p>,
              <p key={2}>执行的命令内可以使用发布申请中设置的环境变量 SPUG_RELEASE，一般可用于标记一次发布的版本号或提交ID等，在执行的脚本内通过使用 $SPUG_RELEASE
                获取其值来执行相应操作。</p>
            ]} />
        )}
        {server_actions.map((item, index) => (
          <div key={index} style={{ marginBottom: 30, position: 'relative' }}>
            <Form.Item required label={`本地动作${index + 1}`}>
              <Input value={item['title']} onChange={e => item['title'] = e.target.value} placeholder="请输入" />
            </Form.Item>

            <Form.Item required label="执行内容">
              <Editor
                mode="sh"
                theme="tomorrow"
                width="100%"
                height="100px"
                value={item['data']}
                onChange={v => item['data'] = cleanCommand(v)}
                placeholder="请输入要执行的动作" />
            </Form.Item>

            <Form.Item label="引擎类型">
              <SearchForm>
                <SearchForm.Item >
                  <Select allowClear value={item['engine_type_id']} onChange={v => item['engine_type_id'] = v} placeholder="请选择">
                    {engineStore.engines.map(engine => (
                      <Select.Option value={engine.engine_type} key={engine.engine_type}>{engine.name}</Select.Option>
                    ))}
                  </Select>
                </SearchForm.Item>
              </SearchForm>
            </Form.Item>

            <Form.Item label="选择模板">
              <Button icon="plus" onClick={() => { item['showTemplate'] = true }}>从执行模版中直接选择</Button>
            </Form.Item>

            {item['showTemplate'] && <TemplateSelector onCancel={() => { item['showTemplate'] = !item['showTemplate'] }} onOk={(body, engine_id) => { item['engine_type_id'] = null; item['data'] = body; item['engine_id'] = engine_id }} />}

            <div className={styles.delAction} onClick={() => server_actions.splice(index, 1)}>
              <Icon type="minus-circle" />移除
            </div>
          </div>
        ))}
        <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
          <Button type="dashed" block onClick={() => server_actions.push({})}>
            <Icon type="plus" />添加本地执行动作（在服务端本地执行）
          </Button>
        </Form.Item>
        <Divider />
        {host_actions.map((item, index) => (
          <div key={index} style={{ marginBottom: 30, position: 'relative' }}>
            <Form.Item required label={`目标主机动作${index + 1}`}>
              <Input value={item['title']} onChange={e => item['title'] = e.target.value} placeholder="请输入" />
            </Form.Item>

            <Form.Item required label="执行内容">
              <Editor
                mode="sh"
                theme="tomorrow"
                width="100%"
                height="100px"
                value={item['data']}
                onChange={v => item['data'] = cleanCommand(v)}
                placeholder="请输入要执行的动作" />
            </Form.Item>

            <Form.Item label="引擎类型">
              <SearchForm>
                <SearchForm.Item >
                  <Select allowClear value={item['engine_type_id']} onChange={v => item['engine_type_id'] = v} placeholder="请选择">
                    {engineStore.engines.map(engine => (
                      <Select.Option value={engine.engine_type} key={engine.engine_type}>{engine.name}</Select.Option>
                    ))}
                  </Select>
                </SearchForm.Item>
              </SearchForm>
            </Form.Item>

            <Form.Item label="选择模板">
              <Button icon="plus" onClick={() => { item['showTemplate'] = true }}>从执行模版中直接选择</Button>
            </Form.Item>

            {item['showTemplate'] && <TemplateSelector onCancel={() => { item['showTemplate'] = !item['showTemplate'] }} onOk={(body, engine_id) => { item['engine_type_id'] = null; item['data'] = body; item['engine_id'] = engine_id }} />}

            <div className={styles.delAction} onClick={() => host_actions.splice(index, 1)}>
              <Icon type="minus-circle" />移除
            </div>
          </div>
        ))}
        <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
          <Button type="dashed" block onClick={() => host_actions.push({})}>
            <Icon type="plus" />添加目标主机执行动作（在部署目标主机执行）
          </Button>
        </Form.Item>
        <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
          <Button
            type="primary"
            disabled={[...host_actions, ...server_actions].filter(x => x.title && x.data).length === 0}
            loading={this.state.loading}
            onClick={this.handleSubmit}>提交</Button>
          <Button style={{ marginLeft: 20 }} onClick={() => store.page -= 1}>上一步</Button>
        </Form.Item>
      </Form>
    )
  }
}

export default Ext2Setup3

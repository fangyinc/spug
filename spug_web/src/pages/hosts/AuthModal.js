/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the MIT License.
 */
import React from 'react';
import { Modal, Form, Input, message, Button, Checkbox, Row, Col } from 'antd';
import http from 'libs/http';


class AuthModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      host_list: [],
      selectHost: [],
      selectHostCheck: [],
      selectPassword: null,
      checkAll: false,
    }
  }

  componentDidMount() {
    var selectHostCheck = []
    this.props.host_list.forEach((item) => {
      selectHostCheck.push(false)
    })
    this.setState({
      host_list: this.props.host_list,
      selectHostCheck
    })
  }

  onCheckAllChange = () => {
    const { selectHostCheck, checkAll } = this.state
    var selectHostCheckNew = []
    selectHostCheck.forEach((item) => {
      selectHostCheckNew.push(!checkAll)
    })
    console.log('111', !checkAll, selectHostCheckNew)
    this.setState({
      selectHostCheck: selectHostCheckNew,
      checkAll: !checkAll,
    });
  };
  handleSubmit = async () => {
    const { host_list, selectHostCheck, selectPassword } = this.state
    var selectHost = host_list.filter((item, index) => {
      return selectHostCheck[index]
    })
    if (selectHost.length == 0) {
      message.warning('至少选中一个主机')
      return
    }
    if (selectPassword) {
      selectHost.forEach((item) => {
        item.passsword = selectPassword
      })
      console.log('selectHost', selectHost)
      // await http.post('/api/host/batch', JSON.stringify({ host_list: selectHost })).then(res => {
      //   message.success('验证成功');
      //   console.log('res', res)
      //   // this.setState({
      //   //   host_list: 
      //   // })
      // })
    } else {
      message.warning('请输入授权密码')
    }
  }

  handleConfirm = (index) => {
    const { host_list } = this.state
    if (host_list[index].passsword) {
      return http.post('/api/host/', host_list[index]).then(res => {
        message.success('验证成功');
        host_list.splice(index, 1)
        this.setState({
          host_list
        })
      })
    }else{
      message.warning('请输入授权密码')
    }
  };

  handleSelect = (e, index) => {
    const { selectHostCheck } = this.state
    selectHostCheck[index] = !selectHostCheck[index]
    console.log('checked = ', e.target.checked, selectHostCheck[index], index);
    this.setState({ selectHostCheck })
  }

  render() {
    const { host_list } = this.props
    const { selectHostCheck } = this.state
    console.log('props', this.state.host_list, selectHostCheck)
    return (
      <Modal
        visible
        width={1200}
        maskClosable={false}
        title={'验证主机'}
        okText="完成"
        onCancel={this.props.onCancel}
        onOk={this.props.onOk}>
        {
          host_list && host_list.map((item, index) => {
            return (
              <Row key={item.id}>
                <Col span={22}>
                  <Form span={20} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                    <Form.Item label={`${item.name}`} style={{ marginBottom: 0 }}>
                      <Form.Item style={{ display: 'inline-block', width: 'calc(15%)' }}>
                        <Input addonBefore="ssh" placeholder="用户名" value={item.username} />
                      </Form.Item>
                      <Form.Item style={{ display: 'inline-block', width: 'calc(20%)' }}>
                        <Input addonBefore="@" placeholder="主机名/IP" value={item.hostname} />
                      </Form.Item>
                      <Form.Item style={{ display: 'inline-block', width: 'calc(12%)' }}>
                        <Input addonBefore="-p" placeholder="端口" value={item.port} />
                      </Form.Item>
                      <Form.Item style={{ display: 'inline-block', width: 'calc(20%)' }}>
                        <Input placeholder="主机备注信息" value={item.desc} />
                      </Form.Item>
                      <Form.Item style={{ display: 'inline-block', width: 'calc(20%)' }}>
                        <Input type="password" addonBefore="*" placeholder="授权密码" value={item.passsword} onChange={(e) => { host_list[index].passsword = e.target.value; this.setState({ host_list }) }} />
                      </Form.Item>
                      <Form.Item style={{ display: 'inline-block', marginLeft: '10px', width: 'calc(10%)' }}>
                        <Button type="primary" icon="sync" onClick={() => this.handleConfirm(index)} >验证</Button>
                      </Form.Item>
                    </Form.Item>
                  </Form>
                </Col>
                <Col span={2}>
                  <Checkbox checked={selectHostCheck[index]} style={{ display: 'inline-block', lineHeight: '40px' }} onChange={(e) => { this.handleSelect(e, index) }} value={index}>{index}</Checkbox>
                </Col>
              </Row>)
          })
        }
        <Form>
          <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
            <span role="img" aria-label="notice">⚠️ 首次验证时需要输入登录用户名对应的密码，但不会存储该密码。</span>
          </Form.Item>
          <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
            <Form.Item style={{ display: 'inline-block', marginRight: '20px', width: 'calc(30%)' }}>
              <Input type="password" placeholder="授权密码" value={this.state.selectPassword} onChange={(e) => { this.setState({ selectPassword: e.target.value }) }} />
            </Form.Item>
            <Form.Item style={{ display: 'inline-block', width: 'calc(25%)' }}>
              <Button type="primary" icon="sync" onClick={() => this.handleSubmit()} >验证所有选中</Button>
            </Form.Item>
            <Form.Item style={{ display: 'inline-block', width: 'calc(25%)' }}>
              <Button type="primary" onClick={() => this.onCheckAllChange()} >{!this.state.checkAll ? '选中全部' : '取消全部'}</Button>
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal >
    )
  }
}

export default Form.create()(AuthModal)

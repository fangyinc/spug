/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the MIT License.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { Modal, Table, Input, Button, Select } from 'antd';
import { SearchForm } from 'components';
import ComForm from '../engine/Form';
import store from '../engine/store';

@observer
class EngineSelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedRows: []
    }
  }

  componentDidMount() {
    if (store.records.length === 0) {
      store.fetchRecords()
    }
  }

  handleClick = (record) => {
    const { selectedRows } = this.state;
    const index = selectedRows.indexOf(record);
    if (index > -1) {
      selectedRows.splice(index, 1)
    } else {
      selectedRows.push(record)
    }
    this.setState({ selectedRows });
  };

  handleSubmit = () => {
    this.props.onOk(this.state.selectedRows);
    this.props.onCancel()
  };

  columns = [{
    title: '类别',
    dataIndex: 'zone',
  }, {
    title: '名称',
    dataIndex: 'name',
  }, {
    title: '主机',
    dataIndex: 'hostname',
  }, {
    title: '端口',
    dataIndex: 'port'
  }, {
    title: '备注',
    dataIndex: 'desc',
    ellipsis: true
  }];

  render() {
    const { selectedRows } = this.state;
    let data = store.records;
    console.log('data1', JSON.parse(JSON.stringify(data)))
    // if (store.name) {
    //   data = data.filter(item => item['name'].includes(store.f_name))
    // }
    // if (store.f_type) {
    //   data = data.filter(item => item['type'].includes(store.f_type))
    // }
    return (
      <Modal
        visible
        width={800}
        title="选择执行引擎"
        onCancel={this.props.onCancel}
        onOk={this.handleSubmit}
        maskClosable={false}>
        <SearchForm>
          <SearchForm.Item span={8} title="引擎类型">
            <Select allowClear onChange={v => store.f_type = v} placeholder="请选择">
              {store.engines.map(item => (
                <Select.Option value={item.engine_type} key={item.engine_type}>{item.name}</Select.Option>
              ))}
            </Select>
          </SearchForm.Item>
          <SearchForm.Item span={8} title="引擎名称">
            <Input allowClear onChange={e => store.f_name = e.target.value} placeholder="请输入" />
          </SearchForm.Item>
          <SearchForm.Item span={8}>
            <Button type="primary" icon="sync" onClick={store.fetchRecords}>刷新</Button>
          </SearchForm.Item>
        </SearchForm>
        <Table
          rowKey="id"
          loading={store.isFetching}
          dataSource={data}
          columns={this.columns} />
        {store.formVisible && <ComForm />}
      </Modal>
    )
  }
}

export default EngineSelector 

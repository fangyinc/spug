/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the MIT License.
 */
import { observable } from "mobx";
import http from 'libs/http';

class Store {
  @observable records = [];
  @observable engine_types = [];
  @observable record = {};
  @observable isFetching = false;
  @observable formVisible = false;

  @observable f_name;
  @observable f_type;

  fetchRecords = () => {
    this.isFetching = true;
    http.get('/api/exec/engine/types')
      .then((res) => {
        console.log('res', res)
        var types = []
        res.forEach(item => {
          types.push(item.engine_type)
        });
        this.engine_types = types
      })
      .finally(() => this.isFetching = false)
    http.get('/api/exec/engine/')
      .then((res) => {
        console.log('engine', res)
        this.records = res
      })
      .finally(() => this.isFetching = false)
  };

  showForm = (info = {}) => {
    this.formVisible = true;
    this.record = info
  }
}

export default new Store()

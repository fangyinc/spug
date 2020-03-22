/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the MIT License.
 */
import { observable } from "mobx";
import http from 'libs/http';

class Store {
  @observable records = [];
  @observable types = [];
  @observable engines = [];
  @observable record = {};
  @observable isFetching = false;
  @observable formVisible = false;

  @observable f_name;
  @observable f_type;

  fetchRecords = async () => {
    this.isFetching = true;
    await http.get('/api/exec/engine/')
      .then((res) => {
        console.log('engine', res)
        this.engines = res
      })
      .finally(() => this.isFetching = false)
      await http.get('/api/exec/template/')
      .then(({ types, templates }) => {
        console.log('templates', templates)
        this.records = templates;
        this.types = types
      })
      .finally(() => this.isFetching = false)
      
  };

  showForm = (info = {}) => {
    this.formVisible = true;
    this.record = info
  }
}

export default new Store()

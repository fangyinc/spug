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
  @observable engine_names = [];
  @observable engine_ids = [];
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
        var engine_names = []
        var engine_ids = []
        res.forEach(item => {
          engine_names.push(item.name)
          engine_ids.push(item.id)
        });
        this.engine_names = engine_names
        this.engine_ids = engine_ids
      })
      .finally(() => this.isFetching = false)
      await http.get('/api/exec/template/')
      .then(({ types, templates }) => {
        console.log('this.engine_ids',  JSON.parse(JSON.stringify(this.engine_ids)))
        templates.forEach((item)=>{
          JSON.parse(JSON.stringify(this.engine_ids)).forEach((ele, index)=>{
            if(item.engine_id == ele){
              item.engine_name = this.engine_names[index]
            }
          })
        })
        // JSON.parse(JSON.stringify(this.engine_ids)).forEach((item, index)=>{
        //   if(item == templates.engine_id){
        //     console.log('11')
        //     templates.engine_name =  this.engine_names[index]
        //   }
        // })
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

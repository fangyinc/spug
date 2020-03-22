/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the MIT License.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { AuthDiv, AuthCard } from 'components';
import ComForm from './Form';

export default observer(function () {
  return (
    <AuthCard auth="hosts.hosts.view">
      <AuthDiv>
        批量添加主机:
      </AuthDiv>
      <ComForm></ComForm>
    </AuthCard>
  )
})

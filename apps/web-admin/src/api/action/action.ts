import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace ActionActionApi {
  export interface ActionAction {
    [key: string]: any;
    id: string;
    name: string;
    created_at: string;
    is_prem: number;
    sort: number;
    updated_at: string;
  }
}

/**
 * 获取动作动作列表数据
 */
async function getActionList(params: Recordable<any>) {
  return requestClient.get<Array<ActionActionApi.ActionAction>>(
    '/admin/actions',
    {
      params,
    },
  );
}

/**
 * 创建动作
 * @param data 动作数据
 */
async function createAction(data: Omit<ActionActionApi.ActionAction, 'id'>) {
  return requestClient.post('/admin/actions', data);
}

/**
 * 更新动作
 *
 * @param id 动作 ID
 * @param data 动作数据
 */
async function updateAction(id: number | string, data: any) {
  return requestClient.put(`/admin/actions/${id}`, data);
}

/**
 * 删除动作
 * @param id 动作 ID
 */
async function deleteAction(id: string) {
  return requestClient.delete(`/admin/actions/${id}`);
}

export { createAction, deleteAction, getActionList, updateAction };

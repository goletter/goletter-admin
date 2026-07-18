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
 * 获取动作分类列表数据
 */
async function getClassList(params: Recordable<any>) {
  return requestClient.get<any>('/admin/action_categories', {
    params,
  });
}

/**
 * 获取动作类型列表数据
 */
async function getTypeList(params: Recordable<any>) {
  return requestClient.get<any>('/admin/action_types', {
    params,
  });
}
/**
 * 获取动作属性列表数据
 */
async function getAttributeList(params: Recordable<any>) {
  return requestClient.get<any>('/admin/action_attributes/tree', {
    params,
  });
}
/**
 * 获取动作详情
 *
 * @param id 动作 ID
 */
async function getDetails(id: any) {
  return requestClient.get(`/admin/actions/${id}`);
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
async function updateAction(
  id: number | string,
  data: { action_action_tags: any; name: string; rule: number },
) {
  return requestClient.put(`/admin/actions/${id}`, data);
}

/**
 * 删除动作
 * @param id 动作 ID
 */
async function deleteAction(id: string) {
  return requestClient.delete(`/admin/actions/${id}`);
}

export {
  createAction,
  deleteAction,
  getAttributeList,
  getClassList,
  getDetails,
  getTypeList,
  updateAction,
};

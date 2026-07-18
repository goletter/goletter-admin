import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace ActionClassApi {
  export interface ActionClass {
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
 * 创建分类
 * @param data 分类数据
 */
async function createClass(data: Omit<ActionClassApi.ActionClass, 'id'>) {
  return requestClient.post('/admin/action_categories', data);
}

/**
 * 更新分类
 *
 * @param id 分类 ID
 * @param data 分类数据
 */
async function updateClass(
  id: number | string,
  data: { name: string; sort: number },
) {
  return requestClient.put(`/admin/action_categories/${id}`, data);
}

/**
 * 删除分类
 * @param id 分类 ID
 */
async function deleteClass(id: string) {
  return requestClient.delete(`/admin/action_categories/${id}`);
}

export { createClass, deleteClass, getClassList, updateClass };

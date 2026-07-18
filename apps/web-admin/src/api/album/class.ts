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
  return requestClient.get<any>('/admin/course_types', {
    params,
  });
}

/**
 * 创建动作
 * @param data 动作数据
 */
async function createClass(data: Omit<ActionActionApi.ActionAction, 'id'>) {
  return requestClient.post('/admin/course_types', data);
}

/**
 * 更新动作
 *
 * @param id 动作 ID
 * @param data 动作数据
 */
async function updateClass(
  id: number | string,
  data: { describe: any; name: string; path: string },
) {
  return requestClient.put(`/admin/course_types/${id}`, data);
}

/**
 * 删除动作
 * @param id 动作 ID
 */
async function deleteClass(id: string) {
  return requestClient.delete(`/admin/course_types/${id}`);
}

export { createClass, deleteClass, getClassList, updateClass };

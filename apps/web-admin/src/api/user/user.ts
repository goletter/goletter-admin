import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace TypeApi {
  export interface Type {
    [key: string]: any;
    id: string;
    name: string;
    sort: string;
    updated_at: string;
  }
}

/**
 * 获取用户列表数据
 */
async function getUserList(params: Recordable<any>) {
  return requestClient.get<Array<TypeApi.Type>>('/admin/users', {
    params,
  });
}

/**
 * 创建类型
 * @param data 类型数据
 */
async function createType(data: Omit<TypeApi.Type, 'id'>) {
  return requestClient.post('/admin/action_types', data);
}

/**
 * 更新类型
 *
 * @param id 类型 ID
 * @param data 类型数据
 */
async function updateUser(id: number | string, data: { status: number }) {
  return requestClient.put(`/admin/users/${id}`, data);
}

/**
 * 删除角色
 * @param id 角色 ID
 */
async function deleteType(id: string) {
  return requestClient.delete(`/admin/action_types/${id}`);
}

export { createType, deleteType, getUserList, updateUser };

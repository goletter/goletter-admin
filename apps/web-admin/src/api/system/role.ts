import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    id: string;
    tenantId: string;
    roleName: string;
    roleCode: string;
    remark?: string;
    delFlag: 0 | 1;
    enabledFlag: 0 | 1;
    createdAt: string;
  }
}

/**
 * 获取角色列表数据
 */
async function getRoleList(params: Recordable<any>) {
  return requestClient.get<Array<SystemRoleApi.SystemRole>>('/admin/roles', {
    params,
  });
}

/**
 * 获取角色列表数据
 */
async function getRoleFullList() {
  return requestClient.get<any>('/admin/roles');
}

/**
 * 创建角色
 * @param data 角色数据
 */
async function createRole(data: Omit<SystemRoleApi.SystemRole, 'id'>) {
  return requestClient.post('/admin/roles', data);
}

/**
 * 更新角色
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
async function updateRole(
  id: number | string,
  data: { display_name: string; name: string; permissions: string[] },
) {
  return requestClient.put(`/admin/roles/${id}`, data);
}

/**
 * 查询角色
 * @param id 角色 ID
 */
async function getRoleDetail(id: string) {
  const params = {
    id,
  };
  return requestClient.get('/sysrole/detail', { params });
}

/**
 * 删除角色
 * @param id 角色 ID
 */
async function deleteRole(id: string) {
  return requestClient.delete(`/admin/roles/${id}`);
}

export {
  createRole,
  deleteRole,
  getRoleDetail,
  getRoleFullList,
  getRoleList,
  updateRole,
};

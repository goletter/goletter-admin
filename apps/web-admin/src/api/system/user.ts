import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    id: string;
    realName: string;
    accountName: string;
    email: string;
    phone: string;
    roleId: string;
    tenantId: string;
    rawPassword: string;
    enabledFlag: 0 | 1;
    delFlag: 0 | 1;
    isLocked: 0 | 1;
    lastLoginTime: string;
    loginFailCount: number;
    loginIp: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
  }
}

/**
 * 获取用户列表数据
 */
async function getUserList(params: Recordable<any>) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    '/admin/admin_users',
    { params },
  );
}

/**
 * 新建用户
 * @param data 用户数据
 */
async function createUser(data: Omit<SystemUserApi.SystemUser, 'id'>) {
  return requestClient.post('/admin/admin_users', data);
}

/**
 * 更新用户
 *
 * @param id 用户 ID
 * @param data 用户数据
 */
async function updateUser(
  id: string,
  data: {
    name?: string;
    password?: string;
    realname?: string;
    role_id?: number;
    status?: number;
  },
) {
  return requestClient.put(`/admin/admin_users/${id}`, data);
}

/**
 * 删除用户
 * @param id 用户 ID
 */
async function deleteUser(id: string) {
  return requestClient.delete(`/admin/admin_users/${id}`);
}

/**
 * 重置密码
 * @param id 用户 ID
 */
async function resetUserPassword(id: string) {
  return requestClient.post('/sysuser/resetPassword', {
    userId: id,
  });
}

export { createUser, deleteUser, getUserList, resetUserPassword, updateUser };

import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace ActionConfigApi {
  export interface ActionConfig {
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
async function getConfigList(params: Recordable<any>) {
  return requestClient.get<Array<ActionConfigApi.ActionConfig>>(
    '/admin/user_packages',
    {
      params,
    },
  );
}

/**
 * 创建分类
 * @param data 分类数据
 */
async function createConfig(data: Omit<ActionConfigApi.ActionConfig, 'id'>) {
  return requestClient.post('/admin/user_packages', data);
}

/**
 * 更新分类
 *
 * @param id 分类 ID
 * @param data 分类数据
 */
async function updateConfig(
  id: number | string,
  data: { month: string; name: string; price: string },
) {
  return requestClient.put(`/admin/user_packages/${id}`, data);
}

/**
 * 删除分类
 * @param id 分类 ID
 */
async function deleteConfig(id: string) {
  return requestClient.delete(`/admin/user_packages/${id}`);
}

export { createConfig, deleteConfig, getConfigList, updateConfig };

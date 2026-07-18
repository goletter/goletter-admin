import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace ActionAttributeApi {
  export interface ActionAttribute {
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
 * 获取动作属性列表数据
 */
async function getAttributeList(params: Recordable<any>) {
  return requestClient.get<Array<ActionAttributeApi.ActionAttribute>>(
    '/admin/action_attributes',
    {
      params,
    },
  );
}

/**
 * 创建属性
 * @param data 属性数据
 */
async function createAttribute(
  data: Omit<ActionAttributeApi.ActionAttribute, 'id'>,
) {
  return requestClient.post('/admin/action_attributes', data);
}

/**
 * 更新属性
 *
 * @param id 属性 ID
 * @param data 属性数据
 */
async function updateAttribute(
  id: number | string,
  data: { action_attribute_tags: any; name: string; rule: number },
) {
  return requestClient.put(`/admin/action_attributes/${id}`, data);
}

/**
 * 删除属性
 * @param id 属性 ID
 */
async function deleteAttribute(id: string) {
  return requestClient.delete(`/admin/action_attributes/${id}`);
}

export { createAttribute, deleteAttribute, getAttributeList, updateAttribute };

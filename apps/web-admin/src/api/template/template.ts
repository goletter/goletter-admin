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
async function getTemplateList(params: Recordable<any>) {
  return requestClient.get<Array<ActionActionApi.ActionAction>>(
    '/admin/templates',
    {
      params,
    },
  );
}
/**
 * 获取动作动作列表数据
 */
async function getTemplateDetails(id: any, params: { include: string }) {
  return requestClient.get<any>(`/admin/templates/${id}`, { params });
}

/**
 * 创建动作
 * @param data 动作数据
 */
async function createTemplate(data: Omit<ActionActionApi.ActionAction, 'id'>) {
  return requestClient.post('/admin/templates', data);
}

/**
 * 更新动作
 *
 * @param id 动作 ID
 * @param data 动作数据
 */
async function updateTemplate(id: any | string, data: any) {
  return requestClient.put(`/admin/templates/${id}`, data);
}

/**
 * 删除动作
 * @param id 动作 ID
 */
async function deleteTemplate(id: string) {
  return requestClient.delete(`/admin/templates/${id}`);
}

export {
  createTemplate,
  deleteTemplate,
  getTemplateDetails,
  getTemplateList,
  updateTemplate,
};

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
async function getBannerList(params: Recordable<any>) {
  return requestClient.get<any>('/admin/banners', {
    params,
  });
}

/**
 * 创建动作
 * @param data 动作数据
 */
async function createBanner(data: Omit<ActionActionApi.ActionAction, 'id'>) {
  return requestClient.post('/admin/banners', data);
}

/**
 * 更新动作
 *
 * @param id 动作 ID
 * @param data 动作数据
 */
async function updateBanner(
  id: number | string,
  data: { name: any; path: any; sort: any },
) {
  return requestClient.put(`/admin/banners/${id}`, data);
}

/**
 * 删除动作
 * @param id 动作 ID
 */
async function deleteBanner(id: string) {
  return requestClient.delete(`/admin/banners/${id}`);
}

export { createBanner, deleteBanner, getBannerList, updateBanner };

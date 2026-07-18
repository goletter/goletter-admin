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
async function getDetails(params: { mark: any }) {
  return requestClient.get<any>('/admin/article_types/mark', {
    params,
  });
}

/**
 * 更新动作
 *
 * @param id 动作 ID
 * @param data 动作数据
 */
async function updatePolicy(id: number | string, data: { content: any }) {
  return requestClient.put(`/admin/article_types/${id}`, data);
}

export { getDetails, updatePolicy };

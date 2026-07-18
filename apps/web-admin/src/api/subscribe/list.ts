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
async function getList(params: Recordable<any>) {
  return requestClient.get<Array<ActionConfigApi.ActionConfig>>(
    '/admin/payments',
    {
      params,
    },
  );
}

export { getList };

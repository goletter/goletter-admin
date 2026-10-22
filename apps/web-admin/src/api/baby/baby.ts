import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace BabyApi {
  export interface Type {
    [key: string]: any;
    id: string;
    nickname: string;
    avatar: string;
    age: string;
    height: number;
    weight: number;
    updated_at: string;
  }
}

/**
 * 获取宝宝列表数据
 */
async function getBabyList(params: Recordable<any>) {
  return requestClient.get<Array<BabyApi.Type>>('/admin/babies', {
    params,
  });
}

export { getBabyList };

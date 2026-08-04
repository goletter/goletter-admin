import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace TypeApi {
  export interface Type {
    [key: string]: any;
    id: string;
    height: number;
    weight: number;
    around: number;
    sex: number;
    bmi_type: number;
    total_month: number;
    bmi: number;
    record_at: string;
    created_at: string;
  }
}

/**
 * 获取宝宝记录列表数据
 */
async function getBabyRecordList(params: Recordable<any>) {
  return requestClient.get<Array<TypeApi.Type>>('/admin/baby_records', {
    params,
  });
}

export { getBabyRecordList };

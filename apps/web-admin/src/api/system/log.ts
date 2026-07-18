import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';

export namespace SystemLogApi {
  export interface SystemLog {
    [key: string]: any;
    id: string;
    userName: string;
    userId: number;
    tenantId: number;
    successFlag: 0 | 1;
    moduleName: string;
    responseData: string;
    requestUrl: string;
    requestParam: string;
    requestMethod: string;
    operationType: string;
    operationDesc: string;
    createdAt: string;
    ipAddress: string;
    errorMessage: string;
  }
}

/**
 * 获取日志列表数据
 */
async function getLogList(data: Recordable<any>) {
  return requestClient.post<Array<SystemLogApi.SystemLog>>(
    '/operationLog/pageList',
    data,
  );
}

export { getLogList };

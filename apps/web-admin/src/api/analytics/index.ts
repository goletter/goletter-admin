import { requestClient } from '#/api/request';

// 获取订阅数据
export async function getInfo() {
  return requestClient.get<any>('/admin/dashboard/index');
}
// 获取用户数据
export async function getCombined(params?: { date_at?: [string, string] }) {
  return requestClient.get<any>('/admin/dashboard/combined', { params });
}

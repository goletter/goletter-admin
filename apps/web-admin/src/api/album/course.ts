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
async function getCourseList(params: Recordable<any>) {
  return requestClient.get<any>('/admin/courses', {
    params,
  });
}

/**
 * 创建动作
 * @param data 动作数据
 */
async function createCourse(data: Omit<ActionActionApi.ActionAction, 'id'>) {
  return requestClient.post('/admin/courses', data);
}

/**
 * 更新动作
 *
 * @param id 动作 ID
 * @param data 动作数据
 */
async function updateCourse(
  id: number | string,
  data: {
    course_items?: any;
    course_type_id?: any;
    name?: string;
    path?: string;
    status?: any;
  },
) {
  return requestClient.put(`/admin/courses/${id}`, data);
}

/**
 * 删除动作
 * @param id 动作 ID
 */
async function deleteCourse(id: string) {
  return requestClient.delete(`/admin/courses/${id}`);
}

export { createCourse, deleteCourse, getCourseList, updateCourse };

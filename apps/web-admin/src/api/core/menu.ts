import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

type BackendMenuRoute = Partial<RouteRecordStringComponent> & {
  children?: BackendMenuRoute[];
  type?: string;
};

function filterRouteMenus(
  routes: BackendMenuRoute[],
): RouteRecordStringComponent[] {
  return routes
    .filter((route) => route.type !== 'button')
    .map(({ children, ...route }) => {
      const menuRoute = route as RouteRecordStringComponent;
      const menuChildren = children ? filterRouteMenus(children) : [];

      if (menuChildren.length > 0) {
        menuRoute.children = menuChildren;
      }

      return menuRoute;
    });
}

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  const res = await requestClient.get<
    BackendMenuRoute[] | { data?: BackendMenuRoute[] }
  >('/admin/permissions/all');
  const routes = Array.isArray(res) ? res : (res.data ?? []);

  return filterRouteMenus(routes);
}

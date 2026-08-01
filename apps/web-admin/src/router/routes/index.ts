import type { RouteRecordRaw } from 'vue-router';

import { traverseTreeValues } from '@vben/utils';

import { coreRoutes, fallbackNotFoundRoute } from './core';

const pageComponentFiles = import.meta.glob('../../views/**/*.vue');

// 后端菜单模式下，业务路由由 /admin/permissions 动态返回。
// const dynamicRouteFiles = import.meta.glob('./modules/**/*.ts', {
//   eager: true,
// });

// 有需要可以自行打开注释，并创建文件夹
// const externalRouteFiles = import.meta.glob('./external/**/*.ts', { eager: true });
// const staticRouteFiles = import.meta.glob('./static/**/*.ts', { eager: true });

/** 动态路由 */
// const dynamicRoutes: RouteRecordRaw[] = mergeRouteModules(dynamicRouteFiles);

/** 外部路由列表，访问这些页面可以不需要Layout，可能用于内嵌在别的系统(不会显示在菜单中) */
// const externalRoutes: RouteRecordRaw[] = mergeRouteModules(externalRouteFiles);
// const staticRoutes: RouteRecordRaw[] = mergeRouteModules(staticRouteFiles);
const staticRoutes: RouteRecordRaw[] = [];
const externalRoutes: RouteRecordRaw[] = [];

/** 路由列表，由基本路由、外部路由和404兜底路由组成
 *  无需走权限验证（会一直显示在菜单中） */
const routes: RouteRecordRaw[] = [
  ...coreRoutes,
  ...externalRoutes,
  fallbackNotFoundRoute,
];

/** 基本路由列表，这些路由不需要进入权限拦截 */
const coreRouteNames = traverseTreeValues(coreRoutes, (route) => route.name);

/** 页面组件列表，仅供菜单管理选择组件路径，不参与路由注册 */
const componentKeys = Object.keys(pageComponentFiles)
  .map((path) => path.replace(/^..\/..\/views/, '').replace(/\.vue$/, ''))
  .sort();

/** 有权限校验的路由列表，包含动态路由和静态路由 */
const accessRoutes = [...staticRoutes];
export { accessRoutes, componentKeys, coreRouteNames, routes };

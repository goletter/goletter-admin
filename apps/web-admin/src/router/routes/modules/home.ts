import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:airplay',
      order: -1,
      title: '欢迎回来',
      hideInBreadcrumb: true,
      hideInMenu: true,
      hideInTab: false,
    },
    name: 'Home',
    path: '/home',
    component: () => import('#/views/home/index.vue'),
  },
];

export default routes;

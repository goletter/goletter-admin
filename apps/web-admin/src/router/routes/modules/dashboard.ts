import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: 0,
      title: $t('page.dashboard.title'),
    },
    name: 'Dashboard',
    path: '/analytics',
    component: () => import('#/views/dashboard/analytics/index.vue'),
  },
];

export default routes;

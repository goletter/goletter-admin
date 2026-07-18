import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:settings-outline',
      order: 100,
      title: $t('system.title'),
      authority: ['System'],
    },
    name: 'System',
    path: '/system',
    children: [
      {
        path: '/system/role',
        name: 'SystemRole',
        meta: {
          icon: 'mdi:account-group',
          title: $t('system.role.title'),
          authority: ['Role'],
        },
        component: () => import('#/views/system/role/list.vue'),
      },
      {
        path: '/system/user',
        name: 'SystemUser',
        meta: {
          icon: 'solar:users-group-rounded-broken',
          title: $t('system.user.title'),
          authority: ['AdminUser'],
        },
        component: () => import('#/views/system/user/list.vue'),
      },
    ],
  },
];

export default routes;

import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-account-box',
      order: 102,
      title: $t('user.title'),
      authority: ['User'],
    },
    name: 'User',
    path: '/user',
    children: [
      {
        path: '/user/user',
        name: 'user',
        meta: {
          icon: 'icon-park-outline:activity-source',
          title: $t('user.user.title'),
          authority: ['UserList'],
        },
        component: () => import('#/views/user/user/list.vue'),
      },
    ],
  },
];

export default routes;

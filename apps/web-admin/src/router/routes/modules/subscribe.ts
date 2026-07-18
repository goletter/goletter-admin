import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-add-card',
      order: 103,
      title: $t('subscribe.title'),
      authority: ['Payment'],
    },
    name: 'Subscribe',
    path: '/subscribe',
    children: [
      {
        path: '/subscribe/config',
        name: 'config',
        meta: {
          icon: 'icon-park-outline:activity-source',
          title: $t('subscribe.config.title'),
          authority: ['UserPackagesList'],
        },
        component: () => import('#/views/subscribe/config/list.vue'),
      },
      {
        path: '/subscribe/list',
        name: 'list',
        meta: {
          icon: 'icon-park-outline:activity-source',
          title: $t('subscribe.list.title'),
          authority: ['PaymentList'],
        },
        component: () => import('#/views/subscribe/list/list.vue'),
      },
    ],
  },
];

export default routes;

import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:accessibility-outline',
      order: 101,
      title: $t('action.title'),
      authority: ['Account'],
    },
    name: 'Action',
    path: '/action',
    children: [
      {
        path: '/action/classification',
        name: 'classification',
        meta: {
          icon: 'icon-park-outline:activity-source',
          title: $t('action.classification.title'),
          authority: ['ActionCategory'],
        },
        component: () => import('#/views/action/classification/list.vue'),
      },
      {
        path: '/action/type',
        name: 'type',
        meta: {
          icon: 'icon-park-outline:activity-source',
          title: $t('action.type.title'),
          authority: ['ActionType'],
        },
        component: () => import('#/views/action/type/list.vue'),
      },
      {
        path: '/action/attribute',
        name: 'attribute',
        meta: {
          icon: 'icon-park-outline:activity-source',
          title: $t('action.attribute.title'),
          authority: ['ActionAttribute'],
        },
        component: () => import('#/views/action/attribute/list.vue'),
      },
      {
        path: '/action/action',
        name: 'action',
        meta: {
          icon: 'icon-park-outline:activity-source',
          title: $t('action.action.title'),
          authority: ['Action'],
        },
        component: () => import('#/views/action/action/list.vue'),
      },
      {
        path: '/action/action/edit',
        name: 'ActionEdit',
        meta: {
          icon: 'icon-park-outline:activity-source',
          title: $t('action.edit.title'),
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: false,
          authority: ['Action'],
        },
        component: () => import('#/views/action/action/edit.vue'),
      },
    ],
  },
];

export default routes;

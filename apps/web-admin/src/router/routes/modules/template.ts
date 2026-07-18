import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'tabler:album',
      order: 107,
      title: $t('template.title'),
      authority: ['Adaptive'],
    },
    name: 'Template',
    path: '/template',
    children: [
      {
        path: '/template',
        name: 'template-list',
        meta: {
          icon: 'icon-park-outline:activity-source',
          title: $t('template.list.title'),
          authority: ['AdaptiveList'],
        },
        component: () => import('#/views/template/list.vue'),
      },
      {
        path: '/template/edit',
        name: 'TemplateEdit',
        meta: {
          icon: 'icon-park-outline:activity-source',
          title: $t('template.edit.title'),
          authority: ['AdaptiveList'],
          hideInBreadcrumb: true,
          hideInMenu: true,
          hideInTab: false,
        },
        component: () => import('#/views/template/edit.vue'),
      },
    ],
  },
];

export default routes;

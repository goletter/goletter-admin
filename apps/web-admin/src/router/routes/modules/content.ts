import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'tabler:align-box-left-bottom',
      order: 106,
      title: $t('content.title'),
      authority: ['Article'],
    },
    name: 'Content',
    path: '/content',
    children: [
      {
        path: '/content/banner',
        name: 'banner',
        meta: {
          icon: 'icon-park-outline:activity-source',
          title: $t('content.banner.title'),
          authority: ['BannerList'],
        },
        component: () => import('#/views/content/banner/list.vue'),
      },
      {
        path: '/content/user',
        name: 'user-policy',
        meta: {
          icon: 'icon-park-outline:activity-source',
          title: $t('content.user.title'),
          authority: ['ArticleTypeList'],
        },
        component: () => import('#/views/content/user/user.vue'),
      },
      {
        path: '/content/privacy',
        name: 'privacy-policy',
        meta: {
          icon: 'icon-park-outline:activity-source',
          title: $t('content.privacy.title'),
          authority: ['ArticleTypeList'],
        },
        component: () => import('#/views/content/privacy/privacy.vue'),
      },
    ],
  },
];

export default routes;

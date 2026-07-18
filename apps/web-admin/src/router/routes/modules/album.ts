import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'tabler:align-box-center-stretch',
      order: 105,
      title: $t('album.title'),
      authority: ['Course'],
    },
    name: 'Album',
    path: '/album',
    children: [
      {
        path: '/album/class',
        name: 'class',
        meta: {
          icon: 'icon-park-outline:activity-source',
          title: $t('album.class.title'),
          authority: ['CourseTypeList'],
        },
        component: () => import('#/views/album/class/list.vue'),
      },
      {
        path: '/album/course',
        name: 'course',
        meta: {
          icon: 'icon-park-outline:activity-source',
          title: $t('album.course.title'),
          authority: ['CourseList'],
        },
        component: () => import('#/views/album/course/list.vue'),
      },
    ],
  },
];

export default routes;

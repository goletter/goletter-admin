<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { Page } from '@vben/common-ui';

import { Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getList } from '#/api/subscribe/list';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';

const [Grid] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(),
    height: 'auto',
    keepSource: true,
    size: 'large',
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getList({
            page: page.currentPage,
            pageSize: page.pageSize,
            include: 'user,userPackage',
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },

    toolbarConfig: {
      custom: true,
      export: false,
      refresh: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemUserApi.SystemUser>,
});
</script>
<template>
  <Page auto-content-height>
    <Grid :table-title="$t('subscribe.list.listTitle')">
      <template #status="{ row }">
        <Tag color="blue" v-if="row.status">
          {{ $t(`subscribe.list.statusTrue`) }}
        </Tag>
        <Tag color="red" v-else>
          {{ $t(`subscribe.list.statusFalse`) }}
        </Tag>
      </template>
    </Grid>
  </Page>
</template>

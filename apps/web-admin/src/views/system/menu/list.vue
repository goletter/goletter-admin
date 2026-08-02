<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api/system/role';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteMenu, getMenuList, SystemMenuApi } from '#/api/system/menu';
import { $t } from '#/locales';

import { SysMenuType, useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
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
          return await getMenuList({
            page: page.currentPage,
            pageSize: page.pageSize,
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

    treeConfig: {
      parentField: 'parent_id',
      rowField: 'id',
      transform: false,
      expandAll: true,
    },
  } as VxeTableGridOptions<SystemRoleApi.SystemRole>,
});

async function onEdit(row: SystemRoleApi.SystemRole) {
  // const data = await getRoleDetail(row.id);
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemRoleApi.SystemRole) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteMenu(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onAppend(row: SystemMenuApi.SystemMenu) {
  formDrawerApi.setData({ parent_id: row.id }).open();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.menu.name')]) }}
        </Button>
      </template>
      <template #type="{ row }">
        <span v-if="row.type === SysMenuType.Catalog">目录</span>
        <span v-else-if="row.type === SysMenuType.Menu">菜单</span>
        <span v-else-if="row.type === SysMenuType.Button">按钮</span>
      </template>
      <template #status="{ row }">
        <span v-if="row.status === 1" class="text-primary">已启用</span>
        <span v-else-if="row.status === 0" class="text-danger">已禁用</span>
      </template>
      <template #icon="{ row }">
        <div class="size-5 flex-shrink-0">
          <IconifyIcon
            :icon="row.icon || 'carbon:circle-dash'"
            class="size-full"
          />
        </div>
      </template>
      <template #action="{ row }">
        <Button type="text" size="small" @click="onAppend(row)">
          <span class="text-primary">新增下级</span>
        </Button>
        <Button type="text" size="small" @click="onEdit(row)">
          <span class="text-warning">编辑</span>
        </Button>
        <Button type="text" danger size="small" @click="onDelete(row)">
          删除
        </Button>
      </template>
    </Grid>
  </Page>
</template>

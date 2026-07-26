<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { onMounted } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteMenu, getMenuList, SystemMenuApi } from '#/api/system/menu';

import { SysMenuType, useColumns } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params) => {
          const result = await getMenuList();

          return {
            total: result.total,
            items: result.data,
          };
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
      zoom: true,
    },
    treeConfig: {
      parentField: 'parent_id',
      rowField: 'id',
      transform: false,
      expandAll: true,
    },
  } as VxeTableGridOptions,
});

// function onActionClick({
//   code,
//   row,
// }: OnActionClickParams<SystemMenuApi.SystemMenu>) {
//   switch (code) {
//     case 'append': {
//       onAppend(row);
//       break;
//     }
//     case 'delete': {
//       onDelete(row);
//       break;
//     }
//     case 'edit': {
//       onEdit(row);
//       break;
//     }
//     default: {
//       break;
//     }
//   }
// }

function onRefresh() {
  gridApi.query();
}
function onEdit(row: SystemMenuApi.SystemMenu) {
  formDrawerApi.setData(row).open();
}
function onCreate() {
  formDrawerApi.setData({}).open();
}
function onAppend(row: SystemMenuApi.SystemMenu) {
  formDrawerApi.setData({ parent_id: row.id }).open();
}

function onDelete(row: SystemMenuApi.SystemMenu) {
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

onMounted(() => {
  gridApi.reload();
});
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
        <span v-else-if="row.tyep === SysMenuType.Button">按钮</span>
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
          <span class="text-primary">新增下级菜单</span>
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
<style lang="scss" scoped>
.menu-badge {
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  & > :deep(div) {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>

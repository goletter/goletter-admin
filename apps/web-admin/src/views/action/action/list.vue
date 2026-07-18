<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { useRouter } from 'vue-router';

import { AccessControl } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Image, message, Modal, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteAction, getActionList, updateAction } from '#/api/action/action';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const router = useRouter();
const [FormModal] = useVbenModal({
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
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    size: 'large',
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getActionList({
            page: page.currentPage,
            pageSize: page.pageSize,
            include: 'actionCategory,actionTypes,actionAttributeTags',
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

function onActionClick(e: OnActionClickParams<SystemUserApi.SystemUser>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

function onEdit(row: SystemUserApi.SystemUser) {
  // formModalApi.setData(row).open();
  router.push({ name: 'ActionEdit', query: { id: row.id } });
}

function onDelete(row: SystemUserApi.SystemUser) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.realName]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteAction(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.realName]),
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
  // formModalApi.setData({}).open();
  router.push({ name: 'ActionEdit' });
}
/**
 * 状态开关即将改变
 * @param newStatus 期望改变的状态值
 * @param row 行数据
 * @returns 返回false则中止改变，返回其他值（undefined、true）则允许改变
 */
async function onStatusChange(
  newStatus: number,
  row: SystemUserApi.SystemUser,
) {
  const status: Recordable<string> = {
    0: $t('common.disable'),
    1: $t('common.enable'),
  };
  try {
    await confirm(
      $t('common.ifSwitchStatus', [row.realName, status[newStatus.toString()]]),
      $t('common.toggleState'),
    );
    await updateAction(row.id, {
      name: row.name,
      action_category_id: row.action_category_id,
      action_type_ids: row.action_type_ids,
      path: row.path,
      videos: row.videos,
      action_attribute_tag_ids: row.action_attribute_tag_ids,
      status: newStatus,
    });
    return true;
  } catch {
    return false;
  }
}
/**
 * 将Antd的Modal.confirm封装为promise，方便在异步函数中调用。
 * @param content 提示内容
 * @param title 提示标题
 */
function confirm(content: string, title: string) {
  return new Promise((reslove, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('已取消'));
      },
      onOk() {
        reslove(true);
      },
      title,
    });
  });
}
</script>
<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <Grid :table-title="$t('action.action.listTitle')">
      <template #image-url="{ row }">
        <Image :src="row.path" height="40px" style="margin-top: 2px" />
      </template>
      <template #toolbar-tools>
        <AccessControl :codes="['ActionCreate']" type="code">
          <Button type="primary" @click="onCreate">
            <Plus class="size-5" />
            {{ $t('ui.actionTitle.create', [$t('action.action.biref')]) }}
          </Button>
        </AccessControl>
      </template>
      <template #actionAttributes="{ row }">
        <template v-if="Array.isArray(row.action_attribute_tags)">
          <Tag
            style="margin-bottom: 2px"
            color="blue"
            v-for="tag in row.action_attribute_tags"
            :key="tag.id"
          >
            {{ tag.name }}
          </Tag>
        </template>
      </template>
      <template #actionTypes="{ row }">
        <template v-if="Array.isArray(row.action_types)">
          <Tag
            style="margin-bottom: 2px"
            color="blue"
            v-for="tag in row.action_types"
            :key="tag.id"
          >
            {{ tag.name }}
          </Tag>
        </template>
      </template>
      <template #difficulty="{ row }">
        <Tag style="margin-bottom: 2px" color="blue">
          {{ row.difficulty }}
        </Tag>
      </template>
    </Grid>
  </Page>
</template>

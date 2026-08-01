import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemMenuApi } from '#/api/system/menu';

import { $t } from '#/locales';

/* eslint-disable no-unused-vars */
export enum SysMenuType {
  Button = 2,
  Catalog = 0,
  Menu = 1,
}
/* eslint-enable no-unused-vars */

export function getMenuTypeOptions() {
  return [
    {
      color: 'processing',
      label: $t('system.menu.typeCatalog'),
      value: SysMenuType.Catalog,
    },
    {
      color: 'default',
      label: $t('system.menu.typeMenu'),
      value: SysMenuType.Menu,
    },
    {
      color: 'error',
      label: $t('system.menu.typeButton'),
      value: SysMenuType.Button,
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: '菜单名称',
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('system.role.roleName')}`,
      },
    },
  ];
}

export function useColumns<T = SystemMenuApi.SystemMenu>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      align: 'left',
      field: 'display_name',
      fixed: 'left',
      title: '菜单名称',
      treeNode: true,
      width: 250,
    },
    {
      align: 'left',
      field: 'icon',
      title: '图标',
      slots: { default: 'icon' },
      width: 250,
    },
    {
      align: 'center',
      field: 'type',
      slots: { default: 'type' },
      title: $t('system.menu.type'),
      width: 100,
    },
    {
      field: 'name',
      title: $t('system.menu.authCode'),
      width: 200,
    },
    {
      align: 'left',
      field: 'path',
      title: $t('system.menu.path'),
      width: 200,
    },

    {
      align: 'left',
      field: 'component',
      formatter: ({ row }) => {
        switch (row.type as any) {
          case 'embedded': {
            return row.meta?.iframeSrc ?? '';
          }
          case 'link': {
            return row.meta?.link ?? '';
          }
          case SysMenuType.Catalog:
          case SysMenuType.Menu: {
            return row.component ?? '';
          }
        }
        return '';
      },
      minWidth: 200,
      title: $t('system.menu.component'),
    },
    {
      cellRender: { name: 'CellTag' },
      field: 'status',
      slots: { default: 'status' },
      title: $t('system.menu.status'),
      width: 100,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.role.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: $t('common.edit'),
          },
          {
            code: 'delete',
            text: $t('common.delete'),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('common.operation'),
      minWidth: 130,
    },
  ];
}

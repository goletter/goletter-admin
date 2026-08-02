import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { useAccess } from '@vben/access';

import { $t } from '#/locales';

const { hasAccessByCodes } = useAccess();

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('user.user.id'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('user.user.id')}`,
      },
    },
  ];
}

export function useColumns<T = SystemUserApi.SystemUser>(
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'id',
      title: $t('user.user.id'),
      minWidth: 100,
    },
    {
      field: 'name',
      title: $t('user.user.email'),
      minWidth: 100,
    },
    {
      field: 'phone',
      title: $t('user.user.email'),
      minWidth: 100,
    },
    {
      field: 'father_height',
      title: $t('user.user.email'),
      minWidth: 100,
    },
    {
      field: 'mother_height',
      title: $t('user.user.email'),
      minWidth: 100,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name:
          onStatusChange && hasAccessByCodes(['UserList'])
            ? 'CellSwitch'
            : 'CellTag',
      },
      field: 'status',
      title: $t('common.status'),
      width: 100,
    },
    {
      field: 'card_at',
      title: $t('user.user.createdTime'),
      minWidth: 100,
    },
    {
      field: 'created_at',
      title: $t('user.user.createdTime'),
      minWidth: 100,
    },
  ];
}

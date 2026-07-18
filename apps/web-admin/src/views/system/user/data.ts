import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { useAccess } from '@vben/access';

import { getRoleFullList } from '#/api/system/role';
import { $t } from '#/locales';

const { hasAccessByCodes } = useAccess();

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'realname',
      label: $t('system.user.userName'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('system.user.userName')}`,
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.user.account'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('system.user.account')}`,
      },
      rules: 'required',
    },
    {
      component: 'password',
      fieldName: 'password',
      label: $t('system.user.password'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('system.user.password')}`,
      },
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: () => getRoleFullList().then((res) => res.data),
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
      },
      fieldName: 'role_id',
      label: $t('system.user.roleName'),
      rules: 'required',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'realname',
      label: $t('system.user.userName'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('system.user.userName')}`,
      },
    },
    {
      component: 'Input',
      fieldName: 'roleName',
      label: $t('system.user.roleName'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('system.user.roleName')}`,
      },
    },
  ];
}

export function useColumns<T = SystemUserApi.SystemUser>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      type: 'seq',
      title: $t('common.index'),
      width: 60,
      align: 'center',
    },
    {
      field: 'realname',
      title: $t('system.user.userName'),
      minWidth: 100,
    },
    {
      field: 'name',
      title: $t('system.user.account'),
      minWidth: 100,
    },
    {
      field: 'role.name',
      title: $t('system.user.roleName'),
      minWidth: 100,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name:
          onStatusChange && hasAccessByCodes(['AdminUser'])
            ? 'CellSwitch'
            : 'CellTag',
      },
      field: 'status',
      title: $t('common.status'),
      width: 100,
    },
    {
      field: 'created_at',
      title: $t('common.createTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.user.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: $t('common.edit'),
            show: hasAccessByCodes(['AdminUserUpdate']),
          },
          // {
          //   code: 'reset',
          //   text: $t('common.reset'),
          //   show: hasAccessByCodes(['AdminUser']),
          // },
          {
            code: 'delete',
            text: $t('common.delete'),
            show: hasAccessByCodes(['AdminUserDelete']),
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

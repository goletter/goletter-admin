import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api/system/role';

import { useAccess } from '@vben/access';

import { $t } from '#/locales';

const { hasAccessByCodes } = useAccess();

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.roleName'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('system.role.roleName')}`,
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'display_name',
      label: $t('system.role.remark'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('system.role.remark')}`,
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'permissions',
      formItemClass: 'items-start',
      label: $t('common.setPermissions'),
      modelPropName: 'modelValue',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'realname',
      label: $t('system.role.roleName'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('system.role.roleName')}`,
      },
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.remark'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('system.role.remark')}`,
      },
    },
  ];
}

export function useColumns<T = SystemRoleApi.SystemRole>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      type: 'seq',
      title: $t('common.index'),
      width: 60,
      align: 'center',
    },
    {
      field: 'name',
      title: $t('system.role.roleName'),
      width: 200,
    },
    {
      field: 'display_name',
      minWidth: 100,
      title: $t('system.role.remark'),
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
          nameTitle: $t('system.role.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: $t('common.edit'),
            show: hasAccessByCodes(['RoleUpdate']),
          },
          // {
          //   code: 'permission',
          //   text: $t('common.setPermissions'),
          //   // show: hasAccessByCodes(['20104']),
          // },
          {
            code: 'delete',
            text: $t('common.delete'),
            show: hasAccessByCodes(['RoleDelete']),
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

import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

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
      fieldName: 'nickname',
      label: $t('baby.baby.nickname'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('baby.baby.nickname')}`,
      },
    },
  ];
}

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'id',
      title: $t('baby.baby.id'),
      width: 100,
    },
    {
      field: 'nickname',
      title: $t('baby.baby.nickname'),
    },
    {
      field: 'age',
      title: $t('baby.baby.age'),
    },
    {
      field: 'height',
      title: $t('baby.baby.height'),
    },
    {
      field: 'weight',
      title: $t('baby.baby.weight'),
    },
    {
      field: 'created_at',
      title: $t('common.createTime'),
    },
  ];
}

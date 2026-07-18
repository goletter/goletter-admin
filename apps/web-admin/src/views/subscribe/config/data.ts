import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { useAccess } from '@vben/access';

import { $t } from '#/locales';

const { hasAccessByCodes } = useAccess();

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('subscribe.config.name'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('subscribe.config.name')}`,
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'price',
      label: $t('subscribe.config.price'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('subscribe.config.price')}`,
        prefix: '$',
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'month',
      label: $t('subscribe.config.time'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('subscribe.config.time')}`,
        suffix: '个月',
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'product_id',
      label: $t('subscribe.config.product_id'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('subscribe.config.product_id')}`,
      },
      rules: 'required',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  const showSearch = false; // 控制是否显示搜索
  if (!showSearch) return [];

  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('subscribe.config.name'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('subscribe.config.name')}`,
      },
    },
  ];
}

export function useColumns<T = SystemUserApi.SystemUser>(
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
      title: $t('subscribe.config.name'),
      minWidth: 100,
    },
    {
      field: 'price',
      title: $t('subscribe.config.price'),
      width: 200,
      formatter: ({ cellValue }) => `$${cellValue ?? ''}`,
    },
    {
      field: 'month',
      title: $t('subscribe.config.time'),
      width: 200,
      formatter: ({ cellValue }) => `${cellValue ?? ''}个月`,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('action.classification.listTitle'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: $t('common.edit'),
            show: hasAccessByCodes(['UserPackagesUpdate']),
          },
          {
            code: 'delete',
            text: $t('common.delete'),
            show: hasAccessByCodes(['UserPackagesDelete']),
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

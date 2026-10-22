import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'user_id',
      label: $t('subscribe.list.userId'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('subscribe.list.userId')}`,
      },
      rules: 'required',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'trade_no',
      label: $t('subscribe.list.orderNo'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('subscribe.list.orderNo')}`,
      },
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          {
            label: '已付款',
            value: '1',
          },
          {
            label: '未付款',
            value: '0',
          },
        ],
      },
      fieldName: 'status',
      label: $t('subscribe.list.status'),
    },
  ];
}

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'id',
      title: $t('subscribe.list.id'),
      width: 100,
    },
    {
      field: 'trade_no',
      title: $t('subscribe.list.orderNo'),
      minWidth: 100,
    },
    {
      field: 'user.name',
      title: $t('subscribe.list.userName'),
      minWidth: 50,
    },
    {
      field: 'user_package.name',
      title: $t('subscribe.list.membershipPlan'),
      minWidth: 100,
    },
    {
      field: 'money',
      title: $t('subscribe.list.paymentAmount'),
      minWidth: 40,
      formatter: ({ cellValue }) => `$${cellValue ?? ''}`,
    },
    {
      field: 'status',
      title: $t('subscribe.list.status'),
      slots: {
        default: 'status', // 自定义插槽名
      },
      minWidth: 100,
    },
    {
      field: 'created_at',
      title: $t('subscribe.list.startTime'),
      minWidth: 100,
    },
  ];
}

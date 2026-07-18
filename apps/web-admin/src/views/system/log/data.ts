import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'userName',
      label: $t('system.log.operator'),
    },
    {
      component: 'DatePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
      },
      fieldName: 'createdAt',
      label: $t('system.log.operationTime'),
    },
  ];
}

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      type: 'seq',
      title: $t('page.common.index'),
      width: 60,
      align: 'center',
    },
    {
      field: 'id',
      title: $t('system.log.number'),
      minWidth: 100,
    },
    {
      field: 'createdAt',
      title: $t('system.log.operationTime'),
      width: 200,
    },
    {
      field: 'userName',
      minWidth: 100,
      title: $t('system.log.operator'),
    },
    {
      field: 'ipAddress',
      title: $t('system.log.ip'),
      width: 200,
    },
    {
      field: 'operationType',
      title: $t('system.log.content'),
      minWidth: 200,
    },
  ];
}

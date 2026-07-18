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
      label: $t('content.banner.bannerTitle'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('content.banner.bannerTitle')}`,
      },
      rules: 'required',
    },
    {
      component: 'Upload',
      fieldName: 'path',
      label: $t('content.banner.bannerImg'),
      rules: 'selectRequired',
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: $t('content.banner.sort'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('content.banner.sort')}`,
        width: '100%',
      },
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('content.banner.bannerTitle'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('content.banner.bannerTitle')}`,
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
      title: $t('content.banner.bannerTitle'),
      minWidth: 100,
    },
    {
      field: 'path',
      slots: { default: 'image-url' },
      title: $t('content.banner.bannerImg'),
      width: 200,
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
          nameTitle: $t('action.classification.listTitle'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: $t('common.edit'),
            show: hasAccessByCodes(['BannerUpdate']),
          },
          {
            code: 'delete',
            text: $t('common.delete'),
            show: hasAccessByCodes(['BannerDelete']),
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

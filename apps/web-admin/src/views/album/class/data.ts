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
      label: $t('album.class.className'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('album.class.className')}`,
      },
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'describe',
      label: $t('album.class.description'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('album.class.description')}`,
        style: 'width:100%',
        maxLength: 5000,
        showCount: true,
        rows: 10,
      },
    },
    {
      component: 'Upload',
      fieldName: 'path',
      label: $t('album.class.cover'),
      rules: 'selectRequired',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('action.classification.classname'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('action.classification.classname')}`,
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
      title: $t('album.class.className'),
      minWidth: 100,
    },
    {
      field: 'path',
      slots: { default: 'image-url' },
      title: $t('album.class.cover'),
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
            show: hasAccessByCodes(['CourseTypeUpdate']),
          },
          {
            code: 'delete',
            text: $t('common.delete'),
            show: hasAccessByCodes(['CourseTypeDelete']),
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

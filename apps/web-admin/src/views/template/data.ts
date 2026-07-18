import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { useAccess } from '@vben/access';

import { getAttributeList, getClassList, getTypeList } from '#/api/action/edit';
import { $t } from '#/locales';

const { hasAccessByCodes } = useAccess();

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('action.edit.actionName'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('action.edit.actionName')}`,
        style: 'width: 60%',
      },
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'describe',
      label: $t('action.edit.actionDescription'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('action.edit.actionDescription')}`,
        style: 'width: 60%',
      },
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getClassList,
        params: { pageSize: 1000 },
        resultField: 'data',
        labelField: 'name',
        valueField: 'id',
        placeholder: `${$t('common.pleaseSelect')}${$t('action.edit.category')}`,
        style: 'width: 60%',
      },
      fieldName: 'action_category_id',
      label: $t('action.edit.category'),
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getTypeList,
        params: { pageSize: 1000 },
        resultField: 'data',
        labelField: 'name',
        valueField: 'id',
        placeholder: `${$t('common.pleaseSelect')}${$t('action.edit.type')}`,
        style: 'width: 60%',
        mode: 'multiple',
      },
      fieldName: 'action_type_ids',
      label: $t('action.edit.type'),
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          {
            label: 'VIP',
            value: '1',
          },
          {
            label: '免费',
            value: '0',
          },
        ],
      },
      fieldName: 'is_vip',
      label: $t('action.edit.viewRule'),
      rules: 'required',
    },
    {
      component: 'Upload',
      fieldName: 'path',
      label: $t('action.edit.coverImage'),
      rules: 'required',
    },
    {
      component: 'Upload',
      fieldName: 'video_zh',
      label: $t('action.edit.uploadVideoZh'),
      rules: 'required',
    },
    {
      component: 'Upload',
      fieldName: 'video_en',
      label: $t('action.edit.uploadVideoEn'),
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        addButtonText: '添加属性',
        api: getAttributeList,
        params: { pageSize: 1000, include: 'actionAttributeTags' },
        resultField: 'data',
        labelField: 'name',
        valueField: 'id',
        placeholder: `${$t('common.pleaseSelect')}${$t('action.edit.attributes')}`,
        style: 'width: 60%',
        mode: 'multiple',
      },
      fieldName: 'action_attribute_ids',
      label: $t('action.edit.attributes'),
      rules: 'required',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('template.list.listName'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('template.list.listName')}`,
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
      field: 'name',
      title: $t('template.list.listName'),
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
      title: $t('template.list.status'),
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
          nameTitle: $t('action.action.listTitle'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: $t('common.edit'),
            show: hasAccessByCodes(['AdaptiveUpdate']),
          },
          {
            code: 'delete',
            text: $t('common.delete'),
            show: hasAccessByCodes(['AdaptiveDelete']),
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

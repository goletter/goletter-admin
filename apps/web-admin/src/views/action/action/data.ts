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
        style: 'width:100%',
      },
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'describe',
      label: $t('action.edit.actionDescription'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('action.edit.actionDescription')}`,
        style: 'width:100%',
        maxlength: 5000,
        showCount: true,
        rows: 10,
      },
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getClassList,
        params: { pageSize: 10_000 },
        resultField: 'data',
        labelField: 'name',
        valueField: 'id',
        placeholder: `${$t('common.pleaseSelect')}${$t('action.edit.category')}`,
        style: 'width:100%',
      },
      fieldName: 'action_category_id',
      label: $t('action.edit.category'),
      rules: 'selectRequired',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getTypeList,
        params: { pageSize: 10_000 },
        resultField: 'data',
        labelField: 'name',
        valueField: 'id',
        placeholder: `${$t('common.pleaseSelect')}${$t('action.edit.type')}`,
        style: 'width:100%',
        mode: 'multiple',
      },
      fieldName: 'action_type_ids',
      label: $t('action.edit.type'),
      rules: 'selectRequired',
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
      rules: 'selectRequired',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          {
            label: '初级',
            value: 'Beginner',
          },
          {
            label: '中级',
            value: 'Intermediate',
          },
          {
            label: '高级',
            value: 'Advanced',
          },
        ],
      },
      fieldName: 'difficulty',
      label: $t('action.edit.nd'),
      rules: 'selectRequired',
    },
    {
      component: 'Upload',
      fieldName: 'path',
      label: $t('action.edit.coverImage'),
      rules: 'selectRequired',
    },
    {
      component: 'Upload',
      fieldName: 'video_en',
      label: $t('action.edit.uploadVideoEn'),
      rules: 'selectRequired',
    },
    {
      component: 'Upload',
      fieldName: 'video_zh',
      label: $t('action.edit.uploadVideoZh'),
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        api: getAttributeList,
        resultField: 'data',
        placeholder: `${$t('common.pleaseSelect')}${$t('action.edit.attributes')}`,
        style: 'width:100%',
        treeCheckable: true,
        multiple: true,
        treeNodeFilterProp: 'label',
        fieldNames: {
          label: 'label',
          value: 'value',
          children: 'children',
        },
      },
      fieldName: 'action_attribute_tag_ids',
      label: $t('action.edit.attributes'),
      rules: 'selectRequired',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('action.action.actionname'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('action.action.actionname')}`,
      },
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getClassList,
        params: { pageSize: 10_000 },
        resultField: 'data',
        labelField: 'name',
        valueField: 'id',
        placeholder: `${$t('common.pleaseSelect')}${$t('action.edit.category')}`,
        style: 'width:100%',
      },
      fieldName: 'action_category_id',
      label: $t('action.edit.category'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getTypeList,
        params: { pageSize: 10_000 },
        resultField: 'data',
        labelField: 'name',
        valueField: 'id',
        placeholder: `${$t('common.pleaseSelect')}${$t('action.edit.type')}`,
        style: 'width:100%',
        mode: 'multiple',
      },
      fieldName: 'action_type_ids',
      label: $t('action.edit.type'),
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
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          {
            label: '初级',
            value: 'Beginner',
          },
          {
            label: '中级',
            value: 'Intermediate',
          },
          {
            label: '高级',
            value: 'Advanced',
          },
        ],
      },
      fieldName: 'difficulty',
      label: $t('action.edit.nd'),
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
      title: $t('action.action.actionname'),
      minWidth: 100,
    },
    {
      field: 'path',
      slots: { default: 'image-url' },
      title: $t('action.action.cover_image'),
      width: 100,
    },
    {
      field: 'action_category.name',
      title: $t('action.action.category'),
      minWidth: 100,
    },
    {
      field: 'action_types',
      title: $t('action.action.action_type'),
      minWidth: 100,
      showOverflow: false,
      align: 'left',
      slots: {
        default: 'actionTypes', // 自定义插槽名
      },
    },
    {
      field: 'action_attribute_tags',
      title: $t('action.edit.attributes'),
      minWidth: 100,
      showOverflow: false,
      align: 'left',
      slots: {
        default: 'actionAttributes', // 自定义插槽名
      },
    },
    {
      field: 'difficulty',
      title: $t('action.edit.nd'),
      minWidth: 100,
      showOverflow: false,
      align: 'left',
      slots: {
        default: 'difficulty', // 自定义插槽名
      },
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
      title: $t('action.action.status'),
      width: 100,
    },
    {
      field: 'duration',
      title: $t('action.action.time'),
      minWidth: 100,
      slots: {
        default: ({ row }) => {
          if (!row.duration && row.duration !== 0) return '';
          const minutes = Math.floor(row.duration / 60);
          const seconds = row.duration % 60;
          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        },
      },
    },
    {
      field: 'view_count',
      title: $t('action.action.views'),
      minWidth: 100,
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
            show: hasAccessByCodes(['ActionUpdate']),
          },
          {
            code: 'delete',
            text: $t('common.delete'),
            show: hasAccessByCodes(['ActionDelete']),
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

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { useAccess } from '@vben/access';

import { getActionList } from '#/api/action/action';
import { getClassList } from '#/api/album/class';
import { $t } from '#/locales';

const { hasAccessByCodes } = useAccess();

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('album.course.courseTitle'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('album.course.courseTitle')}`,
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
        placeholder: `${$t('common.pleaseSelect')}${$t('album.class.title')}`,
        style: 'width: 60%',
      },
      fieldName: 'course_type_id',
      label: $t('album.class.title'),
      rules: 'selectRequired',
    },
    {
      component: 'Upload',
      fieldName: 'path',
      label: $t('album.course.cover'),
      rules: 'selectRequired',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getActionList,
        params: { pageSize: 10_000 },
        resultField: 'data',
        labelField: 'name',
        valueField: 'id',
        placeholder: `${$t('common.pleaseSelect')}${$t('album.course.action')}`,
        style: 'width: 60%',
        mode: 'multiple',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          // 改成只要包含输入的词就行
          return option.label?.toLowerCase().includes(input.toLowerCase());
        },
      },
      fieldName: 'course_items',
      label: $t('album.course.actionTitle'),
      rules: 'selectRequired',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('album.course.courseTitle'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('album.course.courseTitle')}`,
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
      title: $t('album.course.courseTitle'),
      minWidth: 100,
    },
    {
      field: 'path',
      slots: { default: 'image-url' },
      title: $t('album.course.cover'),
      width: 200,
    },
    {
      field: 'item_count',
      title: $t('album.course.videoNum'),
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
      title: $t('action.action.status'),
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
          nameTitle: $t('action.classification.listTitle'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: $t('common.edit'),
            show: hasAccessByCodes(['CourseUpdate']),
          },
          {
            code: 'delete',
            text: $t('common.delete'),
            show: hasAccessByCodes(['CourseDelete']),
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

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { useAccess } from '@vben/access';

import { $t } from '#/locales';

import DynamicTagsInput from './modules/DynamicTagsInput.vue';

const { hasAccessByCodes } = useAccess();

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('action.attribute.typeName'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('action.attribute.typeName')}`,
      },
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      fieldName: 'rule',
      label: $t('action.attribute.rule'),
      componentProps: {
        options: [
          { label: $t('action.attribute.mul'), value: 1 },
          { label: $t('action.attribute.so'), value: 0 },
        ],
      },
      rules: 'selectRequired',
    },
    {
      component: DynamicTagsInput,
      fieldName: 'action_attribute_tags',
      label: $t('action.attribute.tags'),
      rules: 'selectRequired',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('action.attribute.typeName'),
      componentProps: {
        placeholder: `${$t('common.pleaseEnter')}${$t('action.attribute.typeName')}`,
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
      title: $t('action.attribute.typeName'),
      minWidth: 100,
    },
    {
      field: 'action_attribute_tags',
      title: $t('action.attribute.tags'),
      minWidth: 100,
      slots: {
        default: 'actionAttributeTags', // 自定义插槽名
      },
      showOverflow: false,
      align: 'left',
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
            show: hasAccessByCodes(['ActionAttributeUpdate']),
          },
          {
            code: 'delete',
            text: $t('common.delete'),
            show: hasAccessByCodes(['ActionAttributeDelete']),
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

<script lang="ts" setup>
import type { SystemUserApi } from '#/api/system/user';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createUser, updateUser } from '#/api/system/user';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const id = ref();
const isEditMode = ref<boolean>(false);

const formData = ref<SystemUserApi.SystemUser>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    (id.value
      ? updateUser(id.value, {
          name: values.name,
          realname: values.realname,
          status: values.status,
          password: values.password,
          role_id: values.role_id,
        })
      : createUser(values)
    )
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemUserApi.SystemUser>();
      formApi.resetForm();

      if (data?.id) {
        formData.value = data;
        id.value = data.id;
        isEditMode.value = true;
        formApi.setValues(data);
      } else {
        id.value = undefined;
        isEditMode.value = false;
      }
      updatePasswordField();
    }
  },
});

const updatePasswordField = () => {
  formApi.updateSchema([
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: $t('system.user.password'),
      componentProps: {
        // disabled: isEditMode.value,
        placeholder: `${$t('common.pleaseEnter')}${$t('system.user.password')}`,
      },
    },
  ]);
};

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.user.name'))
    : $t('common.create', $t('system.user.name'));
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    display: none;
    margin-left: 20px;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    display: flex;
    flex: auto;
    justify-content: flex-end;
    margin-left: 20px;
  }
}
</style>

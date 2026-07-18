<script lang="ts" setup>
import type { UploadProps } from 'ant-design-vue';

import type { SystemUserApi } from '#/api/system/user';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import { message, Upload } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createCourse, updateCourse } from '#/api/album/course';
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
const accessStore = useAccessStore();
const uploadHeadersRef = computed(() => {
  return {
    Authorization: String(accessStore.accessToken || ''),
  };
});
const coverFileList = ref<UploadProps['fileList']>([]);

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    console.log('valid', values);
    modalApi.lock();

    const oldItems =
      values.course_items?.filter(
        (item: any) => typeof item === 'object' && item.action_id,
      ) || [];
    const newItems =
      values.course_items
        ?.filter((item: any) => typeof item === 'number')
        .map((id: number) => ({ action_id: id })) || [];
    const submitCourseItems = [...oldItems, ...newItems];

    (id.value
      ? updateCourse(id.value, {
          name: values.name,
          course_type_id: values.course_type_id,
          course_items: submitCourseItems,
          path: values.path,
        })
      : createCourse({
          ...values,
          course_items: submitCourseItems,
        })
    )
      .then(() => {
        emits('success');
        modalApi.close();
      })
      .catch(() => {
        modalApi.unlock();
      });
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemUserApi.SystemUser>();
      formApi.resetForm();

      if (data?.id) {
        formData.value = data;
        id.value = data.id;
        isEditMode.value = true;
        // formApi.setValues(data);

        // Normalize course_items for ApiSelect
        if (data.course_items && Array.isArray(data.course_items)) {
          data.course_items = data.course_items.map((item) => item.action_id);
          // formApi.setValues({ course_items: mappedIds });
        }
        formApi.setValues(data);
        // ✅ 同步封面回显
        coverFileList.value = data.path
          ? [
              {
                uid: String(Date.now()),
                name: '封面',
                status: 'done',
                url: data.path,
              },
            ]
          : [];
      } else {
        id.value = undefined;
        isEditMode.value = false;
        coverFileList.value = []; // 新建时清空
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
        disabled: isEditMode.value,
        placeholder: `${$t('common.pleaseEnter')}${$t('system.user.password')}`,
      },
    },
  ]);
};

const getModalTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.user.name'))
    : $t('common.create', $t('system.user.name'));
});
const handleChange = async (info: any, model?: any, field?: any) => {
  if (info.file.status !== 'uploading') {
    // console.log(info.file, info.fileList);
  }
  switch (info.file.status) {
    case 'done': {
      message.success(`${info.file.name} file uploaded successfully`);

      const fileUrl = info.file.response?.data?.url || info.file.response?.url;
      if (field) {
        // 更新表单字段
        formApi.setValues({
          [field.name]: fileUrl,
        });
        // 同步更新 fileList
        switch (field.name) {
          case 'path': {
            // **关键：同步更新 fileList**
            coverFileList.value = info.fileList.map((file: any) => ({
              uid: file.uid,
              name: file.name,
              status: file.status,
              url: file.response?.data?.url || file.url, // 兼容已有回显
            }));

            break;
          }
          // No default
        }
      }

      break;
    }
    case 'error': {
      message.error(`${info.file.name} file upload failed.`);

      break;
    }
    case 'removed': {
      if (field) {
        // 清空表单字段
        formApi.setValues({
          [field.name]: '',
        });
        // 触发验证
        formApi.validateField(field.name);
        // 清空 fileList
        if (field.name === 'path') {
          coverFileList.value = [];
        }
      }

      break;
    }
    // No default
  }
};
</script>
<template>
  <Modal :title="getModalTitle" class="w-[700px]">
    <Form>
      <template #path="{ model, field }">
        <Upload
          action="/api/admin/resources/upload"
          list-type="picture-card"
          :max-count="1"
          :headers="uploadHeadersRef"
          :data="{ directory: 'actions' }"
          accept="image/*"
          v-model:file-list="coverFileList"
          @change="handleChange($event, model, field)"
        >
          <div>上传封面</div>
        </Upload>
      </template>
    </Form>
  </Modal>
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

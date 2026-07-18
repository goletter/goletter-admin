<script lang="ts" setup>
// import type { SystemUserApi } from '#/api/action/edit';

import type { UploadProps } from 'ant-design-vue';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useAccessStore, useTabbarStore } from '@vben/stores';

import { Button, message, Upload } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createAction, getDetails, updateAction } from '#/api/action/edit';
import { $t } from '#/locales';

import { useFormSchema } from './data';

// import 'ant-design-vue/es/upload/style/index.css';

const id = ref();
const isEditMode = ref<boolean>(false);
const formData = ref<any>();
const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const route = useRoute();
const router = useRouter();
const tabbarStore = useTabbarStore();
const coverFileList = ref<UploadProps['fileList']>([]);
const zhVideoFileList = ref<UploadProps['fileList']>([]);
const enVideoFileList = ref<UploadProps['fileList']>([]);

const handleSubmit = async () => {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  values.videos = [];
  if (values.video_zh) {
    values.videos.push({ lang: 'Chinese', path: values.video_zh });
  }
  if (values.video_en) {
    values.videos.push({ lang: 'English', path: values.video_en });
  }
  delete values.video_zh;
  delete values.video_en;
  try {
    await (isEditMode.value && id.value
      ? updateAction(id.value, values)
      : createAction(values));
    router.back();
    await tabbarStore.closeTab(route, router);
    router.push({ path: '/action/action' });
  } catch {
    // Optionally show error message
  }
};

const handleCancel = () => {
  tabbarStore.closeTab(route, router);
  router.push({ path: '/action/action' });
};
onMounted(async () => {
  const queryId = route.query.id;
  if (queryId) {
    id.value = queryId;
    isEditMode.value = true;
    try {
      const details = await getDetails(queryId);
      const data = details.data;

      // ✅ 把 videos 数组拆到表单需要的字段
      const zhVideo = data.videos?.find(
        (v: any) => v.lang === 'Chinese' || v.lang === 'zh',
      );
      const enVideo = data.videos?.find(
        (v: any) => v.lang === 'English' || v.lang === 'en',
      );

      formApi.setValues({
        ...data,
        is_vip: String(data.is_vip),
        video_zh: zhVideo ? zhVideo.path : '',
        video_en: enVideo ? enVideo.path : '',
      });
      // 回显 Upload
      if (data.path) {
        coverFileList.value = [
          { uid: '-1', name: 'cover.png', status: 'done', url: data.path },
        ];
      }
      if (zhVideo) {
        zhVideoFileList.value = [
          {
            uid: '-2',
            name: 'file',
            status: 'done',
            url: zhVideo.path,
          },
        ];
      }
      if (enVideo) {
        enVideoFileList.value = [
          {
            uid: '-3',
            name: 'file',
            status: 'done',
            url: enVideo.path,
          },
        ];
      }
      formData.value = data;
    } catch {
      // fallback to empty form if fetch fails
      formData.value = undefined;
    }
  } else {
    isEditMode.value = false;
    id.value = undefined;
    formData.value = undefined;
  }
});

const getModalTitle = computed(() => {
  return isEditMode.value
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
          case 'video_en': {
            enVideoFileList.value = [
              {
                uid: String(Date.now()),
                name: info.file.name,
                status: 'done',
                url: fileUrl,
              },
            ];

            break;
          }
          case 'video_zh': {
            zhVideoFileList.value = [
              {
                uid: String(Date.now()),
                name: info.file.name,
                status: 'done',
                url: fileUrl,
              },
            ];

            break;
          }
          // No default
        }
        if (info.fileList.length === 0) {
          formApi.setValues({
            [field.name]: '',
          });
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
        formApi.setValues({
          [field.name]: '',
        });
        switch (field.name) {
          case 'path': {
            coverFileList.value = [];
            break;
          }
          case 'video_en': {
            enVideoFileList.value = [];
            break;
          }
          case 'video_zh': {
            zhVideoFileList.value = [];
            break;
          }
        }
      }

      break;
    }
    // No default
  }
};
const accessStore = useAccessStore();
const uploadHeadersRef = computed(() => {
  return {
    Authorization: String(accessStore.accessToken || ''),
  };
});
</script>
<template>
  <Page auto-content-height>
    <div class="active_header bg-background text-foreground">
      {{ getModalTitle }}
    </div>
    <div class="bg-background text-foreground action_box flex flex-col">
      <Form style="width: 70%">
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
        <template #video_en="{ model, field }">
          <Upload
            action="/api/admin/resources/upload"
            list-type="picture-card"
            :max-count="1"
            :headers="uploadHeadersRef"
            :data="{ directory: 'actions' }"
            accept="video/*"
            v-model:file-list="enVideoFileList"
            @change="handleChange($event, model, field)"
          >
            <div>上传视频</div>
          </Upload>
        </template>
        <template #video_zh="{ model, field }">
          <Upload
            action="/api/admin/resources/upload"
            list-type="picture-card"
            :max-count="1"
            :headers="uploadHeadersRef"
            :data="{ directory: 'actions' }"
            accept="video/*"
            v-model:file-list="zhVideoFileList"
            @change="handleChange($event, model, field)"
          >
            <div>上传视频</div>
          </Upload>
        </template>
      </Form>
      <div class="flex" style="margin-top: 50px">
        <Button class="mr-10" size="large" @click="handleCancel">取消</Button>
        <Button type="primary" size="large" @click="handleSubmit">确定</Button>
      </div>
    </div>
  </Page>
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
.action_box {
  /* background: #fff; */
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 4rem;
}
.active_header {
  font-size: 1.2rem;
  /* background: #fff; */
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
}
</style>

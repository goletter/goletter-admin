<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { QuillEditor } from '@vueup/vue-quill';
import { Button, message } from 'ant-design-vue';

import { getDetails, updatePolicy } from '#/api/content/user';
import { $t } from '#/locales';

import '@vueup/vue-quill/dist/vue-quill.snow.css';

const { hasAccessByCodes } = useAccess();

const content = ref<any>(''); // 建议初始化为空字符串
const contentId = ref<any>(''); // 建议初始化为空字符串

onMounted(async () => {
  try {
    const res = await getDetails({ mark: 'privacy' });
    contentId.value = res?.data?.id;
    content.value = res?.data?.content || '';
  } catch (error) {
    console.error('获取协议失败', error);
  }
});

async function handleSave() {
  try {
    await updatePolicy(contentId.value, { content: content.value });
    message.success($t('content.user.toast1'));
  } catch {
    // console.error('更新协议失败', error);
    message.error($t('content.user.toast2'));
  }
}
</script>

<template>
  <Page auto-content-height>
    <div class="active_header bg-background text-foreground">
      {{ $t('content.privacy.title') }}
    </div>
    <div class="bg-background p-5">
      <template v-if="hasAccessByCodes(['ArticleTypeList'])">
        <QuillEditor
          v-model:content="content"
          content-type="html"
          style="height: 800px"
          theme="snow"
        />
        <div class="flex" style="margin: 50px 0 30px">
          <Button type="primary" class="mr-10" size="large" @click="handleSave">
            {{ $t('content.user.btn') }}
          </Button>
        </div>
      </template>
    </div>
  </Page>
</template>
<style lang="css" scoped>
.active_header {
  font-size: 1.2rem;
  /* background: #fff; */
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
}
</style>

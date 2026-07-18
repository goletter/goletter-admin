<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';

import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useTabbarStore } from '@vben/stores';

import {
  Button,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Radio,
  RadioGroup,
  Select,
  TabPane,
  Tabs,
  Tag,
} from 'ant-design-vue';

import { getClassList } from '#/api/action/classification';
import {
  createTemplate,
  getTemplateDetails,
  updateTemplate,
} from '#/api/template/template';

const route = useRoute();
const router = useRouter();
const tabbarStore = useTabbarStore();
const getModalTitle = ref(false);

const mainFormRef = ref<FormInstance>();

const rules: Record<string, any> = {
  name: [{ required: true, message: '必填项', trigger: 'change' }],
  warmup: [
    { type: 'array', required: true, message: '必填项', trigger: 'change' },
  ],
  main: [
    { type: 'array', required: true, message: '必填项', trigger: 'change' },
  ],
  relax: [
    { type: 'array', required: true, message: '必填项', trigger: 'change' },
  ],
  duration: [{ required: true, message: '必填项', trigger: 'change' }],
  minCount: [{ required: true, message: '必填项', trigger: 'change' }],
  maxCount: [{ required: true, message: '必填项', trigger: 'change' }],
};

const formState = reactive({
  name: '',
  warmup: [] as string[],
  main: [] as string[],
  relax: [] as string[],
  configs: [] as Array<{
    duration: null | number;
    mainRules: Record<string, string>;
    maxCount: null | number;
    minCount: null | number;
    relaxCount: Record<string, number>;
    warmupCount: Record<string, number>;
  }>,
});

// 动态获取课程分类列表
const classList = ref<Array<{ label: string; stage: string; value: string }>>(
  [],
);

// 记录已选中的所有 value
const selectedIds = computed(() => [
  ...(formState.warmup || []),
  ...(formState.main || []),
  ...(formState.relax || []),
]);

const fetchClassList = async () => {
  try {
    const res = await getClassList({ pageSize: 10_000 });
    // 假设返回的数据结构为 { data: Array }
    classList.value =
      res && Array.isArray(res.data)
        ? res.data.map((item: any) => ({
            label: item.name,
            value: item.id.toString(),
            stage: '',
          }))
        : [];
    // console.log(classList.value);
  } catch {
    classList.value = [];
  }
};

onMounted(async () => {
  await fetchClassList();
  const id = route.query.id;
  if (id) {
    getModalTitle.value = true;
    try {
      const res = await getTemplateDetails(id, {
        include: 'templateItems',
      });
      if (res && res.data) {
        const data = res.data;
        formState.name = data.name || '';
        formState.warmup = (data.warm || []).map((cid: any) => cid.toString());
        formState.main = (data.main || []).map((cid: any) => cid.toString());
        formState.relax = (data.relax || []).map((cid: any) => cid.toString());
        formState.configs = (data.template_items || []).map((item: any) => ({
          id: item.id, // 新增
          duration: item.total_duration || null,
          minCount: item.min_num || null,
          maxCount: item.max_num || null,
          warmupCount: (item.warm || []).reduce(
            (acc: Record<string, number>, cur: any) => {
              acc[cur.action_category_id.toString()] = cur.number;
              return acc;
            },
            {},
          ),
          mainRules: (item.main || []).reduce(
            (acc: Record<string, string>, cur: any) => {
              acc[cur.action_category_id.toString()] = cur.value;
              return acc;
            },
            {},
          ),
          relaxCount: (item.relax || []).reduce(
            (acc: Record<string, number>, cur: any) => {
              acc[cur.action_category_id.toString()] = cur.number;
              return acc;
            },
            {},
          ),
        }));
      }
    } catch (error) {
      console.error('getTemplateDetails error:', error);
    }
  }
});
function getOptionsForStage(stage: string) {
  return classList.value.map((opt) => {
    const isSelectedInCurrentStage = formState[stage]?.includes(opt.value);
    const isSelectedInOtherStage =
      selectedIds.value.includes(opt.value) && !isSelectedInCurrentStage;
    return {
      label: opt.label,
      value: opt.value,
      disabled: isSelectedInOtherStage,
    };
  });
}
const activeConfig = ref('0');

function addConfig() {
  formState.configs.push({
    duration: null,
    minCount: null,
    maxCount: null,
    warmupCount: {} as Record<string, number>,
    mainRules: {} as Record<string, string>,
    relaxCount: {} as Record<string, number>,
  });
  activeConfig.value = (formState.configs.length - 1).toString();
}

function handleEdit(targetKey: string, action: 'add' | 'remove') {
  if (action === 'remove') {
    const index = formState.configs.findIndex(
      (_, i) => i.toString() === targetKey,
    );
    if (index !== -1) {
      formState.configs.splice(index, 1);
      // 调整 activeConfig
      if (formState.configs.length === 0) {
        activeConfig.value = '0';
      } else if (Number(activeConfig.value) >= formState.configs.length) {
        activeConfig.value = (formState.configs.length - 1).toString();
      }
    }
  } else if (action === 'add') {
    addConfig();
  }
}

async function onSubmit() {
  try {
    await mainFormRef.value?.validate();
  } catch {
    return;
  }
  if (formState.configs.length === 0) {
    message.warning({ content: '请至少添加一个时长配置' });
    return;
  }
  // 新增校验所有配置项必须完整填写
  for (const config of formState.configs) {
    if (
      config.duration == null ||
      config.minCount == null ||
      config.maxCount == null
    ) {
      message.warning({ content: '请完整填写所有配置项' });
      return;
    }
  }
  const templateItems = formState.configs.map((config: any) => {
    const warmArr = (formState.warmup || []).map((cid) => ({
      action_category_id: cid,
      number: config.warmupCount?.[cid] ?? 1,
    }));
    const mainArr = (formState.main || []).map((cid) => ({
      action_category_id: cid,
      value: config.mainRules?.[cid] ?? '中',
    }));
    const relaxArr = (formState.relax || []).map((cid) => ({
      action_category_id: cid,
      number: config.relaxCount?.[cid] ?? 1,
    }));

    const item: any = {
      total_duration: config.duration,
      min_num: config.minCount,
      max_num: config.maxCount,
      warm: warmArr,
      main: mainArr,
      relax: relaxArr,
    };

    if (config.id) {
      item.id = config.id;
    }

    return item;
  });

  const params: any = {
    name: formState.name,
    warm: formState.warmup,
    main: formState.main,
    relax: formState.relax,
    status: 1,
    template_items: templateItems,
  };

  try {
    const id = route.query.id;
    const result = await (id
      ? updateTemplate(id, params)
      : createTemplate(params));
    // console.log('submit result:', result);
    tabbarStore.closeTab(route, router);
    router.push({ path: '/template' });
  } catch (error) {
    console.error('submit error:', error);
  }
}
const handleCancel = () => {
  tabbarStore.closeTab(route, router);
  router.push({ path: '/template' });
};
</script>
<template>
  <Page auto-content-height>
    <div
      class="active_header bg-background text-foreground font-semboild mb-5 p-5 pb-5 text-xl tracking-tight"
    >
      {{ getModalTitle ? $t('common.edit') : $t('common.create') }}
    </div>
    <div class="bg-background p-5">
      <div class="bor-1 font-semboild mb-5 pb-5 text-xl tracking-tight">
        基础信息
      </div>
      <Form :model="formState" ref="mainFormRef" :rules="rules">
        <FormItem
          label="模板名称"
          name="name"
          :rules="[{ required: true, message: '必填项' }]"
        >
          <Input v-model:value="formState.name" placeholder="请输入模板名称" />
        </FormItem>
        <div
          class="font-semboild bor-1 bor-2 mb-5 pb-5 pt-5 text-xl tracking-tight"
        >
          课程结构配置
        </div>
        <FormItem
          label="热身阶段"
          name="warmup"
          :rules="[{ required: true, message: '必填项' }]"
        >
          <Select
            v-model:value="formState.warmup"
            mode="multiple"
            placeholder="请选择热身阶段"
            :options="getOptionsForStage('warmup')"
          />
        </FormItem>
        <FormItem
          label="主体阶段"
          name="main"
          :rules="[{ required: true, message: '必填项' }]"
        >
          <Select
            v-model:value="formState.main"
            mode="tags"
            placeholder="请选择主体阶段"
            :options="getOptionsForStage('main')"
          />
        </FormItem>
        <FormItem
          label="放松阶段"
          name="relax"
          :rules="[{ required: true, message: '必填项' }]"
        >
          <Select
            v-model:value="formState.relax"
            placeholder="请选择放松阶段"
            mode="multiple"
            :options="getOptionsForStage('relax')"
          />
        </FormItem>
      </Form>

      <div
        class="font-semboild bor-1 bor-2 mt-5 pb-5 pt-5 text-xl tracking-tight"
      >
        时长配置
        <Button type="primary" style="margin-left: 1rem" @click="addConfig">
          添加配置
        </Button>
      </div>

      <Tabs
        v-model:active-key="activeConfig"
        type="editable-card"
        style="margin-top: 1rem"
        @edit="handleEdit"
      >
        <TabPane
          v-for="(config, index) in formState.configs"
          :key="index.toString()"
          :tab="`配置 ${index + 1}`"
        >
          <Form :model="config" :rules="rules">
            <div class="flex">
              <FormItem
                label="当课程时长为"
                name="duration"
                style="margin-right: 1rem"
                :rules="[{ required: true, message: '必填项' }]"
              >
                <Select
                  v-model:value="config.duration"
                  placeholder="请选择时长"
                  :options="[
                    { label: '10', value: 10 },
                    { label: '20', value: 20 },
                    { label: '30', value: 30 },
                    { label: '40', value: 40 },
                    { label: '50', value: 50 },
                    { label: '60', value: 60 },
                  ]"
                />
              </FormItem>
              <FormItem label="分钟时，显示">
                <div style="display: flex; align-items: center">
                  <FormItem name="minCount" style="margin: 0 1rem 0 0">
                    <InputNumber
                      v-model:value="config.minCount"
                      placeholder="最小值"
                      min="1"
                    />
                  </FormItem>

                  <!-- 中间的“至” -->
                  <!-- -->

                  <FormItem name="maxCount" style="margin: 0 1rem 0 0">
                    <span style="margin: 0 1rem; line-height: 32px">至</span>
                    <InputNumber
                      v-model:value="config.maxCount"
                      placeholder="最大值"
                      min="1"
                    />
                    <span style="margin: 0 1rem">个动作影片</span>
                  </FormItem>
                </div>
              </FormItem>
            </div>

            <FormItem label="热身阶段">
              <div
                v-for="w in formState.warmup"
                :key="w"
                style="display: flex; align-items: center; margin-bottom: 1rem"
              >
                <Tag color="blue">
                  {{ classList.find((o) => o.value === w)?.label || w }}
                </Tag>
                <InputNumber
                  v-model:value="config.warmupCount[w]"
                  placeholder="数量"
                  style="width: 100px"
                  min="1"
                />
                <span style="margin-left: 1rem">个</span>
              </div>
            </FormItem>

            <FormItem label="主体阶段">
              <div
                v-for="m in formState.main"
                :key="m"
                style="margin-bottom: 1rem"
                class="flex items-center"
              >
                <Tag color="blue">
                  {{ classList.find((o) => o.value === m)?.label || m }}
                </Tag>
                <RadioGroup
                  v-model:value="config.mainRules[m]"
                  style="display: flex; gap: 1rem; margin-top: 0.25rem"
                >
                  <Radio value="多">多出现</Radio>
                  <Radio value="中">平均出现</Radio>
                  <Radio value="少">少出现</Radio>
                  <Radio value="无">不出现</Radio>
                </RadioGroup>
              </div>
            </FormItem>

            <FormItem label="放松阶段">
              <div
                v-for="r in formState.relax"
                :key="r"
                style="display: flex; align-items: center; margin-bottom: 1rem"
              >
                <Tag color="blue">
                  {{ classList.find((o) => o.value === r)?.label || r }}
                </Tag>
                <InputNumber
                  v-model:value="config.relaxCount[r]"
                  placeholder="数量"
                  style="width: 100px"
                  min="1"
                />
                <span style="margin-left: 1rem">个</span>
              </div>
            </FormItem>
          </Form>
        </TabPane>
      </Tabs>

      <div style="margin-top: 2rem" class="flex justify-center">
        <Button size="large" @click="handleCancel" class="mr-5">取消</Button>
        <Button size="large" type="primary" @click="onSubmit">提交</Button>
      </div>
    </div>
  </Page>
</template>
<style lang="scss" scoped>
.bor-1 {
  border-bottom: 1px solid rgba(10, 10, 37, 0.11);
}
.bor-2 {
  border-top: 1px solid rgba(10, 10, 37, 0.11);
}
</style>

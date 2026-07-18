<script setup lang="ts">
import { Button, Input } from 'ant-design-vue';

const props = defineProps<{ modelValue?: any[] }>();
const emit = defineEmits(['update:modelValue']);

function addTag() {
  emit('update:modelValue', [...(props.modelValue || []), { name: '' }]);
}
function removeTag(index: number) {
  const newTags = [...(props.modelValue || [])];
  newTags.splice(index, 1);
  emit('update:modelValue', newTags);
}
</script>

<template>
  <div>
    <Button type="primary" @click="addTag">
      {{ $t('ui.actionTitle.create') }}
    </Button>

    <div v-for="(tag, index) in modelValue || []" :key="index" class="tag-item">
      <Input
        v-model:value="tag.name"
        :placeholder="$t('common.pleaseEnter') + $t('action.attribute.tag')"
      />
      <Button
        danger
        type="text"
        @click="removeTag(index)"
        style="margin-left: 5px"
      >
        删除
      </Button>
    </div>
  </div>
</template>

<style scoped>
.tag-item {
  display: flex;
  align-items: center;
  margin-top: 8px;
}
.tag-item .ant-input {
  flex: 1;
}
</style>

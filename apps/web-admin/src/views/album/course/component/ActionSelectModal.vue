<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

defineEmits(['update:actions']);

const [Modal, modalApi] = useVbenModal({ title: '选择动作', width: 800 });

const selectedRowKeys = ref<number[]>([]);
const actionList = ref<any[]>([]);

const open = (selected: number[]) => {
  selectedRowKeys.value = selected;
  modalApi.open();
};

const handleOk = () => {
  emit('update:actions', selectedRowKeys.value);
  modalApi.close();
};

const onSelectChange = (selectedKeys: number[]) => {
  selectedRowKeys.value = selectedKeys;
};
</script>

<template>
  <Modal @ok="handleOk">
    <a-table
      row-key="id"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      :data-source="actionList"
      :columns="[]"
    />
  </Modal>
</template>

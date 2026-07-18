<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const props = defineProps<{
  height?: string;
  seriesData: number[];
  xData: string[];
}>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);
watch(
  () => [props.xData, props.seriesData] as const,
  ([newX, newY]) => {
    if (newX.length > 0 && newY.length > 0) {
      renderEcharts({
        grid: {
          bottom: 0,
          containLabel: true,
          left: '1%',
          right: '1%',
          top: '5%',
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'category', data: newX },
        yAxis: { type: 'value', splitNumber: 4 },
        series: [
          {
            name: '订阅金额$',
            type: 'bar',
            barGap: 0,
            barMaxWidth: 50,
            data: newY,
          },
        ],
      });
    }
  },
  { immediate: true },
);
</script>

<template>
  <EchartsUI :height="height ?? '400px'" ref="chartRef" />
</template>

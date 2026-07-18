<script lang="ts" setup>
import { ref, watch } from 'vue';

import { AnalysisChartCard, AnalysisOverview2 } from '@vben/common-ui';
import { SvgCakeIcon, SvgCardIcon } from '@vben/icons';

import { DatePicker } from 'ant-design-vue';
import dayjs from 'dayjs';

import { getCombined, getInfo } from '#/api/analytics/index';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsVisitsMoney from './analytics-visits-money.vue';
import AnalyticsVisits from './analytics-visits.vue';

const selectedRange = ref<[any, any]>([dayjs().subtract(6, 'day'), dayjs()]);
const { RangePicker } = DatePicker;

const overviewItems = ref<any[]>([
  {
    icon: SvgCardIcon,
    title: '今日订阅次数',
    value: 0,
    totalTitle: '总订阅次数',
    totalValue: 0,
  },
  {
    icon: SvgCakeIcon,
    title: '今日营收金额',
    value: 0,
    totalTitle: '累计营收金额',
    totalValue: 0,
  },
  {
    icon: SvgCakeIcon,
    title: '7日新增用户',
    value: 0,
    totalTitle: '总用户数',
    totalValue: 0,
  },
  {
    icon: SvgCakeIcon,
    title: '7日活跃用户量',
    value: 0,
    totalTitle: '日活跃量',
    totalValue: 0,
  },
]);
const xData = ref<string[]>([]);
const seriesData = ref<number[]>([]);
const xDataUser = ref<string[]>([]);
const seriesDataUser = ref<number[]>([]);
const seriesData2 = ref<number[]>([]);
const totalUserCount = ref(0);
const totalUserMoney = ref(0);

watch(
  selectedRange,
  async (newRange) => {
    try {
      const [infoRes, combinedRes] = await Promise.all([
        getInfo(),
        getCombined({
          date_at: [
            newRange[0].format('YYYY-MM-DD'),
            newRange[1].format('YYYY-MM-DD'),
          ],
        }),
      ]);

      // 订阅数据统计（兼容数组或对象形式的 extends）
      const extendsRaw = infoRes.data?.extends;
      const extendsList = Array.isArray(extendsRaw)
        ? extendsRaw
        : extendsRaw && typeof extendsRaw === 'object'
          ? Object.values(extendsRaw)
          : [];

      if (extendsList.length > 0) {
        xData.value = extendsList.map((item: any) => item.name);
        seriesData.value = extendsList.map((item: any) => item.user_count);
        seriesData2.value = extendsList.map((item: any) => item.user_money);
        totalUserCount.value = extendsList.reduce(
          (sum: number, item: any) => sum + Number(item.user_count),
          0,
        );
        totalUserMoney.value = extendsList.reduce(
          (sum: number, item: any) => sum + Number(item.user_money),
          0,
        );
      }

      // 卡片数据统计（useTransition 需要 number，接口常返回字符串）
      const toNum = (v: unknown) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };
      overviewItems.value = [
        {
          icon: SvgCardIcon,
          title: '今日订阅次数',
          value: toNum(infoRes.data?.payment_count),
          totalTitle: '总订阅次数',
          totalValue: toNum(infoRes.data?.payment_total_count),
        },
        {
          icon: SvgCakeIcon,
          title: '今日营收金额',
          value: toNum(infoRes.data?.payment_amount),
          totalTitle: '累计营收金额',
          totalValue: toNum(infoRes.data?.payment_total_amount),
        },
        {
          icon: SvgCakeIcon,
          title: '7日新增用户',
          value: toNum(infoRes.data?.register_count),
          totalTitle: '总用户数',
          totalValue: toNum(infoRes.data?.register_total_count),
        },
        {
          icon: SvgCakeIcon,
          title: '7日活跃用户量',
          value: toNum(infoRes.data?.active_total_count),
          totalTitle: '日活跃量',
          totalValue: toNum(infoRes.data?.active_count),
        },
      ];

      // 活跃用户数据统计
      const combinedData = combinedRes.data ?? {};
      xDataUser.value = Array.isArray(combinedData.name)
        ? combinedData.name
        : [];
      seriesDataUser.value = Array.isArray(combinedData.active_total_count)
        ? combinedData.active_total_count
        : [];
    } catch (error) {
      console.error('获取数据失败', error);
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="p-5">
    <AnalysisOverview2 :items="overviewItems" />
    <div class="mt-5 w-full md:flex">
      <AnalysisChartCard
        class="mt-5 md:mr-4 md:mt-0 md:w-1/2"
        :title="`订阅数据统计（总人数：${totalUserCount}人）`"
      >
        <AnalyticsVisits :x-data="xData" :series-data="seriesData" />
      </AnalysisChartCard>
      <AnalysisChartCard
        class="mt-5 md:mt-0 md:w-1/2"
        :title="`订阅数据统计（总金额：$${totalUserMoney}）`"
      >
        <AnalyticsVisitsMoney :x-data="xData" :series-data="seriesData2" />
      </AnalysisChartCard>
    </div>
    <AnalysisChartCard class="mt-5" title="活跃用户趋势">
      <div class="mb-4">
        <RangePicker
          v-model:value="selectedRange"
          :allow-clear="false"
          format="YYYY-MM-DD"
        />
      </div>
      <AnalyticsTrends :x-data="xDataUser" :series-data="seriesDataUser" />
    </AnalysisChartCard>
  </div>
</template>

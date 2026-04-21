<template>
  <div class="page">
    <BabyHeader />

    <!-- 主要睡眠时长卡片 -->
    <div class="hero-card">
      <div class="hero-label">昨日总睡眠</div>
      <div class="hero-value">{{ fmtDuration(metrics.total) }}</div>
      <div class="hero-subtitle">{{ yesterdayDate }}</div>
    </div>

    <!-- 睡眠指标网格 -->
    <div class="metrics-grid">
      <div class="metric-card metric-night">
        <div class="metric-icon">🌙</div>
        <div class="metric-value">{{ fmtDuration(metrics.night) }}</div>
        <div class="metric-label">夜间睡眠</div>
      </div>
      <div class="metric-card metric-day">
        <div class="metric-icon">☀️</div>
        <div class="metric-value">{{ fmtDuration(metrics.day) }}</div>
        <div class="metric-label">白天小睡</div>
      </div>
      <div class="metric-card metric-soothe">
        <div class="metric-icon">🍼</div>
        <div class="metric-value">{{ fmtDuration(metrics.avgSoothe) }}</div>
        <div class="metric-label">平均哄睡</div>
      </div>
      <div class="metric-card metric-interval">
        <div class="metric-icon">⏱️</div>
        <div class="metric-value">{{ fmtDuration(metrics.avgInterval) }}</div>
        <div class="metric-label">睡眠间隔</div>
      </div>
    </div>

    <!-- 睡眠分布图表 -->
    <div class="chart-card">
      <div class="chart-header">
        <div class="chart-title">24小时睡眠分布</div>
        <div class="chart-subtitle">睡眠与清醒时段</div>
      </div>
      <div ref="distributionChartRef" class="chart-container"></div>
    </div>

    <!-- 趋势图表 -->
    <div class="chart-card">
      <div class="chart-header">
        <div class="chart-title">近7日睡眠趋势</div>
        <div class="chart-subtitle">每日总睡眠时长</div>
      </div>
      <div ref="trendChartRef" class="chart-container chart-trend"></div>
    </div>
  </div>

  <AppTabbar />
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import BabyHeader from '../components/BabyHeader.vue'
import AppTabbar from '../components/AppTabbar.vue'
import { useSleepStore } from '../stores/sleep'
import { fmtDuration } from '../utils/sleepMetrics'
import type { ECharts } from 'echarts'

const store = useSleepStore()
const distributionChartRef = ref<HTMLDivElement | null>(null)
const trendChartRef = ref<HTMLDivElement | null>(null)
let distributionChart: ECharts | null = null
let trendChart: ECharts | null = null

const metrics = computed(() => store.yesterdayMetrics)
const yesterdayDate = computed(() => dayjs().subtract(1, 'day').format('M月D日 dddd'))

function renderCharts() {
  if (!distributionChartRef.value || !trendChartRef.value) return

  if (!distributionChart) {
    distributionChart = echarts.init(distributionChartRef.value)
  }
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  // 睡眠分布图表 - 使用渐变色和圆角
  distributionChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['睡眠', '清醒'],
      top: 0,
      textStyle: { color: '#6b7280', fontSize: 12 }
    },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: metrics.value.distribution.labels,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#9ca3af', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      axisLabel: { color: '#9ca3af', fontSize: 11 }
    },
    series: [
      {
        name: '睡眠',
        type: 'bar',
        data: metrics.value.distribution.sleep,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#818cf8' },
            { offset: 1, color: '#6366f1' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '40%'
      },
      {
        name: '清醒',
        type: 'bar',
        data: metrics.value.distribution.awake,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#fbbf24' },
            { offset: 1, color: '#f59e0b' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '40%'
      }
    ]
  })

  // 趋势图表 - 使用面积图和渐变
  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>${data.seriesName}: ${data.value.toFixed(1)}小时`
      }
    },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: metrics.value.weeklySleepHours.map((item) => item.day),
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#9ca3af', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      axisLabel: { color: '#9ca3af', fontSize: 11 }
    },
    series: [
      {
        name: '睡眠时长',
        type: 'line',
        smooth: true,
        data: metrics.value.weeklySleepHours.map((item) => item.hours),
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#6366f1',
          borderWidth: 2,
          borderColor: '#fff'
        },
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#818cf8' },
            { offset: 1, color: '#6366f1' }
          ])
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(129, 140, 248, 0.3)' },
            { offset: 1, color: 'rgba(129, 140, 248, 0.05)' }
          ])
        }
      }
    ]
  })
}

onMounted(async () => {
  await store.loadAll()
  await nextTick()
  renderCharts()
  window.addEventListener('resize', renderCharts)
})

watch(metrics, async () => {
  await nextTick()
  renderCharts()
})
</script>

<style scoped>
/* 主要睡眠时长卡片 */
.hero-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 32px 24px;
  margin: 16px;
  text-align: center;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.hero-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.hero-value {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 4px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 13px;
  opacity: 0.85;
  font-weight: 400;
}

/* 指标网格 */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 16px 16px;
}

.metric-card {
  background: white;
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
}

.metric-card:active {
  transform: scale(0.98);
}

.metric-icon {
  font-size: 28px;
  margin-bottom: 8px;
  line-height: 1;
}

.metric-value {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #1f2937;
}

.metric-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

/* 不同指标的颜色 */
.metric-night .metric-value {
  color: #3b82f6;
}

.metric-day .metric-value {
  color: #a855f7;
}

.metric-soothe .metric-value {
  color: #10b981;
}

.metric-interval .metric-value {
  color: #f59e0b;
}

/* 图表卡片 */
.chart-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin: 0 16px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f3f4f6;
}

.chart-header {
  margin-bottom: 16px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.chart-subtitle {
  font-size: 12px;
  color: #9ca3af;
}

.chart-container {
  height: 240px;
}

.chart-trend {
  height: 200px;
}

/* 响应式调整 */
@media (max-width: 375px) {
  .hero-value {
    font-size: 42px;
  }

  .metrics-grid {
    gap: 10px;
  }

  .metric-card {
    padding: 16px 12px;
  }

  .metric-icon {
    font-size: 24px;
  }

  .metric-value {
    font-size: 18px;
  }
}
</style>

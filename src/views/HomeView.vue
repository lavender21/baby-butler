<template>
  <div class="page">
    <div class="section-card">
      <div style="display: flex; align-items: center; justify-content: space-between">
        <div>
          <div style="font-size: 20px; font-weight: 700">{{ store.profile.name || '宝宝' }}</div>
          <div class="value-sub">{{ store.ageText }}</div>
        </div>
        <van-tag type="primary" round>昨日睡眠概览</van-tag>
      </div>

      <div style="margin: 16px 0 6px; text-align: center">
        <div class="value-strong">{{ fmtDuration(metrics.total) }}</div>
        <div class="value-sub">总睡眠时长</div>
      </div>

      <div class="grid-metric">
        <div class="metric-item"><b>{{ fmtDuration(metrics.night) }}</b><span>夜间睡眠</span></div>
        <div class="metric-item"><b>{{ fmtDuration(metrics.day) }}</b><span>白天小睡</span></div>
        <div class="metric-item"><b>{{ fmtDuration(metrics.avgSoothe) }}</b><span>平均哄睡</span></div>
        <div class="metric-item"><b>{{ fmtDuration(metrics.avgInterval) }}</b><span>平均间隔</span></div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">睡眠/清醒分布</div>
      <div ref="distributionChartRef" style="height: 220px"></div>
    </div>

    <div class="section-card">
      <div class="section-title">近7日睡眠趋势</div>
      <div ref="trendChartRef" style="height: 180px"></div>
    </div>
  </div>

  <van-tabbar route>
    <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
    <van-tabbar-item to="/record" icon="clock-o">记录</van-tabbar-item>
    <van-tabbar-item to="/history" icon="records-o">历史</van-tabbar-item>
    <van-tabbar-item to="/profile" icon="manager-o">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import * as echarts from 'echarts'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useSleepStore } from '../stores/sleep'
import { fmtDuration } from '../utils/sleepMetrics'

const store = useSleepStore()
const distributionChartRef = ref(null)
const trendChartRef = ref(null)
let distributionChart
let trendChart

const metrics = computed(() => store.yesterdayMetrics)

function renderCharts() {
  if (!distributionChartRef.value || !trendChartRef.value) return

  if (!distributionChart) {
    distributionChart = echarts.init(distributionChartRef.value)
  }
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  distributionChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['睡眠', '清醒'] },
    grid: { left: 30, right: 16, top: 36, bottom: 24 },
    xAxis: { type: 'category', data: metrics.value.distribution.labels },
    yAxis: { type: 'value' },
    series: [
      { name: '睡眠', type: 'bar', data: metrics.value.distribution.sleep, itemStyle: { color: '#5b6dff' } },
      { name: '清醒', type: 'bar', data: metrics.value.distribution.awake, itemStyle: { color: '#f3c04f' } }
    ]
  })

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 20, right: 20, top: 12, bottom: 20 },
    xAxis: { type: 'category', data: metrics.value.weeklySleepHours.map((item) => item.day) },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'line',
        smooth: true,
        data: metrics.value.weeklySleepHours.map((item) => item.hours),
        itemStyle: { color: '#4f67ff' },
        areaStyle: { color: 'rgba(79,103,255,0.15)' }
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
.grid-metric {
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.metric-item {
  background: #f2f5ff;
  border-radius: 12px;
  padding: 10px;
  text-align: center;
}

.metric-item b {
  display: block;
  color: #4f67ff;
  margin-bottom: 4px;
}

.metric-item span {
  color: #6f7787;
  font-size: 12px;
}
</style>

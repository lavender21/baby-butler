<template>
  <div class="page">
    <van-nav-bar title="睡眠记录" />

    <div v-if="store.records.length" class="section-card" style="padding: 6px 14px">
      <van-cell
        v-for="item in store.records"
        :key="item.id"
        :title="formatDate(item.sleepStart)"
        :label="`哄睡 ${formatTime(item.sootheStart)} → 睡着 ${formatTime(item.sleepStart)} → 睡醒 ${formatTime(item.sleepEnd)}`"
        :value="sleepDuration(item)"
      />
    </div>

    <van-empty v-else description="还没有睡眠记录" />
  </div>

  <van-tabbar route>
    <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
    <van-tabbar-item to="/record" icon="clock-o">记录</van-tabbar-item>
    <van-tabbar-item to="/history" icon="records-o">历史</van-tabbar-item>
    <van-tabbar-item to="/profile" icon="manager-o">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import dayjs from 'dayjs'
import { onMounted } from 'vue'
import { useSleepStore } from '../stores/sleep'
import { fmtDuration } from '../utils/sleepMetrics'

const store = useSleepStore()

function formatDate(time) {
  return dayjs(time).format('MM-DD dddd')
}

function formatTime(time) {
  return dayjs(time).format('HH:mm')
}

function sleepDuration(item) {
  return fmtDuration(dayjs(item.sleepEnd).diff(dayjs(item.sleepStart), 'minute'))
}

onMounted(async () => {
  if (!store.records.length) {
    await store.loadAll()
  }
})
</script>

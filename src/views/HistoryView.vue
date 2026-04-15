<template>
  <div class="page">
    <BabyHeader title="睡眠记录" />

    <div v-if="store.records.length" class="section-card" style="padding: 6px 14px">
      <van-cell v-for="item in store.records" :key="item.id">
        <template #title>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px">
            <div style="font-weight: 600">{{ formatDate(item.sleepStart) }}</div>
            <div class="tag-row">
              <van-tag type="warning" plain>哄睡 {{ sootheDuration(item) }}</van-tag>
              <van-tag type="primary" plain>睡眠 {{ sleepDuration(item) }}</van-tag>
            </div>
          </div>
        </template>
        <template #label>
          <span class="value-sub">
            {{ `哄睡 ${formatTime(item.sootheStart)} → 睡着 ${formatTime(item.sleepStart)} → 睡醒 ${formatTime(item.sleepEnd)}` }}
          </span>
        </template>
      </van-cell>
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

<script setup lang="ts">
import dayjs from 'dayjs'
import { onMounted } from 'vue'
import BabyHeader from '../components/BabyHeader.vue'
import { useSleepStore } from '../stores/sleep'
import { fmtDuration } from '../utils/sleepMetrics'
import type { SleepRecord } from '../types/sleep'

const store = useSleepStore()

function formatDate(time: string): string {
  return dayjs(time).format('MM-DD dddd')
}

function formatTime(time: string): string {
  return dayjs(time).format('HH:mm')
}

function sleepDuration(item: SleepRecord): string {
  return fmtDuration(dayjs(item.sleepEnd).diff(dayjs(item.sleepStart), 'minute'))
}

function sootheDuration(item: SleepRecord): string {
  return fmtDuration(dayjs(item.sleepStart).diff(dayjs(item.sootheStart), 'minute'))
}

onMounted(async () => {
  if (!store.records.length) {
    await store.loadAll()
  }
})
</script>

<style scoped>
.tag-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
</style>

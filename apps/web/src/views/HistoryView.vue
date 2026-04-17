<template>
  <div class="page">
    <BabyHeader title="睡眠记录" />

    <div v-if="groupedRecords.length" class="history-container">
      <div v-for="group in groupedRecords" :key="group.date" class="date-group">
        <div class="group-title">
          {{ group.dateText }}
        </div>
        <div class="records-list">
          <div v-for="item in group.records" :key="item.id" class="record-card">
            <div class="card-content">
              <div class="left-info">
                <div class="soothe-info">
                  <span class="label">哄睡</span>
                  <span class="value">{{ sootheDuration(item) }}</span>
                </div>
                <div class="sleep-info">
                  <span class="label">睡眠</span>
                  <span class="value">{{ sleepDuration(item) }}</span>
                </div>
              </div>
              <div class="right-info">
                <van-tag v-if="isNaiSleep(item)" type="success" class="nai-tag">奶睡</van-tag>
                <div class="time-detail">
                  {{ formatTime(item.sootheStart) }} → {{ formatTime(item.sleepStart) }} → {{ formatTime(item.sleepEnd) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <van-empty v-else description="还没有睡眠记录" />
  </div>

  <AppTabbar />
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, onMounted } from 'vue'
import BabyHeader from '../components/BabyHeader.vue'
import AppTabbar from '../components/AppTabbar.vue'
import { useSleepStore } from '../stores/sleep'
import { fmtDuration } from '../utils/sleepMetrics'
import type { SleepRecord } from '../types/sleep'

const store = useSleepStore()

interface DateGroup {
  date: string
  dateText: string
  records: SleepRecord[]
}

const groupedRecords = computed<DateGroup[]>(() => {
  const groups = new Map<string, SleepRecord[]>()
  
  store.records.forEach(record => {
    const date = dayjs(record.sleepStart).format('YYYY-MM-DD')
    if (!groups.has(date)) {
      groups.set(date, [])
    }
    groups.get(date)!.push(record)
  })
  
  return Array.from(groups.entries()).map(([date, records]) => ({
    date,
    dateText: dayjs(date).format('MM-DD dddd'),
    records
  }))
})

function formatTime(time: string): string {
  return dayjs(time).format('HH:mm')
}

function sleepDuration(item: SleepRecord): string {
  return fmtDuration(dayjs(item.sleepEnd).diff(dayjs(item.sleepStart), 'minute'))
}

function sootheDuration(item: SleepRecord): string {
  return fmtDuration(dayjs(item.sleepStart).diff(dayjs(item.sootheStart), 'minute'))
}

function isNaiSleep(item: SleepRecord): boolean {
  return item.sootheStart === item.sleepStart
}

onMounted(async () => {
  if (!store.records.length) {
    await store.loadAll()
  }
})
</script>

<style scoped>
.history-container {
  padding: 0 16px 80px;
}

.date-group {
  margin-bottom: 24px;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2533;
  padding: 12px 0 8px;
  position: sticky;
  top: 0;
  background: #f7f8fa;
  z-index: 1;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-card {
  background: white;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.left-info {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
}

.soothe-info,
.sleep-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.soothe-info .label {
  font-size: 12px;
  color: #f2994a;
  font-weight: 500;
}

.soothe-info .value {
  font-size: 16px;
  font-weight: 600;
  color: #f2994a;
}

.sleep-info .label {
  font-size: 12px;
  color: #4f67ff;
  font-weight: 500;
}

.sleep-info .value {
  font-size: 16px;
  font-weight: 600;
  color: #4f67ff;
}

.right-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.nai-tag {
  flex-shrink: 0;
}

.time-detail {
  font-size: 13px;
  color: #6f7787;
  text-align: right;
  word-break: keep-all;
  white-space: nowrap;
}
</style>

<template>
  <div class="page" style="display: flex; flex-direction: column; justify-content: space-between">
    <div>
      <van-nav-bar title="记录睡眠" />

      <div class="section-card" style="text-align: center; margin-top: 12px">
        <div class="timer">{{ timerText }}</div>
        <div class="value-sub" style="margin-bottom: 18px">{{ statusText }}</div>

        <van-button v-if="!running.isSootheStarted" type="primary" block @click="onStartSoothe">开始哄睡</van-button>
        <van-button v-else-if="running.isSootheStarted && !running.isSleeping" type="primary" block @click="onStartSleep">睡着了</van-button>
        <van-button v-else type="success" block @click="onWakeUp">睡醒了，完成记录</van-button>
        <van-button
          v-if="running.isSootheStarted"
          style="margin-top: 10px"
          type="danger"
          plain
          block
          @click="onCancelRunning"
        >
          取消当前记录
        </van-button>
      </div>

      <div class="section-card">
        <div class="record-header">
          <div class="section-title">手动记录</div>
          <van-button size="small" type="primary" plain @click="openCreatePage">手动添加</van-button>
        </div>
        <div class="value-sub">可手动填写开始时间、哄睡时长、睡眠时长，并支持编辑与删除。</div>
      </div>

      <div class="section-card">
        <div class="section-title">最近记录</div>
        <template v-if="store.records.length">
          <div v-for="item in store.records.slice(0, 6)" :key="item.id" class="record-item">
            <div>
              <div class="record-main">{{ formatDateTime(item.sleepStart) }} 开始睡</div>
              <div class="value-sub">
                哄睡 {{ calcSootheMinutes(item) }} 分钟 · 睡眠 {{ calcSleepMinutes(item) }} 分钟
              </div>
            </div>
            <div class="record-actions">
              <van-button size="mini" plain type="primary" @click="openEditPage(item)">修改</van-button>
              <van-button size="mini" plain type="danger" @click="onDelete(item)">删除</van-button>
            </div>
          </div>
        </template>
        <div v-else class="value-sub">暂无记录，点击上方“手动添加”创建。</div>
      </div>
    </div>

    <div class="section-card" style="text-align: center">
      <router-link to="/history">查看历史记录 ></router-link>
    </div>
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { showConfirmDialog, showSuccessToast } from 'vant'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useSleepStore } from '../stores/sleep'
import type { SleepRecord } from '../types/sleep'

const store = useSleepStore()
const router = useRouter()
const now = ref(dayjs())
let timer: ReturnType<typeof setInterval> | null = null

const { runningRecord: running } = storeToRefs(store)

const statusText = computed(() => {
  if (!running.value.isSootheStarted) return '准备就绪，开始记录宝宝睡眠'
  if (!running.value.isSleeping) return '正在哄睡，点击“睡着了”进入睡眠计时'
  return '宝宝睡眠中，醒来后点击结束'
})

const timerText = computed(() => {
  let start
  if (running.value.isSleeping && running.value.sleepStart) {
    start = dayjs(running.value.sleepStart)
  } else if (running.value.isSootheStarted && running.value.sootheStart) {
    start = dayjs(running.value.sootheStart)
  } else {
    return '00:00:00'
  }

  const diff = now.value.diff(start, 'second')
  const hours = `${Math.floor(diff / 3600)}`.padStart(2, '0')
  const minutes = `${Math.floor((diff % 3600) / 60)}`.padStart(2, '0')
  const seconds = `${diff % 60}`.padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
})

function onStartSoothe() {
  store.startSoothe()
}

function onStartSleep() {
  store.startSleep()
  showSuccessToast('已开始记录睡眠时长')
}

async function onWakeUp() {
  await store.endSleep()
  showSuccessToast('已记录本次睡眠')
}

async function onCancelRunning() {
  try {
    await showConfirmDialog({
      title: '取消当前记录',
      message: '确认取消当前哄睡/睡眠记录吗？取消后本次计时将被清空且不会保存。'
    })
    store.cancelRunningRecord()
    showSuccessToast('已取消当前记录')
  } catch (_error) {
    // 用户取消
  }
}

function formatDateTime(time: string): string {
  return dayjs(time).format('MM-DD HH:mm')
}

function calcSootheMinutes(item: SleepRecord): number {
  return dayjs(item.sleepStart).diff(dayjs(item.sootheStart), 'minute')
}

function calcSleepMinutes(item: SleepRecord): number {
  return dayjs(item.sleepEnd).diff(dayjs(item.sleepStart), 'minute')
}

function openCreatePage() {
  router.push('/record/create')
}

function openEditPage(item: SleepRecord) {
  router.push(`/record/edit/${item.id}`)
}

async function onDelete(item: SleepRecord) {
  try {
    await showConfirmDialog({
      title: '删除记录',
      message: `确认删除 ${formatDateTime(item.sleepStart)} 的睡眠记录吗？`
    })
    await store.removeSleepRecord(item.id)
    showSuccessToast('已删除记录')
  } catch (_error) {
    // 用户取消删除
  }
}

onMounted(async () => {
  if (!store.records.length || !store.profile.name) {
    await store.loadAll()
  }
  timer = setInterval(() => {
    now.value = dayjs()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.timer {
  font-size: 54px;
  letter-spacing: 2px;
  color: #4f67ff;
  font-weight: 700;
  margin: 10px 0;
}

a {
  color: #4f67ff;
  text-decoration: none;
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eef2ff;
  padding: 8px 0;
}

.record-main {
  font-weight: 600;
}

.record-actions {
  display: flex;
  gap: 8px;
}
</style>

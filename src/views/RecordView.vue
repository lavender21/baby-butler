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

<script setup>
import dayjs from 'dayjs'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { showSuccessToast } from 'vant'
import { useSleepStore } from '../stores/sleep'

const store = useSleepStore()
const now = ref(dayjs())
let timer

const running = computed(() => store.runningRecord)

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

onMounted(async () => {
  if (!store.records.length || !store.profile.name) {
    await store.loadAll()
  }
  timer = setInterval(() => {
    now.value = dayjs()
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
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
</style>

<template>
  <div class="page">
    <van-nav-bar title="手动添加睡眠" left-arrow @click-left="router.back()" />

    <div class="section-card">
      <div class="value-sub">记录日期固定为今天：{{ todayText }}，仅需选择时间。</div>
      <van-form @submit="onSubmit">
        <van-field v-model="form.time" label="开始时间" type="time" required />
        <van-field v-model="form.sootheMinutes" label="哄睡时长(分钟)" type="number" required />
        <van-field v-model="form.sleepMinutes" label="睡眠时长(分钟)" type="number" required />
        <div style="margin-top: 16px">
          <van-button native-type="submit" type="primary" block>保存记录</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import { useSleepStore } from '../stores/sleep'

const store = useSleepStore()
const router = useRouter()

const todayText = dayjs().format('YYYY-MM-DD')
const form = reactive({
  time: dayjs().format('HH:mm'),
  sootheMinutes: '20',
  sleepMinutes: '90'
})

function getStartDateTime() {
  return dayjs(`${todayText} ${form.time}`)
}

async function onSubmit() {
  const startAt = getStartDateTime()
  const sootheMinutes = Number(form.sootheMinutes)
  const sleepMinutes = Number(form.sleepMinutes)

  if (!startAt.isValid()) {
    showFailToast('请填写有效的开始时间')
    return
  }
  if (!Number.isFinite(sootheMinutes) || sootheMinutes < 0) {
    showFailToast('哄睡时长需大于等于0')
    return
  }
  if (!Number.isFinite(sleepMinutes) || sleepMinutes <= 0) {
    showFailToast('睡眠时长需大于0')
    return
  }

  await store.addManualSleepRecord({
    sleepStart: startAt.toISOString(),
    sootheStart: startAt.subtract(sootheMinutes, 'minute').toISOString(),
    sleepEnd: startAt.add(sleepMinutes, 'minute').toISOString()
  })

  showSuccessToast('已新增记录')
  router.replace('/record')
}
</script>

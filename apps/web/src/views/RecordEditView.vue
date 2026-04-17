<template>
  <div class="page">
    <van-nav-bar title="修改睡眠记录" left-arrow @click-left="router.back()" />

    <div v-if="targetRecord" class="section-card">
      <div class="value-sub">记录日期固定为：{{ fixedDateText }}，仅支持修改时间。</div>
      <van-form @submit="onSubmit">
        <van-field v-model="form.time" label="开始时间" type="time" required />
        <van-field v-model="form.sootheMinutes" label="哄睡时长(分钟)" type="number" required />
        <van-field v-model="form.sleepMinutes" label="睡眠时长(分钟)" type="number" required />
        <div style="margin-top: 16px">
          <van-button native-type="submit" type="primary" block>保存修改</van-button>
        </div>
      </van-form>
    </div>
    <van-empty v-else description="记录不存在或已删除" />
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import { useSleepStore } from '../stores/sleep'

const store = useSleepStore()
const route = useRoute()
const router = useRouter()

const recordId = computed(() => String(route.params.id || ''))
const targetRecord = computed(() => store.records.find((item) => item.id === recordId.value))
const fixedDateText = computed(() =>
  targetRecord.value ? dayjs(targetRecord.value.sleepStart).format('YYYY-MM-DD') : ''
)

const form = reactive({
  time: '08:00',
  sootheMinutes: '20',
  sleepMinutes: '90'
})

function initForm() {
  if (!targetRecord.value) return
  const record = targetRecord.value
  form.time = dayjs(record.sleepStart).format('HH:mm')
  form.sootheMinutes = String(dayjs(record.sleepStart).diff(dayjs(record.sootheStart), 'minute'))
  form.sleepMinutes = String(dayjs(record.sleepEnd).diff(dayjs(record.sleepStart), 'minute'))
}

function getStartDateTime() {
  return dayjs(`${fixedDateText.value} ${form.time}`)
}

async function onSubmit() {
  if (!targetRecord.value) return
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

  await store.editSleepRecord(targetRecord.value.id, {
    sleepStart: startAt.toISOString(),
    sootheStart: startAt.subtract(sootheMinutes, 'minute').toISOString(),
    sleepEnd: startAt.add(sleepMinutes, 'minute').toISOString()
  })

  showSuccessToast('已修改记录')
  router.replace('/record')
}

onMounted(async () => {
  if (!store.records.length) {
    await store.loadAll()
  }
  initForm()
})
</script>

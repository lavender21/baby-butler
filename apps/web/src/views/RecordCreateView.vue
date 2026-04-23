<template>
  <div class="page">
    <BabyHeader title="手动添加睡眠" showBack @back="router.back()" />

    <div class="section-card">
      <van-form @submit="onSubmit">
        <van-field
          v-model="form.date"
          is-link
          readonly
          label="哄睡日期"
          placeholder="请选择哄睡日期"
          @click="showDatePicker = true"
          required
        />
        <van-field
          v-model="form.sootheTime"
          is-link
          readonly
          label="哄睡开始时间"
          placeholder="请选择哄睡开始时间"
          @click="showSootheTimePicker = true"
          required
        />
        <van-field
          v-model="form.sleepTime"
          is-link
          readonly
          label="睡着时间"
          placeholder="请选择睡着时间"
          @click="showSleepTimePicker = true"
          required
        />
        <van-field
          v-model="form.wakeDate"
          is-link
          readonly
          label="醒来日期"
          placeholder="请选择醒来日期"
          @click="showWakeDatePicker = true"
          required
        />
        <van-field
          v-model="form.wakeTime"
          is-link
          readonly
          label="醒来时间"
          placeholder="请选择醒来时间"
          @click="showWakeTimePicker = true"
          required
        />
        <div style="margin-top: 16px">
          <van-button native-type="submit" type="primary" block>保存记录</van-button>
        </div>
      </van-form>
    </div>

    <!-- 哄睡日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        :model-value="datePickerValue"
        title="选择哄睡日期"
        @cancel="showDatePicker = false"
        @confirm="onConfirmDate"
      />
    </van-popup>

    <!-- 醒来日期选择器 -->
    <van-popup v-model:show="showWakeDatePicker" position="bottom">
      <van-date-picker
        :model-value="wakeDatePickerValue"
        title="选择醒来日期"
        @cancel="showWakeDatePicker = false"
        @confirm="onConfirmWakeDate"
      />
    </van-popup>

    <!-- 哄睡时间选择器 -->
    <van-popup v-model:show="showSootheTimePicker" position="bottom">
      <van-time-picker
        :model-value="sootheTimePickerValue"
        title="选择哄睡开始时间"
        @cancel="showSootheTimePicker = false"
        @confirm="onConfirmSootheTime"
      />
    </van-popup>

    <!-- 睡着时间选择器 -->
    <van-popup v-model:show="showSleepTimePicker" position="bottom">
      <van-time-picker
        :model-value="sleepTimePickerValue"
        title="选择睡着时间"
        @cancel="showSleepTimePicker = false"
        @confirm="onConfirmSleepTime"
      />
    </van-popup>

    <!-- 醒来时间选择器 -->
    <van-popup v-model:show="showWakeTimePicker" position="bottom">
      <van-time-picker
        :model-value="wakeTimePickerValue"
        title="选择醒来时间"
        @cancel="showWakeTimePicker = false"
        @confirm="onConfirmWakeTime"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import BabyHeader from '../components/BabyHeader.vue'
import { useSleepStore } from '../stores/sleep'

const store = useSleepStore()
const router = useRouter()

const showDatePicker = ref(false)
const showWakeDatePicker = ref(false)
const showSootheTimePicker = ref(false)
const showSleepTimePicker = ref(false)
const showWakeTimePicker = ref(false)

const form = reactive({
  date: dayjs().format('YYYY-MM-DD'),
  wakeDate: dayjs().format('YYYY-MM-DD'),
  sootheTime: '',
  sleepTime: '',
  wakeTime: ''
})

// 日期选择器的值
const datePickerValue = computed(() => {
  const date = form.date ? dayjs(form.date) : dayjs()
  return [date.format('YYYY'), date.format('MM'), date.format('DD')]
})

// 醒来日期选择器的值
const wakeDatePickerValue = computed(() => {
  const date = form.wakeDate ? dayjs(form.wakeDate) : dayjs()
  return [date.format('YYYY'), date.format('MM'), date.format('DD')]
})

// 哄睡时间选择器的值
const sootheTimePickerValue = computed(() => {
  if (!form.sootheTime) return ['20', '00']
  const [hour, minute] = form.sootheTime.split(':')
  return [hour.padStart(2, '0'), minute.padStart(2, '0')]
})

// 睡着时间选择器的值
const sleepTimePickerValue = computed(() => {
  if (!form.sleepTime) return ['20', '30']
  const [hour, minute] = form.sleepTime.split(':')
  return [hour.padStart(2, '0'), minute.padStart(2, '0')]
})

// 醒来时间选择器的值
const wakeTimePickerValue = computed(() => {
  if (!form.wakeTime) return ['22', '00']
  const [hour, minute] = form.wakeTime.split(':')
  return [hour.padStart(2, '0'), minute.padStart(2, '0')]
})

function onConfirmDate({ selectedValues }: { selectedValues: string[] }) {
  form.date = `${selectedValues[0]}-${selectedValues[1]}-${selectedValues[2]}`
  // 默认醒来日期与哄睡日期相同
  if (!form.wakeDate || form.wakeDate === dayjs().format('YYYY-MM-DD')) {
    form.wakeDate = form.date
  }
  showDatePicker.value = false
}

function onConfirmWakeDate({ selectedValues }: { selectedValues: string[] }) {
  form.wakeDate = `${selectedValues[0]}-${selectedValues[1]}-${selectedValues[2]}`
  showWakeDatePicker.value = false
}

function onConfirmSootheTime({ selectedValues }: { selectedValues: string[] }) {
  form.sootheTime = `${selectedValues[0].padStart(2, '0')}:${selectedValues[1].padStart(2, '0')}`
  showSootheTimePicker.value = false
}

function onConfirmSleepTime({ selectedValues }: { selectedValues: string[] }) {
  form.sleepTime = `${selectedValues[0].padStart(2, '0')}:${selectedValues[1].padStart(2, '0')}`
  showSleepTimePicker.value = false
}

function onConfirmWakeTime({ selectedValues }: { selectedValues: string[] }) {
  form.wakeTime = `${selectedValues[0].padStart(2, '0')}:${selectedValues[1].padStart(2, '0')}`
  showWakeTimePicker.value = false
}

async function onSubmit() {
  if (!form.date || !form.wakeDate || !form.sootheTime || !form.sleepTime || !form.wakeTime) {
    showFailToast('请填写完整信息')
    return
  }

  const sootheStart = dayjs(`${form.date} ${form.sootheTime}`)
  let sleepStart = dayjs(`${form.date} ${form.sleepTime}`)
  const sleepEnd = dayjs(`${form.wakeDate} ${form.wakeTime}`)

  // 如果睡着时间早于哄睡时间，说明跨天了
  if (sleepStart.isBefore(sootheStart)) {
    sleepStart = sleepStart.add(1, 'day')
  }

  // 验证时间逻辑
  if (!sootheStart.isValid() || !sleepStart.isValid() || !sleepEnd.isValid()) {
    showFailToast('请填写有效的时间')
    return
  }

  if (sleepStart.isBefore(sootheStart)) {
    showFailToast('睡着时间不能早于哄睡开始时间')
    return
  }

  if (sleepEnd.isBefore(sleepStart) || sleepEnd.isSame(sleepStart)) {
    showFailToast('醒来时间必须晚于睡着时间')
    return
  }

  await store.addManualSleepRecord({
    sootheStart: sootheStart.toISOString(),
    sleepStart: sleepStart.toISOString(),
    sleepEnd: sleepEnd.toISOString()
  })

  showSuccessToast('已新增记录')
  router.replace('/record')
}
</script>

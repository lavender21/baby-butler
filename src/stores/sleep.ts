import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createSleepRecord, getProfile, listSleepRecords, updateProfile } from '../services/sleepApi'
import { buildDailyMetrics, getAgeText } from '../utils/sleepMetrics'
import type { BabyProfile, RunningRecord, SleepRecord } from '../types/sleep'

const EMPTY_RUNNING: RunningRecord = {
  sootheStart: '',
  sleepStart: '',
  isSootheStarted: false,
  isSleeping: false
}

export const useSleepStore = defineStore('sleep', () => {
  const profile = ref<BabyProfile>({ name: '', birthday: '', gender: '' })
  const records = ref<SleepRecord[]>([])
  const runningRecord = ref<RunningRecord>({ ...EMPTY_RUNNING })

  const ageText = computed(() => (profile.value.birthday ? getAgeText(profile.value.birthday) : '--'))
  const yesterdayMetrics = computed(() => buildDailyMetrics(records.value))

  async function loadAll(): Promise<void> {
    profile.value = await getProfile()
    records.value = await listSleepRecords()
  }

  async function saveProfile(payload: Partial<BabyProfile>): Promise<void> {
    profile.value = await updateProfile(payload)
  }

  function startSoothe(): void {
    runningRecord.value = {
      sootheStart: new Date().toISOString(),
      sleepStart: '',
      isSootheStarted: true,
      isSleeping: false
    }
  }

  function startSleep(): void {
    if (!runningRecord.value.isSootheStarted) return
    runningRecord.value.sleepStart = new Date().toISOString()
    runningRecord.value.isSleeping = true
  }

  async function endSleep(): Promise<void> {
    if (!runningRecord.value.isSleeping) return

    await createSleepRecord({
      sootheStart: runningRecord.value.sootheStart,
      sleepStart: runningRecord.value.sleepStart,
      sleepEnd: new Date().toISOString()
    })

    records.value = await listSleepRecords()
    runningRecord.value = { ...EMPTY_RUNNING }
  }

  return {
    profile,
    records,
    runningRecord,
    ageText,
    yesterdayMetrics,
    loadAll,
    saveProfile,
    startSoothe,
    startSleep,
    endSleep
  }
})

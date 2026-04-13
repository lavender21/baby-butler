import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createSleepRecord, getProfile, listSleepRecords, updateProfile } from '../services/sleepApi'
import { buildDailyMetrics, getAgeText } from '../utils/sleepMetrics'

export const useSleepStore = defineStore('sleep', () => {
  const profile = ref({ name: '', birthday: '', gender: '' })
  const records = ref([])
  const runningRecord = ref({
    sootheStart: '',
    sleepStart: '',
    isSootheStarted: false,
    isSleeping: false
  })

  const ageText = computed(() => (profile.value.birthday ? getAgeText(profile.value.birthday) : '--'))
  const yesterdayMetrics = computed(() => buildDailyMetrics(records.value))

  async function loadAll() {
    profile.value = await getProfile()
    records.value = await listSleepRecords()
  }

  async function saveProfile(payload) {
    profile.value = await updateProfile(payload)
  }

  function startSoothe() {
    runningRecord.value = {
      sootheStart: new Date().toISOString(),
      sleepStart: '',
      isSootheStarted: true,
      isSleeping: false
    }
  }

  function startSleep() {
    if (!runningRecord.value.isSootheStarted) return
    runningRecord.value.sleepStart = new Date().toISOString()
    runningRecord.value.isSleeping = true
  }

  async function endSleep() {
    if (!runningRecord.value.isSleeping) return

    await createSleepRecord({
      sootheStart: runningRecord.value.sootheStart,
      sleepStart: runningRecord.value.sleepStart,
      sleepEnd: new Date().toISOString()
    })

    records.value = await listSleepRecords()
    runningRecord.value = {
      sootheStart: '',
      sleepStart: '',
      isSootheStarted: false,
      isSleeping: false
    }
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

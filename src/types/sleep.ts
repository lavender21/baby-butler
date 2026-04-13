export interface BabyProfile {
  name: string
  birthday: string
  gender: string
}

export interface SleepRecord {
  id: string
  sootheStart: string
  sleepStart: string
  sleepEnd: string
}

export interface RunningRecord {
  sootheStart: string
  sleepStart: string
  isSootheStarted: boolean
  isSleeping: boolean
}

export interface SleepDistribution {
  labels: string[]
  sleep: number[]
  awake: number[]
}

export interface WeeklySleepItem {
  day: string
  hours: number
}

export interface DailyMetrics {
  total: number
  night: number
  day: number
  avgSoothe: number
  avgInterval: number
  count: number
  distribution: SleepDistribution
  weeklySleepHours: WeeklySleepItem[]
}

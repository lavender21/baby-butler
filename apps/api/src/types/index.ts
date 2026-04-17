export interface Profile {
  name: string
  birthday: string
  gender: string
  avatarUrl: string
}

export interface SleepRecord {
  id: string
  sootheStart: string
  sleepStart: string
  sleepEnd: string
}

export interface ProfileRow {
  id: number
  name: string
  birthday: string
  gender: string
  avatar_url: string
  created_at: string
  updated_at: string
}

export interface SleepRecordRow {
  id: string
  soothe_start: string
  sleep_start: string
  sleep_end: string
  created_at: string
  updated_at: string
}

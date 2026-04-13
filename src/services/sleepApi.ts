import seedData from '../mock/babyData.json'
import type { BabyProfile, SleepRecord } from '../types/sleep'

interface DbSchema {
  profile: BabyProfile
  sleepRecords: SleepRecord[]
}

const LOCAL_KEY = 'baby-butler-db'

const wait = (ms = 80): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function loadDb(): DbSchema {
  const cached = localStorage.getItem(LOCAL_KEY)
  if (!cached) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(seedData))
    return clone(seedData as DbSchema)
  }

  try {
    return JSON.parse(cached) as DbSchema
  } catch (_error) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(seedData))
    return clone(seedData as DbSchema)
  }
}

function saveDb(data: DbSchema): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
}

export async function getProfile(): Promise<BabyProfile> {
  await wait()
  const db = loadDb()
  return db.profile
}

export async function updateProfile(payload: Partial<BabyProfile>): Promise<BabyProfile> {
  await wait()
  const db = loadDb()
  db.profile = { ...db.profile, ...payload }
  saveDb(db)
  return db.profile
}

export async function listSleepRecords(): Promise<SleepRecord[]> {
  await wait()
  const db = loadDb()
  return [...db.sleepRecords].sort(
    (a, b) => new Date(b.sootheStart).getTime() - new Date(a.sootheStart).getTime()
  )
}

export async function createSleepRecord(payload: Omit<SleepRecord, 'id'>): Promise<SleepRecord[]> {
  await wait()
  const db = loadDb()
  db.sleepRecords.push({ id: `r-${Date.now()}`, ...payload })
  saveDb(db)
  return db.sleepRecords
}

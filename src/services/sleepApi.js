import seedData from '../mock/babyData.json'

const LOCAL_KEY = 'baby-butler-db'

const wait = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms))

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function loadDb() {
  const cached = localStorage.getItem(LOCAL_KEY)
  if (!cached) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(seedData))
    return clone(seedData)
  }

  try {
    return JSON.parse(cached)
  } catch (_error) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(seedData))
    return clone(seedData)
  }
}

function saveDb(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
}

export async function getProfile() {
  await wait()
  const db = loadDb()
  return db.profile
}

export async function updateProfile(payload) {
  await wait()
  const db = loadDb()
  db.profile = { ...db.profile, ...payload }
  saveDb(db)
  return db.profile
}

export async function listSleepRecords() {
  await wait()
  const db = loadDb()
  return db.sleepRecords.sort((a, b) => new Date(b.sootheStart) - new Date(a.sootheStart))
}

export async function createSleepRecord(payload) {
  await wait()
  const db = loadDb()
  db.sleepRecords.push({ id: `r-${Date.now()}`, ...payload })
  saveDb(db)
  return db.sleepRecords
}

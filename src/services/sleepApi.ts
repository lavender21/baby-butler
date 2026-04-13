import type { BabyProfile, SleepRecord } from '../types/sleep'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`)
  }

  return (await response.json()) as T
}

export async function getProfile(): Promise<BabyProfile> {
  return request<BabyProfile>('/api/profile')
}

export async function updateProfile(payload: Partial<BabyProfile>): Promise<BabyProfile> {
  return request<BabyProfile>('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
}

export async function listSleepRecords(): Promise<SleepRecord[]> {
  return request<SleepRecord[]>('/api/sleep-records')
}

export async function createSleepRecord(payload: Omit<SleepRecord, 'id'>): Promise<SleepRecord[]> {
  return request<SleepRecord[]>('/api/sleep-records', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

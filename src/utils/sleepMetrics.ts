import dayjs, { type Dayjs } from 'dayjs'
import type { DailyMetrics, SleepRecord, WeeklySleepItem } from '../types/sleep'

const MINUTE = 60 * 1000

interface MappedRecord extends Omit<SleepRecord, 'sootheStart' | 'sleepStart' | 'sleepEnd'> {
  sootheStart: Dayjs
  sleepStart: Dayjs
  sleepEnd: Dayjs
}

export function fmtDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes))
  const h = Math.floor(m / 60)
  const left = m % 60
  if (!h) {
    return `${left}分钟`
  }
  return `${h}小时${left}分钟`
}

export function getAgeText(birthday: string): string {
  const birth = dayjs(birthday)
  const now = dayjs()
  const months = now.diff(birth, 'month')
  const days = now.diff(birth.add(months, 'month'), 'day')
  return `${months}个月${days}天`
}

export function buildDailyMetrics(
  records: SleepRecord[],
  targetDate: Dayjs = dayjs().subtract(1, 'day')
): DailyMetrics {
  const dayStart = targetDate.startOf('day')
  const dayEnd = targetDate.endOf('day')
  const list = records
    .map((item) => ({
      ...item,
      sootheStart: dayjs(item.sootheStart),
      sleepStart: dayjs(item.sleepStart),
      sleepEnd: dayjs(item.sleepEnd)
    }))
    .filter((item) => item.sleepStart.isBefore(dayEnd) && item.sleepEnd.isAfter(dayStart))

  let total = 0
  let night = 0
  let day = 0
  let soothe = 0

  const sorted = list.sort((a, b) => a.sleepStart.valueOf() - b.sleepStart.valueOf())
  const intervals: number[] = []

  sorted.forEach((item, index) => {
    // Clip to the target day so cross-midnight records are only counted within this day
    const clippedStart = item.sleepStart.isBefore(dayStart) ? dayStart : item.sleepStart
    const clippedEnd = item.sleepEnd.isAfter(dayEnd) ? dayEnd : item.sleepEnd
    const sleepMinutes = clippedEnd.diff(clippedStart) / MINUTE
    total += sleepMinutes

    const sleepHour = clippedStart.hour()
    if (sleepHour >= 20 || sleepHour < 6) {
      night += sleepMinutes
    } else {
      day += sleepMinutes
    }

    soothe += item.sleepStart.diff(item.sootheStart) / MINUTE

    if (sorted[index - 1]) {
      intervals.push(item.sleepStart.diff(sorted[index - 1].sleepEnd) / MINUTE)
    }
  })

  const avgSoothe = sorted.length ? soothe / sorted.length : 0
  const avgInterval = intervals.length ? intervals.reduce((acc, i) => acc + i, 0) / intervals.length : 0

  return {
    total,
    night,
    day,
    avgSoothe,
    avgInterval,
    count: sorted.length,
    distribution: buildDistribution(sorted, dayStart, dayEnd),
    weeklySleepHours: buildWeeklyHours(records)
  }
}

function buildDistribution(records: MappedRecord[], dayStart: Dayjs, dayEnd: Dayjs): DailyMetrics['distribution'] {
  const sleepMinutes = Array.from({ length: 24 }, () => 0)

  records.forEach((item) => {
    const clippedStart = item.sleepStart.isBefore(dayStart) ? dayStart : item.sleepStart
    const clippedEnd = item.sleepEnd.isAfter(dayEnd) ? dayEnd : item.sleepEnd

    for (let hour = 0; hour < 24; hour++) {
      const slotStart = dayStart.add(hour, 'hour')
      const slotEnd = slotStart.add(1, 'hour')
      const overlapStart = clippedStart.isAfter(slotStart) ? clippedStart : slotStart
      const overlapEnd = clippedEnd.isBefore(slotEnd) ? clippedEnd : slotEnd
      if (overlapStart.isBefore(overlapEnd)) {
        sleepMinutes[hour] += overlapEnd.diff(overlapStart, 'minute')
      }
    }
  })

  const labels = ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22']
  const hourAxis = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]
  const hasData = records.length > 0

  return {
    labels,
    sleep: hourAxis.map((h) => sleepMinutes[h]),
    awake: hourAxis.map((h) => (hasData ? 60 - sleepMinutes[h] : 0))
  }
}

function buildWeeklyHours(records: SleepRecord[]): WeeklySleepItem[] {
  return Array.from({ length: 7 }, (_item, index) => {
    const day = dayjs().subtract(6 - index, 'day')
    const dayStart = day.startOf('day')
    const dayEnd = day.endOf('day')
    const hours = records
      .map((record) => ({
        start: dayjs(record.sleepStart),
        end: dayjs(record.sleepEnd)
      }))
      .filter((record) => record.start.isBefore(dayEnd) && record.end.isAfter(dayStart))
      .reduce((acc, record) => {
        const clippedStart = record.start.isBefore(dayStart) ? dayStart : record.start
        const clippedEnd = record.end.isAfter(dayEnd) ? dayEnd : record.end
        return acc + clippedEnd.diff(clippedStart, 'minute') / 60
      }, 0)

    return {
      day: day.format('dd'),
      hours: Number(hours.toFixed(1))
    }
  })
}

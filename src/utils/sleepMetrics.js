import dayjs from 'dayjs'

const MINUTE = 60 * 1000

export function fmtDuration(minutes) {
  const m = Math.max(0, Math.round(minutes))
  const h = Math.floor(m / 60)
  const left = m % 60
  if (!h) {
    return `${left}分钟`
  }
  return `${h}小时${left}分钟`
}

export function getAgeText(birthday) {
  const birth = dayjs(birthday)
  const now = dayjs()
  const months = now.diff(birth, 'month')
  const days = now.diff(birth.add(months, 'month'), 'day')
  return `${months}个月${days}天`
}

export function buildDailyMetrics(records, targetDate = dayjs().subtract(1, 'day')) {
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
  const intervals = []

  sorted.forEach((item, index) => {
    const sleepMinutes = item.sleepEnd.diff(item.sleepStart) / MINUTE
    total += sleepMinutes

    const sleepHour = item.sleepStart.hour()
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
    distribution: buildDistribution(sorted),
    weeklySleepHours: buildWeeklyHours(records)
  }
}

function buildDistribution(records) {
  const sleepHours = Array.from({ length: 24 }, () => 0)
  const awakeHours = Array.from({ length: 24 }, () => 60)

  records.forEach((item) => {
    let cursor = item.sleepStart.startOf('hour')
    const end = item.sleepEnd
    while (cursor.isBefore(end)) {
      const hour = cursor.hour()
      sleepHours[hour] += 60
      awakeHours[hour] = Math.max(0, awakeHours[hour] - 60)
      cursor = cursor.add(1, 'hour')
    }
  })

  return {
    labels: ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22'],
    sleep: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map((h) => sleepHours[h]),
    awake: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map((h) => awakeHours[h])
  }
}

function buildWeeklyHours(records) {
  return Array.from({ length: 7 }, (_item, index) => {
    const day = dayjs().subtract(6 - index, 'day')
    const hours = records
      .map((record) => ({
        start: dayjs(record.sleepStart),
        end: dayjs(record.sleepEnd)
      }))
      .filter((record) => record.start.isBefore(day.endOf('day')) && record.end.isAfter(day.startOf('day')))
      .reduce((acc, record) => acc + record.end.diff(record.start, 'minute') / 60, 0)

    return {
      day: day.format('dd'),
      hours: Number(hours.toFixed(1))
    }
  })
}

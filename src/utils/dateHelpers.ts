export function getGreeting(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

export function formatDisplayDate(isoDate: string): string {
  const date = new Date(isoDate + 'T12:00:00') // noon avoids timezone shifts
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    year: 'numeric',
  })
}

export function toMonthKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function isToday(isoDate: string): boolean {
  return isoDate === toMonthKey(new Date()).slice(0, 7) + '-' + new Date().getDate().toString().padStart(2, '0')
}

export function friendlyDate(isoDate: string): string {
  const today = toMonthKey(new Date()) + '-' + new Date().getDate().toString().padStart(2, '0')
  const yesterday = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toISOString().slice(0, 10)
  })()
  if (isoDate === today) return 'Today'
  if (isoDate === yesterday) return 'Yesterday'
  return formatDisplayDate(isoDate)
}

export function formatIssueDate(value: string, locale: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value.toUpperCase()
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
    .format(date)
    .toUpperCase()
}

export function formatDeskDate(value: string, locale: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date)
}

export function formatCount(value: number, locale: string) {
  return value.toLocaleString(locale)
}

import { format, formatDistanceToNow, parseISO } from 'date-fns'

/** Money arrives in minor units; never divide before formatting. */
export function formatMoney(minorUnits: number, currency = 'EUR', locale = 'en-GB'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: minorUnits % 100 === 0 ? 0 : 2,
  }).format(minorUnits / 100)
}

export function formatNumber(value: number, locale = 'en-GB'): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy')
}

/** "3 days ago"; returns a dash for a missing timestamp so tables stay aligned. */
export function formatRelative(iso: string | null): string {
  if (!iso) return '—'
  return formatDistanceToNow(parseISO(iso), { addSuffix: true })
}

/** "2026-09" -> "Sep 2026", for chart axes. */
export function formatMonth(yearMonth: string): string {
  return format(parseISO(`${yearMonth}-01`), 'MMM yyyy')
}

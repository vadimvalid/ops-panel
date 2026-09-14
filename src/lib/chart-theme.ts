/**
 * Chart colour tokens.
 *
 * Values come from the documented visualisation palette and were checked with
 * its validator rather than picked by eye — an earlier blue ramp (steps
 * 250/400/450/600) looked fine but failed the adjacent-lightness check,
 * because two neighbouring steps were only 0.047 apart.
 *
 * Plans are an ORDINAL scale (free < starter < pro < enterprise), so they take
 * one hue stepped light to dark: the reader sees the ordering in the colour.
 * Using four different hues here would spend the identity channel on something
 * the axis order already says.
 */

/** Blue 250 / 400 / 550 / 700 — validated on the light surface. */
const PLAN_RAMP_LIGHT = ['#86b6ef', '#3987e5', '#1c5cab', '#0d366b'] as const

/** Reversed and re-stepped for the dark surface; not an automatic flip. */
const PLAN_RAMP_DARK = ['#cde2fb', '#9ec5f4', '#5598e7', '#2a78d6'] as const

/** Single-series trend lines use the sequential default hue. */
const TREND_LIGHT = '#2a78d6'
const TREND_DARK = '#3987e5'

/** Reserved status colours — never reused as a series colour. */
export const STATUS_COLORS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
} as const

export function isDarkMode(): boolean {
  if (typeof document === 'undefined') return false
  const explicit = document.documentElement.dataset.theme
  if (explicit === 'dark') return true
  if (explicit === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function planRamp(dark = isDarkMode()): readonly string[] {
  return dark ? PLAN_RAMP_DARK : PLAN_RAMP_LIGHT
}

export function trendColor(dark = isDarkMode()): string {
  return dark ? TREND_DARK : TREND_LIGHT
}

/** Recessive grid and axis ink, one step off the surface. */
export function chartInk(dark = isDarkMode()) {
  return {
    grid: dark ? '#2e2e2c' : '#eceae5',
    axis: dark ? '#9b9a95' : '#6f6e69',
    surface: dark ? '#1a1a19' : '#fcfcfb',
  }
}

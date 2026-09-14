import { describe, it, expect } from 'vitest'
import { planRamp, trendColor, chartInk, STATUS_COLORS } from '../chart-theme'

/** OKLCH lightness, enough to assert ordering and step spacing. */
function lightness(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)

  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
}

describe('plan ramp', () => {
  it.each([
    ['light', false],
    ['dark', true],
  ])('steps monotonically in %s mode', (_mode, dark) => {
    const ramp = planRamp(dark)
    const steps = ramp.map(lightness)

    // Plans are ordinal, so the ramp must read as an order, not a set of hues.
    for (let i = 1; i < steps.length; i += 1) {
      expect(steps[i]).toBeLessThan(steps[i - 1]!)
    }
  })

  it.each([
    ['light', false],
    ['dark', true],
  ])('keeps adjacent steps distinguishable in %s mode', (_mode, dark) => {
    const steps = planRamp(dark).map(lightness)

    // The validator rejected an earlier ramp whose closest gap was 0.047.
    for (let i = 1; i < steps.length; i += 1) {
      expect(Math.abs(steps[i]! - steps[i - 1]!)).toBeGreaterThanOrEqual(0.06)
    }
  })

  it('covers every plan tier', () => {
    expect(planRamp(false)).toHaveLength(4)
    expect(planRamp(true)).toHaveLength(4)
  })
})

describe('theme awareness', () => {
  it('uses different ink and series colours per mode', () => {
    expect(trendColor(true)).not.toBe(trendColor(false))
    expect(chartInk(true).surface).not.toBe(chartInk(false).surface)
  })
})

describe('status colours', () => {
  it('stay separate from the series ramp', () => {
    const series = new Set([...planRamp(false), ...planRamp(true)])
    for (const color of Object.values(STATUS_COLORS)) {
      expect(series.has(color)).toBe(false)
    }
  })
})

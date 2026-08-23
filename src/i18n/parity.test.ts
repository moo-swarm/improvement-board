import { describe, it, expect } from 'vitest'
import en from './en.json'
import es from './es.json'
import be from './be.json'
import ru from './ru.json'

/** Deep key enumeration: "every user-visible string lands in all 4 files" (CC2). */
function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return value !== null && typeof value === 'object'
      ? flattenKeys(value as Record<string, unknown>, path)
      : [path]
  })
}

describe('i18n parity', () => {
  const enKeys = flattenKeys(en).sort()

  it('es/be/ru declare exactly the same key set as en', () => {
    expect(flattenKeys(es).sort()).toEqual(enKeys)
    expect(flattenKeys(be).sort()).toEqual(enKeys)
    expect(flattenKeys(ru).sort()).toEqual(enKeys)
  })
})

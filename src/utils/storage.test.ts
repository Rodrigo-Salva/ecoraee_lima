import { beforeEach, describe, expect, it } from 'vitest'
import { clearDemoStorage, isUserRole, readStorage, STORAGE_KEYS, writeStorage } from './storage'

describe('demo storage', () => {
  beforeEach(() => window.localStorage.clear())

  it('writes and reads JSON values', () => {
    writeStorage(STORAGE_KEYS.pointVisits, 4)
    expect(readStorage(STORAGE_KEYS.pointVisits, 0)).toBe(4)
  })

  it('uses the fallback for malformed data', () => {
    window.localStorage.setItem(STORAGE_KEYS.deliveries, '{invalid')
    expect(readStorage(STORAGE_KEYS.deliveries, [])).toEqual([])
  })

  it('accepts only supported roles', () => {
    expect(isUserRole('citizen')).toBe(true)
    expect(isUserRole('point')).toBe(true)
    expect(isUserRole('admin')).toBe(true)
    expect(isUserRole('owner')).toBe(false)
  })

  it('clears all versioned demo keys', () => {
    Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.setItem(key, 'value'))
    clearDemoStorage()
    Object.values(STORAGE_KEYS).forEach((key) => expect(window.localStorage.getItem(key)).toBeNull())
  })
})

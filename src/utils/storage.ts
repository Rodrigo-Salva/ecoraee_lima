import type { UserRole } from '../types'

export const STORAGE_KEYS = {
  deliveries: 'ecoraee.deliveries.v1',
  pointVisits: 'ecoraee.pointVisits.v1',
  localUserId: 'ecoraee.userId.v1',
  role: 'ecoraee.role.v1',
  representedPoint: 'ecoraee.representedPoint.v1',
  pointOverrides: 'ecoraee.pointOverrides.v1',
  campaigns: 'ecoraee.campaigns.v1',
  reports: 'ecoraee.reports.v1',
  suggestions: 'ecoraee.suggestions.v1',
  favorites: 'ecoraee.favorites.v1',
  subscriptions: 'ecoraee.subscriptions.v1',
  shareCount: 'ecoraee.shareCount.v1',
  quizScore: 'ecoraee.quizScore.v1',
  satisfaction: 'ecoraee.satisfaction.v1',
} as const

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable in private mode or restricted browsers.
  }
}

export function isUserRole(value: unknown): value is UserRole {
  return value === 'citizen' || value === 'point' || value === 'admin'
}

export function clearDemoStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key))
}

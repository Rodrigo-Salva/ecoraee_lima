import { describe, expect, it } from 'vitest'
import type { Campaign, Delivery, Point } from '../types'
import { calculateDeliveryMetrics, filterPoints, getCampaignStatus, haversineDistance, normalizeText } from './domain'

describe('domain utilities', () => {
  it('normalizes accents and case', () => { expect(normalizeText('  San MÍGUEL ')).toBe('san miguel') })
  it('calculates a plausible distance in Lima', () => { const distance = haversineDistance({ lat: -12.0464, lng: -77.0428 }, { lat: -12.1211, lng: -77.0297 }); expect(distance).toBeGreaterThan(8); expect(distance).toBeLessThan(9) })
  it('calculates campaign status by date', () => { const campaign = { startDate: '2026-11-20', endDate: '2026-11-23' } as Campaign; expect(getCampaignStatus(campaign, new Date('2026-11-22T10:00:00'))).toBe('active'); expect(getCampaignStatus(campaign, new Date('2026-11-24T10:00:00'))).toBe('finished') })
  it('combines point filters', () => { const point = { name: 'Centro Lima', district: 'San Miguel', acceptedWaste: ['phone'], type: 'permanent', verified: true } as Point; expect(filterPoints([point], { search: 'miguel', district: '', wasteType: 'phone', pointType: 'permanent', verifiedOnly: true })).toHaveLength(1); expect(filterPoints([point], { search: '', district: 'Lince', wasteType: '', pointType: '', verifiedOnly: false })).toHaveLength(0) })
  it('counts delivery metrics using confirmed weight only', () => { const deliveries = [{ status: 'declared', estimatedWeightKg: 5 }, { status: 'confirmed', estimatedWeightKg: 2.5 }, { status: 'confirmed' }] as Delivery[]; expect(calculateDeliveryMetrics(deliveries)).toEqual({ declared: 1, confirmed: 2, confirmedWeight: 2.5 }) })
  it('prefers the actual received weight for confirmed deliveries', () => { const deliveries = [{ status: 'confirmed', estimatedWeightKg: 5, actualWeightKg: 4.2 }] as Delivery[]; expect(calculateDeliveryMetrics(deliveries).confirmedWeight).toBe(4.2) })
})

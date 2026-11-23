import type { Campaign, CampaignStatus, Delivery, DeliveryItem, Point, WasteType } from '../types'

export const normalizeText = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-PE').trim()

export function haversineDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
) {
  const radius = 6371
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const latDelta = toRadians(destination.lat - origin.lat)
  const lngDelta = toRadians(destination.lng - origin.lng)
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(origin.lat)) *
      Math.cos(toRadians(destination.lat)) *
      Math.sin(lngDelta / 2) ** 2
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getCampaignStatus(campaign: Campaign, today = new Date()): CampaignStatus {
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const start = new Date(`${campaign.startDate}T00:00:00`).getTime()
  const end = new Date(`${campaign.endDate}T23:59:59`).getTime()
  if (current < start) return 'upcoming'
  if (current > end) return 'finished'
  return 'active'
}

interface PointFilters {
  search: string
  district: string
  wasteType: WasteType | ''
  pointType: Point['type'] | ''
  verifiedOnly: boolean
}

export function filterPoints(points: Point[], filters: PointFilters) {
  const query = normalizeText(filters.search)
  return points.filter((point) => {
    const matchesSearch = !query || normalizeText(`${point.name} ${point.district}`).includes(query)
    return (
      matchesSearch &&
      (!filters.district || point.district === filters.district) &&
      (!filters.wasteType || point.acceptedWaste.includes(filters.wasteType)) &&
      (!filters.pointType || point.type === filters.pointType) &&
      (!filters.verifiedOnly || point.verified)
    )
  })
}

export function calculateDeliveryMetrics(deliveries: Delivery[]) {
  const confirmed = deliveries.filter((delivery) => delivery.status === 'confirmed')
  return {
    declared: deliveries.filter((delivery) => delivery.status === 'declared').length,
    confirmed: confirmed.length,
    confirmedWeight: confirmed.reduce((sum, delivery) => sum + (delivery.actualWeightKg ?? delivery.estimatedWeightKg ?? 0), 0),
  }
}

export function getDeliveryItems(delivery: Delivery): DeliveryItem[] {
  return delivery.items?.length ? delivery.items : [{ wasteType: delivery.wasteType, quantity: delivery.quantity, estimatedWeightKg: delivery.estimatedWeightKg }]
}

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${value.slice(0, 10)}T12:00:00Z`),
  )

export const formatDistance = (distance: number) =>
  distance < 1 ? `a ${Math.round(distance * 1000)} m` : `a ${distance.toFixed(1)} km`

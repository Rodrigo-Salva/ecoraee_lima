export const WASTE_TYPES = [
  'phone',
  'laptop',
  'computer',
  'cables',
  'tv',
  'printer',
  'battery',
  'smallAppliance',
] as const

export type WasteType = (typeof WASTE_TYPES)[number]
export type UserRole = 'citizen' | 'point' | 'admin'
export type PointType = 'permanent' | 'campaign'
export type DeliveryStatus = 'declared' | 'confirmed' | 'rejected'
export type CampaignStatus = 'upcoming' | 'active' | 'finished'
export type ReviewStatus = 'pending' | 'approved' | 'discarded'

export interface Point {
  id: string
  name: string
  address: string
  district: string
  lat: number
  lng: number
  schedule: string
  conditions: string
  acceptedWaste: WasteType[]
  type: PointType
  operator: string
  verified: boolean
  lastVerifiedAt: string
}

export interface Campaign {
  id: string
  title: string
  startDate: string
  endDate: string
  place: string
  district: string
  organizer: string
  description: string
  isExample: boolean
  sourceUrl?: string
}

export interface Delivery {
  id: string
  pointId: string
  wasteType: WasteType
  quantity: number
  deliveryDate: string
  estimatedWeightKg?: number
  notes?: string
  status: DeliveryStatus
  createdAt: string
  actualWeightKg?: number
  confirmedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  items?: DeliveryItem[]
}

export interface DeliveryItem {
  wasteType: WasteType
  quantity: number
  estimatedWeightKg?: number
}

export type PointOverride = Partial<Pick<Point, 'schedule' | 'conditions' | 'acceptedWaste' | 'verified' | 'lastVerifiedAt'>>

export interface DataIssueReport {
  id: string
  pointId: string
  category: string
  description: string
  createdAt: string
  status: ReviewStatus
  isExample: boolean
}

export interface PointSuggestion {
  id: string
  name: string
  address: string
  district: string
  lat: number
  lng: number
  acceptedWaste: WasteType[]
  schedule: string
  notes: string
  createdAt: string
  status: ReviewStatus
  isExample: boolean
}

export interface RecycleItem {
  name: string
  destination: 'raee' | 'other' | 'special'
  wasteType?: WasteType
  guidance: string
}

export interface Operator {
  id: string
  name: string
  service: string
  districts: string[]
  phone: string
  email: string
  isExample: boolean
}

export interface SatisfactionResponse {
  id: string
  ease: number
  usefulness: number
  satisfaction: number
  createdAt: string
}

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface ToastMessage {
  id: string
  message: string
  tone: 'success' | 'info' | 'error'
}

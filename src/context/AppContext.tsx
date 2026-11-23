import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import campaignsData from '../data/campaigns.json'
import adminDemoData from '../data/admin-demo.json'
import pointsData from '../data/points.json'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type {
  Campaign,
  DataIssueReport,
  Delivery,
  Point,
  PointOverride,
  PointSuggestion,
  ReviewStatus,
  SatisfactionResponse,
  ToastMessage,
  UserRole,
} from '../types'
import { clearDemoStorage, isUserRole, STORAGE_KEYS } from '../utils/storage'

const basePoints = pointsData as Point[]
const baseCampaigns = campaignsData as Campaign[]
const initialReports = adminDemoData.reports as DataIssueReport[]
const initialSuggestions = adminDemoData.suggestions as PointSuggestion[]
const defaultPointId = basePoints.find((point) => point.type === 'permanent')?.id ?? basePoints[0].id

interface AppContextValue {
  deliveries: Delivery[]
  points: Point[]
  campaigns: Campaign[]
  reports: DataIssueReport[]
  suggestions: PointSuggestion[]
  favorites: string[]
  subscribedDistricts: string[]
  shareCount: number
  quizBestScore: number
  satisfactionResponses: SatisfactionResponse[]
  representedPointId: string
  pointVisits: number
  localUserId: string
  role: UserRole
  toasts: ToastMessage[]
  setRole: (role: UserRole) => void
  setRepresentedPointId: (pointId: string) => void
  addDelivery: (delivery: Omit<Delivery, 'id' | 'createdAt' | 'status'>) => void
  confirmDelivery: (id: string, actualWeightKg?: number) => void
  rejectDelivery: (id: string, reason: string) => void
  deleteDelivery: (id: string) => void
  updatePoint: (id: string, changes: PointOverride) => void
  togglePointVerification: (id: string) => void
  reviewReport: (id: string, status: Exclude<ReviewStatus, 'pending'>) => void
  reviewSuggestion: (id: string, status: Exclude<ReviewStatus, 'pending'>) => void
  submitReport: (report: Omit<DataIssueReport, 'id' | 'createdAt' | 'status' | 'isExample'>) => void
  submitSuggestion: (suggestion: Omit<PointSuggestion, 'id' | 'createdAt' | 'status' | 'isExample'>) => void
  toggleFavorite: (pointId: string) => void
  toggleSubscription: (district: string) => void
  registerShare: () => void
  saveQuizScore: (score: number) => void
  submitSatisfaction: (response: Omit<SatisfactionResponse, 'id' | 'createdAt'>) => void
  resetDemo: () => void
  createCampaign: (campaign: Omit<Campaign, 'id'>) => void
  updateCampaign: (campaign: Campaign) => void
  deleteCampaign: (id: string) => void
  registerPointVisit: () => void
  notify: (message: string, tone?: ToastMessage['tone']) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [deliveries, setDeliveries] = useLocalStorage<Delivery[]>(STORAGE_KEYS.deliveries, [])
  const [pointVisits, setPointVisits] = useLocalStorage<number>(STORAGE_KEYS.pointVisits, 0)
  const [localUserId] = useLocalStorage<string>(STORAGE_KEYS.localUserId, () => crypto.randomUUID())
  const [storedRole, setStoredRole] = useLocalStorage<UserRole>(STORAGE_KEYS.role, 'citizen')
  const [representedPointId, setRepresentedPointId] = useLocalStorage<string>(STORAGE_KEYS.representedPoint, defaultPointId)
  const [pointOverrides, setPointOverrides] = useLocalStorage<Record<string, PointOverride>>(STORAGE_KEYS.pointOverrides, {})
  const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>(STORAGE_KEYS.campaigns, baseCampaigns)
  const [reports, setReports] = useLocalStorage<DataIssueReport[]>(STORAGE_KEYS.reports, initialReports)
  const [suggestions, setSuggestions] = useLocalStorage<PointSuggestion[]>(STORAGE_KEYS.suggestions, initialSuggestions)
  const [favorites, setFavorites] = useLocalStorage<string[]>(STORAGE_KEYS.favorites, [])
  const [subscribedDistricts, setSubscribedDistricts] = useLocalStorage<string[]>(STORAGE_KEYS.subscriptions, [])
  const [shareCount, setShareCount] = useLocalStorage<number>(STORAGE_KEYS.shareCount, 0)
  const [quizBestScore, setQuizBestScore] = useLocalStorage<number>(STORAGE_KEYS.quizScore, 0)
  const [satisfactionResponses, setSatisfactionResponses] = useLocalStorage<SatisfactionResponse[]>(STORAGE_KEYS.satisfaction, [])
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const points = useMemo(() => basePoints.map((point) => ({ ...point, ...pointOverrides[point.id] })), [pointOverrides])
  const role = isUserRole(storedRole) ? storedRole : 'citizen'
  const setRole = useCallback((nextRole: UserRole) => setStoredRole(nextRole), [setStoredRole])

  const notify = useCallback((message: string, tone: ToastMessage['tone'] = 'success') => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200)
  }, [])

  const addDelivery = useCallback((delivery: Omit<Delivery, 'id' | 'createdAt' | 'status'>) => {
    setDeliveries((current) => [{ ...delivery, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'declared' }, ...current])
    notify('Entrega registrada como declaración.')
  }, [notify, setDeliveries])

  const confirmDelivery = useCallback((id: string, actualWeightKg?: number) => {
    setDeliveries((current) => current.map((delivery) => delivery.id === id ? {
      ...delivery,
      status: 'confirmed',
      actualWeightKg: actualWeightKg ?? delivery.actualWeightKg ?? delivery.estimatedWeightKg,
      confirmedAt: new Date().toISOString(),
      rejectedAt: undefined,
      rejectionReason: undefined,
    } : delivery))
    notify('Recepción confirmada por el punto.')
  }, [notify, setDeliveries])

  const rejectDelivery = useCallback((id: string, reason: string) => {
    setDeliveries((current) => current.map((delivery) => delivery.id === id ? {
      ...delivery,
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
      actualWeightKg: undefined,
      confirmedAt: undefined,
    } : delivery))
    notify('La entrega fue marcada como rechazada.', 'info')
  }, [notify, setDeliveries])

  const deleteDelivery = useCallback((id: string) => {
    setDeliveries((current) => current.filter((delivery) => delivery.id !== id))
    notify('Registro eliminado.', 'info')
  }, [notify, setDeliveries])

  const updatePoint = useCallback((id: string, changes: PointOverride) => {
    setPointOverrides((current) => ({ ...current, [id]: { ...current[id], ...changes } }))
    notify('Información del punto actualizada.')
  }, [notify, setPointOverrides])

  const togglePointVerification = useCallback((id: string) => {
    const point = points.find((item) => item.id === id)
    if (!point) return
    setPointOverrides((current) => ({
      ...current,
      [id]: {
        ...current[id],
        verified: !point.verified,
        lastVerifiedAt: new Date().toISOString().slice(0, 10),
      },
    }))
    notify(point.verified ? 'Se quitó la verificación ficticia.' : 'Punto marcado como verificado en la demo.', 'info')
  }, [notify, points, setPointOverrides])

  const reviewReport = useCallback((id: string, status: Exclude<ReviewStatus, 'pending'>) => {
    setReports((current) => current.map((report) => report.id === id ? { ...report, status } : report))
    notify(status === 'approved' ? 'Reporte marcado como atendido.' : 'Reporte descartado.', 'info')
  }, [notify, setReports])

  const reviewSuggestion = useCallback((id: string, status: Exclude<ReviewStatus, 'pending'>) => {
    setSuggestions((current) => current.map((suggestion) => suggestion.id === id ? { ...suggestion, status } : suggestion))
    notify(status === 'approved' ? 'Sugerencia aprobada para futura validación.' : 'Sugerencia descartada.', 'info')
  }, [notify, setSuggestions])

  const submitReport = useCallback((report: Omit<DataIssueReport, 'id' | 'createdAt' | 'status' | 'isExample'>) => {
    setReports((current) => [{ ...report, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'pending', isExample: true }, ...current])
    notify('Reporte enviado a la bandeja del Administrador.')
  }, [notify, setReports])

  const submitSuggestion = useCallback((suggestion: Omit<PointSuggestion, 'id' | 'createdAt' | 'status' | 'isExample'>) => {
    setSuggestions((current) => [{ ...suggestion, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'pending', isExample: true }, ...current])
    notify('Punto sugerido para revisión administrativa.')
  }, [notify, setSuggestions])

  const toggleFavorite = useCallback((pointId: string) => {
    setFavorites((current) => current.includes(pointId) ? current.filter((id) => id !== pointId) : [...current, pointId])
  }, [setFavorites])

  const toggleSubscription = useCallback((district: string) => {
    setSubscribedDistricts((current) => current.includes(district) ? current.filter((item) => item !== district) : [...current, district])
  }, [setSubscribedDistricts])

  const registerShare = useCallback(() => setShareCount((value) => value + 1), [setShareCount])
  const saveQuizScore = useCallback((score: number) => setQuizBestScore((current) => Math.max(current, score)), [setQuizBestScore])
  const submitSatisfaction = useCallback((response: Omit<SatisfactionResponse, 'id' | 'createdAt'>) => {
    setSatisfactionResponses((current) => [{ ...response, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current])
    notify('Gracias por evaluar el prototipo.')
  }, [notify, setSatisfactionResponses])
  const resetDemo = useCallback(() => { clearDemoStorage(); window.location.reload() }, [])

  const createCampaign = useCallback((campaign: Omit<Campaign, 'id'>) => {
    setCampaigns((current) => [{ ...campaign, id: `campaign-example-${crypto.randomUUID()}` }, ...current])
    notify('Campaña de ejemplo creada.')
  }, [notify, setCampaigns])

  const updateCampaign = useCallback((campaign: Campaign) => {
    setCampaigns((current) => current.map((item) => item.id === campaign.id ? campaign : item))
    notify('Campaña actualizada.')
  }, [notify, setCampaigns])

  const deleteCampaign = useCallback((id: string) => {
    const campaign = campaigns.find((item) => item.id === id)
    if (campaign && !campaign.isExample) {
      notify('La campaña real documentada no se puede eliminar.', 'error')
      return
    }
    setCampaigns((current) => current.filter((item) => item.id !== id))
    notify('Campaña eliminada.', 'info')
  }, [campaigns, notify, setCampaigns])

  const registerPointVisit = useCallback(() => setPointVisits((value) => value + 1), [setPointVisits])

  const value = useMemo(() => ({
    deliveries, points, campaigns, reports, suggestions, favorites, subscribedDistricts, shareCount, quizBestScore, satisfactionResponses, representedPointId, pointVisits, localUserId, role, toasts,
    setRole, setRepresentedPointId, addDelivery, confirmDelivery, rejectDelivery, deleteDelivery, updatePoint,
    togglePointVerification, reviewReport, reviewSuggestion, submitReport, submitSuggestion, toggleFavorite, toggleSubscription,
    registerShare, saveQuizScore, submitSatisfaction, resetDemo, createCampaign, updateCampaign, deleteCampaign,
    registerPointVisit, notify,
  }), [
    deliveries, points, campaigns, reports, suggestions, favorites, subscribedDistricts, shareCount, quizBestScore, satisfactionResponses, representedPointId, pointVisits, localUserId, role, toasts,
    setRole, setRepresentedPointId, addDelivery, confirmDelivery, rejectDelivery, deleteDelivery, updatePoint,
    togglePointVerification, reviewReport, reviewSuggestion, submitReport, submitSuggestion, toggleFavorite, toggleSubscription,
    registerShare, saveQuizScore, submitSatisfaction, resetDemo, createCampaign, updateCampaign, deleteCampaign,
    registerPointVisit, notify,
  ])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// The provider and its companion hook intentionally share one module.
// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp debe utilizarse dentro de AppProvider')
  return context
}

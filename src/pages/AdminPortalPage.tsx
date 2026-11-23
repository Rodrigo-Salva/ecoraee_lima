import { BarChart3, CheckCircle2, Download, FileWarning, MapPinned, Pencil, Plus, Scale, ShieldCheck, Trash2, UserRound, XCircle } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import PageHeader from '../components/PageHeader'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import Stat from '../components/ui/Stat'
import Tabs from '../components/ui/Tabs'
import { WASTE_LABELS } from '../constants'
import { useApp } from '../context/AppContext'
import type { Campaign, ReviewStatus, WasteType } from '../types'
import { downloadCsv } from '../utils/csv'
import { calculateDeliveryMetrics, formatDate, getCampaignStatus, getDeliveryItems } from '../utils/domain'

type AdminTab = 'points' | 'quality' | 'campaigns' | 'indicators'
type QualityTab = 'reports' | 'suggestions'

interface CampaignForm {
  id?: string
  title: string
  startDate: string
  endDate: string
  place: string
  district: string
  organizer: string
  description: string
}

const emptyCampaign: CampaignForm = { title: '', startDate: '', endDate: '', place: '', district: '', organizer: '', description: '' }
const reviewLabels: Record<ReviewStatus, string> = { pending: 'Pendiente', approved: 'Atendido', discarded: 'Descartado' }

export default function AdminPortalPage() {
  const {
    points, campaigns, deliveries, reports, suggestions, pointVisits, localUserId,
    togglePointVerification, reviewReport, reviewSuggestion, createCampaign, updateCampaign, deleteCampaign,
  } = useApp()
  const [tab, setTab] = useState<AdminTab>('points')
  const [qualityTab, setQualityTab] = useState<QualityTab>('reports')
  const [campaignModal, setCampaignModal] = useState(false)
  const [campaignForm, setCampaignForm] = useState<CampaignForm>(emptyCampaign)
  const [campaignError, setCampaignError] = useState('')

  const metrics = calculateDeliveryMetrics(deliveries)
  const rejected = deliveries.filter((delivery) => delivery.status === 'rejected').length
  const pendingQuality = reports.filter((item) => item.status === 'pending').length + suggestions.filter((item) => item.status === 'pending').length
  const deliveryChart = useMemo(() => Object.entries(deliveries.flatMap(getDeliveryItems).reduce<Partial<Record<WasteType, number>>>((result, item) => ({ ...result, [item.wasteType]: (result[item.wasteType] ?? 0) + item.quantity }), {})).map(([type, value]) => ({ name: WASTE_LABELS[type as WasteType], cantidad: value })), [deliveries])

  const openCreateCampaign = () => { setCampaignForm(emptyCampaign); setCampaignError(''); setCampaignModal(true) }
  const openEditCampaign = (campaign: Campaign) => {
    setCampaignForm({ id: campaign.id, title: campaign.title, startDate: campaign.startDate, endDate: campaign.endDate, place: campaign.place, district: campaign.district, organizer: campaign.organizer, description: campaign.description })
    setCampaignError('')
    setCampaignModal(true)
  }
  const saveCampaign = (event: FormEvent) => {
    event.preventDefault()
    if (!campaignForm.title.trim() || !campaignForm.startDate || !campaignForm.endDate || !campaignForm.place.trim() || !campaignForm.district.trim() || !campaignForm.organizer.trim()) { setCampaignError('Completa todos los campos obligatorios.'); return }
    if (campaignForm.endDate < campaignForm.startDate) { setCampaignError('La fecha final no puede ser anterior a la inicial.'); return }
    if (campaignForm.id) {
      const original = campaigns.find((item) => item.id === campaignForm.id)
      if (!original) return
      updateCampaign({ ...original, ...campaignForm, id: campaignForm.id })
    } else {
      createCampaign({ ...campaignForm, title: campaignForm.title.includes('(ejemplo)') ? campaignForm.title : `${campaignForm.title} (ejemplo)`, isExample: true })
    }
    setCampaignModal(false)
  }

  const exportIndicators = () => downloadCsv('ecoraee-indicadores-globales.csv', [
    { indicador: 'Puntos registrados', valor: points.length },
    { indicador: 'Puntos con verificación ficticia', valor: points.filter((point) => point.verified).length },
    { indicador: 'Consultas a detalles', valor: pointVisits },
    { indicador: 'Entregas declaradas', valor: metrics.declared },
    { indicador: 'Entregas confirmadas', valor: metrics.confirmed },
    { indicador: 'Entregas rechazadas', valor: rejected },
    { indicador: 'Peso confirmado (kg)', valor: metrics.confirmedWeight },
    { indicador: 'Usuarios locales del prototipo', valor: localUserId ? 1 : 0 },
  ])

  return (
    <>
      <PageHeader eyebrow="Gestión de la plataforma" title="Administración de EcoRAEE" description="Revisa puntos, solicitudes ciudadanas, campañas e indicadores guardados en esta demostración local." actions={<Badge tone="blue"><ShieldCheck className="h-4 w-4" />Rol: Administrador</Badge>} />
      <section className="container-page py-8 sm:py-10">
        <div className="grid gap-4 sm:grid-cols-3"><Stat label="Puntos registrados" value={points.length} help={`${points.filter((point) => point.verified).length} con verificación ficticia`} icon={MapPinned} /><Stat label="Pendientes de revisión" value={pendingQuality} help="Reportes y sugerencias de la bandeja local." icon={FileWarning} /><Stat label="Entregas confirmadas" value={metrics.confirmed} help={`${metrics.confirmedWeight.toLocaleString('es-PE')} kg confirmados`} icon={CheckCircle2} /></div>
        <div className="mt-8"><Tabs label="Módulos de administración" value={tab} onChange={setTab} items={[{ value: 'points', label: 'Puntos' }, { value: 'quality', label: 'Calidad de datos', count: pendingQuality }, { value: 'campaigns', label: 'Campañas' }, { value: 'indicators', label: 'Indicadores' }]} /></div>

        {tab === 'points' && <PointsPanel points={points} onToggle={togglePointVerification} />}
        {tab === 'quality' && <QualityPanel qualityTab={qualityTab} setQualityTab={setQualityTab} reports={reports} suggestions={suggestions} points={points} reviewReport={reviewReport} reviewSuggestion={reviewSuggestion} />}
        {tab === 'campaigns' && <CampaignsPanel campaigns={campaigns} onCreate={openCreateCampaign} onEdit={openEditCampaign} onDelete={deleteCampaign} />}
        {tab === 'indicators' && <IndicatorsPanel pointsCount={points.length} verifiedCount={points.filter((point) => point.verified).length} visits={pointVisits} declared={metrics.declared} confirmed={metrics.confirmed} rejected={rejected} weight={metrics.confirmedWeight} users={localUserId ? 1 : 0} chart={deliveryChart} onExport={exportIndicators} />}
      </section>

      <Modal open={campaignModal} onClose={() => setCampaignModal(false)} title={campaignForm.id ? 'Editar campaña de ejemplo' : 'Crear campaña de ejemplo'} description="Los datos creados desde este panel se guardan únicamente en localStorage.">
        <form onSubmit={saveCampaign} className="space-y-4">
          <label><span className="field-label">Nombre</span><input className="field" value={campaignForm.title} onChange={(event) => setCampaignForm((current) => ({ ...current, title: event.target.value }))} /></label>
          <div className="grid grid-cols-2 gap-3"><label><span className="field-label">Fecha inicial</span><input type="date" className="field" value={campaignForm.startDate} onChange={(event) => setCampaignForm((current) => ({ ...current, startDate: event.target.value }))} /></label><label><span className="field-label">Fecha final</span><input type="date" className="field" value={campaignForm.endDate} onChange={(event) => setCampaignForm((current) => ({ ...current, endDate: event.target.value }))} /></label></div>
          <label><span className="field-label">Lugar</span><input className="field" value={campaignForm.place} onChange={(event) => setCampaignForm((current) => ({ ...current, place: event.target.value }))} /></label>
          <label><span className="field-label">Distrito</span><input className="field" value={campaignForm.district} onChange={(event) => setCampaignForm((current) => ({ ...current, district: event.target.value }))} /></label>
          <label><span className="field-label">Entidad organizadora</span><input className="field" value={campaignForm.organizer} onChange={(event) => setCampaignForm((current) => ({ ...current, organizer: event.target.value }))} /></label>
          <label><span className="field-label">Descripción</span><textarea className="field min-h-24" value={campaignForm.description} onChange={(event) => setCampaignForm((current) => ({ ...current, description: event.target.value }))} /></label>
          {campaignError && <p className="text-sm font-semibold text-red-700" role="alert">{campaignError}</p>}
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setCampaignModal(false)}>Cancelar</Button><Button type="submit">Guardar campaña</Button></div>
        </form>
      </Modal>
    </>
  )
}

function PointsPanel({ points, onToggle }: { points: ReturnType<typeof useApp>['points']; onToggle: (id: string) => void }) {
  return <Card className="mt-6 overflow-hidden"><div className="border-b border-slate-100 p-5"><h2 className="text-xl font-bold text-slate-950">Verificación de puntos</h2><p className="mt-1 text-sm text-slate-600">Estados ilustrativos del prototipo, no validaciones oficiales.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-5 py-3">Punto</th><th className="px-5 py-3">Distrito</th><th className="px-5 py-3">Tipo</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3 text-right">Acción</th></tr></thead><tbody className="divide-y divide-slate-100">{points.map((point) => <tr key={point.id}><td className="px-5 py-4 font-semibold text-slate-900">{point.name}</td><td className="px-5 py-4">{point.district}</td><td className="px-5 py-4">{point.type === 'permanent' ? 'Permanente' : 'Campaña'}</td><td className="px-5 py-4"><Badge tone={point.verified ? 'green' : 'gray'}>{point.verified ? 'Verificado*' : 'Sin verificar'}</Badge></td><td className="px-5 py-4 text-right"><Button size="sm" variant={point.verified ? 'secondary' : 'primary'} onClick={() => onToggle(point.id)}>{point.verified ? 'Quitar verificación' : 'Verificar'}</Button></td></tr>)}</tbody></table></div></Card>
}

function QualityPanel({ qualityTab, setQualityTab, reports, suggestions, points, reviewReport, reviewSuggestion }: { qualityTab: QualityTab; setQualityTab: (value: QualityTab) => void; reports: ReturnType<typeof useApp>['reports']; suggestions: ReturnType<typeof useApp>['suggestions']; points: ReturnType<typeof useApp>['points']; reviewReport: ReturnType<typeof useApp>['reviewReport']; reviewSuggestion: ReturnType<typeof useApp>['reviewSuggestion'] }) {
  const items = qualityTab === 'reports' ? reports : suggestions
  return <div className="mt-6"><Tabs label="Tipo de solicitud" value={qualityTab} onChange={setQualityTab} items={[{ value: 'reports', label: 'Información incorrecta', count: reports.filter((item) => item.status === 'pending').length }, { value: 'suggestions', label: 'Puntos sugeridos', count: suggestions.filter((item) => item.status === 'pending').length }]} /><div className="mt-5 space-y-4">{items.length ? items.map((item) => qualityTab === 'reports' ? (() => { const report = item as typeof reports[number]; const point = points.find((entry) => entry.id === report.pointId); return <Card key={report.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><Badge tone="yellow">Ejemplo</Badge><ReviewBadge status={report.status} /></div><h2 className="mt-3 font-bold text-slate-950">{report.category}</h2><p className="mt-1 text-sm font-semibold text-petrol">{point?.name ?? 'Punto no disponible'}</p></div>{report.status === 'pending' && <ReviewActions onApprove={() => reviewReport(report.id, 'approved')} onDiscard={() => reviewReport(report.id, 'discarded')} />}</div><p className="mt-4 leading-7 text-slate-600">{report.description}</p><p className="mt-3 text-xs text-slate-500">Recibido: {formatDate(report.createdAt)}</p></Card> })() : (() => { const suggestion = item as typeof suggestions[number]; return <Card key={suggestion.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><Badge tone="yellow">Ejemplo</Badge><ReviewBadge status={suggestion.status} /></div><h2 className="mt-3 font-bold text-slate-950">{suggestion.name}</h2><p className="mt-1 text-sm text-slate-600">{suggestion.address} · {suggestion.district}</p></div>{suggestion.status === 'pending' && <ReviewActions onApprove={() => reviewSuggestion(suggestion.id, 'approved')} onDiscard={() => reviewSuggestion(suggestion.id, 'discarded')} />}</div><p className="mt-4 leading-7 text-slate-600">{suggestion.notes}</p><div className="mt-3 flex flex-wrap gap-2">{suggestion.acceptedWaste.map((waste) => <Badge key={waste} tone="blue">{WASTE_LABELS[waste]}</Badge>)}</div></Card> })()) : <EmptyState icon={FileWarning} title="Bandeja vacía" description="Las solicitudes ciudadanas aparecerán en este espacio." />}</div></div>
}

function ReviewBadge({ status }: { status: ReviewStatus }) { return <Badge tone={status === 'pending' ? 'yellow' : status === 'approved' ? 'green' : 'gray'}>{reviewLabels[status]}</Badge> }
function ReviewActions({ onApprove, onDiscard }: { onApprove: () => void; onDiscard: () => void }) { return <div className="flex gap-2"><Button size="sm" onClick={onApprove}><CheckCircle2 className="h-4 w-4" />Aprobar</Button><Button size="sm" variant="secondary" onClick={onDiscard}><XCircle className="h-4 w-4" />Descartar</Button></div> }

function CampaignsPanel({ campaigns, onCreate, onEdit, onDelete }: { campaigns: Campaign[]; onCreate: () => void; onEdit: (campaign: Campaign) => void; onDelete: (id: string) => void }) {
  return <div className="mt-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-bold text-slate-950">Gestión de campañas</h2><p className="mt-1 text-slate-600">{campaigns.length} campañas almacenadas</p></div><Button onClick={onCreate}><Plus className="h-4 w-4" />Nueva campaña</Button></div><div className="mt-5 grid gap-4 lg:grid-cols-2">{campaigns.map((campaign) => <Card key={campaign.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><Badge tone={campaign.isExample ? 'yellow' : 'green'}>{campaign.isExample ? 'Ejemplo' : 'Documentada'}</Badge><h3 className="mt-3 text-lg font-bold text-slate-950">{campaign.title}</h3><p className="mt-1 text-sm text-slate-600">{formatDate(campaign.startDate)} · {campaign.district}</p></div><Badge tone={getCampaignStatus(campaign) === 'finished' ? 'gray' : getCampaignStatus(campaign) === 'active' ? 'green' : 'blue'}>{getCampaignStatus(campaign) === 'finished' ? 'Finalizada' : getCampaignStatus(campaign) === 'active' ? 'En curso' : 'Próxima'}</Badge></div><p className="mt-4 text-sm leading-6 text-slate-600">{campaign.place} · {campaign.organizer}</p><div className="mt-5 flex gap-2"><Button size="sm" variant="secondary" onClick={() => onEdit(campaign)} disabled={!campaign.isExample}><Pencil className="h-4 w-4" />Editar</Button><Button size="sm" variant="danger" onClick={() => { if (window.confirm('¿Eliminar esta campaña de ejemplo?')) onDelete(campaign.id) }} disabled={!campaign.isExample}><Trash2 className="h-4 w-4" />Eliminar</Button></div>{!campaign.isExample && <p className="mt-3 text-xs text-slate-500">La campaña real documentada está protegida contra cambios desde la demo.</p>}</Card>)}</div></div>
}

function IndicatorsPanel({ pointsCount, verifiedCount, visits, declared, confirmed, rejected, weight, users, chart, onExport }: { pointsCount: number; verifiedCount: number; visits: number; declared: number; confirmed: number; rejected: number; weight: number; users: number; chart: Array<{ name: string; cantidad: number | undefined }>; onExport: () => void }) {
  return <div className="mt-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-bold text-slate-950">Indicadores globales</h2><p className="mt-1 text-slate-600">Datos del prototipo guardados en este navegador.</p></div><Button onClick={onExport}><Download className="h-4 w-4" />Exportar CSV</Button></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Stat label="Puntos" value={pointsCount} help={`${verifiedCount} verificados*`} icon={MapPinned} /><Stat label="Consultas" value={visits} help="Visitas a detalles" icon={BarChart3} /><Stat label="Entregas" value={declared + confirmed + rejected} help={`${declared} declaradas · ${rejected} rechazadas`} icon={CheckCircle2} /><Stat label="Peso confirmado" value={`${weight.toLocaleString('es-PE')} kg`} help={`${confirmed} recepciones confirmadas`} icon={Scale} /><Stat label="Usuarios" value={users} help="Usuario local del prototipo" icon={UserRound} /></div><Card className="mt-6 p-5 sm:p-7"><h3 className="text-xl font-bold text-slate-950">Unidades por tipo de dispositivo</h3>{chart.length ? <div className="mt-5 h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={80} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="cantidad" fill="#1B5E20" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div> : <div className="mt-5"><EmptyState icon={BarChart3} title="Sin entregas todavía" description="Los datos aparecerán cuando un ciudadano registre una entrega." /></div>}<p className="mt-4 text-xs text-slate-500">*La verificación mostrada es ficticia y no representa validación oficial.</p></Card></div>
}

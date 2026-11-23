import { BarChart3, CheckCircle2, ClipboardCheck, PackageCheck, Scale, Settings2, Warehouse, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import DeliveryStatusBadge from '../components/DeliveryStatusBadge'
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
import { WASTE_TYPES, type Delivery, type DeliveryStatus, type WasteType } from '../types'
import { formatDate, getDeliveryItems } from '../utils/domain'

type PortalTab = 'deliveries' | 'settings'
type DeliveryAction = { type: 'confirm' | 'reject'; delivery: Delivery } | null

export default function PointPortalPage() {
  const { points, deliveries, representedPointId, setRepresentedPointId, confirmDelivery, rejectDelivery, updatePoint } = useApp()
  const availablePoints = useMemo(() => points.filter((point) => point.type === 'permanent'), [points])
  const point = availablePoints.find((item) => item.id === representedPointId) ?? availablePoints[0]!
  const [tab, setTab] = useState<PortalTab>('deliveries')
  const [status, setStatus] = useState<DeliveryStatus | 'all'>('declared')
  const [action, setAction] = useState<DeliveryAction>(null)
  const [weight, setWeight] = useState('')
  const [reason, setReason] = useState('')
  const [actionError, setActionError] = useState('')
  const [schedule, setSchedule] = useState(point.schedule)
  const [conditions, setConditions] = useState(point.conditions)
  const [acceptedWaste, setAcceptedWaste] = useState<WasteType[]>(point.acceptedWaste)

  useEffect(() => {
    setSchedule(point.schedule)
    setConditions(point.conditions)
    setAcceptedWaste(point.acceptedWaste)
  }, [point])

  const pointDeliveries = useMemo(() => deliveries.filter((delivery) => delivery.pointId === point.id), [deliveries, point.id])
  const visibleDeliveries = pointDeliveries.filter((delivery) => status === 'all' || delivery.status === status)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthDeliveries = pointDeliveries.filter((delivery) => delivery.deliveryDate.startsWith(currentMonth))
  const confirmed = pointDeliveries.filter((delivery) => delivery.status === 'confirmed')
  const confirmedWeight = confirmed.reduce((sum, delivery) => sum + (delivery.actualWeightKg ?? delivery.estimatedWeightKg ?? 0), 0)
  const chartData = Object.entries(pointDeliveries.flatMap(getDeliveryItems).reduce<Partial<Record<WasteType, number>>>((result, item) => ({ ...result, [item.wasteType]: (result[item.wasteType] ?? 0) + item.quantity }), {})).map(([type, value]) => ({ name: WASTE_LABELS[type as WasteType], cantidad: value }))

  const closeAction = () => { setAction(null); setWeight(''); setReason(''); setActionError('') }
  const submitAction = (event: FormEvent) => {
    event.preventDefault()
    if (!action) return
    if (action.type === 'confirm') {
      if (!weight || Number(weight) <= 0) { setActionError('Ingresa el peso real recibido, mayor que cero.'); return }
      confirmDelivery(action.delivery.id, Number(weight))
    } else {
      if (reason.trim().length < 5) { setActionError('Explica brevemente el motivo del rechazo.'); return }
      rejectDelivery(action.delivery.id, reason.trim())
    }
    closeAction()
  }

  const savePoint = (event: FormEvent) => {
    event.preventDefault()
    if (!schedule.trim() || !conditions.trim() || !acceptedWaste.length) return
    updatePoint(point.id, { schedule: schedule.trim(), conditions: conditions.trim(), acceptedWaste })
  }

  const toggleWaste = (waste: WasteType) => setAcceptedWaste((current) => current.includes(waste) ? current.filter((item) => item !== waste) : [...current, waste])

  return (
    <>
      <PageHeader eyebrow="Operación del punto" title="Panel del punto de recolección" description="Revisa declaraciones, confirma el peso recibido y mantén actualizada la información visible para los ciudadanos." actions={<Badge tone="blue"><Warehouse className="h-4 w-4" />Rol: Punto de recolección</Badge>} />
      <section className="container-page py-8 sm:py-10">
        <Card className="p-5">
          <label className="block max-w-2xl"><span className="field-label">Punto que representas en la demostración</span><select className="field" value={point.id} onChange={(event) => setRepresentedPointId(event.target.value)}>{availablePoints.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <p className="mt-3 text-sm text-slate-500">Selección guardada solamente en este navegador. Todos los puntos son datos de ejemplo.</p>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Stat label="Entregas del mes" value={monthDeliveries.length} help="Declaraciones asociadas al punto este mes." icon={ClipboardCheck} />
          <Stat label="Confirmadas" value={confirmed.length} help="Recepciones confirmadas en la demostración." icon={PackageCheck} />
          <Stat label="Peso confirmado" value={`${confirmedWeight.toLocaleString('es-PE')} kg`} help="Peso real recibido o estimado en registros previos." icon={Scale} />
        </div>

        <div className="mt-8"><Tabs label="Secciones del panel del punto" value={tab} onChange={setTab} items={[{ value: 'deliveries', label: 'Bandeja de entregas' }, { value: 'settings', label: 'Datos del punto' }]} /></div>

        {tab === 'deliveries' ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-bold text-slate-950">Entregas declaradas</h2><p className="mt-1 text-slate-600">{pointDeliveries.length} registros vinculados a este punto</p></div><Tabs label="Filtrar entregas por estado" value={status} onChange={setStatus} items={[{ value: 'all', label: 'Todas' }, { value: 'declared', label: 'Declaradas' }, { value: 'confirmed', label: 'Confirmadas' }, { value: 'rejected', label: 'Rechazadas' }]} /></div>
              {visibleDeliveries.length ? <div className="mt-5 space-y-4">{visibleDeliveries.map((delivery) => <Card key={delivery.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><DeliveryStatusBadge status={delivery.status} /><h3 className="mt-3 text-lg font-bold text-slate-950">{WASTE_LABELS[delivery.wasteType]} · {delivery.quantity} {delivery.quantity === 1 ? 'unidad' : 'unidades'}</h3><p className="mt-1 text-sm text-slate-600">Entrega declarada para el {formatDate(delivery.deliveryDate)}</p></div>{delivery.status === 'declared' && <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => setAction({ type: 'confirm', delivery })}><CheckCircle2 className="h-4 w-4" />Confirmar</Button><Button size="sm" variant="danger" onClick={() => setAction({ type: 'reject', delivery })}><XCircle className="h-4 w-4" />Rechazar</Button></div>}</div><dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3"><div><dt className="font-bold text-slate-500">Peso estimado</dt><dd>{delivery.estimatedWeightKg ? `${delivery.estimatedWeightKg} kg` : 'No indicado'}</dd></div><div><dt className="font-bold text-slate-500">Peso recibido</dt><dd>{delivery.actualWeightKg ? `${delivery.actualWeightKg} kg` : 'Pendiente'}</dd></div><div><dt className="font-bold text-slate-500">Registro</dt><dd>{formatDate(delivery.createdAt)}</dd></div></dl>{delivery.rejectionReason && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"><strong>Motivo:</strong> {delivery.rejectionReason}</p>}</Card>)}</div> : <div className="mt-5"><EmptyState icon={ClipboardCheck} title="No hay entregas en este estado" description="Cambia el filtro o registra una entrega ciudadana para este punto." /></div>}
            </div>
            <Card className="p-5 sm:p-6"><div className="flex items-center gap-3"><BarChart3 className="h-6 w-6 text-petrol" /><h2 className="text-xl font-bold text-slate-950">Equipos declarados</h2></div>{chartData.length ? <div className="mt-5 h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical" margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="cantidad" fill="#006064" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></div> : <div className="mt-5"><EmptyState icon={BarChart3} title="Sin datos para graficar" description="El gráfico se activará cuando existan entregas para este punto." /></div>}</Card>
          </div>
        ) : (
          <Card className="mt-6 p-6 sm:p-8">
            <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-forest"><Settings2 className="h-5 w-5" /></span><div><h2 className="text-xl font-bold text-slate-950">Información pública del punto</h2><p className="mt-1 text-sm text-slate-600">Los cambios se reflejan en el mapa y en el detalle del punto.</p></div></div>
            <form onSubmit={savePoint} className="mt-7 max-w-3xl space-y-5">
              <label><span className="field-label">Horario</span><textarea className="field min-h-24" required value={schedule} onChange={(event) => setSchedule(event.target.value)} /></label>
              <label><span className="field-label">Condiciones de recepción</span><textarea className="field min-h-28" required value={conditions} onChange={(event) => setConditions(event.target.value)} /></label>
              <fieldset><legend className="field-label">Residuos aceptados</legend><div className="grid gap-2 sm:grid-cols-2">{WASTE_TYPES.map((waste) => <label key={waste} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 text-sm font-semibold"><input type="checkbox" className="h-4 w-4 accent-forest" checked={acceptedWaste.includes(waste)} onChange={() => toggleWaste(waste)} />{WASTE_LABELS[waste]}</label>)}</div>{!acceptedWaste.length && <p className="mt-2 text-sm font-semibold text-red-700">Selecciona al menos un tipo de residuo.</p>}</fieldset>
              <Button type="submit" disabled={!schedule.trim() || !conditions.trim() || !acceptedWaste.length}>Guardar cambios</Button>
            </form>
          </Card>
        )}
      </section>

      <Modal open={Boolean(action)} onClose={closeAction} title={action?.type === 'confirm' ? 'Confirmar recepción' : 'Rechazar entrega'} description={action?.type === 'confirm' ? 'Registra el peso real recibido para actualizar los indicadores.' : 'El ciudadano verá el motivo en su historial.'}>
        <form onSubmit={submitAction}>
          {action?.type === 'confirm' ? <label><span className="field-label">Peso real recibido (kg)</span><input autoFocus className="field" type="number" min="0.01" step="0.01" value={weight} onChange={(event) => { setWeight(event.target.value); setActionError('') }} placeholder="Ej. 2.35" /></label> : <label><span className="field-label">Motivo del rechazo</span><textarea autoFocus className="field min-h-28" maxLength={300} value={reason} onChange={(event) => { setReason(event.target.value); setActionError('') }} placeholder="Ej. El equipo no fue llevado al punto." /></label>}
          {actionError && <p className="mt-3 text-sm font-semibold text-red-700" role="alert">{actionError}</p>}
          <div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={closeAction}>Cancelar</Button><Button type="submit" variant={action?.type === 'reject' ? 'danger' : 'primary'}>{action?.type === 'confirm' ? 'Confirmar recepción' : 'Rechazar entrega'}</Button></div>
        </form>
      </Modal>
    </>
  )
}

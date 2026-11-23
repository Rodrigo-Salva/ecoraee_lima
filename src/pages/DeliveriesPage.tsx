import { Award, CheckCircle2, ClipboardList, Download, Plus, Search, Scale, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import DeliveryStatusBadge from '../components/DeliveryStatusBadge'
import PageHeader from '../components/PageHeader'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Stat from '../components/ui/Stat'
import { WASTE_LABELS } from '../constants'
import { useApp } from '../context/AppContext'
import type { Delivery, DeliveryItem, DeliveryStatus, Point, WasteType } from '../types'
import { downloadCsv } from '../utils/csv'
import { formatDate, getDeliveryItems, normalizeText } from '../utils/domain'

interface DraftItem { wasteType: WasteType; quantity: string; estimatedWeightKg: string }
const today = new Date().toISOString().slice(0, 10)
const emptyItem = (): DraftItem => ({ wasteType: 'phone', quantity: '1', estimatedWeightKg: '' })

export default function DeliveriesPage() {
  const [searchParams] = useSearchParams()
  const { points, deliveries, addDelivery, deleteDelivery, shareCount } = useApp()
  const requestedPoint = searchParams.get('point')
  const requestedWaste = searchParams.get('waste') as WasteType | null
  const [pointId, setPointId] = useState(points.some((point) => point.id === requestedPoint) ? requestedPoint! : '')
  const [items, setItems] = useState<DraftItem[]>([{ ...emptyItem(), ...(requestedWaste && requestedWaste in WASTE_LABELS ? { wasteType: requestedWaste } : {}) }])
  const [deliveryDate, setDeliveryDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [pointSearch, setPointSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all')
  const filteredPoints = useMemo(() => points.filter((point) => normalizeText(`${point.name} ${point.district}`).includes(normalizeText(pointSearch))), [pointSearch, points])
  const visible = useMemo(() => [...deliveries].filter((delivery) => statusFilter === 'all' || delivery.status === statusFilter).sort((a, b) => b.deliveryDate.localeCompare(a.deliveryDate)), [deliveries, statusFilter])
  const confirmed = deliveries.filter((delivery) => delivery.status === 'confirmed')
  const totalConfirmedItems = confirmed.flatMap(getDeliveryItems).reduce((sum, item) => sum + item.quantity, 0)
  const totalDeclaredWeight = deliveries.reduce((sum, delivery) => sum + getDeliveryItems(delivery).reduce((itemSum, item) => itemSum + (item.estimatedWeightKg ?? 0), 0), 0)
  const totalConfirmedWeight = confirmed.reduce((sum, delivery) => sum + (delivery.actualWeightKg ?? getDeliveryItems(delivery).reduce((itemSum, item) => itemSum + (item.estimatedWeightKg ?? 0), 0)), 0)

  const updateItem = (index: number, changes: Partial<DraftItem>) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const validItems = items.every((item) => Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0 && (!item.estimatedWeightKg || Number(item.estimatedWeightKg) > 0))
    if (!pointId || !deliveryDate || deliveryDate > today || !validItems) { setError('Selecciona un punto, una fecha válida y cantidades mayores que cero.'); return }
    const parsed: DeliveryItem[] = items.map((item) => ({ wasteType: item.wasteType, quantity: Number(item.quantity), ...(item.estimatedWeightKg ? { estimatedWeightKg: Number(item.estimatedWeightKg) } : {}) }))
    addDelivery({ pointId, wasteType: parsed[0].wasteType, quantity: parsed[0].quantity, items: parsed, deliveryDate, estimatedWeightKg: parsed.reduce((sum, item) => sum + (item.estimatedWeightKg ?? 0), 0) || undefined, ...(notes.trim() ? { notes: notes.trim() } : {}) })
    setItems([emptyItem()]); setNotes(''); setError('')
  }
  const remove = (id: string) => { if (window.confirm('¿Eliminar este registro de entrega?')) deleteDelivery(id) }
  const exportMine = () => downloadCsv('mis-entregas-ecoraee.csv', deliveries.flatMap((delivery) => getDeliveryItems(delivery).map((item) => ({ codigo: delivery.id, fecha: delivery.deliveryDate, punto: points.find((point) => point.id === delivery.pointId)?.name ?? '', equipo: WASTE_LABELS[item.wasteType], cantidad: item.quantity, peso_estimado_kg: item.estimatedWeightKg ?? '', peso_confirmado_kg: delivery.actualWeightKg ?? '', estado: delivery.status }))))

  return (
    <>
      <PageHeader eyebrow="Registro local" title="Mis entregas" description="Declara varios equipos en una sola entrega y sigue su confirmación por el punto." actions={<Button variant="secondary" onClick={exportMine} disabled={!deliveries.length}><Download className="h-4 w-4" />Exportar CSV</Button>} />
      <section className="container-page py-10">
        <div className="grid gap-4 sm:grid-cols-3"><Stat label="Peso declarado" value={`${totalDeclaredWeight.toLocaleString('es-PE')} kg`} help="Suma de pesos estimados" icon={Scale} /><Stat label="Peso confirmado" value={`${totalConfirmedWeight.toLocaleString('es-PE')} kg`} help="Validado por los puntos" icon={CheckCircle2} /><Stat label="Equipos confirmados" value={totalConfirmedItems} help="Conteo de unidades recibidas" icon={Award} /></div>
        <Badges confirmed={confirmed.length} items={totalConfirmedItems} shares={shareCount} />
        <div className="mt-8 grid gap-8 lg:grid-cols-[440px_1fr] lg:items-start">
          <form onSubmit={submit} className="card p-6 lg:sticky lg:top-24" noValidate>
            <h2 className="text-xl font-bold text-slate-950">Registrar entrega</h2><p className="mt-2 text-sm leading-6 text-slate-600">La declaración queda pendiente hasta que el punto confirme la recepción.</p>
            <div className="mt-5"><label className="field-label" htmlFor="point-search">Buscar punto</label><span className="relative block"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input id="point-search" className="field pl-10" value={pointSearch} onChange={(event) => setPointSearch(event.target.value)} placeholder="Nombre o distrito" /></span></div>
            <label className="mt-4 block"><span className="field-label">Punto de recolección</span><select className="field" value={pointId} onChange={(event) => setPointId(event.target.value)}><option value="">Selecciona un punto</option>{filteredPoints.map((point) => <option key={point.id} value={point.id}>{point.name}</option>)}</select></label>
            <div className="mt-5 space-y-3"><div className="flex items-center justify-between"><h3 className="font-bold text-slate-900">Equipos</h3><Button size="sm" variant="secondary" onClick={() => setItems((current) => [...current, emptyItem()])}><Plus className="h-4 w-4" />Agregar</Button></div>{items.map((item, index) => <div key={index} className="rounded-xl border border-slate-200 p-3"><div className="flex justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Equipo {index + 1}</span>{items.length > 1 && <button type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="text-red-700" aria-label={`Eliminar equipo ${index + 1}`}><Trash2 className="h-4 w-4" /></button>}</div><select className="field mt-2" value={item.wasteType} onChange={(event) => updateItem(index, { wasteType: event.target.value as WasteType })}>{Object.entries(WASTE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><div className="mt-2 grid grid-cols-2 gap-2"><input className="field" aria-label={`Cantidad del equipo ${index + 1}`} type="number" min="1" step="1" value={item.quantity} onChange={(event) => updateItem(index, { quantity: event.target.value })} placeholder="Cantidad" /><input className="field" aria-label={`Peso del equipo ${index + 1}`} type="number" min="0.01" step="0.01" value={item.estimatedWeightKg} onChange={(event) => updateItem(index, { estimatedWeightKg: event.target.value })} placeholder="Peso kg" /></div></div>)}</div>
            <label className="mt-4 block"><span className="field-label">Fecha</span><input className="field" type="date" max={today} value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} /></label>
            <label className="mt-4 block"><span className="field-label">Notas (opcional)</span><textarea className="field min-h-20" maxLength={300} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
            {error && <p className="mt-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
            <Button type="submit" className="mt-5 w-full"><ClipboardList className="h-5 w-5" />Guardar declaración</Button>
          </form>

          <div><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-bold text-slate-950">Historial y seguimiento</h2><p className="mt-1 text-slate-600">{deliveries.length} registros guardados</p></div><select className="field max-w-52" aria-label="Filtrar entregas" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as DeliveryStatus | 'all')}><option value="all">Todos los estados</option><option value="declared">Declaradas</option><option value="confirmed">Confirmadas</option><option value="rejected">Rechazadas</option></select></div>{visible.length ? <div className="mt-5 space-y-4">{visible.map((delivery) => <DeliveryCard key={delivery.id} delivery={delivery} point={points.find((point) => point.id === delivery.pointId)} onDelete={() => remove(delivery.id)} />)}</div> : <Card className="mt-5 p-10 text-center"><ClipboardList className="mx-auto h-10 w-10 text-slate-400" /><p className="mt-4 font-bold">No hay entregas en este estado.</p></Card>}</div>
        </div>
      </section>
    </>
  )
}

function Badges({ confirmed, items, shares }: { confirmed: number; items: number; shares: number }) { const badges = [{ name: 'Primera entrega', earned: confirmed >= 1 }, { name: '5 equipos', earned: items >= 5 }, { name: 'Difusor', earned: shares >= 1 }]; const progress = Math.min(100, (badges.filter((badge) => badge.earned).length / badges.length) * 100); return <Card className="mt-6 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-slate-950">Participación local</h2><p className="mt-1 text-sm text-slate-600">Insignias privadas guardadas en este navegador.</p></div><span className="font-bold text-forest">{Math.round(progress)} %</span></div><div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-eco" style={{ width: `${progress}%` }} /></div><div className="mt-4 flex flex-wrap gap-2">{badges.map((badge) => <Badge key={badge.name} tone={badge.earned ? 'green' : 'gray'}><Award className="h-4 w-4" />{badge.name}</Badge>)}</div></Card> }

function DeliveryCard({ delivery, point, onDelete }: { delivery: Delivery; point?: Point; onDelete: () => void }) { const items = getDeliveryItems(delivery); return <Card className="p-5"><div className="flex justify-between gap-3"><div><DeliveryStatusBadge status={delivery.status} /><h3 className="mt-3 font-bold text-slate-950">{items.reduce((sum, item) => sum + item.quantity, 0)} equipos · {point?.name ?? 'Punto no disponible'}</h3></div><button type="button" onClick={onDelete} className="h-10 w-10 text-red-700" aria-label="Eliminar"><Trash2 className="h-5 w-5" /></button></div><ul className="mt-4 grid gap-2">{items.map((item, index) => <li key={`${item.wasteType}-${index}`} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"><span>{WASTE_LABELS[item.wasteType]} × {item.quantity}</span><span>{item.estimatedWeightKg ? `${item.estimatedWeightKg} kg` : 'Sin peso'}</span></li>)}</ul><Timeline delivery={delivery} />{delivery.rejectionReason && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"><strong>Motivo:</strong> {delivery.rejectionReason}</p>}{delivery.status === 'confirmed' && <Button size="sm" variant="secondary" className="mt-4" onClick={() => downloadCertificate(delivery, point)}><Download className="h-4 w-4" />Descargar constancia PDF</Button>}</Card> }

function Timeline({ delivery }: { delivery: Delivery }) { return <ol className="mt-5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3"><li className="rounded-lg bg-amber-50 p-3 font-semibold text-amber-900">Declarada<br />{formatDate(delivery.createdAt)}</li><li className={`rounded-lg p-3 font-semibold ${delivery.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800' : delivery.status === 'rejected' ? 'bg-red-50 text-red-800' : 'bg-slate-100 text-slate-400'}`}>{delivery.status === 'rejected' ? 'Rechazada' : 'Confirmada'}<br />{delivery.confirmedAt ? formatDate(delivery.confirmedAt) : delivery.rejectedAt ? formatDate(delivery.rejectedAt) : 'Pendiente'}</li></ol> }

async function downloadCertificate(delivery: Delivery, point?: Point) { const { jsPDF } = await import('jspdf'); const doc = new jsPDF(); doc.setFontSize(20); doc.setTextColor(27,94,32); doc.text('EcoRAEE Lima', 20, 24); doc.setFontSize(14); doc.setTextColor(20,30,25); doc.text('Constancia informativa de entrega', 20, 36); doc.setFontSize(10); doc.text(`Código: ${delivery.id}`, 20, 50); doc.text(`Fecha: ${formatDate(delivery.deliveryDate)}`, 20, 58); doc.text(`Punto: ${point?.name ?? 'Punto de ejemplo'}`, 20, 66, { maxWidth: 170 }); let y = 80; getDeliveryItems(delivery).forEach((item) => { doc.text(`• ${WASTE_LABELS[item.wasteType]} — ${item.quantity} unidad(es)`, 24, y); y += 8 }); doc.text(`Peso confirmado: ${delivery.actualWeightKg ?? delivery.estimatedWeightKg ?? 0} kg`, 20, y + 5); doc.setFontSize(9); doc.text('Constancia informativa generada por EcoRAEE Lima (prototipo académico). No tiene valor legal.', 20, y + 22, { maxWidth: 170 }); doc.save(`constancia-ecoraee-${delivery.id.slice(0, 8)}.pdf`) }

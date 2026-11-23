import { ArrowLeft, CalendarClock, CheckCircle2, Clipboard, ExternalLink, Flag, Heart, MapPin, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import DataNotice from '../components/DataNotice'
import MapView from '../components/MapView'
import WasteBadge from '../components/WasteBadge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useApp } from '../context/AppContext'
import { formatDate } from '../utils/domain'

export default function PointDetailPage() {
  const { id } = useParams()
  const { points, registerPointVisit, notify, favorites, toggleFavorite, submitReport, registerShare } = useApp()
  const [reportOpen, setReportOpen] = useState(false)
  const [category, setCategory] = useState('Horario incorrecto')
  const [description, setDescription] = useState('')
  const point = points.find((item) => item.id === id)
  const counted = useRef(false)

  useEffect(() => { if (point && !counted.current) { registerPointVisit(); counted.current = true } }, [point, registerPointVisit])
  if (!point) return <div className="container-page py-20 text-center"><h1 className="text-3xl font-bold">Punto no encontrado</h1><p className="mt-3 text-slate-600">El enlace no coincide con ningún punto del prototipo.</p><Link to="/mapa" className="btn-primary mt-6">Volver al mapa</Link></div>

  const share = async () => {
    try { if (navigator.share) await navigator.share({ title: point.name, text: 'Revisa este punto de ejemplo en EcoRAEE Lima', url: window.location.href }); else { await navigator.clipboard.writeText(window.location.href); notify('Enlace copiado al portapapeles.') } registerShare() }
    catch { notify('No se pudo copiar el enlace. Cópialo desde la barra del navegador.', 'error') }
  }
  const report = (event: FormEvent) => { event.preventDefault(); submitReport({ pointId: point.id, category, description }); setReportOpen(false); setDescription('') }
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`

  return (
    <>
      <section className="bg-[#103f2d] py-10 text-white sm:py-14">
        <div className="container-page"><Link to="/mapa" className="inline-flex items-center gap-2 rounded-lg text-sm font-bold text-emerald-100 hover:text-white"><ArrowLeft className="h-4 w-4" />Volver al mapa</Link><div className="mt-7 flex flex-wrap items-center gap-3"><span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold">{point.type === 'campaign' ? 'Campaña temporal' : 'Punto permanente'}</span>{point.verified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-300 px-3 py-1 text-sm font-bold text-emerald-950"><ShieldCheck className="h-4 w-4" />Verificado*</span>}</div><h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">{point.name}</h1><p className="mt-4 flex items-center gap-2 text-emerald-100"><MapPin className="h-5 w-5" />{point.address}</p></div>
      </section>
      <div className="container-page py-8"><DataNotice compact /></div>
      <section className="container-page grid gap-7 pb-16 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <article className="card p-6 sm:p-8"><h2 className="text-xl font-bold text-slate-950">Información para tu entrega</h2><dl className="mt-6 grid gap-6 sm:grid-cols-2"><div><dt className="text-sm font-bold text-slate-500">Distrito</dt><dd className="mt-1 font-semibold">{point.district}</dd></div><div><dt className="text-sm font-bold text-slate-500">Horario</dt><dd className="mt-1 font-semibold">{point.schedule}</dd></div><div><dt className="text-sm font-bold text-slate-500">Entidad responsable</dt><dd className="mt-1 font-semibold">{point.operator}</dd></div><div><dt className="text-sm font-bold text-slate-500">Última verificación ficticia</dt><dd className="mt-1 font-semibold">{formatDate(point.lastVerifiedAt)}</dd></div></dl><div className="mt-7 rounded-xl bg-amber-50 p-4"><h3 className="font-bold text-amber-950">Condiciones de recepción</h3><p className="mt-2 leading-7 text-amber-900">{point.conditions}</p></div></article>
          <article className="card p-6 sm:p-8"><h2 className="text-xl font-bold text-slate-950">Residuos aceptados</h2><div className="mt-5 flex flex-wrap gap-2">{point.acceptedWaste.map((type) => <WasteBadge key={type} type={type} />)}</div></article>
          <div className="grid gap-3 sm:grid-cols-3"><a href={directions} target="_blank" rel="noreferrer" className="btn-primary"><ExternalLink className="h-4 w-4" />Cómo llegar</a><Link to={`/entregas?point=${point.id}`} className="btn-secondary"><CheckCircle2 className="h-4 w-4" />Registrar entrega aquí</Link><button type="button" onClick={share} className="btn-secondary"><Clipboard className="h-4 w-4" />Compartir</button><Button variant="secondary" onClick={() => toggleFavorite(point.id)}><Heart className={`h-4 w-4 ${favorites.includes(point.id) ? 'fill-current text-red-600' : ''}`} />{favorites.includes(point.id) ? 'Quitar favorito' : 'Guardar favorito'}</Button><Button variant="ghost" onClick={() => setReportOpen(true)}><Flag className="h-4 w-4" />Reportar información</Button></div>
          <p className="text-xs text-slate-500">* Estado ilustrativo del prototipo; no constituye validación oficial del punto.</p>
        </div>
        <aside><div className="card sticky top-24 overflow-hidden p-3"><MapView points={[point]} selectedId={point.id} className="h-[390px]" /><div className="p-3"><p className="flex gap-2 text-sm text-slate-600"><CalendarClock className="h-4 w-4 shrink-0" />Consulta el horario antes de trasladarte.</p></div></div></aside>
      </section>
      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Reportar información incorrecta" description="El reporte se guardará como ejemplo en la bandeja del Administrador."><form onSubmit={report} className="space-y-4"><label><span className="field-label">Tipo de problema</span><select className="field" value={category} onChange={(event) => setCategory(event.target.value)}><option>Horario incorrecto</option><option>Dirección incorrecta</option><option>Residuos aceptados</option><option>Punto no disponible</option></select></label><label><span className="field-label">Descripción</span><textarea required minLength={5} className="field min-h-28" value={description} onChange={(event) => setDescription(event.target.value)} /></label><Button type="submit" className="w-full">Enviar reporte</Button></form></Modal>
    </>
  )
}

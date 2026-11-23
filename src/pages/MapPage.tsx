import { Columns3, Crosshair, Heart, List, Map as MapIcon, Plus, RotateCcw, Search } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import DataNotice from '../components/DataNotice'
import MapView from '../components/MapView'
import PageHeader from '../components/PageHeader'
import PointCard from '../components/PointCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { WASTE_LABELS } from '../constants'
import { useApp } from '../context/AppContext'
import type { Point, PointType, WasteType } from '../types'
import { filterPoints, haversineDistance } from '../utils/domain'

export default function MapPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState(searchParams.get('district') ?? '')
  const [wasteType, setWasteType] = useState<WasteType | ''>('')
  const [pointType, setPointType] = useState<PointType | ''>('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestion, setSuggestion] = useState({ name: '', address: '', district: '', lat: '-12.0464', lng: '-77.0428', schedule: '', notes: '' })
  const [selectedId, setSelectedId] = useState<string>()
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const { notify, points, favorites, toggleFavorite, submitSuggestion } = useApp()
  const districts = useMemo(() => [...new Set(points.map((point) => point.district))].sort(), [points])

  const filtered = useMemo(() => {
    const result = filterPoints(points, { search, district, wasteType, pointType, verifiedOnly }).filter((point) => !favoriteOnly || favorites.includes(point.id))
    if (!userPosition) return result.map((point) => ({ point, distance: undefined }))
    return result.map((point) => ({ point, distance: haversineDistance(userPosition, point) })).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
  }, [points, search, district, wasteType, pointType, verifiedOnly, favoriteOnly, favorites, userPosition])

  const clear = () => { setSearch(''); setDistrict(''); setWasteType(''); setPointType(''); setVerifiedOnly(false); setFavoriteOnly(false); setUserPosition(null); setGeoError(''); setSelectedId(undefined) }
  const toggleCompare = (id: string) => setCompareIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : (notify('Puedes comparar hasta tres puntos.', 'error'), current))
  const sendSuggestion = (event: FormEvent) => { event.preventDefault(); submitSuggestion({ ...suggestion, lat: Number(suggestion.lat), lng: Number(suggestion.lng), acceptedWaste: ['phone'] }); setSuggestOpen(false); setSuggestion({ name: '', address: '', district: '', lat: '-12.0464', lng: '-77.0428', schedule: '', notes: '' }) }
  const locate = () => {
    if (!navigator.geolocation) { setGeoError('Tu navegador no admite geolocalización.'); return }
    setGeoLoading(true); setGeoError('')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setUserPosition({ lat: coords.latitude, lng: coords.longitude }); setGeoLoading(false); notify('Puntos ordenados desde tu ubicación.', 'info') },
      () => { setGeoLoading(false); setGeoError('No pudimos acceder a tu ubicación. Revisa el permiso del navegador o busca por distrito.'); notify('Permiso de ubicación no disponible.', 'error') },
      { enableHighAccuracy: false, timeout: 10000 },
    )
  }

  return (
    <>
      <PageHeader eyebrow="Explora Lima" title="Mapa de puntos de recolección" description="Filtra, guarda favoritos y compara hasta tres puntos de demostración." actions={<Button variant="secondary" onClick={() => setSuggestOpen(true)}><Plus className="h-4 w-4" />Sugerir un punto</Button>} />
      <div className="container-page py-6"><DataNotice compact /></div>
      <section className="container-page pb-16">
        <div className="card p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-5">
            <label className="lg:col-span-2"><span className="field-label">Buscar por nombre o distrito</span><span className="relative block"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input className="field pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ej. San Miguel" /></span></label>
            <label><span className="field-label">Distrito</span><select className="field" value={district} onChange={(event) => setDistrict(event.target.value)}><option value="">Todos</option>{districts.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span className="field-label">Residuo aceptado</span><select className="field" value={wasteType} onChange={(event) => setWasteType(event.target.value as WasteType | '')}><option value="">Todos</option>{Object.entries(WASTE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label><span className="field-label">Tipo de punto</span><select className="field" value={pointType} onChange={(event) => setPointType(event.target.value as PointType | '')}><option value="">Todos</option><option value="permanent">Permanente</option><option value="campaign">Campaña temporal</option></select></label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold"><input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} className="h-4 w-4 accent-forest" />Solo verificados*</label>
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold"><input type="checkbox" checked={favoriteOnly} onChange={(event) => setFavoriteOnly(event.target.checked)} className="h-4 w-4 accent-forest" /><Heart className="h-4 w-4" />Mis favoritos</label>
            <button type="button" onClick={locate} disabled={geoLoading} className="btn-secondary"><Crosshair className="h-4 w-4" />{geoLoading ? 'Obteniendo ubicación…' : 'Cerca de mí'}</button>
            <button type="button" onClick={clear} className="inline-flex min-h-11 items-center gap-2 px-3 font-semibold text-slate-600 hover:text-forest"><RotateCcw className="h-4 w-4" />Limpiar filtros</button>
            <p className="ml-auto font-bold text-slate-800">{filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}</p>
          </div>
          {geoError && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">{geoError}</p>}
        </div>

        <div className="mt-6 hidden min-h-[650px] grid-cols-[380px_1fr] gap-5 lg:grid">
          <div className="max-h-[650px] space-y-3 overflow-y-auto pr-2">
            {filtered.length ? filtered.map(({ point, distance }) => <PointCard key={point.id} point={point} distance={distance} selected={selectedId === point.id} onSelect={() => setSelectedId(point.id)} favorite={favorites.includes(point.id)} onFavorite={() => toggleFavorite(point.id)} compared={compareIds.includes(point.id)} onCompare={() => toggleCompare(point.id)} />) : <EmptyResults onClear={clear} />}
          </div>
          <div className="relative"><MapView points={filtered.map((item) => item.point)} selectedId={selectedId} onSelect={(point) => setSelectedId(point.id)} userPosition={userPosition} className="h-[650px]" /><Legend /></div>
        </div>

        <div className="mt-6 lg:hidden">
          {mobileView === 'list' ? <div className="space-y-3">{filtered.length ? filtered.map(({ point, distance }) => <PointCard key={point.id} point={point} distance={distance} selected={selectedId === point.id} onSelect={() => setSelectedId(point.id)} favorite={favorites.includes(point.id)} onFavorite={() => toggleFavorite(point.id)} compared={compareIds.includes(point.id)} onCompare={() => toggleCompare(point.id)} />) : <EmptyResults onClear={clear} />}</div> : <div className="relative"><MapView points={filtered.map((item) => item.point)} selectedId={selectedId} onSelect={(point) => setSelectedId(point.id)} userPosition={userPosition} className="h-[65vh] min-h-[440px]" /><Legend /></div>}
          <button type="button" onClick={() => setMobileView((value) => value === 'list' ? 'map' : 'list')} className="fixed bottom-5 left-1/2 z-[450] inline-flex min-h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-forest px-5 font-bold text-white shadow-xl" aria-label={`Mostrar ${mobileView === 'list' ? 'mapa' : 'lista'}`}>{mobileView === 'list' ? <MapIcon className="h-5 w-5" /> : <List className="h-5 w-5" />}{mobileView === 'list' ? 'Ver mapa' : 'Ver lista'}</button>
        </div>
        {compareIds.length > 0 && <Comparison points={compareIds.map((id) => points.find((point) => point.id === id)).filter(Boolean) as Point[]} onRemove={toggleCompare} />}
        <p className="mt-5 text-xs text-slate-500">* “Verificado” es un estado ficticio utilizado para demostrar la interfaz; no constituye validación oficial.</p>
      </section>
      <Modal open={suggestOpen} onClose={() => setSuggestOpen(false)} title="Sugerir un punto" description="La sugerencia ficticia llegará a la bandeja del Administrador."><form onSubmit={sendSuggestion} className="space-y-3">{(['name','address','district','schedule'] as const).map((field) => <label key={field}><span className="field-label">{{ name:'Nombre', address:'Dirección', district:'Distrito', schedule:'Horario' }[field]}</span><input required className="field" value={suggestion[field]} onChange={(event) => setSuggestion((current) => ({ ...current, [field]: event.target.value }))} /></label>)}<div className="grid grid-cols-2 gap-3"><label><span className="field-label">Latitud</span><input required type="number" step="any" className="field" value={suggestion.lat} onChange={(event) => setSuggestion((current) => ({ ...current, lat: event.target.value }))} /></label><label><span className="field-label">Longitud</span><input required type="number" step="any" className="field" value={suggestion.lng} onChange={(event) => setSuggestion((current) => ({ ...current, lng: event.target.value }))} /></label></div><label><span className="field-label">Notas</span><textarea required className="field min-h-20" value={suggestion.notes} onChange={(event) => setSuggestion((current) => ({ ...current, notes: event.target.value }))} /></label><Button type="submit" className="w-full">Enviar sugerencia</Button></form></Modal>
    </>
  )
}

function Legend() { return <div className="absolute bottom-7 left-3 z-[400] rounded-xl bg-white/95 p-3 text-xs font-semibold shadow-lg"><p className="mb-2 font-bold text-slate-800">Leyenda</p><p className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-forest" />Punto permanente</p><p className="mt-1 flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-petrol" />Campaña temporal</p></div> }
function EmptyResults({ onClear }: { onClear: () => void }) { return <EmptyState icon={Search} title="No encontramos puntos" description="Prueba con menos filtros o con otro distrito." action={<Button variant="secondary" onClick={onClear}>Limpiar filtros</Button>} /> }
function Comparison({ points, onRemove }: { points: Point[]; onRemove: (id: string) => void }) { return <div className="mt-8"><h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950"><Columns3 className="text-petrol" />Comparar puntos</h2><div className="mt-4 grid gap-4 lg:grid-cols-3">{points.map((point) => <div key={point.id} className="card p-5"><BadgeLine label={point.verified ? 'Verificado*' : 'Sin verificar'} /><h3 className="mt-3 font-bold">{point.name}</h3><p className="mt-2 text-sm text-slate-600">{point.schedule}</p><p className="mt-3 text-sm">{point.acceptedWaste.map((waste) => WASTE_LABELS[waste]).join(', ')}</p><Button size="sm" variant="ghost" className="mt-4" onClick={() => onRemove(point.id)}>Quitar</Button></div>)}</div></div> }
function BadgeLine({ label }: { label: string }) { return <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-forest">{label}</span> }

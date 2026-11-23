import { CalendarClock, Columns3, Heart, MapPin, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDistance } from '../utils/domain'
import type { Point } from '../types'

export default function PointCard({ point, selected, distance, onSelect, favorite, onFavorite, compared, onCompare }: { point: Point; selected?: boolean; distance?: number; onSelect?: () => void; favorite?: boolean; onFavorite?: () => void; compared?: boolean; onCompare?: () => void }) {
  return (
    <article className={`rounded-2xl border bg-white p-4 transition ${selected ? 'border-forest ring-2 ring-forest/15' : 'border-slate-200 hover:border-forest/40'}`}>
      <button type="button" onClick={onSelect} className="w-full text-left" aria-pressed={selected}>
        <div className="flex items-start justify-between gap-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${point.type === 'campaign' ? 'bg-cyan-100 text-petrol' : 'bg-emerald-100 text-forest'}`}>{point.type === 'campaign' ? 'Campaña temporal' : 'Punto permanente'}</span>
          {point.verified && <span className="inline-flex items-center gap-1 text-xs font-bold text-forest"><ShieldCheck className="h-4 w-4" />Verificado*</span>}
        </div>
        <h2 className="mt-3 font-bold leading-6 text-slate-950">{point.name}</h2>
        <p className="mt-2 flex gap-2 text-sm text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{point.address}</p>
        <p className="mt-2 flex gap-2 text-sm text-slate-600"><CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />{point.schedule}</p>
        {distance !== undefined && <p className="mt-3 font-bold text-petrol">{formatDistance(distance)}</p>}
      </button>
      <div className="mt-4 flex flex-wrap items-center gap-2"><Link to={`/puntos/${point.id}`} className="mr-auto inline-flex min-h-10 items-center rounded-lg font-bold text-forest hover:underline">Ver información completa</Link>{onFavorite && <button type="button" onClick={onFavorite} className={`grid h-10 w-10 place-items-center rounded-lg border ${favorite ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500'}`} aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}><Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} /></button>}{onCompare && <button type="button" onClick={onCompare} className={`grid h-10 w-10 place-items-center rounded-lg border ${compared ? 'border-petrol bg-cyan-50 text-petrol' : 'border-slate-200 text-slate-500'}`} aria-label={compared ? 'Quitar de comparación' : 'Comparar punto'}><Columns3 className="h-4 w-4" /></button>}</div>
    </article>
  )
}

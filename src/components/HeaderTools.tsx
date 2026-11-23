import { Bell, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import recycleItemsData from '../data/recycle-items.json'
import { useApp } from '../context/AppContext'
import type { RecycleItem } from '../types'
import { getCampaignStatus, normalizeText } from '../utils/domain'
import Modal from './ui/Modal'

const items = recycleItemsData as RecycleItem[]

export default function HeaderTools() {
  const { points, campaigns, subscribedDistricts } = useApp()
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const notifications = campaigns.filter((campaign) => subscribedDistricts.includes(campaign.district) && getCampaignStatus(campaign) !== 'finished')
  const results = useMemo(() => {
    const term = normalizeText(query)
    if (!term) return []
    return [
      ...points.filter((point) => normalizeText(`${point.name} ${point.district}`).includes(term)).slice(0, 4).map((point) => ({ label: point.name, meta: `Punto · ${point.district}`, to: `/puntos/${point.id}` })),
      ...campaigns.filter((campaign) => normalizeText(`${campaign.title} ${campaign.district}`).includes(term)).slice(0, 3).map((campaign) => ({ label: campaign.title, meta: `Campaña · ${campaign.district}`, to: `/campanas#${campaign.id}` })),
      ...items.filter((item) => normalizeText(item.name).includes(term)).slice(0, 4).map((item) => ({ label: item.name, meta: 'Artículo · Guía de reciclaje', to: `/asistente?item=${encodeURIComponent(item.name)}` })),
    ]
  }, [campaigns, points, query])

  useEffect(() => { const shortcut = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true) } }; window.addEventListener('keydown', shortcut); return () => window.removeEventListener('keydown', shortcut) }, [])
  const go = (to: string) => { setSearchOpen(false); setQuery(''); navigate(to) }

  return <div className="flex items-center gap-1"><button type="button" onClick={() => setSearchOpen(true)} className="grid h-11 w-11 place-items-center rounded-xl text-slate-600 hover:bg-slate-100" aria-label="Abrir buscador global"><Search className="h-5 w-5" /></button><div className="relative"><button type="button" onClick={() => setNotificationsOpen((value) => !value)} className="relative grid h-11 w-11 place-items-center rounded-xl text-slate-600 hover:bg-slate-100" aria-label="Centro de notificaciones"><Bell className="h-5 w-5" />{notifications.length > 0 && <span className="absolute right-1.5 top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-sun px-1 text-[10px] font-bold text-slate-900">{notifications.length}</span>}</button>{notificationsOpen && <div className="absolute right-0 top-12 z-[700] w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"><div className="flex justify-between"><h2 className="font-bold text-slate-950">Campañas próximas</h2><button onClick={() => setNotificationsOpen(false)} aria-label="Cerrar notificaciones"><X className="h-4 w-4" /></button></div>{notifications.length ? <div className="mt-3 space-y-2">{notifications.map((campaign) => <button key={campaign.id} onClick={() => { navigate(`/campanas#${campaign.id}`); setNotificationsOpen(false) }} className="w-full rounded-lg bg-slate-50 p-3 text-left"><strong className="text-sm">{campaign.title}</strong><span className="mt-1 block text-xs text-slate-500">{campaign.district} · {campaign.startDate}</span></button>)}</div> : <p className="mt-3 text-sm text-slate-600">Activa avisos por distrito desde Campañas.</p>}</div>}</div><Modal open={searchOpen} onClose={() => setSearchOpen(false)} title="Buscar en EcoRAEE" description="Puntos, campañas y artículos. Atajo: Ctrl+K"><input autoFocus className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Escribe para buscar…" />{query && <div className="mt-4 space-y-2">{results.length ? results.map((result) => <button key={`${result.to}-${result.label}`} onClick={() => go(result.to)} className="w-full rounded-xl border border-slate-200 p-3 text-left hover:border-forest"><strong className="block text-slate-900">{result.label}</strong><span className="text-xs text-slate-500">{result.meta}</span></button>) : <p className="text-sm text-slate-600">No encontramos resultados.</p>}</div>}</Modal></div>
}

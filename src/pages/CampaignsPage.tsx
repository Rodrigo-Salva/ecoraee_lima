import { Bell, CalendarDays, ExternalLink, MapPin, Share2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import DataNotice from '../components/DataNotice'
import PageHeader from '../components/PageHeader'
import Tabs from '../components/ui/Tabs'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import { formatDate, getCampaignStatus } from '../utils/domain'
const statusLabel = { upcoming: 'Próxima', active: 'En curso', finished: 'Finalizada' }

export default function CampaignsPage() {
  const { campaigns, subscribedDistricts, toggleSubscription, registerShare, notify } = useApp()
  const shareCampaign = async (title: string, id: string) => { const url = `${window.location.origin}/campanas#${id}`; try { if (navigator.share) await navigator.share({ title, text: 'Campaña en EcoRAEE Lima', url }); else { await navigator.clipboard.writeText(url); notify('Enlace de campaña copiado.') } registerShare() } catch { notify('No se pudo compartir.', 'error') } }
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const filtered = useMemo(() => campaigns.filter((campaign) => tab === 'past' ? getCampaignStatus(campaign) === 'finished' : getCampaignStatus(campaign) !== 'finished'), [campaigns, tab])
  return (
    <>
      <PageHeader eyebrow="Fechas para participar" title="Campañas de recolección" description="Consulta jornadas temporales de demostración y una campaña real documentada por el MINAM." />
      <section className="container-page py-8 sm:py-12">
        <DataNotice />
        <div className="mt-8"><Tabs label="Filtrar campañas" value={tab} onChange={setTab} items={[{ value: 'upcoming', label: 'Próximas' }, { value: 'past', label: 'Pasadas' }]} /></div>
        {filtered.length ? <div className="mt-7 grid gap-5 lg:grid-cols-2">{filtered.map((campaign) => { const status = getCampaignStatus(campaign); const subscribed = subscribedDistricts.includes(campaign.district); return <article id={campaign.id} key={campaign.id} className="card p-6"><div className="flex flex-wrap items-center justify-between gap-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${status === 'active' ? 'bg-emerald-100 text-emerald-800' : status === 'upcoming' ? 'bg-cyan-100 text-petrol' : 'bg-slate-200 text-slate-700'}`}>{statusLabel[status]}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${campaign.isExample ? 'bg-amber-100 text-amber-900' : 'bg-forest text-white'}`}>{campaign.isExample ? 'Ejemplo del prototipo' : 'Campaña documentada'}</span></div><h2 className="mt-5 text-xl font-bold text-slate-950">{campaign.title}</h2><p className="mt-3 leading-7 text-slate-600">{campaign.description}</p><div className="mt-5 grid gap-3 text-sm font-semibold text-slate-700"><p className="flex gap-2"><CalendarDays className="h-5 w-5 text-forest" />{formatDate(campaign.startDate)}{campaign.endDate !== campaign.startDate && ` al ${formatDate(campaign.endDate)}`}</p><p className="flex gap-2"><MapPin className="h-5 w-5 text-forest" />{campaign.place}, {campaign.district}</p><p>Organiza: {campaign.organizer}</p></div><div className="mt-6 flex flex-wrap gap-2">{campaign.sourceUrl && <a href={campaign.sourceUrl} target="_blank" rel="noreferrer" className="btn-secondary"><ExternalLink className="h-4 w-4" />Ver fuente</a>}<Button size="sm" variant="secondary" onClick={() => toggleSubscription(campaign.district)}><Bell className={`h-4 w-4 ${subscribed ? 'fill-current' : ''}`} />{subscribed ? 'Avisos activos' : 'Avisarme'}</Button><Button size="sm" variant="ghost" onClick={() => shareCampaign(campaign.title, campaign.id)}><Share2 className="h-4 w-4" />Compartir</Button></div></article>})}</div> : <div className="card mt-7 p-10 text-center"><CalendarDays className="mx-auto h-9 w-9 text-slate-400" /><h2 className="mt-4 font-bold">No hay campañas en esta categoría</h2><p className="mt-2 text-slate-600">Revisa la otra pestaña para explorar las campañas disponibles.</p></div>}
      </section>
    </>
  )
}

import { CheckCircle2, ChevronLeft, Crosshair, Search, Sparkles, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PointCard from '../components/PointCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { WASTE_LABELS } from '../constants'
import { useApp } from '../context/AppContext'
import recycleItemsData from '../data/recycle-items.json'
import type { RecycleItem, WasteType } from '../types'
import { haversineDistance, normalizeText } from '../utils/domain'

const recycleItems = recycleItemsData as RecycleItem[]
const wasteOptions = Object.entries(WASTE_LABELS) as Array<[WasteType, string]>

export default function AssistantPage() {
  const [searchParams] = useSearchParams()
  const { points } = useApp()
  const [step, setStep] = useState(0)
  const [wasteType, setWasteType] = useState<WasteType>('phone')
  const [works, setWorks] = useState<boolean | null>(null)
  const [hasData, setHasData] = useState<boolean | null>(null)
  const [condition, setCondition] = useState<'good' | 'regular' | 'damaged' | null>(null)
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [itemQuery, setItemQuery] = useState(searchParams.get('item') ?? '')

  const accepting = useMemo(() => points.filter((point) => point.acceptedWaste.includes(wasteType)).map((point) => ({ point, distance: position ? haversineDistance(position, point) : undefined })).sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999)).slice(0, 3), [points, position, wasteType])
  const matchedItem = recycleItems.find((item) => normalizeText(item.name) === normalizeText(itemQuery))
  const recommendation = works && condition !== 'damaged' ? 'Reparar o donar' : condition === 'regular' && works !== false ? 'Evaluar reparación' : 'Entregar en un punto RAEE'
  const locate = () => navigator.geolocation?.getCurrentPosition(({ coords }) => setPosition({ lat: coords.latitude, lng: coords.longitude }))
  const reset = () => { setStep(0); setWorks(null); setHasData(null); setCondition(null) }

  return (
    <>
      <PageHeader eyebrow="Orientación personalizada" title="¿Qué hago con mi equipo?" description="Responde cuatro preguntas y obtén una recomendación práctica antes de entregar tu aparato." />
      <section className="container-page py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex gap-2" aria-label={`Paso ${Math.min(step + 1, 5)} de 5`}>{[0,1,2,3,4].map((item) => <span key={item} className={`h-2 flex-1 rounded-full ${item <= step ? 'bg-forest' : 'bg-slate-200'}`} />)}</div>
          <Card className="p-6 sm:p-9">
            {step === 0 && <WizardStep title="¿Qué tipo de equipo tienes?" description="Selecciona la categoría más cercana."><div className="grid gap-3 sm:grid-cols-2">{wasteOptions.map(([value, label]) => <Choice key={value} selected={wasteType === value} onClick={() => setWasteType(value)}>{label}</Choice>)}</div><Next onClick={() => setStep(1)} /></WizardStep>}
            {step === 1 && <WizardStep title="¿El equipo todavía funciona?" description="Aunque funcione, puede tener una segunda vida."><div className="grid gap-3 sm:grid-cols-2"><Choice selected={works === true} onClick={() => setWorks(true)}>Sí, funciona</Choice><Choice selected={works === false} onClick={() => setWorks(false)}>No funciona</Choice></div><Nav previous={() => setStep(0)} next={() => setStep(2)} disabled={works === null} /></WizardStep>}
            {step === 2 && <WizardStep title="¿Contiene datos personales?" description="Celulares, laptops y memorias pueden conservar información."><div className="grid gap-3 sm:grid-cols-2"><Choice selected={hasData === true} onClick={() => setHasData(true)}>Sí o no estoy seguro</Choice><Choice selected={hasData === false} onClick={() => setHasData(false)}>No contiene datos</Choice></div><Nav previous={() => setStep(1)} next={() => setStep(3)} disabled={hasData === null} /></WizardStep>}
            {step === 3 && <WizardStep title="¿Cuál es su estado general?" description="No desarmes equipos dañados ni manipules baterías hinchadas."><div className="grid gap-3 sm:grid-cols-3"><Choice selected={condition === 'good'} onClick={() => setCondition('good')}>Bueno</Choice><Choice selected={condition === 'regular'} onClick={() => setCondition('regular')}>Regular</Choice><Choice selected={condition === 'damaged'} onClick={() => setCondition('damaged')}>Dañado</Choice></div><Nav previous={() => setStep(2)} next={() => setStep(4)} disabled={condition === null} /></WizardStep>}
            {step === 4 && <div><Badge tone="green"><Sparkles className="h-4 w-4" />Recomendación</Badge><h2 className="mt-4 text-3xl font-bold text-slate-950">{recommendation}</h2><p className="mt-3 leading-7 text-slate-600">{recommendation.includes('RAEE') ? 'Evita mezclarlo con la basura común y consulta las condiciones del punto antes de trasladarte.' : 'Alargar la vida útil reduce residuos. Si reparar o donar ya no es viable, utiliza un punto RAEE.'}</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><Tip>Respalda y borra tus datos personales.</Tip><Tip>Retira SIM y memorias externas.</Tip><Tip>No perfores ni manipules baterías dañadas.</Tip><Tip>Entrega cargadores y cables por separado.</Tip></div><div className="mt-7 flex flex-wrap gap-3"><Link className="btn-primary" to={`/entregas?waste=${wasteType}${accepting[0] ? `&point=${accepting[0].point.id}` : ''}`}><CheckCircle2 className="h-5 w-5" />Registrar entrega</Link><Button variant="secondary" onClick={reset}>Empezar de nuevo</Button></div></div>}
          </Card>

          {step === 4 && <div className="mt-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-bold text-slate-950">Puntos que aceptan {WASTE_LABELS[wasteType].toLowerCase()}</h2><p className="mt-1 text-slate-600">Mostramos hasta tres opciones.</p></div><Button variant="secondary" onClick={locate}><Crosshair className="h-4 w-4" />Ordenar por cercanía</Button></div><div className="mt-5 grid gap-4 lg:grid-cols-3">{accepting.map(({ point, distance }) => <PointCard key={point.id} point={point} distance={distance} />)}</div></div>}
        </div>
      </section>

      <section className="bg-white py-14"><div className="container-page"><div className="mx-auto max-w-4xl"><p className="eyebrow">Buscador local</p><h2 className="mt-3 text-3xl font-bold text-slate-950">¿Puedo reciclar esto?</h2><p className="mt-3 text-slate-600">Busca entre 40 artículos y conoce su destino recomendado.</p><div className="relative mt-6"><Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" /><input className="field min-h-14 pl-12" list="recycle-items" value={itemQuery} onChange={(event) => setItemQuery(event.target.value)} placeholder="Ej. router, foco LED, tóner…" /><datalist id="recycle-items">{recycleItems.map((item) => <option key={item.name} value={item.name} />)}</datalist></div>{itemQuery && <Card className="mt-5 p-6">{matchedItem ? <><Badge tone={matchedItem.destination === 'raee' ? 'green' : matchedItem.destination === 'special' ? 'red' : 'blue'}>{matchedItem.destination === 'raee' ? 'Punto RAEE' : matchedItem.destination === 'special' ? 'Cuidado especial' : 'Otro sistema de residuos'}</Badge><h3 className="mt-3 text-xl font-bold text-slate-950">{matchedItem.name}</h3><p className="mt-2 leading-7 text-slate-600">{matchedItem.guidance}</p></> : <p className="text-slate-600">Selecciona una opción de la lista para ver la recomendación.</p>}</Card>}</div></div></section>
    </>
  )
}

function WizardStep({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <div><Wrench className="h-8 w-8 text-petrol" /><h2 className="mt-4 text-2xl font-bold text-slate-950">{title}</h2><p className="mt-2 text-slate-600">{description}</p><div className="mt-6">{children}</div></div> }
function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} aria-pressed={selected} className={`min-h-14 rounded-xl border p-4 text-left font-semibold transition ${selected ? 'border-forest bg-emerald-50 text-forest ring-2 ring-forest/10' : 'border-slate-200 bg-white text-slate-700 hover:border-forest/50'}`}>{children}</button> }
function Next({ onClick }: { onClick: () => void }) { return <div className="mt-7 flex justify-end"><Button onClick={onClick}>Continuar</Button></div> }
function Nav({ previous, next, disabled }: { previous: () => void; next: () => void; disabled: boolean }) { return <div className="mt-7 flex justify-between"><Button variant="ghost" onClick={previous}><ChevronLeft className="h-4 w-4" />Volver</Button><Button onClick={next} disabled={disabled}>Continuar</Button></div> }
function Tip({ children }: { children: React.ReactNode }) { return <p className="flex gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900"><CheckCircle2 className="h-5 w-5 shrink-0" />{children}</p> }

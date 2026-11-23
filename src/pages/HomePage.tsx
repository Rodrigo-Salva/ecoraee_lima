import { ArrowDownToLine, CheckCircle2, CircleDot, Map, Recycle, Search, ShieldCheck, Smartphone, Waypoints } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import DataNotice from '../components/DataNotice'
import stats from '../data/stats.json'
import { useApp } from '../context/AppContext'

const steps: Array<[string, string, LucideIcon]> = [
  ['Identifica', 'Reconoce un equipo eléctrico o electrónico que ya no usas.', Smartphone],
  ['Busca', 'Encuentra un punto cercano en el mapa de Lima.', Search],
  ['Consulta', 'Revisa residuos aceptados, horario y condiciones.', CircleDot],
  ['Entrega', 'Lleva el equipo al punto seleccionado.', ArrowDownToLine],
  ['Registra', 'Declara tu entrega; el punto podrá confirmarla después.', CheckCircle2],
]

const goals: Array<[string, string, string, LucideIcon]> = [
  ['Meta 12.4', 'Gestión responsable', 'Facilita encontrar opciones para una disposición ambientalmente adecuada.', ShieldCheck],
  ['Meta 12.5', 'Reducir residuos', 'Promueve la entrega y el registro de equipos para su recuperación.', Recycle],
  ['Meta 12.8', 'Información ambiental', 'Explica el impacto de los RAEE y cómo actuar responsablemente.', Waypoints],
]

export default function HomePage() {
  const { points } = useApp()
  const navigate = useNavigate()
  const [district, setDistrict] = useState('')
  const districts = useMemo(() => [...new Set(points.map((point) => point.district))].sort(), [points])
  const searchDistrict = (event: FormEvent) => { event.preventDefault(); navigate(`/mapa${district ? `?district=${encodeURIComponent(district)}` : ''}`) }
  return (
    <>
      <section className="hero-grid flex min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-[#103f2d] py-16 text-white sm:py-24">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-emerald-200">Lima Metropolitana · ODS 12</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">Encuentra dónde entregar tus residuos electrónicos en Lima</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50">Consulta puntos de recolección, conoce qué reciben y aprende a dar un destino responsable a celulares, computadoras y otros aparatos en desuso.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/mapa" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-sun px-6 py-3 font-bold text-slate-950 transition hover:bg-amber-300"><Map className="h-5 w-5" />Buscar punto de recolección</Link>
              <Link to="/asistente" className="inline-flex min-h-12 items-center rounded-xl border border-white/30 px-6 py-3 font-bold text-white hover:bg-white/10">¿Qué hago con mi equipo?</Link>
            </div>
            <form onSubmit={searchDistrict} className="mt-7 flex max-w-xl flex-col gap-2 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur sm:flex-row"><label className="sr-only" htmlFor="hero-district">Distrito</label><select id="hero-district" className="field flex-1" value={district} onChange={(event) => setDistrict(event.target.value)}><option value="">Todos los distritos</option>{districts.map((item) => <option key={item}>{item}</option>)}</select><button className="min-h-11 rounded-xl bg-white px-5 font-bold text-forest" type="submit">Buscar distrito</button></form>
          </div>
          <div className="relative mx-auto w-full max-w-lg" aria-hidden="true">
            <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-eco/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white p-3 shadow-2xl">
              <div className="relative h-[360px] overflow-hidden rounded-[1.4rem] bg-[#e7efe9]">
                <svg viewBox="0 0 500 360" className="absolute inset-0 h-full w-full">
                  <path d="M-20 295C85 250 90 170 205 180s128-95 310-82" fill="none" stroke="#c2d5c7" strokeWidth="25" />
                  <path d="M40 20c65 90 88 98 147 160s120 73 175 178M318-20c-12 63 5 103 45 155s60 80 160 95" fill="none" stroke="white" strokeWidth="10" />
                  <path d="M-20 95c83 15 135 10 206-30s156 19 334 34M-10 237c85 17 137-5 205 9s135 47 330 12" fill="none" stroke="white" strokeWidth="8" />
                </svg>
                <div className="absolute right-5 top-5 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white/95 px-4 py-3 text-forest shadow-lg">
                  <Smartphone className="h-7 w-7" />
                  <Recycle className="h-7 w-7" />
                  <span className="text-xs font-bold uppercase tracking-wider">Dale otra vida</span>
                </div>
                {[[25,28,'#1B5E20'],[62,19,'#006064'],[71,61,'#1B5E20'],[34,67,'#006064'],[52,48,'#1B5E20']].map(([left,top,color], index) => <span key={index} className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl rounded-bl-sm border-4 border-white text-white shadow-lg" style={{ left: `${left}%`, top: `${top}%`, background: String(color), transform: 'translate(-50%,-50%) rotate(-45deg)' }}><Recycle className="h-5 w-5" style={{ transform: 'rotate(45deg)' }} /></span>)}
                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 p-4 shadow-lg">
                  <p className="text-xs font-bold uppercase tracking-wider text-petrol">Punto seleccionado</p>
                  <p className="mt-1 font-bold text-slate-900">Centro de acopio RAEE – San Miguel</p>
                  <p className="mt-1 text-sm text-slate-500">Datos ilustrativos del prototipo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="container-page">
          <p className="eyebrow">Una ruta sencilla</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">¿Cómo funciona?</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map(([title, text, Icon]) => <article key={String(title)} className="rounded-2xl border border-slate-200 p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-forest"><Icon className="h-5 w-5" /></span><h3 className="mt-4 font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}
          </div>
          <div className="mt-8"><DataNotice /></div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-page">
          <p className="eyebrow">El reto en cifras</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Los residuos electrónicos crecen más rápido que su reciclaje formal</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stats.headline.map((item, index) => <article key={item.value} className="card reveal overflow-hidden p-6"><div className={`mb-5 h-1.5 w-16 rounded-full ${index === 1 ? 'bg-petrol' : 'bg-sun'}`} /><p className="text-3xl font-bold text-forest"><AnimatedValue text={item.value} /></p><p className="mt-3 leading-6 text-slate-700">{item.label}</p><a className="mt-4 inline-block text-xs font-semibold text-slate-500 underline decoration-slate-300 underline-offset-4" href={item.url} target="_blank" rel="noreferrer">Fuente: {item.source}</a></article>)}
          </div>
          <p className="mt-5 text-sm text-slate-500">Las cifras nacionales y globales corresponden a las fuentes y años indicados; no representan resultados de EcoRAEE.</p>
        </div>
      </section>

      <section className="section-space bg-emerald-50"><div className="container-page"><p className="eyebrow">Encuesta exploratoria</p><h2 className="mt-3 text-3xl font-bold text-slate-950">Lo que dice la encuesta</h2><p className="mt-3 max-w-3xl text-slate-600">Resultados de 10 participantes. Son orientativos y no generalizables.</p><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[[70,'No conoce puntos autorizados'],[80,'Tiene equipos que ya no usa'],[50,'Guarda equipos en casa'],[70,'Considera útil una plataforma web']].map(([value,label]) => <article key={String(label)} className="reveal rounded-2xl bg-white p-5 shadow-soft"><p className="text-3xl font-bold text-petrol">{value} %</p><p className="mt-2 text-sm font-semibold text-slate-700">{label}</p><div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-eco" style={{ width: `${value}%` }} /></div></article>)}</div><div className="mt-6 rounded-xl border border-emerald-200 bg-white p-4 text-sm text-slate-600"><strong>Funcionalidad más solicitada:</strong> mapa de puntos (50 %), información de dispositivos aceptados (30 %) y avisos de campañas (20 %).</div></div></section>

      <section className="section-space bg-white">
        <div className="container-page">
          <div className="max-w-2xl"><p className="eyebrow">Producción y consumo responsables</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Cómo contribuye al ODS 12</h2></div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {goals.map(([meta, title, description, Icon]) => <article key={String(meta)} className="rounded-3xl bg-[#103f2d] p-7 text-white"><Icon className="h-8 w-8 text-sun" /><p className="mt-6 text-sm font-bold uppercase tracking-widest text-emerald-200">{meta}</p><h3 className="mt-2 text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-emerald-50">{description}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-sun py-8">
        <div className="container-page flex flex-col items-start justify-between gap-5 md:flex-row md:items-center"><p className="max-w-4xl font-semibold leading-7 text-slate-900"><strong>Importante:</strong> EcoRAEE es una herramienta informativa de apoyo. No reemplaza a las municipalidades ni a los operadores de RAEE.</p><Link to="/acerca" className="rounded-lg font-bold text-slate-950 underline underline-offset-4">Conocer el proyecto</Link></div>
      </section>
    </>
  )
}

function AnimatedValue({ text }: { text: string }) { const target = Number(text.replace(/[^0-9,.]/g, '').replace(',', '.')); const [value, setValue] = useState(0); useEffect(() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setValue(target); return }; let frame = 0; const start = performance.now(); const animate = (time: number) => { const progress = Math.min(1, (time - start) / 900); setValue(target * progress); if (progress < 1) frame = requestAnimationFrame(animate) }; frame = requestAnimationFrame(animate); return () => cancelAnimationFrame(frame) }, [target]); const shown = target % 1 ? value.toFixed(1).replace('.', ',') : Math.round(value).toLocaleString('es-PE'); return <>{text.replace(/[0-9][0-9\s.,]*/, shown)}</> }

import { CheckCircle2, Eye, MapPinned, PackageCheck, Scale, Smile, UserRound } from 'lucide-react'
import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import PageHeader from '../components/PageHeader'
import Stat from '../components/ui/Stat'
import { WASTE_LABELS } from '../constants'
import { useApp } from '../context/AppContext'
import stats from '../data/stats.json'
import type { WasteType } from '../types'
import { calculateDeliveryMetrics } from '../utils/domain'

const colors = ['#1B5E20', '#006064', '#4CAF50', '#FBC02D', '#5B8C5A', '#31838A', '#8BC34A', '#C49A00']

export default function IndicatorsPage() {
  const { deliveries, pointVisits, localUserId, points, satisfactionResponses } = useApp()
  const metrics = calculateDeliveryMetrics(deliveries)
  const deliveryByType = useMemo(() => Object.entries(deliveries.reduce<Partial<Record<WasteType, number>>>((accumulator, delivery) => ({ ...accumulator, [delivery.wasteType]: (accumulator[delivery.wasteType] ?? 0) + delivery.quantity }), {})).map(([type, value]) => ({ name: WASTE_LABELS[type as WasteType], value })), [deliveries])
  const cards = [
    ['Puntos registrados', points.length, `${points.filter((point) => point.verified).length} con verificación ficticia`, MapPinned],
    ['Consultas realizadas', pointVisits, 'Visitas a detalles en este navegador', Eye],
    ['Entregas declaradas', metrics.declared, 'Pendientes de confirmación simulada', PackageCheck],
    ['Entregas confirmadas', metrics.confirmed, 'Confirmadas en el modo demostración', CheckCircle2],
    ['Peso confirmado', `${metrics.confirmedWeight.toLocaleString('es-PE')} kg`, 'Solo registros confirmados con peso', Scale],
    ['Usuarios participantes', localUserId ? 1 : 0, 'Usuario anónimo de este navegador', UserRound],
    ['Nivel de satisfacción', satisfactionResponses.length ? `${(satisfactionResponses.reduce((sum, item) => sum + item.satisfaction, 0) / satisfactionResponses.length).toFixed(1)}/5` : 'Sin datos', `${satisfactionResponses.length} respuestas locales`, Smile],
  ] as const

  return (
    <>
      <PageHeader eyebrow="Panel demostrativo" title="Indicadores de EcoRAEE" description="Una vista en vivo de los datos de ejemplo y de la actividad guardada localmente en este navegador." />
      <section className="container-page py-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, help, Icon]) => <Stat key={label} label={label} value={value} help={help} icon={Icon} />)}</div>
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <article className="card p-5 sm:p-7"><h2 className="text-xl font-bold text-slate-950">Entregas por tipo de dispositivo</h2><p className="mt-2 text-sm text-slate-600">Suma de unidades declaradas y confirmadas.</p>{deliveryByType.length ? <div className="mt-6 h-80" aria-label="Gráfico de dona de entregas por dispositivo"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={deliveryByType} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>{deliveryByType.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(value) => [`${value} unidades`, 'Cantidad']} /></PieChart></ResponsiveContainer></div> : <div className="mt-6 grid h-80 place-items-center rounded-xl bg-slate-50 text-center"><div><PackageCheck className="mx-auto h-9 w-9 text-slate-400" /><p className="mt-3 font-bold text-slate-700">Aún no hay entregas</p><p className="mt-1 text-sm text-slate-500">Registra una para activar este gráfico.</p></div></div>}{deliveryByType.length > 0 && <div className="flex flex-wrap gap-3">{deliveryByType.map((item, index) => <span key={item.name} className="flex items-center gap-2 text-xs font-semibold text-slate-600"><span className="h-3 w-3 rounded-full" style={{ background: colors[index % colors.length] }} />{item.name}: {item.value}</span>)}</div>}</article>
          <article className="card p-5 sm:p-7"><h2 className="text-xl font-bold text-slate-950">RAEE recolectados en el Perú</h2><p className="mt-2 text-sm text-slate-600">Serie nacional expresada en toneladas.</p><div className="mt-6 h-80" aria-label="Gráfico de barras de toneladas recolectadas por año"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.nationalSeries} margin={{ top: 10, right: 10, left: 5, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="year" /><YAxis tickFormatter={(value) => `${value / 1000}k`} /><Tooltip formatter={(value) => [`${Number(value).toLocaleString('es-PE')} t`, 'Recolectado']} /><Bar dataKey="tonnes" fill="#006064" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div><p className="mt-4 text-xs leading-5 text-slate-500">Fuente: MINAM / Sigersol. 2020 ≈ 5 700 t; 2021 = 11 175 t; 2022 &gt; 14 700 t; 2023 &gt; 20 000 t; 2024 &gt; 25 600 t. Los valores marcados con ≈ o &gt; se visualizan de forma aproximada.</p><a className="mt-3 inline-block text-sm font-bold text-petrol underline underline-offset-4" href="https://www.gob.pe/institucion/minam/noticias/1263803-minam-promueve-reciclaje-de-residuos-de-aparatos-electricos-y-electronicos" target="_blank" rel="noreferrer">Consultar fuente oficial</a></article>
        </div>
        <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 font-semibold leading-7 text-amber-950">Los impactos de la plataforma son potenciales; su magnitud solo podrá medirse con una implementación piloto.</div>
      </section>
    </>
  )
}

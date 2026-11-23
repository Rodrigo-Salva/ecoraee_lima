import { Mail, MapPinned, Phone, Truck } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import operatorsData from '../data/operators.json'
import type { Operator } from '../types'

const operators = operatorsData as Operator[]

export default function OperatorsPage() {
  return <><PageHeader eyebrow="Directorio de ejemplo" title="Operadores y gestores" description="Contactos genéricos para demostrar cómo podría consultarse cobertura y tipo de servicio." /><section className="container-page py-10"><div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-950">Todos los operadores y contactos de esta página son ficticios. No deben utilizarse para coordinar servicios reales.</div><div className="mt-7 grid gap-5 md:grid-cols-2">{operators.map((operator) => <Card key={operator.id} className="p-6"><div className="flex justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-forest"><Truck /></span><Badge tone="yellow">Ejemplo</Badge></div><h2 className="mt-5 text-xl font-bold text-slate-950">{operator.name}</h2><p className="mt-2 font-semibold text-petrol">{operator.service}</p><p className="mt-4 flex gap-2 text-sm text-slate-600"><MapPinned className="h-5 w-5 text-forest" />{operator.districts.join(', ')}</p><p className="mt-3 flex gap-2 text-sm"><Phone className="h-5 w-5 text-forest" />{operator.phone}</p><p className="mt-3 flex gap-2 text-sm"><Mail className="h-5 w-5 text-forest" />{operator.email}</p></Card>)}</div></section></>
}

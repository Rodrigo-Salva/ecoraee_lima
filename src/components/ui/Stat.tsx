import type { LucideIcon } from 'lucide-react'
import Card from './Card'

export default function Stat({ label, value, help, icon: Icon }: { label: string; value: string | number; help: string; icon: LucideIcon }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-forest">{value}</p></div>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-forest"><Icon className="h-5 w-5" /></span>
      </div>
      <p className="mt-4 text-sm text-slate-600">{help}</p>
    </Card>
  )
}

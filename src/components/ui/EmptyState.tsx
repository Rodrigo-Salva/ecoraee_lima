import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import Card from './Card'

export default function EmptyState({ icon: Icon, title, description, action, className = '' }: { icon: LucideIcon; title: string; description: string; action?: ReactNode; className?: string }) {
  return (
    <Card className={`p-8 text-center ${className}`}>
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-forest"><Icon className="h-7 w-7" /></span>
      <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  )
}

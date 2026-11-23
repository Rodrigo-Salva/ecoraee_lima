import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type BadgeTone = 'green' | 'yellow' | 'blue' | 'gray' | 'red'

const tones: Record<BadgeTone, string> = {
  green: 'bg-emerald-100 text-emerald-800',
  yellow: 'bg-amber-100 text-amber-900',
  blue: 'bg-cyan-100 text-petrol',
  gray: 'bg-slate-200 text-slate-700',
  red: 'bg-red-100 text-red-800',
}

export default function Badge({ tone = 'green', className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold', tones[tone], className)} {...props} />
}

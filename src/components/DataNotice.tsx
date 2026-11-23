import { Info } from 'lucide-react'
import { EXAMPLE_DATA_NOTICE } from '../constants'

export default function DataNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex gap-3 rounded-xl border border-petrol/20 bg-cyan-50 text-petrol ${compact ? 'p-3 text-sm' : 'p-4'}`} role="note">
      <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p>{EXAMPLE_DATA_NOTICE}</p>
    </div>
  )
}

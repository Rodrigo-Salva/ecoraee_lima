import { BatteryCharging, Cable, Laptop, Monitor, Printer, Refrigerator, Smartphone, Tv } from 'lucide-react'
import { WASTE_LABELS } from '../constants'
import type { WasteType } from '../types'

const icons = { phone: Smartphone, laptop: Laptop, computer: Monitor, cables: Cable, tv: Tv, printer: Printer, battery: BatteryCharging, smallAppliance: Refrigerator }

export default function WasteBadge({ type }: { type: WasteType }) {
  const Icon = icons[type]
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-forest"><Icon className="h-4 w-4" aria-hidden="true" />{WASTE_LABELS[type]}</span>
}

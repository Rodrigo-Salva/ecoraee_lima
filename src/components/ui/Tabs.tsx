import { cn } from '../../utils/cn'

interface TabItem<T extends string> {
  value: T
  label: string
  count?: number
}

export default function Tabs<T extends string>({ items, value, onChange, label }: { items: TabItem<T>[]; value: T; onChange: (value: T) => void; label: string }) {
  return (
    <div className="inline-flex max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white p-1" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button key={item.value} type="button" role="tab" aria-selected={value === item.value} onClick={() => onChange(item.value)} className={cn('min-h-10 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition', value === item.value ? 'bg-forest text-white' : 'text-slate-600 hover:bg-slate-100')}>
          {item.label}{item.count !== undefined && <span className="ml-2 opacity-75">{item.count}</span>}
        </button>
      ))}
    </div>
  )
}

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import faq from '../data/faq.json'

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {faq.map((item, index) => {
        const open = index === openIndex
        return (
          <div key={item.question}>
            <button type="button" className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold text-slate-900" aria-expanded={open} onClick={() => setOpenIndex(open ? null : index)}>
              {item.question}<ChevronDown className={`h-5 w-5 shrink-0 text-forest transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <p className="px-5 pb-5 leading-7 text-slate-600">{item.answer}</p>}
          </div>
        )
      })}
    </div>
  )
}

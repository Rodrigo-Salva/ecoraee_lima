import { Link } from 'react-router-dom'

export default function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5 rounded-lg" aria-label="EcoRAEE Lima, ir al inicio">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${inverse ? 'bg-white/15' : 'bg-forest'}`} aria-hidden="true">
        <svg viewBox="0 0 40 40" className="h-7 w-7">
          <path d="M8 28C4 17 12 8 31 9c-1 14-8 22-23 19Z" fill="#8ED081" />
          <path d="M8 31c6-10 12-15 23-20M16 23h8M14 27v-8" fill="none" stroke="white" strokeWidth="2.7" strokeLinecap="round" />
        </svg>
      </span>
      <span className={`font-bold tracking-tight ${inverse ? 'text-white' : 'text-forest'}`}>
        EcoRAEE <span className={inverse ? 'text-emerald-200' : 'text-petrol'}>Lima</span>
      </span>
    </Link>
  )
}
